# FocusOS - Production Pomodoro Application

A modern, offline-first Pomodoro productivity application with task management, analytics, and cross-device sync.

## Features

### Phase 1 (MVP) - CURRENT
- ✅ **Authentication**: Google and GitHub OAuth via NextAuth
- ✅ **Pomodoro Timer**: Web Worker-based timer with <50ms drift tolerance
- ✅ **Timer Presets**: Classic (25/5), Deep Work (50/10), Flow State (90/15)
- 🚧 **Task Management**: Create, organize, and track tasks
- 🚧 **Analytics**: Daily, weekly, monthly productivity insights
- 🚧 **Offline Sync**: IndexedDB-based offline support with event sourcing

### Phase 2 (Integrations) - PLANNED
- Calendar sync (Google Calendar, Outlook)
- Task manager integration (Notion, Todoist)
- Time tracking (Toggl, Clockify)

### Phase 3 (Collaboration) - PLANNED
- Study rooms and shared timers
- Group analytics

### Phase 4 (AI Features) - PLANNED
- Adaptive session recommendations
- Burnout detection
- Productivity insights

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Shadcn/UI
- **State**: Zustand, React Query
- **Backend:** Node.js, PostgreSQL, Prisma ORM
- **Auth**: NextAuth.js with OAuth
- **Offline**: IndexedDB, Dexie.js

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ (or Docker)
- OAuth credentials (Google, GitHub)

### Installation

1. **Clone and install dependencies**:
```bash
npm install
```

2. **Setup database**:

Using Docker (recommended for development):
```bash
docker-compose up -d
```

Or use your own PostgreSQL instance and update `.env`.

3. **Configure environment variables**:

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/focusdb"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-min-32-chars"

# OAuth (see setup guide below)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

4. **Run migrations and seed**:
```bash
npx prisma migrate dev
npx prisma db seed
```

5. **Start development server**:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### OAuth Setup

**Google OAuth**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create new OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret to `.env`

**GitHub OAuth**:
1. Go to [GitHub Settings > Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Homepage URL: `http://localhost:3000`
4. Callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copy Client ID and Secret to `.env`

## Development

```bash
# Run dev server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Run tests
npm test

# Database management
npm run db:push      # Push schema changes
npm run db:migrate   # Create migration
npm run db:studio    # Open Prisma Studio
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── timer/             # Timer page
│   ├── tasks/             # Task management
│   └── analytics/         # Analytics dashboard
├── components/
│   ├── ui/                # Shadcn UI components
│   ├── timer/             # Timer components
│   └── tasks/             # Task components
├── lib/
│   ├── auth/              # NextAuth config
│   ├── db/                # IndexedDB setup
│   └── sync/              # Offline sync engine
├── store/                 # Zustand stores
└── types/                 # TypeScript types

prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Seed data

public/
└── timer-worker.js        # Web Worker for timer
```

## Architecture

### Timer Engine
- Web Worker for precise timing independent of main thread
- Drift correction algorithm maintains <50ms accuracy
- Automatic session transitions with configurable auto-start

### Offline Sync
- Event sourcing pattern for all mutations
- IndexedDB for local storage
- Automatic sync when online
- Last-write-wins conflict resolution

### State Management
- Zustand for UI state (lightweight, <1KB)
- React Query for server state (caching, optimistic updates)
- Persisted timer state across sessions

## Database

PostgreSQL with Prisma ORM. Schema includes:
- Users, Accounts, Sessions (NextAuth)
- Tasks (with projects, tags, priorities)
- PomodoroSessions (completed timers)
- PomodoroPresets (timer configurations)
- Analytics (aggregated statistics)
- SyncEvents (offline event queue)

View with Prisma Studio:
```bash
npm run db:studio
```

## Deployment

### Docker

```bash
docker build -t focusso .
docker run -p 3000:3000 focusso
```

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform.

Generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## Contributing

This is a production-ready application. Contributions welcome!

## License

MIT

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.