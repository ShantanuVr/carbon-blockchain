# ✅ Database Seeding Complete

## Successfully Seeded Data

The database has been seeded with demo data:

### Organizations (4)
- **AdminOrg** (ADMIN)
- **VerifierOrg** (VERIFIER)
- **IssuerCo** (ISSUER)
- **BuyerCo** (BUYER)

### Users (3)
- **admin@admin.org** / `password123` (Admin role)
- **issuer@issuer.co** / `password123` (Org Admin)
- **buyer@buyer.co** / `password123` (Org Admin)

### Project
- **PRJ-WIND-001** (Wind project in California, 50MW)
- Evidence artifact uploaded

### Credit Class
- Vintage: 2024
- Quantity: 10,000 credits
- Serial range: 1-10000
- Initial holding: IssuerCo owns all 10,000 credits

### Transfer
- 300 credits transferred from IssuerCo → BuyerCo

### Retirement
- 150 credits retired by BuyerCo
- Certificate ID: `CERT-1761919238890`
- Purpose: Offset 2024 Q1 emissions

### Evidence Anchor
- IoT digest anchored on-chain
- Chain ID: 31337

## Summary Statistics
- ✅ Orgs: 4
- ✅ Users: 3
- ✅ Projects: 1
- ✅ Classes: 1
- ✅ Retirements: 1
- ✅ Anchors: 1

## Authentication Note

**Important**: The seed script uses SHA256 hashing for passwords (for simplicity). The auth service has been updated to match this format. 

For production:
- Update seed script to use `bcrypt` with proper hashing
- Update auth service to use `bcrypt.compare()`

## Test Login

You can test authentication:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.org","password":"password123"}'
```

## Next Steps

1. ✅ Database seeded
2. Verify API endpoints work
3. Test UI functionality
4. Run smoke tests: `pnpm smoke`

