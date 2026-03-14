# FocusOS - Database Setup Instructions

## Current Issue
- Docker Desktop is not running
- Local PostgreSQL installed but requires authentication setup
- SQLite not compatible (needs PostgreSQL features)

## Quick Solution Options

### Option 1: Start Docker Desktop (Recommended - 2 minutes)

1. **Start Docker Desktop** application on Windows
2. Wait for Docker to fully start (check system tray icon)
3. Run these commands:
   ```bash
   cd m:\Project\2026\FocusOS
   docker-compose up -d
   npx prisma migrate dev --name init
   npm run dev
   ```

### Option 2: Use Free Hosted PostgreSQL (5 minutes)

**Using Neon (Free, No Credit Card)**:
1. Go to [https://neon.tech](https://neon.tech)
2. Sign up (GitHub signup available)
3. Create new project
4. Copy connection string
5. Update `.env`:
   ```env
   DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require"
   ```
6. Run:
   ```bash
   npx prisma migrate dev --name init
   npm run dev
   ```

**Using Supabase (Free, No Credit Card)**:
1. Go to [https://supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Update `.env` with connection string
5. Run migrations: `npx prisma migrate dev --name init`

### Option 3: Configure Local PostgreSQL (10 minutes)

If you want to use the installed PostgreSQL 16.4:

1. **Create database**:
   ```bash
   # Create database using default postgres user
   createdb -U postgres focusdb
   ```
   
2. **Update .env** with your PostgreSQL credentials:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/focusdb"
   ```

3. **Run migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

## After Database Setup

Once database is ready:

```bash
# Start development server
npm run dev
```

Then:
1. Open http://localhost:3000
2. Sign in with Google/GitHub (requires OAuth setup)
3. Test the timer!

## OAuth Setup (Required for Login)

You'll need to configure OAuth to sign in. See [QUICKSTART.md](./QUICKSTART.md) for detailed instructions:

- **Google OAuth**: https://console.cloud.google.com/apis/credentials
- **GitHub OAuth**: https://github.com/settings/developers

Or for quick testing, I can help you set these up once database is running.

---

**Current Status**: Waiting for database setup to proceed with testing.
