# ✅ Your Supabase CLI is Already Set Up!

## Current Status

Your local Supabase instance is **running** and configured:

```
✅ API URL: http://127.0.0.1:54321
✅ Studio URL: http://127.0.0.1:54323
✅ Mailpit URL: http://127.0.0.1:54324
✅ Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres
✅ All migrations applied
```

## New NPM Scripts Added

I've added convenient database management scripts to your `package.json`:

```bash
# Start/Stop Supabase
pnpm db:start        # Start Supabase services
pnpm db:stop         # Stop Supabase services
pnpm db:status       # Check what's running

# Database Operations
pnpm db:reset        # Reset database (reapply all migrations)
pnpm db:types        # Generate TypeScript types from schema
pnpm db:studio       # Open Supabase Studio in browser

# Data Seeding
pnpm db:seed         # Load sample data
pnpm db:seed:clear   # Clear existing data and reload
```

## Quick Workflow

### Daily Development
```bash
# 1. Start Supabase (if not running)
pnpm db:start

# 2. Start Next.js dev server
pnpm dev

# 3. Open Studio to view database
pnpm db:studio
```

### Making Database Changes
```bash
# 1. Create a new migration
supabase migration new add_my_feature

# 2. Edit the SQL file
code supabase/migrations/YYYYMMDDHHMMSS_add_my_feature.sql

# 3. Apply the migration
pnpm db:reset

# 4. Update TypeScript types
pnpm db:types
```

### Loading Test Data
```bash
# Quick load with sample data
pnpm db:seed:clear

# This loads:
# - 33 courses (19 core + 14 elective)
# - 15 rooms (9 lecture + 6 labs)
# - 10 instructors
# - 7 student groups
```

## Access Your Local Services

### Supabase Studio (Database GUI)
**URL**: http://127.0.0.1:54323

What you can do:
- View all tables and data
- Run SQL queries
- Edit RLS policies
- Monitor auth users
- Check realtime subscriptions

### Mailpit (Email Testing)
**URL**: http://127.0.0.1:54324

All emails sent by your app appear here:
- Registration confirmations
- Password resets
- Notification emails

### Your Application
**URL**: http://localhost:3000

## Create Your First Test User

### Method 1: Through the App (Recommended)

1. Visit http://localhost:3000
2. Click **Register**
3. Fill in:
   - Email: `admin@test.com`
   - Password: `password123`
   - Name: `Admin User`
   - Role: `scheduling` (for full access)
4. Click **Register**
5. Go to Mailpit (http://127.0.0.1:54324)
6. Click the confirmation email
7. Click the confirmation link
8. Login at http://localhost:3000

### Method 2: Via Studio

1. Open Studio: http://127.0.0.1:54323
2. Go to **Authentication** → **Users** → **Add User**
3. Enter email and password
4. Copy the generated user ID
5. Go to **Table Editor** → **user_roles** → **Insert Row**:
   ```
   user_id: <paste user ID>
   role: scheduling
   name: Admin User
   email: admin@test.com
   ```
6. Login at http://localhost:3000

## Available Roles

- `scheduling` - Full access, schedule generation (recommended for testing)
- `teaching_load` - View/edit instructor workload
- `faculty` - View personal schedule
- `student` - Manage elective preferences
- `registrar` - Data management and publishing

## Environment Configuration

Your `.env.dev` file is configured for local Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (local key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (for scripts)
```

The `pnpm dev` command automatically copies `.env.dev` to `.env.local`.

## Documentation

I've created comprehensive guides for you:

1. **QUICK_SETUP.md** - 30-second quick start
2. **SUPABASE_CLI_GUIDE.md** - Complete CLI reference
3. **src/docs/LOCAL_DEVELOPMENT.md** - Detailed local dev guide
4. **src/docs/SEED_DATA_GUIDE.md** - Seed data documentation

## Common Commands Reference

```bash
# Supabase Management
supabase start              # Start all services
supabase stop               # Stop all services
supabase status             # Check running services
supabase logs               # View logs

# Database
supabase db reset           # Reset and reapply migrations
supabase migration new NAME # Create new migration
supabase migration list     # List all migrations

# Type Generation
supabase gen types typescript --local > lib/types/database.ts

# With npm scripts (easier!)
pnpm db:start
pnpm db:reset
pnpm db:types
pnpm db:seed:clear
```

## Troubleshooting

### Supabase not responding
```bash
pnpm db:status  # Check if running
pnpm db:start   # Start if stopped
```

### Port already in use
```bash
pnpm db:stop
pnpm db:start
```

### Docker not running
1. Start Docker Desktop
2. Then: `pnpm db:start`

### Tables don't exist
```bash
pnpm db:reset  # Reapply all migrations
```

## Next Steps

1. ✅ **Load sample data**: `pnpm db:seed:clear`
2. ✅ **Create test user** (see above)
3. ✅ **Login and explore**
4. ✅ **Generate a schedule** from Scheduling dashboard
5. ✅ **View analytics** in Level/Course Overview

## Switching to Remote Supabase

When you're ready to deploy:

1. Create a project at https://supabase.com
2. Link your local project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
3. Push migrations:
   ```bash
   supabase db push
   ```
4. Update environment variables in your hosting platform

---

**You're all set!** 🚀

Your local development environment is fully configured and ready to use.

For detailed information, see:
- `SUPABASE_CLI_GUIDE.md` - Complete CLI reference
- `QUICK_SETUP.md` - Quick start guide
- `src/docs/` - All project documentation

