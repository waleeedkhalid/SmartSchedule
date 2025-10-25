# RLS Performance Fix - Testing Guide

## Quick Start

### 1. Run the Migration

```bash
# Option A: Using Supabase CLI
supabase db push

# Option B: In Supabase SQL Editor
# Copy and paste the contents of:
# supabase/migrations/20251025_fix_rls_performance.sql
```

### 2. Immediate Verification

Run these queries in Supabase SQL Editor:

#### Check Auth RLS InitPlan Issues (Should be 0):
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  definition
FROM pg_policies 
WHERE definition LIKE '%auth.uid()%' 
AND definition NOT LIKE '%(select auth.uid())%'
AND definition NOT LIKE '%current_setting%'
ORDER BY schemaname, tablename;
```

#### Check Multiple Permissive Policies (Should be minimal):
```sql
SELECT 
  schemaname,
  tablename,
  cmd,
  string_agg(policyname, ', ') as policies,
  count(*) as policy_count
FROM pg_policies
WHERE permissive = true
GROUP BY schemaname, tablename, cmd
HAVING count(*) > 1
ORDER BY policy_count DESC, schemaname, tablename;
```

#### Verify Indexes Were Created:
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE indexname LIKE 'idx_%'
AND schemaname = 'public'
ORDER BY tablename, indexname;
```

## Performance Testing

### Before vs After Comparison

#### Test 1: Student Data Query
```sql
-- Run this as a student user (creates test data if needed)
-- Before migration: Expect 50-500ms
-- After migration: Expect 5-20ms

EXPLAIN ANALYZE
SELECT 
  s.*,
  e.course_id,
  c.course_name
FROM students s
LEFT JOIN enrollment e ON s.id = e.student_id
LEFT JOIN course c ON e.course_id = c.course_code
WHERE s.id = auth.uid();
```

#### Test 2: Section Listing (High traffic)
```sql
-- Before migration: Expect 100-1000ms
-- After migration: Expect 10-50ms

EXPLAIN ANALYZE
SELECT 
  s.*,
  c.course_name,
  r.room_number,
  st.day_of_week,
  st.start_time,
  st.end_time
FROM section s
JOIN course c ON s.course_id = c.course_code
LEFT JOIN room r ON s.room_id = r.room_id
LEFT JOIN section_time st ON s.section_id = st.section_id
LIMIT 100;
```

#### Test 3: Faculty Availability Check
```sql
-- Before migration: Expect 20-200ms per faculty
-- After migration: Expect 2-10ms

EXPLAIN ANALYZE
SELECT *
FROM faculty_availability
WHERE faculty_id = auth.uid();
```

#### Test 4: Complex Committee Query
```sql
-- Before migration: Expect 200-2000ms
-- After migration: Expect 20-100ms

EXPLAIN ANALYZE
SELECT 
  s.section_id,
  s.course_id,
  s.capacity,
  se.enrolled_count,
  sc.conflict_count
FROM section s
LEFT JOIN (
  SELECT section_id, COUNT(*) as enrolled_count
  FROM section_enrollment
  GROUP BY section_id
) se ON s.section_id = se.section_id
LEFT JOIN (
  SELECT section_id, COUNT(*) as conflict_count
  FROM schedule_conflicts
  WHERE status = 'active'
  GROUP BY section_id
) sc ON s.section_id = sc.section_id
WHERE s.term_id = (SELECT term_id FROM academic_term WHERE is_active = true LIMIT 1)
LIMIT 50;
```

## Real-World Testing

### 1. Dashboard Load Time Test

**Before Migration:**
- Open committee/scheduler/dashboard
- Note: Page loads in ~3-5 seconds
- Check Network tab: Multiple slow API calls

**After Migration:**
- Open same dashboard
- Expected: Page loads in <1 second
- API calls should complete in 50-200ms each

### 2. Student Schedule View

**Before Migration:**
- Student views their schedule
- Expected: 1-2 seconds to load

**After Migration:**
- Student views their schedule
- Expected: < 300ms to load

### 3. Faculty Availability Form

**Before Migration:**
- Faculty updates availability
- Save takes 500ms-1s

**After Migration:**
- Faculty updates availability
- Save takes < 100ms

## Monitoring Queries

### Track Performance Over Time

#### 1. Slowest Queries (Run daily):
```sql
SELECT 
  LEFT(query, 100) as query_snippet,
  calls,
  ROUND(mean_exec_time::numeric, 2) as avg_ms,
  ROUND(total_exec_time::numeric, 2) as total_ms,
  ROUND((100 * total_exec_time / sum(total_exec_time) OVER ())::numeric, 2) as pct_total
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
AND mean_exec_time > 10
ORDER BY total_exec_time DESC
LIMIT 20;
```

#### 2. Cache Hit Rates (Should be > 95%):
```sql
SELECT 
  'index hit rate' as metric,
  ROUND((sum(idx_blks_hit) / NULLIF(sum(idx_blks_hit + idx_blks_read), 0) * 100)::numeric, 2) as percentage
FROM pg_statio_user_indexes
UNION ALL
SELECT 
  'table hit rate' as metric,
  ROUND((sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit + heap_blks_read), 0) * 100)::numeric, 2) as percentage
FROM pg_statio_user_tables;
```

#### 3. Index Usage Stats:
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as times_used,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC, tablename;
```

#### 4. RLS Policy Overhead Check:
```sql
-- Run this query before and after to see improvement
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT * FROM students WHERE id = auth.uid();

-- Look for:
-- Before: "SubPlan" nodes with multiple "auth.uid()" calls
-- After: Single InitPlan node at top
```

## Expected Results Summary

| Test Type | Before | After | Improvement |
|-----------|--------|-------|-------------|
| Dashboard Load | 3-5s | <1s | 5x faster |
| Student Schedule | 1-2s | <300ms | 5x faster |
| Section List (100 items) | 500ms | 50ms | 10x faster |
| Faculty Availability | 200ms | 10ms | 20x faster |
| Enrollment Query | 100ms | 10ms | 10x faster |

## Troubleshooting

### Issue: No Performance Improvement

**Check:**
1. Migration applied successfully?
```sql
SELECT * FROM public.schema_migrations 
ORDER BY version DESC LIMIT 5;
```

2. Are you testing with the right user role?
```sql
SELECT id, email, role FROM auth.users WHERE id = auth.uid();
```

3. Check for query cache:
```sql
-- Reset stats to get fresh measurements
SELECT pg_stat_statements_reset();
```

### Issue: Authentication Errors

**Check:**
1. RLS policies active:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

2. Verify policy definitions:
```sql
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Issue: Slow Queries Still Present

**Investigate:**
1. Check which queries are still slow:
```sql
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY total_exec_time DESC;
```

2. Analyze specific slow query:
```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
<your-slow-query-here>;
```

## Success Criteria

✅ **Migration Successful If:**

1. Zero `auth_rls_initplan` warnings in linter
2. < 5 instances of multiple permissive policies
3. Dashboard loads in < 1 second
4. All API endpoints respond in < 200ms
5. No authentication errors reported
6. Index hit rate > 95%
7. User-facing features work normally

## Next Steps After Testing

If all tests pass:

1. ✅ Monitor for 24 hours in production
2. ✅ Collect user feedback on performance
3. ✅ Check error logs for any RLS issues
4. 🔄 Consider implementing Redis caching (performance.md Phase 2)
5. 🔄 Implement materialized views for analytics (performance.md Phase 3)

## Rollback (If Needed)

```sql
-- Emergency rollback: Disable RLS temporarily
ALTER TABLE <table_name> DISABLE ROW LEVEL SECURITY;

-- Then restore from backup or re-create original policies
-- Check git history for original policy definitions
```

## Support

If you encounter issues:

1. Check error logs in Supabase Dashboard
2. Review the migration file for specific table
3. Test with different user roles (student, faculty, committee)
4. Verify auth.uid() returns expected value
5. Check application logs for authentication errors

---

**Testing Duration:** 30-60 minutes  
**Production Monitoring:** 24-48 hours recommended  
**Rollback Time:** < 5 minutes if needed

