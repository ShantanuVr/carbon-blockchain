# Deployment Status

## ✅ Services Running

### 1. **Anvil (Blockchain)**
- Status: ✅ Running
- URL: http://127.0.0.1:8545
- Chain ID: 31337
- Verified: RPC responding

### 2. **API Server (NestJS)**
- Status: ✅ Running  
- URL: http://localhost:4000
- Health: http://localhost:4000/api/health
- Note: Requires DATABASE_URL environment variable

### 3. **UI Server (Next.js)**
- Status: ✅ Running
- URL: http://localhost:3000
- Service Hub: http://localhost:3000

### 4. **PostgreSQL**
- Status: ✅ Running (via Homebrew)
- Database: `carbon_classroom`
- Migrations: ✅ Applied

## 📋 Setup Steps Completed

1. ✅ Dependencies installed (pnpm install)
2. ✅ Database created (`carbon_classroom`)
3. ✅ Migrations applied
4. ✅ Prisma Client generated
5. ✅ Anvil started (background)
6. ✅ API server started (background)
7. ✅ UI server started (background)

## 🔧 Configuration

### Database Connection
Default connection string:
```
postgres://[username]@127.0.0.1:5432/carbon_classroom
```

To use with migrations/scripts:
```bash
export DATABASE_URL="postgres://$(whoami)@127.0.0.1:5432/carbon_classroom"
```

### Environment Variables
Create `.env` files in:
- `/carbon-project/.env` (root)
- `/carbon-project/apps/api/.env` (for API)

Required variables:
- `DATABASE_URL`
- `RPC_URL=http://127.0.0.1:8545`
- `CHAIN_ID=31337`
- `JWT_SECRET`
- `PRIVATE_KEY`

## 🚀 Access Points

- **UI**: http://localhost:3000
- **API**: http://localhost:4000/api
- **API Health**: http://localhost:4000/api/health
- **Anvil RPC**: http://127.0.0.1:8545

## 📝 Next Steps

1. **Seed Database**:
   ```bash
   cd carbon-project
   export DATABASE_URL="postgres://$(whoami)@127.0.0.1:5432/carbon_classroom"
   pnpm seed
   ```

2. **Verify Health**:
   ```bash
   curl http://localhost:4000/api/health
   ```

3. **Run Smoke Tests**:
   ```bash
   cd carbon-project
   export DATABASE_URL="postgres://$(whoami)@127.0.0.1:5432/carbon_classroom"
   pnpm smoke
   ```

## 🛑 Stop Services

To stop all services:
```bash
pkill -f anvil
pkill -f "nest start"
pkill -f "next dev"
```

Or stop individually:
- Anvil: `pkill -f anvil`
- API: `pkill -f "nest start"`  
- UI: `pkill -f "next dev"`

## ⚠️ Troubleshooting

### API Health Check Failing
- Ensure DATABASE_URL is set in API process
- Check PostgreSQL is running: `brew services list | grep postgres`
- Verify database exists and migrations ran

### Seed Script Errors
- Ensure Prisma Client is generated: `pnpm db:generate`
- Set DATABASE_URL before running seed
- Check database connection

### UI Not Loading
- Check Next.js is running: `curl http://localhost:3000`
- Check API is accessible from UI: verify CORS settings
- Check browser console for errors

