# Files to Delete for Demo Version

This document lists all files that should be deleted to convert the application to a standalone demo version that doesn't require a database.

## ✅ Files Safe to Delete

### Supabase Configuration Files
- [ ] `supabase/config.toml` - Supabase local configuration
- [ ] `supabase/seed.sql` - Database seed file
- [ ] `supabase/seed-sections.sql` - Section seeding SQL
- [ ] `supabase/middleware.ts` - **KEEP** (already updated for demo mode)

### Database Migration Files
- [ ] `supabase/migrations/` - Entire directory (if exists)
- [ ] Any `.sql` files in `supabase/` directory

### Seed Data Scripts
- [ ] `scripts/seed-database.ts` - Database seeding script
- [ ] `scripts/seed-external-data.ts` - External data seeding script
- [ ] Any other seed scripts in `scripts/` directory

### Seed Data JSON Files
- [ ] `seed-data.json` - Seed data file
- [ ] `seed-data-enhanced.json` - Enhanced seed data
- [ ] `external_departments_courses_sections.json` - External departments data
- [ ] `swe_departments_sections.json` - SWE departments data
- [ ] `swe_plan.json` - SWE plan data

### Documentation Files (Optional - Keep for Reference)
- [ ] `SUPABASE_CLI_GUIDE.md` - Supabase CLI documentation
- [ ] `SUPABASE_LOCAL_SETUP.md` - Local setup guide
- [ ] `SEED_SQL_GUIDE.md` - SQL seeding guide
- [ ] `SECTIONS_SEEDING_GUIDE.md` - Sections seeding guide
- [ ] `EXTERNAL_DATA_SEEDING_GUIDE.md` - External data seeding guide
- [ ] `PRODUCTION_INITIAL_SCHEMA.sql` - Production schema SQL
- [ ] `PRODUCTION_ENV_SETUP.md` - Production environment setup
- [ ] `CURSOR_RULE_SUPABASE.md` - Supabase cursor rules

### Type Definitions (Keep for TypeScript compatibility)
- [ ] `lib/types/database.ts` - **KEEP** (may be referenced by components)
- [ ] `lib/types/database-production.ts` - Can delete if not used
- [ ] `lib/types/scheduling.ts` - **KEEP** (used by scheduling components)

### Hooks (Review - May Still Be Used)
- [ ] `hooks/use-client-fetch.ts` - **REVIEW** (may be used by components)
- [ ] `hooks/use-client-mutation.ts` - **REVIEW** (may be used by components)

### Supabase Client Files (Keep - But Updated for Demo)
- [ ] `supabase/client.ts` - **KEEP** (may be referenced, but won't be used)
- [ ] `supabase/server.ts` - **KEEP** (may be referenced, but won't be used)

## ⚠️ Files to Review Before Deleting

### API Routes
Check if these exist and are used:
- [ ] `app/api/` directory - **REVIEW** (may contain API routes that need to be mocked)

### Auth Routes
- [ ] `app/(auth)/auth/confirm/route.ts` - **REVIEW** (may be needed for email confirmation flow in demo)

### Components Using Supabase
Review these components - they may need updates:
- [ ] `components/onboarding-form.tsx` - Uses `createClient` from Supabase
- [ ] Any other components in `components/` that import from `@/supabase/client` or `@/supabase/server`

## 📝 Files to Keep

### Core Application Files
- ✅ `lib/demo-data.ts` - **NEW** Mock data service (created)
- ✅ `middleware.ts` - Updated for demo mode
- ✅ `app/(auth)/actions.ts` - Updated for demo mode
- ✅ All page components in `app/` directory
- ✅ All UI components in `components/ui/`
- ✅ All other components in `components/`

### Configuration Files
- ✅ `package.json` - Keep (but can remove Supabase scripts)
- ✅ `next.config.ts` - Keep
- ✅ `tsconfig.json` - Keep
- ✅ `tailwind.config.ts` - Keep
- ✅ `postcss.config.mjs` - Keep
- ✅ `components.json` - Keep

### Documentation (Keep for Reference)
- ✅ `README.md` - Keep
- ✅ `PRD.md` - Keep
- ✅ `API_REFERENCE.md` - Keep (for understanding API structure)
- ✅ Other documentation files (optional)

## 🔧 Recommended Actions

1. **Delete Supabase-related files** listed above
2. **Update package.json** to remove Supabase-related scripts:
   - Remove `db:start`, `db:stop`, `db:reset`, `db:migration`, `db:types`, `db:status`, `db:studio`, `db:seed`, `db:logs`
3. **Optional: Remove Supabase dependencies** from `package.json`:
   - `@supabase/ssr`
   - `@supabase/supabase-js`
   - (Keep if you want to maintain compatibility)

4. **Update .env files** to remove database connection strings (or create `.env.example` without them)

## 📋 Summary

**Total files to delete:** ~15-20 files
**Total directories to delete:** 1-2 directories (migrations, scripts if empty)

**Impact:** 
- Removes all database dependencies
- Reduces project size
- Simplifies deployment (no database required)
- Makes the app truly standalone

