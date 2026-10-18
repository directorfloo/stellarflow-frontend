# 🌊 StellarFlow Frontend

> 🌍 **Africa-Oriented Data Oracle Dashboard** | Modern Web3 interface for localized real-time data on Stellar.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Next.js](https://img.shields.io/badge/Next.js-v14.0+-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.0+-blue.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.3+-38bdf8.svg)
![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)

> High-performance, accessible, and responsive Web3 user interface powering **StellarFlow**—the next-generation decentralized exchange (DEX), collateralized vaults, yield aggregators, and ZK-shielded cross-border remittance portal built on the Stellar network.

---

## 📐 Architecture & App Structure

`stellarflow-frontend` is built with Next.js (App Router), TypeScript, TailwindCSS, and Radix UI primitives. It provides real-time market data visualization via WebSockets, seamless wallet connection interfaces (Freighter, Albedo, WalletConnect), and client-side zero-knowledge (ZK) proof generation using WebAssembly (WASM).

```
stellarflow-frontend/
├── app/                  # Next.js App Router pages & layouts
│   ├── (trading)/        # Swap views, order book depth, & charting
│   ├── vaults/           # Collateralized debt positions & health factor gauges
│   ├── yield/            # Auto-compounding strategy vaults & APY calculators
│   ├── governance/       # DAO proposal cards, voting, & delegation trees
│   ├── remittance/       # Interactive SEP-24/31/38 fiat onboarding widgets
│   └── portfolio/        # Multi-wallet PnL charts & activity streams
├── components/           # Reusable UI component library
│   ├── ui/               # Radix UI design primitives (Buttons, Modals, Inputs)
│   ├── wallet/           # Freighter & WalletConnect connection modals
│   ├── charting/         # TradingView & HTML5 Canvas order book visualizers
│   └── zk/               # Client-side WASM ZK proof loading indicators
├── hooks/                # Custom React hooks (WebSockets, SWR price feeds, Session)
├── lib/                  # Soroban SDK instances, formatters, & client helpers
├── public/               # Static assets, WebAssembly binaries, & PWA manifest
├── e2e/                  # Playwright & Cypress end-to-end test suites
└── styles/               # Global TailwindCSS styles & design tokens

```

---

## 🛠 Tech Stack & Tooling

* **Framework:** Next.js 14+ (App Router) / React 18+
* **State Management & Data:** Zustand (Session/UI State) & TanStack Query / SWR
* **Styling & Components:** TailwindCSS, Radix UI Primitives, Lucide Icons
* **Wallet & Blockchain SDKs:** `@stellar/freighter-api`, `@walletconnect/universal-provider`, `@stellar/stellar-sdk`
* **Charts & Visualizers:** Lightweight-Charts, Recharts, HTML5 Canvas
* **Testing & Quality:** Playwright (E2E), Vitest, Storybook v7+, ESLint, Prettier

---

## 🚀 Quickstart Guide

### Prerequisites

* **Node.js**: `v18.17.0` or higher
* **Package Manager**: `pnpm` (recommended), `npm`, or `yarn`

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone [https://github.com/stellarflow/stellarflow-frontend.git](https://github.com/stellarflow/stellarflow-frontend.git)
cd stellarflow-frontend
pnpm install

```

### 2. Environment Configuration

Copy the sample environment file and configure your local settings:

```bash
cp .env.example .env.local

```

## Ensure your `.env.local` contains the active RPC and backend API endpoints:

- NEXT_PUBLIC_SOROBAN_RPC_URL=[https://soroban-testnet.stellar.org](https://soroban-testnet.stellar.org)

- NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8000/api/v1

- NEXT_PUBLIC_WS_MARKET_URL= ws://localhost:8000/ws


### 3. Development Server

Run the Next.js development server:

```bash
pnpm dev

```

Open [http://localhost:3000](http://localhost:3000) in your browser to inspect the application.

---

## 🧪 Testing & Code Quality

Run unit and component tests:

```bash
# Run Vitest component tests
pnpm test

# Run Playwright End-to-End tests
pnpm test:e2e

```

Run linter, type checks, and code formatting:

```bash
# Type check with TypeScript compiler
pnpm type-check

# Lint codebase with ESLint & Tailwind rules
pnpm lint

```

---



## 🤝 Contributing

We welcome open-source contributors! Browse open tasks on our GitHub issue board tagged `good-first-issue` or `help-wanted`.

1. **Fork the repository** and create a feature branch (`git checkout -b feature/my-ui-patch`).
2. **Commit your changes** with clear commit messages and component tests.
3. **Open a Pull Request** linking the corresponding issue ID.

*Thank you to all our open-source contributors for making StellarFlow fast, accessible, and beautiful!*

---

## 📄 License

This repository is licensed under the [MIT License](https://www.google.com/search?q=LICENSE).
