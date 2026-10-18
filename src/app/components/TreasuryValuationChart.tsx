"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  ArcElement,
  Chart,
  type ChartConfiguration,
  Legend,
  PieController,
  Tooltip,
} from "chart.js";

Chart.register(PieController, ArcElement, Tooltip, Legend);

const CHART_COLORS = [
  "#84CC16",
  "#38BDF8",
  "#A78BFA",
  "#F59E0B",
  "#F472B6",
  "#2DD4BF",
  "#FB7185",
  "#818CF8",
];

function getAssetColor(asset: TreasuryAsset, index: number): string {
  return (
    asset.color ??
    CHART_COLORS[index] ??
    `hsl(${(index * 137.508) % 360} 70% 60%)`
  );
}

const formatBalance = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 8,
});

const formatPrice = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumSignificantDigits: 8,
});

const formatValuation = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const formatPercentage = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

export interface TreasuryAsset {
  symbol: string;
  balance: number;
  priceUsd: number;
  color?: string;
}

export interface TreasuryValuationChartProps {
  assets: TreasuryAsset[];
}

function TreasuryValuationChart({ assets }: TreasuryValuationChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const invalidAsset = assets.find(
    ({ symbol, balance, priceUsd }) =>
      !symbol.trim() ||
      !Number.isFinite(balance) ||
      balance < 0 ||
      !Number.isFinite(priceUsd) ||
      priceUsd < 0 ||
      !Number.isFinite(balance * priceUsd),
  );

  const valuedAssets = useMemo(
    () =>
      assets
        .map((asset, index) => ({
          ...asset,
          index,
          usdValue: asset.balance * asset.priceUsd,
        }))
        .filter(({ usdValue }) => usdValue > 0),
    [assets],
  );
  const totalUsdValue = valuedAssets.reduce(
    (total, asset) => total + asset.usdValue,
    0,
  );
  const hasInvalidTotal = !Number.isFinite(totalUsdValue);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || invalidAsset || hasInvalidTotal || valuedAssets.length === 0) return;

    const configuration: ChartConfiguration<"pie", number[], string> = {
      type: "pie",
      data: {
        labels: valuedAssets.map(({ symbol }) => symbol),
        datasets: [
          {
            data: valuedAssets.map(({ usdValue }) => usdValue),
            backgroundColor: valuedAssets.map((asset) =>
              getAssetColor(asset, asset.index),
            ),
            borderColor: "#141414",
            borderWidth: 2,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => items[0]?.label ?? "",
              label: (context) => {
                const asset = valuedAssets[context.dataIndex];
                if (!asset) return "";

                return [
                  `Balance: ${formatBalance.format(asset.balance)} ${asset.symbol}`,
                  `Price: ${formatPrice.format(asset.priceUsd)}`,
                  `Value: ${formatValuation.format(asset.usdValue)}`,
                  `Portfolio weight: ${formatPercentage.format(asset.usdValue / totalUsdValue)}`,
                ];
              },
            },
          },
        },
      },
    };

    const chart = new Chart(canvas, configuration);
    return () => chart.destroy();
  }, [hasInvalidTotal, invalidAsset, totalUsdValue, valuedAssets]);

  if (invalidAsset || hasInvalidTotal) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-400/30 bg-red-400/5 p-4 text-sm text-red-200"
      >
        Unable to display treasury valuation: each asset needs a symbol and
        non-negative, finite balance and USD price.
      </div>
    );
  }

  if (valuedAssets.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#141414] p-6 text-sm text-white/50">
        No valued treasury assets available.
      </div>
    );
  }

  return (
    <section
      aria-label="Treasury valuation"
      className="w-full rounded-xl border border-white/10 bg-[#141414] p-5 text-white"
    >
      <header className="mb-5">
        <h2 className="text-lg font-semibold">Treasury valuation</h2>
        <p className="mt-1 text-sm text-white/50">
          Total portfolio value{" "}
          <span className="font-medium text-white">
            {formatValuation.format(totalUsdValue)}
          </span>
        </p>
      </header>

      <div className="mx-auto h-64 w-full max-w-sm">
        <canvas
          ref={canvasRef}
          aria-label={`Treasury asset allocations totaling ${formatValuation.format(totalUsdValue)}`}
          role="img"
        />
      </div>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {valuedAssets.map((asset) => (
          <li
            key={`${asset.symbol}-${asset.index}`}
            className="flex min-w-0 items-center justify-between gap-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: getAssetColor(asset, asset.index),
                }}
              />
              <span className="truncate">{asset.symbol}</span>
            </span>
            <span className="shrink-0 text-right text-white/60">
              {formatValuation.format(asset.usdValue)}{" "}
              <span className="text-white/40">
                ({formatPercentage.format(asset.usdValue / totalUsdValue)})
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default TreasuryValuationChart;
