# Production Environment Setup

## 🎯 Quick Setup (2 Steps)

### Step 1: Create `.env.local`

Create a new file called `.env.local` in your project root with these credentials:

```bash
# Supabase Production - swe481 (ap-northeast-2)
NEXT_PUBLIC_SUPABASE_URL=https://nfdxuxvlhsdbkcleogoe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mZHh1eHZsaHNkYmtjbGVvZ29lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1ODAxNDcsImV4cCI6MjA3NzE1NjE0N30.9QsglUeC940o7jUIaY-fN9AySBEgglLPrW2-6e8vK4k
```

### Step 2: Restart Your Dev Server

```bash
pnpm dev
```

That's it! Your app now points to production (swe481).

---

## 📋 Production Database Info

| Property | Value |
|----------|-------|
| **Project Name** | swe481 |
| **Region** | ap-northeast-2 (Seoul) |
| **Project ID** | nfdxuxvlhsdbkcleogoe |
| **Status** | ✅ Active & Healthy |
| **Migration** | ✅ 20251029140303_add_onboarding_support |

---

## ✅ What's Already Deployed

- ✅ Onboarding support (level, onboarding_completed fields)
- ✅ RLS infinite recursion fix
- ✅ Auto-assign student to group function
- ✅ Schema supports levels 1-8
- ✅ All RLS policies configured
- ✅ TypeScript types generated

---

## 🧪 Test Your Setup

### 1. Test Registration
```bash
# Start your dev server
pnpm dev

# Navigate to:
http://localhost:3000/register
```

### 2. Create Test Users

**Scheduling Account**:
- Email: `admin@test.com`
- Password: `password123`
- Role: Scheduling
- Test onboarding flow

**Student Account**:
- Email: `student@test.com`
- Password: `password123`
- Role: Student
- Select Level: 4
- Test onboarding + auto-group assignment

### 3. Verify in Supabase Dashboard

Go to: https://supabase.com/dashboard/project/nfdxuxvlhsdbkcleogoe

**Check Table Editor**:
```sql
-- View onboarding completion
SELECT user_id, name, role, level, onboarding_completed
FROM user_roles;

-- Check student group assignments
SELECT 
  ur.name,
  ur.level,
  sg.name as group_name
FROM user_roles ur
LEFT JOIN student_group sg ON sg.level = ur.level
WHERE ur.role = 'student';
```

---

## 📦 Before Students Can Register

You need to create student groups first. Run this in Supabase SQL Editor:

```sql
-- Create student groups for all levels
INSERT INTO student_group (level, size, name) VALUES
  (1, 0, 'Level 1 - Foundation A'),
  (2, 0, 'Level 2 - Foundation B'),
  (3, 0, 'Level 3 - Foundation C'),
  (4, 0, 'Level 4 - Year 1 Sem 1'),
  (5, 0, 'Level 5 - Year 1 Sem 2'),
  (6, 0, 'Level 6 - Year 2 Sem 1'),
  (7, 0, 'Level 7 - Year 2 Sem 2'),
  (8, 0, 'Level 8 - Year 3+');
```

---

## 🚀 Deploy to Vercel

### Environment Variables

Add these to your Vercel project:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://nfdxuxvlhsdbkcleogoe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mZHh1eHZsaHNkYmtjbGVvZ29lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1ODAxNDcsImV4cCI6MjA3NzE1NjE0N30.9QsglUeC940o7jUIaY-fN9AySBEgglLPrW2-6e8vK4k
```

### Deploy

```bash
git push origin main
# Vercel will auto-deploy
```

---

## 🔍 Troubleshooting

### Problem: "Cannot connect to database"

**Solution**: Check your `.env.local` file exists and has correct credentials

### Problem: "Infinite recursion detected"

**Solution**: This is fixed in production! Make sure you're using the production credentials above.

### Problem: "User cannot update onboarding fields"

**Solution**: This is fixed in production! The RLS policy allows users to update their own fields.

### Problem: Browser console shows errors

**Check**:
1. Open browser console (F12)
2. Look for detailed error messages
3. Check Network tab for failed requests
4. Verify Supabase credentials are correct

---

## 📚 Related Documentation

- **Deployment Summary**: `PRODUCTION_DEPLOYMENT_SUMMARY.md`
- **Onboarding Error Fix**: `ONBOARDING_ERROR_FIX.md`
- **Quick Reference**: `ONBOARDING_FIX_QUICK_REFERENCE.md`
- **Production Types**: `lib/types/database-production.ts`

---

## ⚠️ Important Security Notes

1. **Never commit `.env.local`** to git (it's already in `.gitignore`)
2. **Anon key is safe to expose** in client-side code (it's public)
3. **Service role key is SECRET** (not included here, only in Supabase dashboard)
4. **RLS policies protect your data** even with anon key exposed

---

## ✨ You're All Set!

Your production database (swe481) is ready with:
- ✅ Onboarding system working
- ✅ No infinite recursion errors
- ✅ All RLS policies in place
- ✅ Auto-group assignment enabled
- ✅ Schema supports levels 1-8

**Next**: Test the onboarding flow and start adding your course data! 🚀

