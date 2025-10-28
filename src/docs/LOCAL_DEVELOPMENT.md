# Local Development with Supabase

## Overview
This project uses Supabase CLI for local development. All database changes are managed through migrations in the `supabase/migrations/` directory.

## Prerequisites
- Supabase CLI installed (`brew install supabase/tap/supabase` on macOS)
- Docker installed and running

## Getting Started

### 1. Start Local Supabase
```bash
supabase start
```

This will start:
- **API URL**: http://127.0.0.1:54321
- **Database URL**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Studio URL**: http://127.0.0.1:54323 (Database GUI)
- **Mailpit URL**: http://127.0.0.1:54324 (Email testing)

### 2. Environment Configuration
Make sure your `.env.local` file is configured for local development:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### 3. Start Next.js Development Server
```bash
npm run dev
# or
pnpm dev
```

## Database Management

### Apply All Migrations
```bash
supabase db reset
```
This will:
- Drop the database
- Recreate it
- Apply all migrations in order
- Run seed files (if configured)

### Create a New Migration
```bash
supabase migration new migration_name
```

### Check Migration Status
```bash
supabase migration list
```

### View Database in Studio
Open http://127.0.0.1:54323 to access Supabase Studio and:
- Browse tables
- Run SQL queries
- Manage RLS policies
- View logs

## Current Migrations

1. **20241027000001_initial_schema.sql** - Creates all tables and indexes
2. **20241027000002_rls_policies.sql** - Sets up Row Level Security policies
3. **20241027000003_helper_functions.sql** - Adds conflict detection and helper functions
4. **20241027000004_fix_user_role_creation.sql** - Fixes RLS for user registration

## Recent Fixes

### User Registration RLS Fix
**Problem**: New users couldn't create their role entry during registration because of strict RLS policies.

**Solution**: Added a policy in migration `20241027000004_fix_user_role_creation.sql` that allows users to insert their own role entry:
```sql
CREATE POLICY "Users can insert own role"
  ON user_roles FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

This fixes the chicken-and-egg problem where users need a role to do anything, but couldn't create their own role.

## Testing Email in Development

All emails are captured by Mailpit (instead of being sent):
- Open http://127.0.0.1:54324
- View registration confirmation emails
- Click confirmation links (they point to your local app)

## Common Commands

### Stop Supabase
```bash
supabase stop
```

### Restart Supabase
```bash
supabase stop && supabase start
```

### View Logs
```bash
supabase logs
```

### Generate TypeScript Types
```bash
supabase gen types typescript --local > lib/types/database.ts
```

## Troubleshooting

### "Connection refused" errors
Make sure Supabase is running:
```bash
supabase status
```

### Migrations not applying
Reset the database:
```bash
supabase db reset
```

### Port conflicts
Check if ports 54321-54324 are available:
```bash
lsof -i :54321
lsof -i :54322
lsof -i :54323
```

## Production Deployment

When ready to deploy:
1. Link to your Supabase project: `supabase link --project-ref <project-id>`
2. Push migrations: `supabase db push`
3. Update production environment variables in Vercel/hosting platform

