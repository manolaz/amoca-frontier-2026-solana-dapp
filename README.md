# 🌿 Tangram Green

> **The green finance rail for agricultural trade — tokenizing verified export invoices, sustainability data, and working capital on Solana.**

Tangram Green is a decentralised application (dApp) that brings agricultural trade finance on-chain. It lets exporters tokenize verified trade invoices as compressed NFTs (cNFTs), connects them to a marketplace where financiers can provide working capital, and closes the loop when buyers confirm receipt of goods — all with embedded sustainability scoring, end-to-end auditability, and near-zero transaction costs on Solana.

---

## Table of Contents

- [Why Tangram Green](#why-tangram-green)
- [Core Features](#core-features)
- [Who It Is For](#who-it-is-for)
- [Architecture](#architecture)
- [Invoice Lifecycle](#invoice-lifecycle)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [On-Chain Program](#on-chain-program)
- [Deploying to Devnet](#deploying-to-devnet)
- [Environment Variables](#environment-variables)
- [Roadmap](#roadmap)
- [License](#license)

---

## Why Tangram Green

Agricultural exporters in emerging markets face a chronic working capital gap. A verified invoice can sit unpaid for 60–120 days while exporters struggle to fund the next harvest. Traditional trade finance is slow, opaque, and largely inaccessible to small-to-mid-size producers.

Tangram Green solves this by:

- **Tokenizing invoices** as compressed NFTs on Solana, making them transferable, verifiable, and composable with DeFi
- **Embedding sustainability data** (carbon scores, IPFS-pinned audit reports) so green premiums can be priced into financing rates
- **Creating a permissionless marketplace** where any qualified financier can fund an invoice in one transaction
- **Recording every status transition** on-chain so buyers, banks, and regulators can audit the full paper trail in real time

---

## Core Features

| Feature | Description |
|---|---|
| **Invoice Submission** | Exporters submit trade invoices with commodity codes, USDC face value, buyer address, and optional sustainability data |
| **Verifier Approval Workflow** | Designated verifiers review pending invoices and either approve or reject with a typed reason; approval triggers cNFT minting |
| **Compressed NFT Minting** | Each verified invoice is minted as a cNFT via Metaplex Bubblegum — the NFT carries all invoice attributes as on-chain metadata |
| **Financing Marketplace** | Exporters list verified invoices at an ask price; the implied yield is displayed to financiers for instant comparison |
| **ESG Scoring** | Carbon scores (0–100) are stored on-chain; the UI renders Excellent / Good / Moderate / Poor labels with colour-coded indicators |
| **Working Capital Panel** | Exporters see their portfolio status at a glance and can list verified invoices for financing with a single click |
| **Buyer Confirmation** | Buyers confirm receipt of goods on-chain, triggering repayment and marking the invoice as Completed |
| **Invoice Timeline** | Every invoice has a 5-step visual timeline (Submitted → Verified → Listed → Funded → Completed) with on-chain timestamps |
| **Role-Based Navigation** | Four distinct dashboards — Exporter, Buyer, Financier, Verifier — with persistent role selection and role-specific data views |
| **Wallet-Gated Actions** | All write operations require a connected Solana wallet (Phantom, Backpack, Solflare, etc.) |
| **Devnet / Testnet Support** | Chain switcher in the nav bar; all RPC calls routed through the selected cluster |

---

## Who It Is For

### 🌾 Agricultural Exporters
Small-to-mid-size producers and exporters who issue trade invoices and need access to working capital before buyer payment terms clear. Tangram Green lets them tokenize invoices, attach sustainability proof, and receive financing — without a bank intermediary.

### 🏦 Trade Financiers & Impact Investors
Institutional and retail financiers seeking yield from short-duration agricultural trade assets with embedded ESG data. The marketplace displays face value, ask price, implied yield, carbon score, and commodity class so financing decisions can be made in seconds.

### 🛒 Commodity Buyers & Importers
Buyers who issue purchase orders for agricultural goods and confirm receipt on-chain. Their confirmation closes the trade cycle and triggers automatic settlement — reducing disputes and paper-based delays.

### 🔍 Sustainability Verifiers
Independent auditors and certification bodies who review submitted invoices, validate carbon scores and sustainability documentation (via IPFS hashes), and issue on-chain approvals that unlock financing and cNFT minting.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React / Vite)                   │
│                                                                   │
│  Landing   Exporter   Verifier   Marketplace   Financier  Buyer  │
│  Page      Dashboard  Dashboard  Dashboard     Dashboard   Dash  │
│                                                                   │
│   ┌──────────┐  ┌──────────────┐  ┌────────────────────────┐    │
│   │ SWR +    │  │ useTangram-  │  │   useMintInvoiceNFT    │    │
│   │ useInv-  │  │ Program.ts   │  │   (Metaplex UMI +      │    │
│   │ oices.ts │  │ (@coral-xyz/ │  │    Bubblegum cNFT)     │    │
│   │          │  │  anchor)     │  │                        │    │
│   └──────────┘  └──────────────┘  └────────────────────────┘    │
└─────────────────────────┬───────────────────────────────────────┘
                          │ RPC (devnet / testnet)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Solana Blockchain                              │
│                                                                   │
│  ┌──────────────────────────────┐  ┌───────────────────────┐    │
│  │  tangram-invoice (Anchor)    │  │  Metaplex Bubblegum   │    │
│  │                              │  │  (Concurrent Merkle   │    │
│  │  submit_invoice              │  │   Tree cNFT Program)  │    │
│  │  verify_invoice ──────────────────► mintToCollectionV1  │    │
│  │  reject_invoice              │  │                       │    │
│  │  create_listing              │  └───────────────────────┘    │
│  │  fund_invoice                │                               │
│  │  confirm_receipt             │  USDC SPL Token               │
│  │  attach_sustainability_data  │  (devnet: Circle faucet)      │
│  └──────────────────────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

**Invoice PDAs** are derived from `[b"invoice", exporter_pubkey, invoice_id]`, giving every invoice a deterministic, verifiable on-chain address.

---

## Invoice Lifecycle

```
Exporter submits invoice
        │
        ▼
  [Pending] ──── Verifier rejects ──► [Rejected]
        │
        │  Verifier approves
        │  + cNFT minted
        ▼
  [Verified]
        │
        │  Exporter lists for financing
        ▼
   [Listed] ◄──── visible in Marketplace
        │
        │  Financier funds
        ▼
   [Funded]
        │
        │  Buyer confirms receipt
        ▼
 [Completed]
```

Each transition emits an on-chain event (`InvoiceSubmitted`, `InvoiceVerified`, `InvoiceFunded`, `ReceiptConfirmed`) for off-chain indexers.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | React + Vite | 19 / 8 |
| Language | TypeScript | 5.8 |
| UI Components | Radix UI Themes | 3.3 |
| Routing | React Router | 7.6 |
| Data Fetching | SWR | 2.4 |
| Solana Primitives | @solana/kit | 6.9 |
| Wallet Integration | @solana/react + Wallet Standard | 6.9 |
| Smart Contract Framework | Anchor | 0.31 |
| cNFT Minting | Metaplex UMI + Bubblegum | 4.3 |
| Token Metadata | Metaplex mpl-token-metadata | 3.3 |
| Blockchain | Solana (devnet → mainnet-beta) | — |
| Bundler | Vite + SWC | 8 / 4 |

---

## Project Structure

```
tangram-green/
├── index.html
├── vite.config.ts
├── tsconfig.app.json
├── Anchor.toml                          # Anchor workspace config
├── Cargo.toml                           # Rust workspace
│
├── programs/
│   └── tangram-invoice/
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs                   # Anchor program (7 instructions)
│
└── src/
    ├── main.tsx                         # App root, BrowserRouter, providers
    ├── index.css                        # Brand palette CSS variables
    │
    ├── context/
    │   ├── RoleContext.tsx              # Exporter / Buyer / Financier / Verifier
    │   ├── ChainContextProvider.tsx     # devnet / testnet chain switcher
    │   └── RpcContextProvider.tsx       # @solana/kit RPC client
    │
    ├── routes/
    │   ├── root.tsx                     # Landing page + role-selector cards
    │   ├── exporter.tsx                 # Submit invoices, manage portfolio
    │   ├── verifier.tsx                 # Review & approve / reject invoices
    │   ├── marketplace.tsx              # Browse & fund listed invoices
    │   ├── financier.tsx                # Portfolio: deployed capital & repayments
    │   ├── buyer.tsx                    # Confirm receipt of funded invoices
    │   └── invoice.tsx                  # Invoice detail + timeline (/invoice/:id)
    │
    ├── components/
    │   ├── Nav.tsx                      # Topbar: logo, role switcher, wallet connect
    │   ├── InvoiceCard.tsx              # Reusable invoice summary card
    │   ├── InvoiceStatusBadge.tsx       # Coloured status pill
    │   ├── SustainabilityScore.tsx      # ESG score with colour label + IPFS link
    │   ├── CurrencyAmount.tsx           # Formatted USDC display
    │   └── WalletGuard.tsx              # Gate content behind wallet connection
    │
    ├── hooks/
    │   ├── useInvoices.ts               # SWR invoice fetcher (mock → on-chain)
    │   ├── useTangramProgram.ts         # Anchor instruction wrappers
    │   └── useMintInvoiceNFT.ts         # Bubblegum cNFT minting hook
    │
    └── programs/
        ├── constants.ts                 # Program ID, USDC mint, status maps
        └── types.ts                     # TypeScript mirror of on-chain account types
```

---

## Getting Started

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | ≥ 20 | LTS recommended |
| npm | ≥ 10 | Comes with Node 20 |
| Rust | ≥ 1.75 | `rustup install stable` |
| Anchor CLI | 0.31.x | See [Deploying to Devnet](#deploying-to-devnet) |
| Solana CLI | ≥ 1.18 | `sh -c "$(curl -sSfL https://release.solana.com/stable/install)"` |
| Phantom / Backpack | latest | Any Wallet Standard–compatible browser wallet |

### Install & Run

```bash
# 1. Clone
git clone https://github.com/your-org/amoca-frontier-2026-solana-dapp.git
cd amoca-frontier-2026-solana-dapp

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser, connect a Solana wallet set to **devnet**, and select a role from the landing page.

> **Windows users:** If you run `npm install` from WSL on an NTFS-mounted drive, use a WSL-native path (e.g. `~/tangram-green-build`) to avoid NTFS rename permission errors. Copy `node_modules` back afterward or install directly from a Windows terminal (`cmd` / PowerShell).

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| Dev server | `npm run dev` | Vite HMR dev server on port 5173 |
| Production build | `npm run build` | Bundles to `dist/` |
| Preview build | `npm run preview` | Serves `dist/` locally |
| Type check | `npm run typecheck` | `tsc --noEmit` without bundling |

---

## On-Chain Program

The Anchor program lives at `programs/tangram-invoice/src/lib.rs`.

### Instructions

| Instruction | Signer | Description |
|---|---|---|
| `submit_invoice` | Exporter | Creates an `Invoice` PDA (status: Pending) |
| `verify_invoice` | Verifier | Approves the invoice (status: Verified); emits `InvoiceVerified` |
| `reject_invoice` | Verifier | Rejects with a reason string (status: Rejected) |
| `create_listing` | Exporter | Lists a verified invoice on the marketplace (status: Listed) |
| `fund_invoice` | Financier | Transfers USDC face value to exporter, records funder (status: Funded) |
| `confirm_receipt` | Buyer | Confirms delivery; closes the trade cycle (status: Completed) |
| `attach_sustainability_data` | Exporter | Updates IPFS hash and carbon score on an existing invoice |

### Account PDA Seeds

```
["invoice", exporter_pubkey, invoice_id_bytes]
```

### Events Emitted

`InvoiceSubmitted` · `InvoiceVerified` · `InvoiceRejected` · `InvoiceFunded` · `ReceiptConfirmed`

### Error Codes

`InvalidInvoiceId` · `InvoiceAlreadyExists` · `InvalidStatus` · `Unauthorized` · `InvalidAmount` · `InvalidCarbonScore` · `RejectionReasonTooLong`

---

## Deploying to Devnet

### 1. Install Anchor CLI

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install 0.31.1
avm use 0.31.1
```

### 2. Configure Solana CLI for devnet

```bash
solana config set --url devnet
solana-keygen new --outfile ~/.config/solana/id.json   # skip if you already have a keypair
solana airdrop 2                                        # fund deployer wallet
```

### 3. Build & Deploy

```bash
anchor build
anchor deploy --provider.cluster devnet
```

Copy the printed program ID and update two files:

```ts
// src/programs/constants.ts
export const PROGRAM_ID = '<YOUR_DEPLOYED_PROGRAM_ID>';
```

```toml
# Anchor.toml
[programs.devnet]
tangram_invoice = "<YOUR_DEPLOYED_PROGRAM_ID>"
```

### 4. Create the Merkle Tree for cNFT Minting

```bash
npx ts-node scripts/create-merkle-tree.ts
```

Copy the printed tree address and update:

```ts
// src/programs/constants.ts
export const MERKLE_TREE_ADDRESS = '<YOUR_MERKLE_TREE_ADDRESS>';
```

### 5. Replace Stubs with Live Anchor Calls

In `src/hooks/useTangramProgram.ts` and `src/hooks/useMintInvoiceNFT.ts`, locate the `// LIVE IMPLEMENTATION` comment blocks and uncomment the real Anchor / UMI code. The stub layer (`isLive: false`) was designed to let the UI run fully before the program is deployed.

---

## Environment Variables

No `.env` file is required for the default devnet setup. All RPC endpoints are derived from the chain context selected in the UI. If you want to override the default RPC:

```bash
# .env.local (optional)
VITE_RPC_ENDPOINT=https://api.devnet.solana.com
```

---

## Roadmap

- [ ] Deploy `tangram-invoice` program to devnet and replace stub hooks
- [ ] Create Merkle Tree + mint first live Invoice cNFT
- [ ] Integrate Circle USDC devnet faucet for end-to-end transfer tests
- [ ] Add IPFS pinning flow (Web3.Storage / Pinata) for sustainability documents
- [ ] Implement off-chain indexer using `getProgramAccounts` and SWR live refresh
- [ ] Add financier analytics dashboard (IRR, duration, portfolio breakdown by commodity)
- [ ] Multi-currency support (EURC, USDT)
- [ ] Mainnet-beta deployment after audit
- [ ] Mobile-responsive layout pass

---

## License

[MIT](LICENSE) © 2026 AMOCA Frontier
