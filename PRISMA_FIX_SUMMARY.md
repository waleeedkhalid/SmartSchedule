# Prisma Configuration Fix

## Issue
Error: "A folder called prisma already exists in your project"

## Root Cause
Prisma 7 has a different configuration approach:
- **Prisma 7** requires `prisma.config.ts` for datasource URLs (not in `schema.prisma`)
- The `DATABASE_URL` environment variable must be set

## Solution Applied

### 1. ✅ Restored `prisma.config.ts`
The file is now correctly configured for Prisma 7:
```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

### 2. ✅ Fixed `prisma/schema.prisma`
Removed `url` from datasource (Prisma 7 doesn't allow it in schema):
```prisma
datasource db {
  provider = "postgresql"
  // url is configured in prisma.config.ts, not here
}
```

## Next Steps

### 1. Set DATABASE_URL in `.env` file
Add this to your `.env` file (create it if it doesn't exist):

```bash
# Prisma Database Connection
# Get this from Supabase Dashboard → Settings → Database → Connection string
# Use "Transaction" mode (port 6543) for migrations
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@[YOUR_PROJECT_REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
```

### 2. Run Migration
Once `DATABASE_URL` is set, run:
```powershell
npx prisma migrate dev
```

Or if you want to create a new migration:
```powershell
npx prisma migrate dev --name your_migration_name
```

### 3. Generate Prisma Client
After migrations, generate the client:
```powershell
npx prisma generate
```

## Verification

To verify your setup:
1. Check that `.env` file exists and has `DATABASE_URL` set
2. Run `npx prisma migrate dev` - should work without errors
3. Run `npx prisma generate` - should generate client successfully

## Notes

- Prisma 7 uses `prisma.config.ts` for datasource configuration
- The `schema.prisma` file should NOT have `url` in the datasource block
- Make sure `DATABASE_URL` is in `.env` (not `.env.local` for Prisma CLI)
- The connection string format must be valid PostgreSQL URL

