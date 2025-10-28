# 🚀 Quick Setup with Supabase CLI

## ⚡ Super Quick Start (30 seconds)

```bash
# 1. Start Supabase
pnpm db:start

# 2. Start dev server
pnpm dev
```

That's it! Visit http://localhost:3000

---

## 📦 What's Already Running

Your Supabase instance is already running with:

- **API URL**: http://127.0.0.1:54321
- **Studio** (Database GUI): http://127.0.0.1:54323
- **Mailpit** (Email testing): http://127.0.0.1:54324
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres

---

## 🎯 Essential Commands

### Database Management
```bash
pnpm db:start        # Start Supabase
pnpm db:stop         # Stop Supabase
pnpm db:reset        # Reset database (reapply migrations)
pnpm db:status       # Check what's running
pnpm db:studio       # Open database GUI
pnpm db:types        # Generate TypeScript types
```

### Data Seeding
```bash
pnpm db:seed         # Load sample data
pnpm db:seed:clear   # Clear & reload data
```

### Development
```bash
pnpm dev             # Start Next.js server
pnpm build          # Build for production
pnpm lint           # Run linter
```

---

## 📊 Load Sample Data

### Option 1: CLI Script (Fastest)
```bash
pnpm db:seed:clear
```

### Option 2: Web Interface
1. Start the app: `pnpm dev`
2. Login as scheduling user
3. Go to **Import/Export**
4. Upload `seed-data-enhanced.json`

---

## 👥 Create Test Users

### 1. Register Through the App
1. Visit http://localhost:3000
2. Click **Register**
3. Fill in details and submit
4. Check email at http://127.0.0.1:54324 (Mailpit)
5. Click confirmation link

### 2. Assign Role in Studio
1. Open Studio: http://127.0.0.1:54323
2. Go to **Authentication** → **Users**
3. Copy the user ID
4. Go to **Table Editor** → **user_roles**
5. Insert new row:
   - `user_id`: (paste user ID)
   - `role`: `scheduling` (or `faculty`, `student`, `registrar`, `teaching_load`)
   - `name`: Your Name
   - `email`: (same as user email)

### Quick SQL Setup
Run in Studio SQL Editor:
```sql
-- Get user IDs
SELECT id, email FROM auth.users;

-- Assign roles (replace the UUIDs)
INSERT INTO user_roles (user_id, role, name, email) VALUES
  ('your-user-id', 'scheduling', 'Admin User', 'admin@test.com');
```

---

## 🔍 Useful Tools

### Supabase Studio
**URL**: http://127.0.0.1:54323

- Browse all tables
- Run SQL queries
- View RLS policies
- Check logs

### Mailpit (Email Testing)
**URL**: http://127.0.0.1:54324

All emails are captured here:
- Registration confirmations
- Password resets
- Notifications

---

## 🐛 Common Issues

### "Connection refused"
```bash
# Check if Supabase is running
pnpm db:status

# If not, start it
pnpm db:start
```

### "Table does not exist"
```bash
# Reset database to apply migrations
pnpm db:reset
```

### Port already in use
```bash
# Stop Supabase
pnpm db:stop

# Start again
pnpm db:start
```

### Docker not running
```bash
# Start Docker Desktop first, then:
pnpm db:start
```

---

## 📚 More Information

- **Comprehensive Guide**: `SUPABASE_CLI_GUIDE.md`
- **Local Development**: `src/docs/LOCAL_DEVELOPMENT.md`
- **Seed Data Guide**: `src/docs/SEED_DATA_GUIDE.md`
- **Project Timeline**: `timeline.md`

---

## 🎉 You're Ready!

Your local environment is configured and ready. Here's what to do next:

1. ✅ **Load sample data**: `pnpm db:seed:clear`
2. ✅ **Create a test user** (see above)
3. ✅ **Login** and explore the dashboards
4. ✅ **Generate a schedule** from the Scheduling dashboard
5. ✅ **View analytics** in Level/Course Overview

Happy coding! 🚀

