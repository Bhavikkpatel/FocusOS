# Production Database Setup (Supabase)

To use your Supabase database in production (e.g., on Vercel), follow these steps:

### 1. Connection Strings

In your production environment variables (Vercel/Netlify/etc.), set the following:

- **`DATABASE_URL`**: Use the connection string for **Connection Pooling** (Transaction Mode).
  - Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true`
- **`DIRECT_URL`**: Use the **Direct Connection** string.
  - Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### 2. Password

Replace `[YOUR-PASSWORD]` in the strings with your actual Supabase database password.

### 3. Local Development

Your local `.env` file should remain unchanged to continue using your local Postgres:
```bash
DATABASE_URL="postgresql://focus_admin:12345@localhost:5432/focus_os"
DIRECT_URL="postgresql://focus_admin:12345@localhost:5432/focus_os"
```

### 4. Deployment

When you deploy, Prisma will use these variables to connect to Supabase. You can run migrations against Supabase using:
```bash
npx prisma migrate deploy
```
