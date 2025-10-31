# Carbon Credits Classroom Demo

A complete carbon credit workflow demonstration system with registry, blockchain tokens, and evidence anchoring. Built for classroom use with **one UI service** and **one API service**, running locally without Docker.

## Features

- **Credits Lane (Registry)**: Project → Evidence → Issuance → Transfer → Retirement (Certificate)
- **Token Lane (Blockchain)**: Mint/burn tokens representing credits on-chain
- **Evidence Lane (IoT + Anchoring)**: Daily digest hashes anchored on-chain
- **Service Hub**: Single page navigation to all features

## Architecture

- **UI**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **API**: NestJS + TypeScript + Prisma
- **DB**: PostgreSQL (local)
- **Chain**: Anvil (Foundry) local at `http://127.0.0.1:8545`
- **IPFS**: Optional Kubo daemon at `127.0.0.1:5001`
- **Storage**: Local filesystem (`./var/evidence`, `./var/certificates`)

## Prerequisites

- Node.js 20+
- pnpm: `corepack enable && corepack prepare pnpm@9 --activate`
- PostgreSQL 15+ (local)
- Foundry (Anvil): https://book.getfoundry.sh/getting-started/installation
- Optional: IPFS Kubo (`brew install ipfs` or download)

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Database Setup

```bash
# Create database
createdb carbon_classroom

# Run migrations
pnpm db:migrate
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Start Services (in separate terminals)

**Terminal 1 - PostgreSQL** (if not running as service):
```bash
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

**Terminal 2 - Anvil (Blockchain)**:
```bash
anvil --block-time 1
```

**Terminal 3 - IPFS (Optional)**:
```bash
ipfs daemon
```

**Terminal 4 - API**:
```bash
pnpm dev:api
# Runs on http://localhost:4000
```

**Terminal 5 - UI**:
```bash
pnpm dev:ui
# Runs on http://localhost:3000
```

### 5. Seed Demo Data

```bash
pnpm seed
```

### 6. Run Smoke Tests

```bash
pnpm smoke
```

## Usage

1. Open `http://localhost:3000` in your browser
2. Navigate to Service Hub to see system status
3. Use the feature cards to:
   - Create projects and upload evidence
   - Issue credit classes
   - Transfer credits between organizations
   - Retire credits and generate certificates
   - Explore credits, tokens, and anchors
   - Admin tools (seed data, smoke tests)

## Default Credentials

After seeding:
- `admin@admin.org` / `password123`
- `issuer@issuer.co` / `password123`
- `buyer@buyer.co` / `password123`

## Project Structure

```
carbon-classroom/
  apps/
    ui/              # Next.js UI
    api/             # NestJS API
  packages/
    shared-types/    # Zod schemas
    carbon-conversion-lib/  # Conversion utilities
  contracts/        # Foundry smart contracts
  scripts/          # Seed, smoke tests
  prisma/           # Database schema
  var/              # Evidence & certificates
```

## Smart Contracts

Deploy contracts (after Foundry setup):

```bash
cd contracts
forge install  # Install OpenZeppelin
forge build
forge script script/Deploy.s.sol:DeployScript --rpc-url http://127.0.0.1:8545 --broadcast
```

Contract addresses will be saved to `contracts/addresses.json`.

## API Endpoints

Base URL: `http://localhost:4000/api`

- `GET /health` - Health check
- `POST /auth/login` - Login
- `POST /projects` - Create project
- `POST /projects/:id/evidence` - Upload evidence
- `POST /classes` - Create credit class
- `POST /classes/:id/finalize` - Finalize class
- `POST /transfers` - Transfer credits
- `GET /holdings?orgId=...` - Get holdings
- `POST /retirements` - Retire credits
- `POST /chain/mint` - Mint tokens
- `POST /chain/burn` - Burn tokens
- `POST /chain/anchor` - Anchor evidence
- `GET /explorer/credits` - Explore credits
- `GET /explorer/tokens` - Explore tokens
- `GET /explorer/anchors` - Explore anchors

## Development

```bash
# Build all packages
pnpm build

# Run API in watch mode
pnpm dev:api

# Run UI in watch mode
pnpm dev:ui

# Database commands
pnpm db:migrate
pnpm db:generate
```

## License

Educational use - Classroom demo project

