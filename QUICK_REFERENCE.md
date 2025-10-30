# 🚀 Quick Reference - Auth-Only Mode

## ✅ Current Status

**Mode:** Authentication-Only  
**Dashboard:** All features in maintenance  
**Auth Flow:** Fully working  
**User Experience:** Personalized maintenance message

---

## 🔐 What Works Now

```
✅ Register → ✅ Verify Email → ✅ Login → 🎯 See Personalized Message
```

### User Journey
1. User visits `/register`
2. Fills form: Name, Email, Password, Role
3. Submits → Gets verification email
4. Clicks verification link → Email confirmed
5. Visits `/login` → Enters credentials
6. Sees: **"Welcome, {NAME}! {ROLE} Dashboard is in Maintenance. Thanks for your understanding."**

---

## 📋 Quick Commands

### To Disable Maintenance (When Ready)
```typescript
// app/(dashboard)/layout.tsx - Line 13
const MAINTENANCE_MODE = false;  // ✅ Change to false
```

### To Reset Database (Clean Start)
```bash
# Local development
supabase db reset

# Generate fresh types
supabase gen types typescript --local > lib/types/database.ts
```

### To Test Registration
```bash
# Start app
npm run dev

# Visit
open http://localhost:3000/register

# Register user → Check email → Verify → Login
# Should see: "Welcome, {Your Name}! Student Dashboard is in Maintenance"
```

---

## 🎯 What Users See

### After Login (Student Example):
```
┌──────────────────────────────────────┐
│      Welcome, John Smith!            │
│  Student Dashboard is in Maintenance │
├──────────────────────────────────────┤
│                                      │
│  👤 J  Thank You for Understanding   │
│                                      │
│  We appreciate your patience...     │
│  Your Student dashboard will be     │
│  available shortly.                 │
│                                      │
│  Account: john@example.com          │
│  Role: Student                      │
│  Status: Dashboard Offline          │
│                                      │
│  [Technical Details]  [Sign Out]    │
│                                      │
│  Thanks for your understanding,     │
│  John. Your data is safe.           │
└──────────────────────────────────────┘
```

### Different Roles Show Different Messages:
- **Student:** "Student Dashboard is in Maintenance"
- **Faculty:** "Faculty Dashboard is in Maintenance"  
- **Scheduling:** "Scheduling Dashboard is in Maintenance"
- **Teaching Load:** "Teaching Load Dashboard is in Maintenance"
- **Registrar:** "Registrar Dashboard is in Maintenance"

---

## 📁 Key Files

| File | Purpose | Line to Change |
|------|---------|----------------|
| `app/(dashboard)/layout.tsx` | Maintenance flag | Line 13: `MAINTENANCE_MODE` |
| `app/(auth)/register/page.tsx` | Registration page | ✅ Working |
| `app/(auth)/login/page.tsx` | Login page | ✅ Working |
| `app/(auth)/auth/confirm/route.ts` | Email verification | ✅ Working |

---

## 🔧 Maintenance Toggle

**Current:** `MAINTENANCE_MODE = true` (Line 13)

**To Enable Dashboard:**
1. Edit `app/(dashboard)/layout.tsx`
2. Change line 13: `const MAINTENANCE_MODE = false;`
3. Uncomment imports (lines 4-6)
4. Uncomment normal layout code (lines 274-286)
5. Save and deploy

---

## 🎨 Personalization Features

The maintenance page is **personalized** for each user:

1. ✅ Shows user's actual name (not "User")
2. ✅ Shows user's role in message
3. ✅ Displays user initial in avatar
4. ✅ Personal footer message
5. ✅ Shows user's email and role

**How it works:**
- Queries `user_roles` table for name and role
- Formats role nicely (teaching_load → Teaching Load)
- Uses first letter of name for avatar
- Customizes all messages with user's details

---

## 📊 Testing Scenarios

### Test 1: New Student Registration
```bash
1. Visit /register
2. Fill: Name="Alice Student", Email="alice@test.com", Role="student"
3. Submit → Check email
4. Click verification link
5. Login → Should see: "Welcome, Alice Student! Student Dashboard..."
```

### Test 2: Faculty User
```bash
1. Create user with role='faculty' in Supabase
2. Login
3. Should see: "Welcome, {Name}! Faculty Dashboard is in Maintenance"
```

### Test 3: Admin User
```bash
1. Create user with role='scheduling' in Supabase  
2. Login
3. Should see: "Welcome, {Name}! Scheduling Dashboard is in Maintenance"
```

---

## ⚠️ Known Limitations

During maintenance mode:

- ❌ Cannot access any dashboard features
- ❌ Cannot view courses, sections, schedules
- ❌ Cannot register for classes
- ❌ Cannot submit feedback
- ❌ All database-dependent features offline

But:

- ✅ Can register new accounts
- ✅ Can verify email
- ✅ Can login/logout
- ✅ Can view maintenance details

---

## 🗃️ New Database Structure

### Simplified `user_roles` Table
```
✅ user_id      (UUID, PK)
✅ role         (enum: student, faculty, etc.)
✅ name         (TEXT, full name)
✅ email        (TEXT)
✅ created_at   (TIMESTAMPTZ)
✅ updated_at   (TIMESTAMPTZ)

❌ Removed: level, department, enrollment_year,
   expected_graduation_year, onboarding_completed,
   student_group_id (these were student-only fields)
```

### New `student_profile` Table (Students Only!)
```
✅ user_id           (UUID, PK, FK to user_roles)
✅ level             (INT 1-8, academic level)
✅ student_group_id  (UUID, nullable)
✅ department        (TEXT, default 'Software Engineering')
✅ created_at        (TIMESTAMPTZ)
✅ updated_at        (TIMESTAMPTZ)

✨ Auto-created when student registers!
```

**Key Points:**
- Faculty/Admin: NO record in `student_profile`
- Students: AUTO-created profile when registered
- Clean separation: universal data vs student-specific data

**Migrations:**
1. `20251030154649_simplify_user_roles_to_basics.sql`
2. `20251030154721_create_student_profile_table.sql`

**To Apply:**
```bash
supabase db reset --local
pnpm db:types
```

---

## 🔄 When to Disable Maintenance

Disable maintenance mode when:

1. ✅ Database schema simplified (new migrations ready)
2. ✅ student_profile table created
3. ✅ user_roles bloat removed
4. ✅ All migrations applied locally and tested
5. ✅ TypeScript types regenerated
6. ✅ All API routes updated for new schema
7. ✅ All components updated for new schema
8. ✅ Registration flow tested (auto-creates student_profile)
9. ✅ All features tested
10. ✅ No errors in logs

Then:
- Set `MAINTENANCE_MODE = false` (line 13 of layout.tsx)
- Uncomment sidebar imports (lines 4-6)
- Uncomment normal layout code (lines 274-286)
- Deploy

---

## 📚 Documentation

- **This file:** Quick reference
- **AUTH_ONLY_MODE.md:** Detailed auth flow documentation
- **GLOBAL_MAINTENANCE_MODE.md:** Maintenance mode guide
- **DATABASE_SIMPLIFICATION_GUIDE.md:** ✨ NEW - Complete guide to simplified schema
- **DATABASE_SCHEMA_ISSUES.md:** Schema problems and solutions
- **DATABASE_RESET_GUIDE.md:** How to reset database

---

## 🎯 Summary

**What you have now:**
- ✅ Users can register and create accounts
- ✅ Email verification works
- ✅ Login works perfectly
- ✅ **Personalized** maintenance message with user's name and role
- ✅ Professional, welcoming experience
- ✅ Users feel acknowledged, not blocked
- ✅ Building user base during maintenance

**What's next:**
- Fix database schema (remove level from user_roles)
- Create student_profile table
- Update all API routes
- Test everything
- Set `MAINTENANCE_MODE = false`
- Go live! 🚀

---

**Toggle Location:** `app/(dashboard)/layout.tsx:13`  
**Current Value:** `MAINTENANCE_MODE = true`  
**To Disable:** Change to `false`

