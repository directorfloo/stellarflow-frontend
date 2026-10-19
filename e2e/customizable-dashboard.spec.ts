import { type Page, expect, test } from "@playwright/test";

/**
 * Customizable dashboard grid (Issue #936).
 *
 * These cover the two acceptance criteria that only a real browser can show:
 *   1. widgets drag and snap to grid positions on desktop viewports
 *   2. the layout state persists across page navigations
 *
 * The pure layout logic is covered by `tests/ui/customizableDashboard.test.ts`;
 * this spec only asserts the DOM behaviour that depends on a real layout engine.
 */

const DASHBOARD = "/dashboard/widgets";
const STORAGE_KEY = "stellarflow-dashboard-grid-layout:v1";

interface StoredLayout {
  layouts: Record<string, { i: string; x: number; y: number }[]>;
}

/** Read the persisted layout for the widest (reference) breakpoint. */
function readStoredLayout(page: Page): Promise<StoredLayout | null> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as StoredLayout) : null;
  }, STORAGE_KEY);
}

function storedItem(layout: StoredLayout | null, id: string) {
  return layout?.layouts?.lg?.find((item) => item.i === id);
}

async function dragWidgetBy(page: Page, widgetId: string, x: number, y: number) {
  const handle = page.locator(`[data-testid="widget-${widgetId}"] .widget-drag-handle`);
  await expect(handle).toBeVisible();
  await handle.scrollIntoViewIfNeeded();

  const handleBox = await handle.boundingBox();
  const viewport = page.viewportSize();
  expect(handleBox).not.toBeNull();
  expect(viewport).not.toBeNull();

  const startX = handleBox!.x + handleBox!.width / 2;
  const startY = handleBox!.y + handleBox!.height / 2;
  const targetX = startX + x;
  const targetY = startY + y;
  expect(targetX).toBeGreaterThanOrEqual(0);
  expect(targetX).toBeLessThan(viewport!.width);
  expect(targetY).toBeGreaterThanOrEqual(0);
  expect(targetY).toBeLessThan(viewport!.height);

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(targetX, targetY, { steps: 12 });
  await page.mouse.up();
}

test.describe("Customizable dashboard grid", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DASHBOARD);
    await expect(page.getByTestId("customizable-dashboard")).toBeVisible();
    // The grid renders only after the container has been measured.
    await expect(page.locator(".react-grid-layout")).toBeVisible();
    await expect.poll(() => readStoredLayout(page)).not.toBeNull();
  });

  test("renders the default widgets on the desktop grid", async ({ page }) => {
    await expect(page.getByTestId("widget-analytics-volume")).toBeVisible();
    await expect(page.getByTestId("widget-analytics-fee-market")).toBeVisible();
    await expect(page.getByTestId("widget-portfolio-balance")).toBeVisible();
  });

  test("snaps a dragged widget to grid positions", async ({ page }) => {
    await page.getByTestId("remove-widget-analytics-fee-market").click();
    await expect(page.getByTestId("widget-analytics-fee-market")).toHaveCount(0);
    const before = storedItem(await readStoredLayout(page), "analytics-volume")!;
    const grid = await page.locator(".react-grid-layout").boundingBox();
    expect(grid).not.toBeNull();
    await dragWidgetBy(page, "analytics-volume", grid!.width / 2, 0);

    await expect
      .poll(async () => storedItem(await readStoredLayout(page), "analytics-volume")?.x)
      .not.toBe(before.x);

    const item = storedItem(await readStoredLayout(page), "analytics-volume")!;
    expect(Number.isInteger(item.x)).toBe(true);
    expect(Number.isInteger(item.y)).toBe(true);

    expect(item.x).toBeGreaterThan(before.x);
  });

  test("persists the layout across a page navigation", async ({ page }) => {
    await page.getByTestId("remove-widget-portfolio-balance").click();
    await expect(page.getByTestId("widget-portfolio-balance")).toHaveCount(0);
    const before = storedItem(await readStoredLayout(page), "analytics-asset-mix")!;
    const grid = await page.locator(".react-grid-layout").boundingBox();
    expect(grid).not.toBeNull();
    await dragWidgetBy(page, "analytics-asset-mix", grid!.width / 3, 0);

    await expect
      .poll(async () => storedItem(await readStoredLayout(page), "analytics-asset-mix")?.x)
      .not.toBe(before.x);
    const moved = storedItem(await readStoredLayout(page), "analytics-asset-mix")!;

    // Navigate away and back: the saved layout must be restored.
    await page.goto("/dashboard/portfolio");
    await page.goto(DASHBOARD);
    await expect(page.locator(".react-grid-layout")).toBeVisible();

    await expect.poll(() => readStoredLayout(page)).not.toBeNull();
    expect(storedItem(await readStoredLayout(page), "analytics-asset-mix")).toEqual(moved);
  });

  test("restores a saved layout after a full reload", async ({ page }) => {
    await page.getByTestId("remove-widget-analytics-asset-mix").click();
    await expect(page.getByTestId("widget-analytics-asset-mix")).toHaveCount(0);
    const before = storedItem(await readStoredLayout(page), "portfolio-balance")!;
    await dragWidgetBy(page, "portfolio-balance", 0, 80);

    await expect
      .poll(async () => storedItem(await readStoredLayout(page), "portfolio-balance")?.y)
      .not.toBe(before.y);
    const moved = storedItem(await readStoredLayout(page), "portfolio-balance")!;

    await page.reload();
    await expect(page.locator(".react-grid-layout")).toBeVisible();

    await expect.poll(() => readStoredLayout(page)).not.toBeNull();
    expect(storedItem(await readStoredLayout(page), "portfolio-balance")).toEqual(moved);
  });

  test("adds a widget from the drawer and persists it", async ({ page }) => {
    await expect(page.getByTestId("widget-bookmarks-watchlist")).toHaveCount(0);

    await page.getByTestId("open-widget-drawer").click();
    await expect(page.getByTestId("widget-drawer")).toBeVisible();
    await page.getByTestId("add-widget-bookmarks-watchlist").click();

    await expect(page.getByTestId("widget-bookmarks-watchlist")).toBeVisible();
    await expect
      .poll(async () => Boolean(storedItem(await readStoredLayout(page), "bookmarks-watchlist")))
      .toBe(true);

    // It must stay added after a reload.
    await page.reload();
    await expect(page.locator(".react-grid-layout")).toBeVisible();
    await expect(page.getByTestId("widget-bookmarks-watchlist")).toBeVisible();
  });

  test("groups the drawer by Charts, Bookmarks and Portfolio", async ({ page }) => {
    await page.getByTestId("remove-widget-portfolio-balance").click();
    await page.getByTestId("remove-widget-portfolio-allocations").click();
    await page.getByTestId("open-widget-drawer").click();
    const drawer = page.getByTestId("widget-drawer");
    await expect(drawer).toContainText("Charts");
    await expect(drawer).toContainText("Bookmarks");
    await expect(drawer).toContainText("Portfolio");
  });

  test("removes a widget and persists the removal", async ({ page }) => {
    await expect(page.getByTestId("widget-analytics-fee-market")).toBeVisible();
    await page.getByTestId("remove-widget-analytics-fee-market").click();
    await expect(page.getByTestId("widget-analytics-fee-market")).toHaveCount(0);

    await expect
      .poll(async () => storedItem(await readStoredLayout(page), "analytics-fee-market"))
      .toBeUndefined();

    await page.reload();
    await expect(page.locator(".react-grid-layout")).toBeVisible();
    await expect(page.getByTestId("widget-analytics-fee-market")).toHaveCount(0);
  });

  test("restores the default layout with the reset action", async ({ page }) => {
    const defaultLayout = await readStoredLayout(page);

    await page.getByTestId("open-widget-drawer").click();
    await page.getByTestId("add-widget-bookmarks-watchlist").click();
    await expect(page.getByTestId("widget-bookmarks-watchlist")).toBeVisible();

    await page.getByTestId("reset-layout").click();

    await expect(page.getByTestId("widget-bookmarks-watchlist")).toHaveCount(0);
    await expect.poll(() => readStoredLayout(page)).toEqual(defaultLayout);
  });

  test("falls back to the default layout for a corrupt saved layout", async ({ page }) => {
    await page.evaluate((key) => {
      window.localStorage.setItem(key, "{ this is not json");
    }, STORAGE_KEY);
    await page.reload();

    await expect(page.locator(".react-grid-layout")).toBeVisible();
    await expect(page.getByTestId("widget-analytics-volume")).toBeVisible();
  });

  test("ignores a saved layout written by a future schema version", async ({ page }) => {
    await page.evaluate((key) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({ version: 99, layouts: { lg: [{ i: "analytics-volume", x: 99, y: 99, w: 6, h: 4 }] } })
      );
    }, STORAGE_KEY);
    await page.reload();

    await expect(page.locator(".react-grid-layout")).toBeVisible();
    const item = storedItem(await readStoredLayout(page), "analytics-volume")!;
    expect(item.x).toBeLessThan(12);
  });
});
