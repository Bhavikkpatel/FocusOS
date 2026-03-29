# FocusOS - Quick Start Guide

## Prerequisites

- Node.js 18+
- PostgreSQL (via Docker or hosted service)
- Google OAuth credentials
- GitHub OAuth credentials

## Setup Steps

### 1. Install Dependencies (✅ DONE)
```bash
npm install
```

### 2. Setup Database

**Option A - Docker (Recommended)**:
```bash
# Start PostgreSQL + pgAdmin
docker-compose up -d

# Check if running
docker ps
```

**Option B - Hosted Database**:
- Use Supabase, Neon, or Railway
- Get connection string
- Update `.env` → `DATABASE_URL`

### 3. Configure OAuth

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create new OAuth 2.0 Client ID
3. Add authorized redirect: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID + Secret

#### GitHub OAuth
1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Homepage: `http://localhost:3000`
4. Callback: `http://localhost:3000/api/auth/callback/github`
5. Copy Client ID + Secret

### 4. Update Environment Variables

Edit `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/focusdb"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<run: openssl rand -base64 32>"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# S3 Compatible Storage (Optional)
R2_ACCESS_KEY_ID="your-access-key-id"
R2_SECRET_ACCESS_KEY="your-secret-access-key"
R2_BUCKET_NAME="your-bucket-name"
R2_ENDPOINT="your-s3-endpoint"
```

### 5. Setup Database Schema

```bash
#Generate Prisma Client (DONE ✅)
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) View database
npx prisma studio
```

### 6. Start Application

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

## Testing

1. Sign in with Google or GitHub
2. You'll be redirected to `/timer`
3. Click **Play** button to start timer
4. Timer displays circular progress
5. Countdown updates every second
6. Test Pause, Resume, Reset, Skip

## Troubleshooting

**"Cannot find module '@prisma/client'"**:
```bash
npx prisma generate
```

**"PrismaClientInitializationError"**:
- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Run migrations: `npx prisma migrate dev`

**"NextAuth configuration error"**:
- Verify NEXTAUTH_SECRET is set (min 32 chars)
- Check OAuth credentials in `.env`
- Ensure redirect URIs match exactly

**Timer doesn't start**:
- Check browser console for errors
- Verify `/timer-worker.js` exists in public folder
- Check preset loaded (should show preset name below timer)

## Production Deployment

### Environment Variables
Set all `.env` variables in your deployment platform

### Build
```bash
npm run build
npm start
```

### Migrations
```bash
npx prisma migrate deploy
```

### Recommended Platforms
- **Frontend**: Vercel, Railway, Render
- **Database**: PostgreSQL (Any provider)

## Features Overview

✅ **Implemented**:
- OAuth authentication (Google, GitHub)
- Pomodoro timer with Web Worker
- Preset management (25/5, 50/10, 90/15)
- Auto-start breaks/focus
- Pause/Resume/Reset/Skip controls
- API for tasks and presets

🚧 **In Progress**:
- Task management UI
- Offline sync
- Analytics dashboard
- Settings page

## Support

See [README.md](./README.md) for detailed architecture and development guide.
See [walkthrough.md](./.gemini/antigravity/brain/f2854e48-d8cb-4fcb-a145-4c47cfe52e8f/walkthrough.md) for complete implementation details.
