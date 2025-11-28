# RLS and Schema Verification Report

**Date:** Generated via Supabase MCP  
**Project:** swe481 (nfdxuxvlhsdbkcleogoe)  
**Status:** ACTIVE_HEALTHY

## Executive Summary

✅ **RLS Status: All tables have RLS enabled**  
✅ **Schema Status: All tables have RLS policies**  
⚠️ **Security Issues: 3 warnings found**  
⚠️ **Performance Issues: Multiple warnings found**

---

## 1. RLS Verification

### All Tables Have RLS Enabled ✅

All 17 tables in the `public` schema have Row Level Security enabled:

| Table | RLS Enabled | Policy Count |
|-------|-------------|--------------|
| `academic_term` | ✅ Yes | 2 |
| `committee_profile` | ✅ Yes | 5 |
| `course` | ✅ Yes | 2 |
| `course_prerequisite` | ✅ Yes | 2 |
| `elective_comment` | ✅ Yes | 7 |
| `elective_preference` | ✅ Yes | 2 |
| `faculty_profile` | ✅ Yes | 6 |
| `notification` | ✅ Yes | 4 |
| `room` | ✅ Yes | 2 |
| `schedule` | ✅ Yes | 2 |
| `schedule_comment` | ✅ Yes | 4 |
| `section` | ✅ Yes | 2 |
| `semester_timeline` | ✅ Yes | 2 |
| `student_enrollment` | ✅ Yes | 4 |
| `student_profile` | ✅ Yes | 5 |
| `time_grid_config` | ✅ Yes | 2 |
| `user_roles` | ✅ Yes | 6 |

**Result:** ✅ **PASS** - No tables are missing RLS protection.

---

## 2. Security Issues

### 🔴 HIGH PRIORITY

#### 1. Function Search Path Mutable (24 functions affected)

**Issue:** Functions don't set `search_path`, making them vulnerable to search path injection attacks.

**Affected Functions:**
- `update_updated_at_column`
- `is_admin`
- `is_registrar_or_admin`
- `get_user_role`
- `has_role`
- `has_any_role`
- `check_course_prerequisites`
- `check_instructor_conflicts`
- `check_student_level_conflicts`
- `check_room_conflicts`
- `get_overdue_events`
- `get_upcoming_deadlines_for_role`
- `auto_assign_student_to_group`
- `update_time_grid_config_updated_at`
- `update_irregular_student_updated_at`
- `get_enrollment_year_from_first_term`
- `get_current_term_hijri_year`
- `auto_generate_student_number`
- `update_student_number_on_first_enrollment`
- `generate_student_number`
- `get_level_statistics`
- `time_ranges_overlap`
- And more...

**Remediation:** Add `SET search_path = public, pg_temp` to all functions:
```sql
CREATE OR REPLACE FUNCTION function_name()
RETURNS type
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
-- function body
$$;
```

**Reference:** https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

#### 2. Extension in Public Schema

**Issue:** Extension `pg_trgm` is installed in the `public` schema.

**Remediation:** Move extension to another schema (e.g., `extensions`).

**Reference:** https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public

#### 3. Leaked Password Protection Disabled

**Issue:** Supabase Auth's leaked password protection is currently disabled.

**Remediation:** Enable leaked password protection in Supabase Dashboard:
- Go to Authentication → Settings
- Enable "Leaked Password Protection"
- This checks passwords against HaveIBeenPwned.org

**Reference:** https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

---

## 3. Performance Issues

### 🟡 MEDIUM PRIORITY

#### 1. Auth RLS Initialization Plan (Multiple policies)

**Issue:** RLS policies are re-evaluating `auth.uid()` or `current_setting()` for each row, causing performance degradation.

**Affected Tables:**
- `user_roles` (3 policies)
- `elective_preference` (1 policy)
- `schedule_comment` (2 policies)
- `student_enrollment` (2 policies)
- `student_profile` (3 policies)
- `committee_profile` (3 policies)
- `elective_comment` (7 policies)
- `time_grid_config` (2 policies)
- `notification` (4 policies)
- `faculty_profile` (5 policies)

**Example Problem:**
```sql
-- ❌ BAD: Re-evaluates for each row
CREATE POLICY "Users can read own role"
  ON user_roles FOR SELECT
  USING (user_id = auth.uid());
```

**Remediation:** Wrap auth functions in subquery:
```sql
-- ✅ GOOD: Evaluates once
CREATE POLICY "Users can read own role"
  ON user_roles FOR SELECT
  USING (user_id = (SELECT auth.uid()));
```

**Reference:** https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

#### 2. Multiple Permissive Policies

**Issue:** Multiple permissive policies on the same table/role/action combination reduce performance.

**Affected Tables:**
- `academic_term` - Multiple SELECT policies
- `committee_profile` - Multiple SELECT/UPDATE policies
- `course` - Multiple SELECT policies
- `course_prerequisite` - Multiple SELECT policies
- `elective_comment` - Multiple SELECT/UPDATE policies
- `elective_preference` - Multiple SELECT policies
- `faculty_profile` - Multiple SELECT/UPDATE/INSERT policies
- `room` - Multiple SELECT policies
- `schedule` - Multiple SELECT policies
- `schedule_comment` - Multiple INSERT/SELECT/UPDATE policies
- `section` - Multiple SELECT policies
- `semester_timeline` - Multiple SELECT policies
- `student_enrollment` - Multiple SELECT/INSERT/UPDATE/DELETE policies
- `student_profile` - Multiple SELECT/UPDATE/INSERT policies
- `time_grid_config` - Multiple SELECT policies
- `user_roles` - Multiple SELECT/UPDATE/INSERT policies

**Remediation:** Consolidate policies where possible. Use single policy with OR conditions instead of multiple policies.

**Reference:** https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies

#### 3. Unindexed Foreign Keys

**Issue:** Foreign keys without covering indexes can impact query performance.

**Affected:**
- `elective_comment.resolved_by` → `auth.users.id`
- `time_grid_config.updated_by` → `auth.users.id`

**Remediation:** Add indexes:
```sql
CREATE INDEX idx_elective_comment_resolved_by ON elective_comment(resolved_by);
CREATE INDEX idx_time_grid_config_updated_by ON time_grid_config(updated_by);
```

**Reference:** https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys

#### 4. Unused Indexes

**Issue:** Several indexes have never been used and may be candidates for removal.

**Affected Indexes:**
- `idx_user_roles_onboarding`
- `idx_course_level`
- `idx_course_is_elective`
- `idx_section_group_level`
- `idx_student_enrollment_status`
- `idx_semester_timeline_category`
- `idx_faculty_profile_department`
- `idx_elective_comment_resolved`
- `idx_student_profile_level`
- `idx_course_title`
- `idx_course_credits`
- `idx_course_weekly_hours`
- `idx_course_code_trgm`
- `idx_course_title_trgm`
- `idx_student_profile_student_number`
- `idx_academic_term_created_by`
- `idx_course_created_by`
- `idx_room_created_by`
- `idx_schedule_comment_resolved_by`
- `idx_section_created_by`
- `idx_section_room_code`
- `idx_notification_created_at`
- `idx_student_profile_enrollment_year`

**Note:** These may be kept for future use or removed if confirmed unused.

**Reference:** https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index

---

## 4. Schema Structure

### Tables Overview

All tables follow proper structure with:
- ✅ Primary keys defined
- ✅ Foreign key constraints
- ✅ Appropriate data types
- ✅ Check constraints where needed
- ✅ Default values for timestamps
- ✅ RLS enabled

### Key Relationships

- **User Management:**
  - `user_roles` → `auth.users`
  - `student_profile` → `auth.users`
  - `faculty_profile` → `auth.users`
  - `committee_profile` → `auth.users`

- **Course Management:**
  - `course` → `course_prerequisite` (self-referencing)
  - `section` → `course`
  - `section` → `room`
  - `section` → `faculty_profile` (instructor)

- **Scheduling:**
  - `schedule` → `academic_term`
  - `schedule` → `section`
  - `student_enrollment` → `section`
  - `student_enrollment` → `auth.users` (student)

---

## 5. Recommendations

### Immediate Actions (Security)

1. **Fix Function Search Path** ⚠️ HIGH PRIORITY
   - Update all 24 functions to set `search_path`
   - Prevents search path injection attacks

2. **Enable Leaked Password Protection** ⚠️ HIGH PRIORITY
   - Enable in Supabase Dashboard
   - Protects users from compromised passwords

3. **Move Extension** ⚠️ MEDIUM PRIORITY
   - Move `pg_trgm` to `extensions` schema

### Performance Optimizations

1. **Optimize RLS Policies** 🟡 MEDIUM PRIORITY
   - Wrap `auth.uid()` calls in subqueries
   - Consolidate multiple permissive policies where possible

2. **Add Missing Indexes** 🟡 LOW PRIORITY
   - Add indexes for `resolved_by` and `updated_by` foreign keys

3. **Review Unused Indexes** 🟢 LOW PRIORITY
   - Monitor usage or remove if confirmed unused

---

## 6. Compliance Status

| Category | Status | Notes |
|----------|--------|-------|
| RLS Enabled | ✅ PASS | All 17 tables have RLS enabled |
| RLS Policies | ✅ PASS | All tables have at least 2 policies |
| Function Security | ⚠️ WARN | 24 functions need search_path fix |
| Password Security | ⚠️ WARN | Leaked password protection disabled |
| Extension Security | ⚠️ WARN | Extension in public schema |
| RLS Performance | ⚠️ WARN | Multiple policies need optimization |
| Index Performance | ⚠️ INFO | Some indexes unused, some FKs unindexed |

---

## 7. Next Steps

1. Create migration to fix function search paths
2. Enable leaked password protection in dashboard
3. Create migration to optimize RLS policies (wrap auth functions)
4. Add missing foreign key indexes
5. Monitor and potentially remove unused indexes

---

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Database Linter Documentation](https://supabase.com/docs/guides/database/database-linter)
- [Function Security Best Practices](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)
- [RLS Performance Optimization](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select)

