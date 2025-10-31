# Blockchain Integration & Registry Adapter

## Overview

This document describes the blockchain integration architecture, registry-adapter pattern, and certificate generation system for the Carbon Credits platform.

## Architecture

### Registry Adapter Pattern

The **Registry Adapter Service** (`apps/api/src/chain/registry-adapter.service.ts`) bridges the off-chain registry (PostgreSQL database) with on-chain smart contracts (Ethereum/Foundry).

#### Key Responsibilities:
1. **Mint On Finalize**: When a credit class is finalized, automatically mints tokens on-chain
2. **Transfer On Chain**: When credits are transferred in the registry, transfers tokens on-chain
3. **Burn On Retirement**: When credits are retired, burns tokens on-chain
4. **Certificate Generation**: Generates certificates for all blockchain actions (MINT, TRANSFER, RETIREMENT)

### Smart Contract Integration

The **Chain Service** (`apps/api/src/chain/chain.service.ts`) handles direct interaction with smart contracts:

#### Contracts:
- **CarbonCredit1155**: ERC-1155 token contract for carbon credits
  - `mintClass()`: Maps classId to tokenId and mints initial supply
  - `mint()`: Mints additional tokens for existing class
  - `burn()`: Burns tokens (retirement)
  - `safeTransferFrom()`: Transfers tokens between wallets

- **EvidenceAnchor**: Anchors evidence hashes on-chain
  - `anchor()`: Stores SHA256 hash of evidence on blockchain

#### Features:
- **Mock Mode**: Automatically falls back to simulated transactions if contracts aren't deployed
- **Contract Detection**: Automatically loads contract addresses from `contracts/addresses.json`
- **Error Handling**: Gracefully handles blockchain errors while maintaining registry consistency

## Integration Flow

### 1. Credit Class Minting

```
User creates Credit Class
    ↓
ClassesService.create()
    ↓
User calls finalize endpoint
    ↓
ClassesService.finalize()
    ↓
RegistryAdapter.mintOnFinalize()
    ↓
ChainService.mint() → Smart Contract
    ↓
Certificate Generated → MINT Certificate
```

### 2. Credit Transfer

```
User initiates transfer
    ↓
TransfersService.create()
    ↓
Registry updates (holdings adjusted)
    ↓
RegistryAdapter.transferOnChain() (if wallets provided)
    ↓
ChainService.transfer() → Smart Contract
    ↓
Certificate Generated → TRANSFER Certificate
```

### 3. Credit Retirement

```
User retires credits
    ↓
RetirementsService.create()
    ↓
Registry updates (holdings decremented)
    ↓
RegistryAdapter.burnOnRetirement() (if wallet provided)
    ↓
ChainService.burn() → Smart Contract
    ↓
Certificate Generated → RETIREMENT Certificate
```

## Certificate System

### Certificate Types

1. **MINT Certificate**
   - Type: `MINT`
   - Contains: classId, tokenId, project info, quantity, serial range, blockchain txHash
   - Generated when: Credit class is finalized and tokens are minted

2. **TRANSFER Certificate**
   - Type: `TRANSFER`
   - Contains: transferId, from/to orgs, class info, quantity, blockchain txHash
   - Generated when: Credits are transferred on-chain

3. **RETIREMENT Certificate**
   - Type: `RETIREMENT`
   - Contains: certificateId, org, class, quantity, serial range, purpose/beneficiary hashes, blockchain burn txHash
   - Generated when: Credits are retired and tokens are burned

### Certificate API

```
GET /api/certificates/:type/:id
```

- `type`: MINT | TRANSFER | RETIREMENT
- `id`: classId (for MINT), transferId (for TRANSFER), certificateId (for RETIREMENT)

## Database Schema Changes

### Transfer Model
Added `chainTransferTx` field to track on-chain transfer transactions:
```prisma
model Transfer {
  ...
  chainTransferTx String?
  ...
}
```

## Configuration

### Environment Variables

- `RPC_URL`: Blockchain RPC endpoint (default: `http://127.0.0.1:8545`)
- `PRIVATE_KEY`: Wallet private key for signing transactions
- `CHAIN_ID`: Chain ID (default: `31337` for Anvil)
- `DEFAULT_MINT_ADDRESS`: Default wallet address for minting (optional)

### Contract Deployment

Contracts must be deployed using Foundry:
```bash
cd contracts
make deploy
```

This generates `addresses.json` with contract addresses that the ChainService automatically loads.

## Usage Examples

### Finalize and Mint Credit Class

```typescript
// POST /api/classes/:id/finalize
const response = await api.post(`/classes/${classId}/finalize`, {
  orgWalletAddress: '0x...' // optional
});

// Response includes:
{
  message: 'Class finalized and tokens minted',
  classId: '...',
  tokenId: 12345,
  txHash: '0x...',
  certificate: { ... }
}
```

### Transfer with On-Chain Transfer

```typescript
// POST /api/transfers
const response = await api.post('/transfers', {
  fromOrgId: '...',
  toOrgId: '...',
  classId: '...',
  quantity: 100
  // Note: Wallet addresses would need to be provided via headers or separate endpoint
});

// Response includes chainTransferTx if on-chain transfer succeeds
```

### Retire with On-Chain Burn

```typescript
// POST /api/retirements
const response = await api.post('/retirements', {
  orgId: '...',
  classId: '...',
  quantity: 50,
  purposeHash: '0x...',
  beneficiaryHash: '0x...',
  walletAddress: '0x...' // optional, triggers on-chain burn
});

// Response includes chainBurnTx and certificate if burn succeeds
```

### Get Certificate

```typescript
// GET /api/certificates/MINT/:classId
// GET /api/certificates/TRANSFER/:transferId
// GET /api/certificates/RETIREMENT/:certificateId

const certificate = await api.get(`/certificates/RETIREMENT/${certId}`);
```

## Mock Mode

If contracts aren't deployed, the system operates in "mock mode":
- Transactions are simulated (generates fake txHashes)
- Registry updates still occur
- Certificates are still generated
- All functionality works off-chain

This allows development without a running blockchain.

## Next Steps (UI Integration)

1. **Issuance Page**: Add "Finalize & Mint" button that calls finalize endpoint
2. **Transfer Page**: Show blockchain status and certificate links
3. **Retire Page**: Show burn transaction status and certificate
4. **Certificate Viewer**: New page to display/download certificates
5. **Explorer Page**: Show on-chain transaction status for all operations

## Files Modified/Created

### New Files:
- `apps/api/src/chain/registry-adapter.service.ts` - Registry adapter
- `apps/api/src/certificates/certificates.controller.ts` - Certificate API
- `apps/api/src/certificates/certificates.module.ts` - Certificate module

### Modified Files:
- `apps/api/src/chain/chain.service.ts` - Full smart contract integration
- `apps/api/src/chain/chain.module.ts` - Exports RegistryAdapterService
- `apps/api/src/classes/classes.service.ts` - Integrates with registry adapter
- `apps/api/src/transfers/transfers.service.ts` - Integrates with registry adapter
- `apps/api/src/retirements/retirements.service.ts` - Integrates with registry adapter
- `prisma/schema.prisma` - Added `chainTransferTx` field
- `packages/shared-types/src/index.ts` - Added `walletAddress` and `toAddress`/`amount` fields

## Testing

To test the integration:

1. **Start local blockchain**:
   ```bash
   cd contracts
   anvil
   ```

2. **Deploy contracts**:
   ```bash
   make deploy
   ```

3. **Start API** with environment variables:
   ```bash
   export RPC_URL="http://127.0.0.1:8545"
   export PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
   export CHAIN_ID="31337"
   pnpm dev:api
   ```

4. **Test minting**:
   - Create a credit class
   - Call finalize endpoint
   - Verify tokenId is assigned and certificate is generated

5. **Test transfers and retirements** similarly

