# UI Authentication Fix

## Changes Made

### 1. Added Login Page
- Created `/login` page at `apps/ui/src/app/login/page.tsx`
- Allows users to authenticate with email/password
- Stores JWT token in localStorage
- Shows demo credentials

### 2. Updated Service Hub
- Added authentication check on page load
- Redirects to `/login` if not authenticated
- Shows logged-in user email and logout button
- Uses token from localStorage for API calls

### 3. Updated Projects Page
- Added authentication check
- Fetches projects list after login
- Displays projects with evidence and classes count
- Handles 401 errors and redirects to login

### 4. Fixed API Endpoints
- Added `GET /projects` endpoint to list all projects
- Explorer endpoints remain public (no auth required)
- Health endpoint remains public

## How to Use

1. **Access UI**: http://localhost:3000
2. **You'll be redirected to**: http://localhost:3000/login
3. **Login with**:
   - Email: `admin@admin.org`
   - Password: `password123`
4. **After login**: You'll be redirected to the Service Hub
5. **Access protected features**: Projects, Issuance, Transfer, Retire

## Demo Credentials

- `admin@admin.org` / `password123` (Admin)
- `issuer@issuer.co` / `password123` (Issuer)
- `buyer@buyer.co` / `password123` (Buyer)

## Public Endpoints (No Auth Required)

- `GET /api/health` - Health check
- `GET /api/explorer/credits` - Browse credits
- `GET /api/explorer/tokens` - Browse tokens
- `GET /api/explorer/anchors` - Browse anchors

## Protected Endpoints (Require Auth)

- `POST /api/auth/login` - Login (public, returns token)
- `POST /api/projects` - Create project
- `GET /api/projects` - List projects
- `POST /api/projects/:id/evidence` - Upload evidence
- `POST /api/classes` - Create credit class
- `POST /api/transfers` - Transfer credits
- `POST /api/retirements` - Retire credits
- All `/api/chain/*` endpoints

## Token Storage

The JWT token is stored in `localStorage` under the key `token`. It's automatically added to all API requests via the axios interceptor in `src/lib/api.ts`.

## Next Steps

1. Access http://localhost:3000
2. Login with demo credentials
3. Navigate to Projects to see seeded data
4. Create new projects, issue credits, etc.

