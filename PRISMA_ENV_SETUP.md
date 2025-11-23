# Prisma Environment Setup

## Required Environment Variables

Add the following to your `.env` file:

```bash
# Prisma Database Connection (Transaction Mode - Port 6543)
# Format: postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@[YOUR_PROJECT_REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"

# Prisma Direct Connection (Session Mode - Port 5432)
# Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
DIRECT_URL="postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres"
```

## How to Get Your Connection Strings

1. Go to your Supabase project dashboard
2. Navigate to Settings → Database
3. Find the "Connection string" section
4. Select "Transaction" mode for DATABASE_URL (port 6543)
5. Select "Session" mode for DIRECT_URL (port 5432)
6. Replace `[YOUR_PASSWORD]` with your database password
7. Replace `[YOUR_PROJECT_REF]` with your project reference ID

## Important Notes

- **DATABASE_URL**: Used for regular queries (transaction mode via PgBouncer)
- **DIRECT_URL**: Used for migrations and schema introspection (direct connection)
- Keep these credentials secure - never commit them to version control
- The `.env` file is already in `.gitignore`

