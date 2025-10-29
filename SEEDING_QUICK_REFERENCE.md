# 🚀 Quick Reference: Database Seeding

## Setup (One-time)

```bash
# 1. Start Supabase
npm run db:start

# 2. Check status and get credentials
npm run db:status

# 3. Create .env.local file
# Add: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
```

## Seeding Commands

### TypeScript Seeder (Recommended)
```bash
# Clear everything and seed fresh
npm run db:seed:external:clear

# Append to existing data
npm run db:seed:external
```

### SQL Seeder (Alternative)
```bash
# Local database
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/seed.sql

# Or via Studio
npm run db:studio
# Then paste SQL in editor
```

## What Gets Seeded

| Item | Count | TypeScript | SQL |
|------|-------|------------|-----|
| Courses | 52 | ✅ | ✅ |
| Instructors | 35 | ✅ | ✅ |
| Rooms | 124 | ✅ | ✅ |
| Sections | 87 | ✅ | ⚠️ |
| Exams | 105 | ✅ | ✅ |
| Student Groups | 8 | ✅ | ✅ |

## Verification

```bash
# Check counts via Studio
npm run db:studio

# Or test the app
npm run dev
# Login and check dashboards
```

## Common Issues

| Problem | Solution |
|---------|----------|
| Missing env vars | Create `.env.local` |
| Connection refused | Run `npm run db:start` |
| Duplicate keys | Use `--clear` flag |
| tsx not found | Already installed ✅ |

## Files Created

- ✅ `scripts/seed-external-data.ts` - TypeScript seeder
- ✅ `supabase/seed.sql` - SQL seed file
- ✅ `EXTERNAL_DATA_SEEDING_GUIDE.md` - Full guide
- ✅ `SEED_SQL_GUIDE.md` - SQL guide
- ✅ `SEEDING_COMPLETE_SUMMARY.md` - Complete summary

## Next Steps

1. Create `.env.local` with your Supabase credentials
2. Run: `npm run db:seed:external:clear`
3. Login and verify data
4. Start building! 🎉

