# FocusOS - Production Pomodoro Application

A modern, offline-first Pomodoro productivity application with task management, calendar-based planning, analytics, and cross-device sync.

## Features

### Phase 1 (Core) - ✅ COMPLETE
- ✅ **Authentication**: Google and GitHub OAuth via NextAuth
- ✅ **Pomodoro Timer**: Web Worker-based timer with <50ms drift tolerance
- ✅ **Timer Presets**: Classic (25/5), Deep Work (50/10), Flow State (90/15)
- ✅ **Task Management**: Create, organize, and track tasks with priorities and projects
- ✅ **Advanced Calendar**: FullCalendar integration with drag-to-create scheduling and live time indicator
- ✅ **Intelligent Scheduling**: Automatic Pomodoro duration calculation factoring in short and long breaks

### Phase 2 (Integrations) - IN PROGRESS
- 🚧 **Analytics**: Daily, weekly, monthly productivity insights
- 🚧 **Cloud Sync**: Supabase production database with connection pooling
- 🚧 **Offline Cache**: IndexedDB-based offline support (Partial)

### Phase 3 (Collaboration / AI) - PLANNED
- Study rooms and shared timers
- Adaptive session recommendations
- Burnout detection

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Shadcn/UI
- **Calendar**: FullCalendar (Day, Week, Month views)
- **State**: Zustand, React Query
- **Backend:** Node.js, PostgreSQL (Supabase in Prod), Prisma ORM
- **Auth**: NextAuth.js with OAuth

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ (Local) or Supabase (Production)
- OAuth credentials (Google, GitHub)

### Installation

1. **Clone and install dependencies**:
```bash
npm install
```

2. **Setup database**:

For local development, update `.env` with your PostgreSQL credentials. 

3. **Configure environment variables**:

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/focusdb"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/focusdb"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-min-32-chars"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. **Run migrations and apply schema**:
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Start development server**:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Production Setup

For deploying to production using Supabase, please refer to [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) for detailed instructions on setting up Connection Pooling and Direct Connection strings.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (Tasks, Calendar, Auth)
│   ├── calendar/          # Calendar page
│   ├── timer/             # Timer page
│   └── tasks/             # Task management
├── components/
│   ├── calendar/          # Advanced Calendar components
│   ├── timer/             # Timer & Focus Mode
│   └── tasks/             # Task lists & Expanded views
├── hooks/                 # Reusable React Query & Logic hooks
├── store/                 # Zustand state (Timer, UI)
└── lib/                   # Shared utilities (Auth, DB)
```

## Architecture

### Intelligent Timer
- Web Worker for precision independent of UI thread
- Dynamic duration calculation: Sessions automagically adjust to fit calendar slots while preserving recovery time.

### Database
PostgreSQL with Prisma. Optimized for production with **Supabase Connection Pooling** to handle high-frequency session logging.

## Contributing

This is an active project. Contributions and feedback are welcome!

## License

MIT

---

Built with ❤️ for focused developers.