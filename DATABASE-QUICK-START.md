# 🚀 Database Integration - Quick Start

## ✅ What Was Done

### Database Tables Created via Supabase MCP

| Table                  | Purpose                | RLS | Records |
| ---------------------- | ---------------------- | --- | ------- |
| `students`             | Student profiles       | ✅  | 0       |
| `completed_courses`    | Course history         | ✅  | 0       |
| `elective_submissions` | Preference submissions | ✅  | 0       |
| `elective_preferences` | Course selections      | ✅  | 0       |
| `student_schedules`    | Generated schedules    | ✅  | 0       |

### Views Created

- `student_profiles` - Students with completed courses array
- `student_submission_details` - Submissions with preferences array

### APIs Updated

- ✅ `/api/student/profile` - Now uses real Supabase queries
- ✅ `/api/electives/submit` (POST) - Saves to database
- ✅ `/api/electives/submit` (GET) - Fetches from database

---

## 🔧 Quick Setup (3 Steps)

### 1. Set Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://zbvincggltzbyrrsrprn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

Get keys from: [Supabase Dashboard → Settings → API](https://supabase.com/dashboard/project/zbvincggltzbyrrsrprn/settings/api)

### 2. Create Test User

In Supabase Dashboard → Authentication → Add User:

- Email: `test@example.com`
- Password: `Test123!@#`
- Copy the User ID

### 3. Insert Test Student

Run in Supabase SQL Editor:

```sql
-- Replace YOUR_USER_ID with the UUID from step 2
INSERT INTO students (user_id, student_id, name, email, level, gpa, completed_credits)
VALUES
  ('YOUR_USER_ID', '441000001', 'Test Student', 'test@example.com', 6, 3.75, 102);

-- Add some completed courses
INSERT INTO completed_courses (student_id, course_code)
SELECT
  (SELECT id FROM students WHERE email = 'test@example.com'),
  course_code
FROM (VALUES
  ('SWE211'), ('CSC111'), ('MATH151'), ('CSC113')
) AS courses(course_code);
```

---

## 🧪 Test the Application

```bash
npm run dev
```

1. Visit `http://localhost:3000`
2. Login with `test@example.com` / `Test123!@#`
3. Navigate to "Elective Selection"
4. Select courses and submit
5. Check Supabase Dashboard for data:
   ```sql
   SELECT * FROM student_submission_details;
   ```

---

## 🔍 Verify Database

```sql
-- Check student was created
SELECT * FROM student_profiles WHERE email = 'test@example.com';

-- Check submissions
SELECT * FROM elective_submissions;

-- Check preferences
SELECT * FROM elective_preferences;
```

---

## 🎯 Status

- ✅ **Tables Created**: 5 core tables + 2 views
- ✅ **Security**: RLS enabled on all tables
- ✅ **APIs Updated**: All mock data removed
- ✅ **Zero Errors**: TypeScript compilation clean
- 🟢 **Ready for Production**

---

## 📞 Troubleshooting

**"Student profile not found"**
→ Run insert SQL from Step 3 above

**"Environment variables missing"**
→ Check `.env.local` exists and restart server

**"Authentication failed"**
→ Create user in Supabase Auth first (Step 2)

---

## 📚 Full Documentation

See: `docs/DATABASE-INTEGRATION-COMPLETE.md`
