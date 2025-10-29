# 🚀 Sections Seeding - Quick Start

## ✅ What's Ready

I've created a complete sections seeding system with:

1. **`supabase/seed-sections.sql`** - SQL file with 69 sections
2. **`SECTIONS_SEEDING_GUIDE.md`** - Complete documentation
3. **`SECTIONS_SEED_COMPLETE.md`** - Detailed summary

## 🎯 How to Seed Sections

### Option 1: TypeScript Seeder (EASIEST - Recommended)

This seeds **everything** (courses, instructors, rooms, sections, exams) in one command:

```bash
# Step 1: Create .env.local with your Supabase credentials
# (See SEEDING_COMPLETE_SUMMARY.md for details)

# Step 2: Run the seeder
npm run db:seed:external:clear
```

**This is the easiest way!** It handles all the dependencies automatically.

### Option 2: SQL File (Manual)

If you have `psql` installed:

```bash
# Step 1: Seed main data first (if not done already)
psql "your_connection_string" -f supabase/seed.sql

# Step 2: Seed sections
psql "your_connection_string" -f supabase/seed-sections.sql
```

### Option 3: Supabase Studio

```bash
# Step 1: Open Supabase Studio
# Navigate to your project on supabase.com or local Studio

# Step 2: Go to SQL Editor

# Step 3: Copy the contents of supabase/seed-sections.sql

# Step 4: Paste and run
```

### Option 4: Web Dashboard Import

```bash
# Step 1: Start your app
npm run dev

# Step 2: Login as admin/registrar

# Step 3: Go to Dashboard → Import/Export

# Step 4: Upload your JSON file

# Step 5: Import sections
```

## 📊 What You'll Get

**69 Complete Sections** including:

- ✅ MATH 244 (2 sections: lecture + tutorial)
- ✅ CSC 113 (3 sections: lecture + tutorial + lab)
- ✅ CSC 212, 220, 227 (2 sections each)
- ✅ PHYS 104 (2 sections)
- ✅ CEN 303 (2 sections)
- ✅ IS 230 (2 sections)
- ✅ IC 107, 108 (1 section each)
- ✅ And 26 more courses...

Each section has:
- Instructor assignment
- Room assignment
- Meeting pattern (days, time, duration)
- Capacity limit
- Group level

## 🔍 Quick Verification

After seeding, check the data:

### Via Dashboard
```bash
npm run dev
# Login and go to Dashboard → Sections
# You should see 69 sections
```

### Via Database Query
If you have access to your database:
```sql
SELECT COUNT(*) FROM section;
-- Expected: 69
```

## 📝 Next Steps

1. **Seed the data** using one of the options above
2. **Verify** sections appear in your dashboard
3. **Release sections** (change state from 'draft' to 'released')
4. **Test enrollment** with student accounts

## 📚 Documentation

For more details, see:
- **`SECTIONS_SEED_COMPLETE.md`** - Complete overview
- **`SECTIONS_SEEDING_GUIDE.md`** - Detailed guide
- **`SEEDING_COMPLETE_SUMMARY.md`** - Full seeding summary

## 🆘 Need Help?

### Issue: Missing Instructors
**Solution**: Seed instructors first (use TypeScript seeder or main seed.sql)

### Issue: Missing Rooms
**Solution**: Seed rooms first (use TypeScript seeder or main seed.sql)

### Issue: Sections in Draft State
**Solution**: Update sections to 'released' state:
```sql
UPDATE section SET state = 'released';
```

## 💡 Recommended Approach

**Use the TypeScript seeder** - it's the easiest and most reliable:

```bash
# Create .env.local with Supabase credentials
# Then run:
npm run db:seed:external:clear
```

This will seed **everything** including all 69 sections with proper instructor and room assignments!

---

**Files Created:**
- ✅ `supabase/seed-sections.sql`
- ✅ `SECTIONS_SEEDING_GUIDE.md`
- ✅ `SECTIONS_SEED_COMPLETE.md`
- ✅ `SECTIONS_QUICK_START.md` (this file)

**Ready to go!** 🎉

