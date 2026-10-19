import "@/config/env";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { ProgressBarProvider } from "./components/TopLoadingBar";
import { UserProvider } from "./components/providers/UserProvider";
import { QueryProvider } from "./components/providers/QueryProvider";
import { ToastProvider } from "@/components/ui/ToastQueue";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Script from "next/script";
import SvgSprite from "@/components/icons/SvgSprite";
import { SecurityBanner } from "@/components/navigation/SecurityBanner";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import { PWAInstallGuideModal } from "@/components/pwa/PWAInstallGuideModal";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";
import { SwUpdateBanner } from "@/components/pwa/SwUpdateBanner";
import { OfflineDraftSyncRoot } from "@/components/offline";
import { ScreenLockProvider } from "@/components/security/ScreenLockModal";
import { SessionTimeoutManager } from "@/components/security/SessionTimeoutManager";
import { InactivityLockGuard } from "@/components/security/InactivityLockGuard";
import { CspReporterInit } from "@/components/security/CspReporterInit";
import { StorageSanitizer } from "@/components/providers/StorageSanitizer";
import { WalletSessionProvider } from "@/context/WalletContext";
import { GasFeeProvider as _GasFeeProvider } from "@/components/gas-fee";
import { headers } from "next/headers";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import { HapticProvider } from "@/components/providers/HapticProvider";
import { PushNotificationRoot } from "@/components/notifications";
import {
  MultisigNotificationBadge,
  MultisigNotificationProvider,
} from "@/components/multisig";
import { RpcFailoverMonitor } from "./components/providers/RpcFailoverMonitor";
import { CommandPalette } from "@/components/command-palette";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { CircuitBreakerBanner, CircuitBreakerProvider } from "@/components/circuit-breaker";
import { InstallBanner } from "./components/InstallBanner";

export const metadata: Metadata = {
  title: "StellarFlow Network Dashboard",
  description:
    "Monitor relayers, contracts, logs, and network health in real time.",
  manifest: "/manifest.json",
  themeColor: "#39ff14",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "StellarFlow",
  },
  icons: {
    apple: "/icon-192.svg",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

import { subresourceRecoveryScript } from "@/utils/subresourceRecovery";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode; }>) {
  const nonce =
    process.env.NEXT_OUTPUT_MODE === "export"
      ? undefined
      : ((await headers()).get("x-nonce") ?? undefined);
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to polyfill CDN (font files are self-hosted via next/font, so no Google Fonts preconnect needed) */}
        <link
          rel="preconnect"
          href="https://polyfill-library.fastly.dev"
        />
        <link
          rel="preconnect"
          href="https://raw.githubusercontent.com"
        />
        <link
          rel="preconnect"
          href="https://assets.coingecko.com"
        />
        <link
          rel="preload"
          href="/sf.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="/sprite.svg"
          as="image"
          type="image/svg+xml"
          fetchPriority="low"
        />
        {/* PWA: apple-touch-icon for iOS home-screen bookmarks */}
        <link
          rel="apple-touch-icon"
          href="/icon-192.svg"
          sizes="192x192"
        />
        <Script
          id="polyfill-loader"
          nonce={nonce}
          strategy="afterInteractive"
          fetchPriority="low"
          integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
          crossOrigin="anonymous"
          dangerouslySetInnerHTML={{
            __html: `
              if (!('IntersectionObserver' in window) || 
                  !('ResizeObserver' in window) || 
                  !('fetch' in window) || 
                  !('Promise' in window)) {
                console.info('StellarFlow: Modern features missing. Loading on-demand polyfills...');
                var js = document.createElement('script');
                js.src = 'https://polyfill-library.fastly.dev/v3/polyfill.min.js?features=default,IntersectionObserver,ResizeObserver,fetch,Promise';
                js.integrity = 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC';
                js.crossOrigin = 'anonymous';
                document.head.appendChild(js);
              }
            `
          }}
        />
      </head>
      <body
        className="antialiased font-sans flex flex-col min-h-screen"
      >
        <Script
          id="subresource-recovery"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: subresourceRecoveryScript }}
          nonce={nonce}
        />
        {/*
         * Apply saved theme and contrast preferences before first paint.
         * beforeInteractive runs this before Next.js client code loads.
         */}
        <Script
          id="theme-preference-bootstrap"
          strategy="beforeInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var r=document.documentElement;var s=localStorage.getItem('stellarflow-theme');var d=s==='dark'||(!s&&window.matchMedia('(prefers-color-scheme: dark)').matches);r.classList.toggle('dark',d);r.classList.toggle('light',!d);var c=localStorage.getItem('stellarflow-high-contrast');var h=c===null?window.matchMedia('(prefers-contrast: more)').matches:c==='true';r.classList.toggle('high-contrast',h);r.dataset.contrast=h?'high':'normal';}catch(e){}})();`,
          }}
        />
        <GlobalErrorBoundary>
        <CircuitBreakerProvider>
        <OfflineBanner />
        {/*
          Circuit breaker provider wraps the whole tree so an on-chain
          `CircuitBreakerTriggered` event can lock the action CTAs of any
          affected module view, not just the page that happens to be open.
          The banner itself sits above it in document order so it is the first
          thing a user meets when a pause lands.
        */}
        <CircuitBreakerBanner />
        <CspReporterInit />
        <StorageSanitizer />
        <SvgSprite />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="stellarflow-theme"
          disableTransitionOnChange
        >
          <AccessibilityProvider>
            <HapticProvider>
              <UserProvider>
                <QueryProvider>
                  <ProgressBarProvider>
                      <ToastProvider>
                        <RpcFailoverMonitor />
                        <PushNotificationRoot>
                          <ErrorBoundary tags={{ section: "root" }}>
                            <WalletSessionProvider>
                              {/*
                                Co-signer alerts (#962) live here so the
                                top-bar badge can read the connected wallet
                                and the pending-signature queue from anywhere.
                              */}
                              <MultisigNotificationProvider>
                                <SessionTimeoutManager>
                                  <ScreenLockProvider>
                                      <InactivityLockGuard>
                                        <div className="fixed top-3 right-3 z-40 flex items-center gap-2">
                                          <MultisigNotificationBadge />
                                          <SecurityBanner />
                                        </div>
                                        {children}
                                        <MobileBottomNav />
                                      </InactivityLockGuard>
                                  </ScreenLockProvider>
                                </SessionTimeoutManager>
                              </MultisigNotificationProvider>
                            </WalletSessionProvider>
                          </ErrorBoundary>
                        </PushNotificationRoot>
                      </ToastProvider>
                      <SwUpdateBanner />
                      <InstallBanner />
                      <OfflineDraftSyncRoot />
                      <PWAInstallGuideModal />
                      <CommandPalette />
                  </ProgressBarProvider>
                </QueryProvider>
              </UserProvider>
            </HapticProvider>
          </AccessibilityProvider>
        </ThemeProvider>
        </CircuitBreakerProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
