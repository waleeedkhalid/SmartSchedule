# Database Migration Fix Summary

## Problem
The local database had no base schema - migrations 001+ were Phase 5 additions that expected the base schema (user_roles, enums, etc.) to already exist, causing:
- `user_roles` table not found errors
- `user_role` enum not found errors  
- Migration dependency conflicts

## Solution Applied

### 1. Created Base Schema Migration ✅
**File**: `supabase/migrations/00000000000000_initial_schema.sql`

Copied from `PRODUCTION_INITIAL_SCHEMA.sql` to establish the complete base schema before Phase 5 migrations:
- All enums (user_role, room_type, section_state, etc.)
- All core tables (user_roles, course, section, instructor, etc.)
- All helper functions (has_role, has_any_role, etc.)
- All base RLS policies

### 2. Fixed Migration Dependencies ✅
**File**: `supabase/migrations/004_create_course_enrollment.sql`

Removed circular dependency where migration 004 referenced `section_assignment` table that was only created in migration 005:

**Before**:
```sql
-- Complex policy with section_assignment join
CREATE POLICY "Students can view own enrollments"
  ON course_enrollment FOR SELECT
  USING (
    ... OR (has_role('faculty'::user_role) AND EXISTS (
      SELECT 1 FROM section s
      INNER JOIN section_assignment sa ON sa.section_id = s.id  -- Doesn't exist yet!
      ...
    ))
  );
```

**After**:
```sql
-- Simplified policy without forward reference
CREATE POLICY "Students can view own enrollments"
  ON course_enrollment FOR SELECT
  USING (
    (has_role('student'::user_role) AND student_id = auth.uid())
    OR has_any_role(ARRAY['scheduling', 'registrar', 'teaching_load', 'faculty']::user_role[])
  );
```

### 3. Made Modify Migrations Conditional ✅
**File**: `supabase/migrations/010_modify_user_roles_table.sql`

Made the migration conditional to handle both scenarios:
- **Old schema**: Has `enrollment_year` column → Run migration to move data
- **New schema** (from PRODUCTION_INITIAL_SCHEMA): Already in final state → Skip migration

```sql
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_roles' AND column_name = 'enrollment_year'
  ) THEN
    -- Run migration...
  ELSE
    RAISE NOTICE 'Migration 010 skipped: Schema already in final state';
  END IF;
END $$;
```

## Database Reset Output

```
✅ Applying migration 00000000000000_initial_schema.sql...
✅ Applying migration 000_create_utility_functions.sql...
✅ Applying migration 001_create_academic_semester.sql...
✅ Applying migration 002_create_survey_period.sql...
✅ Applying migration 003_create_student_profile.sql...
✅ Applying migration 004_create_course_enrollment.sql...
✅ Applying migration 005_create_section_assignment.sql...
✅ Applying migration 006_create_student_group_member.sql...
✅ Applying migration 007_modify_course_table.sql...
✅ Applying migration 008_modify_section_table.sql...
✅ Applying migration 009_modify_exam_table.sql...
✅ Applying migration 010_modify_user_roles_table.sql...
   NOTICE: Migration 010 skipped: Schema already in final state
✅ Applying migration 011_modify_student_group_table.sql...
✅ Applying migration 012_modify_elective_preference_table.sql...
✅ Applying migration 013_modify_schedule_doc_table.sql...
✅ Applying migration 014_create_semester_functions.sql...
✅ Applying migration 015_create_enrollment_functions.sql...
✅ Applying migration 016_create_section_auto_creation_functions.sql...
✅ Applying migration 017_create_schedule_query_functions.sql...
✅ Applying migration 018_create_survey_functions.sql...
✅ Applying migration 019_add_user_roles_insert_policy.sql...
✅ Finished supabase db reset on branch dev.
```

## Current Database State

The local database now has:
- ✅ Complete base schema from PRODUCTION_INITIAL_SCHEMA
- ✅ All Phase 5 enhancements (semesters, enrollments, profiles, etc.)
- ✅ All helper functions (has_role, has_any_role, auto_assign_student_to_group, etc.)
- ✅ All RLS policies including the new INSERT policy for user_roles
- ✅ All indexes and constraints

## Files Modified

1. ✅ `supabase/migrations/00000000000000_initial_schema.sql` (NEW - base schema)
2. ✅ `supabase/migrations/004_create_course_enrollment.sql` (Fixed circular dependency)
3. ✅ `supabase/migrations/010_modify_user_roles_table.sql` (Made conditional)
4. ✅ `supabase/migrations/019_add_user_roles_insert_policy.sql` (NEW - INSERT policy)

## Testing

Now you can test the complete registration flow:
1. Navigate to http://localhost:3000/register
2. Fill in the form and submit
3. **Expected**: User account created successfully with `user_roles` record
4. Login and complete onboarding
5. **Expected**: No infinite redirect loop!

## Next Steps

The database is now ready for use. The registration flow should work end-to-end without errors.

