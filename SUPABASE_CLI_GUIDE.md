# Supabase CLI Local Development Guide

## Quick Start (5 Minutes)

### 1. Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows (with Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
brew install supabase/tap/supabase

# Or with npm (any OS)
npm install -g supabase
```

Verify installation:
```bash
supabase --version
```

### 2. Install Docker

Download and install Docker Desktop:
- **macOS/Windows**: https://www.docker.com/products/docker-desktop
- **Linux**: `sudo apt-get install docker.io` (or use your package manager)

Verify Docker is running:
```bash
docker --version
docker ps
```

### 3. Initialize Supabase (Already Done in This Project)

```bash
# ✅ Already done - this project has supabase/config.toml
# If starting fresh, you would run: supabase init
```

### 4. Start Local Supabase

```bash
cd /Users/waleedkhalid/Documents/Projects/SSv2
supabase start
```

**First-time setup takes ~2-3 minutes** (downloads Docker images)

You'll see output like:
```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Configure Environment

Create/update `.env.local`:

```bash
# Copy the example file
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
# Local Supabase (default for development)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Service role key for scripts (bypasses RLS)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

### 6. Start Development Server

```bash
pnpm dev
```

Visit: http://localhost:3000

---

## Essential Commands

### Starting & Stopping

```bash
# Start Supabase (with all services)
supabase start

# Check status
supabase status

# Stop Supabase
supabase stop

# Restart (stop + start)
supabase stop && supabase start
```

### Database Management

```bash
# Reset database (drop + recreate + run migrations)
supabase db reset

# Apply migrations manually
supabase migration up

# Check migration status
supabase migration list

# Create new migration
supabase migration new my_feature_name
```

### Type Generation

```bash
# Generate TypeScript types from database schema
supabase gen types typescript --local > lib/types/database.ts
```

### Logs & Debugging

```bash
# View all logs
supabase logs

# View specific service logs
supabase logs auth
supabase logs db
supabase logs api
```

---

## Local Services

### Supabase Studio (Database GUI)
**URL**: http://127.0.0.1:54323

Features:
- Browse tables and data
- Run SQL queries
- View and edit RLS policies
- Monitor real-time subscriptions
- Check auth users
- View storage buckets

### Mailpit (Email Testing)
**URL**: http://127.0.0.1:54324

All emails are captured locally instead of being sent:
- Registration confirmations
- Password resets
- Magic links
- Custom notifications

### GraphQL API
**URL**: http://127.0.0.1:54321/graphql/v1

If you enable GraphQL, you can query your database using GraphQL.

---

## Working with Migrations

### Current Migrations (In Order)

1. `20241027000001_initial_schema.sql` - Core tables and schema
2. `20241027000002_rls_policies.sql` - Row Level Security policies
3. `20241027000003_helper_functions.sql` - Conflict detection functions
4. `20241027000004_fix_user_role_creation.sql` - User role RLS fix
5. `20241027000005_exam_conflict_functions.sql` - Exam conflict detection
6. `20241027000006_elective_comments.sql` - Student comment system

### Creating a New Migration

```bash
# Create new migration file
supabase migration new add_feature_name

# This creates: supabase/migrations/YYYYMMDDHHMMSS_add_feature_name.sql
```

Edit the file and add your SQL:
```sql
-- Add your database changes
CREATE TABLE new_feature (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE new_feature ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
  ON new_feature FOR SELECT
  USING (true);
```

Apply the migration:
```bash
supabase db reset
# Or just run new migrations:
supabase migration up
```

### Rolling Back Migrations

Supabase CLI doesn't have a built-in rollback, so:

**Option 1**: Create a new "reverse" migration
```bash
supabase migration new revert_feature_name
# Then write SQL to undo your changes
```

**Option 2**: Reset and exclude migration
```bash
# Temporarily rename the migration file
mv supabase/migrations/YYYYMMDDHHMMSS_bad_migration.sql supabase/migrations/_YYYYMMDDHHMMSS_bad_migration.sql.bak

# Reset database
supabase db reset

# Delete or fix the migration file
```

---

## Loading Seed Data

### Method 1: Using Web Interface
1. Start the app: `pnpm dev`
2. Login with admin credentials
3. Go to Import/Export page
4. Upload `seed-data-enhanced.json`

### Method 2: Using CLI Script
```bash
# Load seed data
pnpm tsx scripts/seed-database.ts

# Clear existing data first, then load
pnpm tsx scripts/seed-database.ts --clear
```

### Method 3: SQL Seed File
Create `supabase/seed.sql`:
```sql
-- Insert seed data
INSERT INTO courses (code, name, level, credits, type, is_elective) VALUES
  ('CS101', 'Introduction to Programming', 1, 3, 'core', false),
  ('CS102', 'Data Structures', 1, 3, 'core', false);

-- More seed data...
```

Then run:
```bash
supabase db reset  # This will run seed.sql automatically
```

---

## Creating Test Users

### Via Supabase Studio

1. Open Studio: http://127.0.0.1:54323
2. Go to **Authentication** → **Users**
3. Click **Add User**
4. Enter email and password
5. Click **Create User**

### Via SQL

```sql
-- Get the user ID first (they must sign up through the app)
SELECT id, email FROM auth.users;

-- Then insert their role
INSERT INTO user_roles (user_id, role, name, email) VALUES
  ('user-uuid-here', 'scheduling', 'Test User', 'test@example.com');
```

### Quick Test Users Setup

```sql
-- After users register through the app, assign roles:

-- Scheduling Committee
INSERT INTO user_roles (user_id, role, name, email)
SELECT id, 'scheduling', 'Scheduler Admin', email
FROM auth.users WHERE email = 'scheduler@test.com';

-- Teaching Load Committee
INSERT INTO user_roles (user_id, role, name, email)
SELECT id, 'teaching_load', 'Teaching Lead', email
FROM auth.users WHERE email = 'teaching@test.com';

-- Faculty
INSERT INTO user_roles (user_id, role, name, email)
SELECT id, 'faculty', 'Prof. Smith', email
FROM auth.users WHERE email = 'faculty@test.com';

-- Student
INSERT INTO user_roles (user_id, role, name, email)
SELECT id, 'student', 'John Doe', email
FROM auth.users WHERE email = 'student@test.com';

-- Registrar
INSERT INTO user_roles (user_id, role, name, email)
SELECT id, 'registrar', 'Registrar Office', email
FROM auth.users WHERE email = 'registrar@test.com';
```

---

## Switching Between Local & Remote

### For Local Development
`.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (local anon key)
```

### For Remote/Production Testing
`.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (your project's anon key)
```

**Tip**: Use different files and swap them:
```bash
# Create local and remote configs
cp .env.local .env.local.local
cp .env.local .env.local.remote

# Switch to local
cp .env.local.local .env.local

# Switch to remote
cp .env.local.remote .env.local
```

---

## Linking to Remote Project

### Initial Setup

```bash
# Login to Supabase
supabase login

# Link to your remote project
supabase link --project-ref your-project-ref

# Get project ref from Supabase dashboard URL:
# https://supabase.com/dashboard/project/YOUR-PROJECT-REF
```

### Pushing Migrations to Remote

```bash
# Push all new migrations
supabase db push

# This will:
# - Detect new migrations not yet applied to remote
# - Show you what will be applied
# - Ask for confirmation
# - Apply them to your remote database
```

### Pulling from Remote

```bash
# Pull remote schema as new migration
supabase db pull

# This creates a new migration file with all differences
```

---

## Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :54321
lsof -i :54322
lsof -i :54323

# Kill the process
kill -9 <PID>

# Or stop and restart Supabase
supabase stop
supabase start
```

### Docker Not Running

```bash
# Start Docker Desktop
open -a Docker  # macOS

# Or check Docker status
docker info
```

### Migrations Not Applying

```bash
# Check migration status
supabase migration list

# Force reset
supabase db reset

# If that fails, stop and start fresh
supabase stop
supabase start
supabase db reset
```

### Connection Refused Errors

```bash
# Check Supabase status
supabase status

# If stopped, start it
supabase start

# Verify connection
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### Type Generation Fails

```bash
# Make sure Supabase is running
supabase status

# Regenerate types
supabase gen types typescript --local > lib/types/database.ts

# Or with explicit schema
supabase gen types typescript --local --schema public > lib/types/database.ts
```

### "Table does not exist" Errors

```bash
# Reset database to apply all migrations
supabase db reset

# Check if migrations ran successfully
supabase migration list

# View database schema
supabase db dump -f schema.sql
```

---

## Performance Tips

### Fast Database Reset

Create an alias in your shell config (`~/.zshrc` or `~/.bashrc`):
```bash
alias dbreset='supabase db reset'
alias dbmigrate='supabase migration new'
alias dbtypes='supabase gen types typescript --local > lib/types/database.ts'
```

Then reload:
```bash
source ~/.zshrc  # or ~/.bashrc
```

Use:
```bash
dbreset
dbmigrate add_feature
dbtypes
```

### Database Snapshots

Save your current database state:
```bash
# Dump current data
supabase db dump -f backup.sql --data-only

# Restore later
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres < backup.sql
```

---

## Advanced Features

### Running SQL Queries

```bash
# Run SQL file
supabase db execute -f my-query.sql

# Run inline SQL
supabase db execute --sql "SELECT * FROM courses LIMIT 5;"
```

### Database Branches (Experimental)

```bash
# Create a branch
supabase branches create feature-branch

# Switch branch
supabase branches checkout feature-branch

# List branches
supabase branches list
```

### Custom Configuration

Edit `supabase/config.toml`:

```toml
[db]
port = 54322
major_version = 17

[api]
port = 54321
max_rows = 1000

[studio]
port = 54323
```

---

## Daily Workflow

### Morning Startup
```bash
# Start Supabase
supabase start

# Verify everything is running
supabase status

# Start Next.js
pnpm dev
```

### Making Database Changes
```bash
# Create migration
supabase migration new add_new_feature

# Edit the SQL file
code supabase/migrations/YYYYMMDDHHMMSS_add_new_feature.sql

# Apply migration
supabase db reset

# Generate new types
supabase gen types typescript --local > lib/types/database.ts
```

### End of Day
```bash
# Optional: Stop Supabase to free resources
supabase stop

# Or leave it running for faster startup tomorrow
```

---

## Additional Resources

- **Supabase CLI Docs**: https://supabase.com/docs/guides/cli
- **Local Development Guide**: https://supabase.com/docs/guides/local-development
- **Migration Guide**: https://supabase.com/docs/guides/cli/local-development#database-migrations
- **Project Docs**: `src/docs/LOCAL_DEVELOPMENT.md`

---

## Quick Reference Card

| Command | Description |
|---------|-------------|
| `supabase start` | Start all services |
| `supabase stop` | Stop all services |
| `supabase status` | Check service status |
| `supabase db reset` | Reset database (drop + recreate + migrations) |
| `supabase migration new <name>` | Create new migration |
| `supabase migration list` | List migrations |
| `supabase gen types typescript --local` | Generate TypeScript types |
| `supabase login` | Login to Supabase account |
| `supabase link` | Link to remote project |
| `supabase db push` | Push migrations to remote |
| Studio: http://127.0.0.1:54323 | Database GUI |
| Mailpit: http://127.0.0.1:54324 | Email testing |

---

**Need Help?** Check `src/docs/LOCAL_DEVELOPMENT.md` or open an issue!

*Last Updated: October 28, 2025*

