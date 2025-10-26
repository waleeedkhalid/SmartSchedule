# Database Refinements Guide

## Overview

This guide documents the required database refinements based on your requests:

1. **faculty_number → faculty_id**: Rename the faculty identifier field
2. **Text Input Security**: Analysis and mitigation strategies
3. **irregular_students**: Already properly linked with student_id FK ✓
4. **Room Table Simplification**: Reduce to id + number only
5. **Add More Enums**: Comprehensive enum types for type safety

---

## 🎯 Implementation Status

### ✅ Already Completed
- ✓ irregular_students.student_id foreign key already exists and is properly linked to users table
- ✓ CHECK constraints dropped
- ✓ Default values dropped
- ✓ Initial enums created

### ⚠️ Partially Complete - Needs Manual Intervention

Due to existing data and complex table relationships, the following changes need to be applied **manually in stages**:

---

## 📋 Manual Migration Steps

### Step 1: Create New Enums (if not exists)

```sql
-- Run these to create the enums
DO $$ BEGIN
  CREATE TYPE student_status AS ENUM ('active', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE faculty_status AS ENUM ('active', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE section_status AS ENUM ('draft', 'reserved', 'confirmed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE section_type_enum AS ENUM ('lecture', 'lab', 'tutorial');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE enrollment_status_enum AS ENUM ('enrolled', 'completed', 'dropped', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE conflict_severity_enum AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE preference_status_enum AS ENUM ('draft', 'submitted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE irregular_status_enum AS ENUM ('pending', 'notified', 'in_progress', 'resolved', 'dismissed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_role_enum AS ENUM ('student', 'faculty', 'scheduling_committee', 'teaching_load_committee', 'registrar');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
```

### Step 2: Faculty Table - Rename faculty_number to faculty_id

```sql
BEGIN;

-- Add new column
ALTER TABLE public.faculty ADD COLUMN IF NOT EXISTS faculty_id TEXT;

-- Copy data
UPDATE public.faculty SET faculty_id = faculty_number WHERE faculty_id IS NULL;

-- Make NOT NULL and UNIQUE
ALTER TABLE public.faculty ALTER COLUMN faculty_id SET NOT NULL;
ALTER TABLE public.faculty ADD CONSTRAINT faculty_faculty_id_key UNIQUE (faculty_id);

-- Drop old column (this will cascade drop the unique constraint)
ALTER TABLE public.faculty DROP COLUMN faculty_number CASCADE;

-- Update status to enum
ALTER TABLE public.faculty 
  RENAME COLUMN status TO status_old;

ALTER TABLE public.faculty 
  ADD COLUMN status faculty_status DEFAULT 'active'::faculty_status;

UPDATE public.faculty 
SET status = CASE LOWER(COALESCE(status_old, 'active'))
  WHEN 'active' THEN 'active'::faculty_status
  WHEN 'inactive' THEN 'inactive'::faculty_status
  ELSE 'active'::faculty_status
END;

ALTER TABLE public.faculty DROP COLUMN status_old;
ALTER TABLE public.faculty ALTER COLUMN status SET NOT NULL;

COMMENT ON COLUMN public.faculty.faculty_id IS 'Unique faculty identifier (replaces faculty_number)';

COMMIT;
```

### Step 3: Simplify Room Table

```sql
BEGIN;

-- Create new simplified room table
CREATE TABLE public.room_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Copy data
INSERT INTO public.room_new (number, created_at, updated_at)
SELECT DISTINCT number, MIN(created_at), MIN(updated_at) 
FROM public.room 
GROUP BY number;

-- Add room_id to referencing tables
ALTER TABLE public.section ADD COLUMN room_id UUID;
ALTER TABLE public.exam ADD COLUMN room_id UUID;

-- Update references
UPDATE public.section s 
SET room_id = rn.id
FROM public.room_new rn
INNER JOIN public.room r ON r.number = rn.number
WHERE s.room_number = r.number;

UPDATE public.exam e 
SET room_id = rn.id
FROM public.room_new rn
INNER JOIN public.room r ON r.number = rn.number
WHERE e.room_number = r.number;

-- Drop old constraints and columns
ALTER TABLE public.section DROP CONSTRAINT IF EXISTS section_room_number_fkey CASCADE;
ALTER TABLE public.exam DROP CONSTRAINT IF EXISTS exam_room_number_fkey CASCADE;
ALTER TABLE public.section DROP COLUMN room_number;
ALTER TABLE public.exam DROP COLUMN room_number;

-- Add new foreign keys
ALTER TABLE public.section 
  ADD CONSTRAINT section_room_id_fkey 
  FOREIGN KEY (room_id) REFERENCES public.room_new(id) ON DELETE SET NULL;

ALTER TABLE public.exam 
  ADD CONSTRAINT exam_room_id_fkey 
  FOREIGN KEY (room_id) REFERENCES public.room_new(id) ON DELETE SET NULL;

-- Replace table
DROP TABLE public.room CASCADE;
ALTER TABLE public.room_new RENAME TO room;

-- Add indexes
CREATE INDEX idx_room_number ON public.room(number);
CREATE INDEX idx_section_room_id ON public.section(room_id);
CREATE INDEX idx_exam_room_id ON public.exam(room_id);

-- Add trigger
CREATE TRIGGER update_room_updated_at 
  BEFORE UPDATE ON public.room
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.room ENABLE ROW LEVEL SECURITY;

CREATE POLICY "room_view" ON public.room 
  FOR SELECT USING (true);

CREATE POLICY "room_manage" ON public.room 
  FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = (SELECT auth.uid()) 
      AND role IN ('scheduling_committee', 'teaching_load_committee'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = (SELECT auth.uid()) 
      AND role IN ('scheduling_committee', 'teaching_load_committee'))
  );

COMMENT ON TABLE public.room IS 'Simplified room table with only id and number';
COMMENT ON COLUMN public.room.number IS 'Room number - primary identifier';

COMMIT;
```

### Step 4: Convert Other Tables to Enums

For each table, use the rename-copy-drop pattern:

```sql
-- Example for students table
BEGIN;

ALTER TABLE public.students RENAME COLUMN status TO status_old;
ALTER TABLE public.students ADD COLUMN status student_status DEFAULT 'active'::student_status;

UPDATE public.students 
SET status = CASE LOWER(COALESCE(status_old, 'active'))
  WHEN 'active' THEN 'active'::student_status
  WHEN 'inactive' THEN 'inactive'::student_status
  WHEN 'graduated' THEN 'graduated'::student_status
  WHEN 'withdrawn' THEN 'withdrawn'::student_status
  WHEN 'suspended' THEN 'suspended'::student_status
  ELSE 'active'::student_status
END;

ALTER TABLE public.students DROP COLUMN status_old;
ALTER TABLE public.students ALTER COLUMN status SET NOT NULL;

COMMIT;
```

Repeat for:
- `section.status` → `section_status`
- `section.section_type` → `section_type_enum`
- `enrollment.status` → `enrollment_status_enum`
- `section_enrollment.enrollment_status` → `enrollment_status_enum`
- `elective_preferences.status` → `preference_status_enum`
- `irregular_students.status` → `irregular_status_enum`
- `schedule_conflicts.severity` → `conflict_severity_enum`

---

## 🔒 Text Input Security Analysis & Mitigation Guide

### Identified Text Input Fields

| Table | Column | Risk Level | User Input? | Mitigation Status |
|-------|--------|------------|-------------|-------------------|
| `feedback` | `feedback_text` | 🔴 HIGH | Yes (Student) | ⚠️ Needs XSS prevention |
| `irregular_students` | `notes` | 🟡 MEDIUM | No (Committee) | ✓ Trusted users only |
| `irregular_students` | `reason` | 🟡 MEDIUM | No (Committee) | ✓ Trusted users only |
| `course` | `description` | 🟢 LOW | No (Admin) | ✓ Trusted users only |
| `notifications` | `message` | 🟢 LOW | No (System) | ✓ System generated |
| `notifications` | `title` | 🟢 LOW | No (System) | ✓ System generated |
| `schedule_conflicts` | `description` | 🟢 LOW | No (System) | ✓ System generated |
| `term_events` | `description` | 🟢 LOW | No (Committee) | ✓ Trusted users only |

### Security Vulnerabilities & Mitigations

#### 1. **XSS (Cross-Site Scripting)** - 🔴 CRITICAL

**Vulnerable Code:**
```typescript
// ❌ BAD: Direct rendering without sanitization
<div dangerouslySetInnerHTML={{ __html: feedback.feedback_text }} />
```

**✅ MITIGATION - Option A: Use React's Default Escaping**
```typescript
// ✅ GOOD: React automatically escapes text
<div>{feedback.feedback_text}</div>
```

**✅ MITIGATION - Option B: Use DOMPurify for Rich Text**
```typescript
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(feedback.feedback_text) 
}} />
```

#### 2. **SQL Injection** - ✅ ALREADY PROTECTED

Supabase uses parameterized queries, so SQL injection is already prevented:

```typescript
// ✅ SAFE: Supabase parameterizes automatically
const { data } = await supabase
  .from("feedback")
  .select("*")
  .eq("student_id", userId); // Automatically escaped
```

#### 3. **Content Length Limits** - ⚠️ NEEDS IMPLEMENTATION

**Current Status:**
```typescript
const feedbackSchema = z.object({
  feedbackText: z.string().min(10, "Feedback must be at least 10 characters"),
  // ❌ NO MAX LENGTH!
});
```

**✅ RECOMMENDED:**
```typescript
const feedbackSchema = z.object({
  feedbackText: z.string()
    .min(10, "Feedback must be at least 10 characters")
    .max(5000, "Feedback cannot exceed 5000 characters"), // Add limit
  rating: z.number().min(1).max(5),
});
```

**Add Database Constraints:**
```sql
ALTER TABLE public.feedback 
  ADD CONSTRAINT feedback_text_length_check 
  CHECK (char_length(feedback_text) <= 5000);

ALTER TABLE public.irregular_students 
  ADD CONSTRAINT notes_length_check 
  CHECK (char_length(notes) <= 2000);

ALTER TABLE public.irregular_students 
  ADD CONSTRAINT reason_length_check 
  CHECK (char_length(reason) <= 500);

ALTER TABLE public.course 
  ADD CONSTRAINT description_length_check 
  CHECK (char_length(description) <= 1000);
```

#### 4. **Rate Limiting** - ⚠️ RECOMMENDED FOR FEEDBACK

**Implement Rate Limiting for Feedback Submission:**

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const feedbackRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 submissions per hour
  analytics: true,
});
```

```typescript
// Use in feedback submission
const { success } = await feedbackRateLimit.limit(user.id);
if (!success) {
  return { error: "Too many feedback submissions. Try again later." };
}
```

#### 5. **Input Sanitization** - ✅ IMPLEMENT

**Add to Validation Schema:**

```typescript
import { z } from "zod";

const sanitizeText = (text: string) => {
  return text
    .trim()
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
    .replace(/\s+/g, " "); // Normalize whitespace
};

const feedbackSchema = z.object({
  feedbackText: z.string()
    .min(10)
    .max(5000)
    .transform(sanitizeText),
  rating: z.number().min(1).max(5),
});
```

### ✅ Security Checklist

- [ ] **Add max length validation** to all text inputs in Zod schemas
- [ ] **Add database constraints** for text length limits
- [ ] **Implement rate limiting** for feedback submissions
- [ ] **Use React's default escaping** when displaying user text (already done)
- [ ] **Add input sanitization** to remove control characters
- [ ] **Test XSS vectors** (try entering `<script>alert('XSS')</script>` in feedback)
- [ ] **Monitor feedback table** for suspicious patterns
- [ ] **Implement content moderation** (optional - flag offensive content)

### 🛡️ Best Practices Going Forward

1. **NEVER** use `dangerouslySetInnerHTML` without sanitization
2. **ALWAYS** validate input length (min AND max)
3. **ALWAYS** sanitize user input before storage
4. **ALWAYS** escape output when rendering (React does this by default)
5. **CONSIDER** rate limiting for user-generated content
6. **CONSIDER** content moderation for public-facing text
7. **TEST** security by trying to inject malicious content

---

## 📝 Code Changes Required

### Update TypeScript Code

After running the migrations above, update your code:

#### 1. Faculty References

```typescript
// ❌ OLD
const { data: faculty } = await supabase
  .from("faculty")
  .select("faculty_number")
  .eq("faculty_number", facultyNumber);

// ✅ NEW
const { data: faculty } = await supabase
  .from("faculty")
  .select("faculty_id")
  .eq("faculty_id", facultyId);
```

#### 2. Room References

```typescript
// ❌ OLD
const { data: section } = await supabase
  .from("section")
  .select("room_number")
  .eq("room_number", roomNumber);

// ✅ NEW
const { data: section } = await supabase
  .from("section")
  .select("room_id, room:room_id(number)")
  .eq("room_id", roomId);
```

#### 3. Enum Usage

```typescript
// ✅ Use TypeScript enums for type safety
import { Database } from "@/types/database";

type StudentStatus = Database['public']['Enums']['student_status'];
type FacultyStatus = Database['public']['Enums']['faculty_status'];

// In queries
const { data } = await supabase
  .from("students")
  .select("*")
  .eq("status", "active" as StudentStatus);
```

---

## 🔄 Regenerate TypeScript Types

After applying all migrations:

```bash
npx supabase gen types typescript --project-id kpmvguvncbqcflaskcmi > src/types/database.ts
```

Or use the Supabase MCP to regenerate types programmatically.

---

## ✅ Final Verification

Run these queries to verify everything is correct:

```sql
-- 1. Check faculty_id exists and faculty_number is gone
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'faculty' 
  AND column_name IN ('faculty_id', 'faculty_number');
-- Should show only faculty_id

-- 2. Check room table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'room';
-- Should show: id, number, created_at, updated_at ONLY

-- 3. Check enums exist
SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname;
-- Should list all new enums

-- 4. Check status columns are enums
SELECT 
  table_name,
  column_name,
  udt_name as data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND column_name LIKE '%status%'
ORDER BY table_name, column_name;

-- 5. Verify irregular_students.student_id FK
SELECT 
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'irregular_students'
  AND kcu.column_name = 'student_id';
-- Should show FK to users(id)
```

---

## 📚 Additional Resources

- **Supabase RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **OWASP XSS Prevention**: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- **Zod Validation**: https://zod.dev/
- **DOMPurify**: https://github.com/cure53/DOMPurify

---

## 🤝 Support

If you encounter any issues during migration, refer to:
1. Supabase Dashboard → Database → Logs
2. Browser console for client-side errors
3. Server logs for API errors

Remember to test thoroughly in a development environment before applying to production!

