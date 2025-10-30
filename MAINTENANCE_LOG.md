# Maintenance Log - Database Schema Migration

**Date:** October 30, 2025  
**Status:** 🟡 In Progress  
**Priority:** High

## Issue Summary

The application is experiencing 500 errors due to outdated database schema references. The `schedule_comment` table was migrated from `student_id` to `author_id` to support multi-user comments (students, faculty, staff), but several components still reference the old column names.

## Affected Components & Pages

### ✅ Fixed (Phase 1)
- [x] `lib/db/schedule-comments.ts` - Updated foreign key references
- [x] `components/faculty/section-card.tsx` - Removed non-existent activity field

### 🔴 Requires Schema Updates (Phase 2)

#### Components
1. **components/schedule-comment-list.tsx**
   - Status: Needs review for schema compatibility
   - Issue: May reference old column names in API calls
   - Lines: Multiple (edit, delete, update functions)

2. **components/schedule-comment-form.tsx**  
   - Status: Needs review
   - Issue: API endpoint `/api/schedule-comments` may need updates
   - Lines: 50-57

3. **components/student-comment-manager.tsx**
   - Status: Needs full review
   - Issue: Complex component with multiple schema interactions
   - Lines: Throughout

4. **components/faculty/comment-list-wrapper.tsx**
   - Status: Needs review
   - Issue: Wrapper component may pass incorrect props

#### Pages
1. **app/(dashboard)/dashboard/student/page.tsx**
   - Status: Uses StudentCommentManager component
   - Action: Temporarily redirect to maintenance page
   - Depends on: StudentCommentManager fix

2. **app/(dashboard)/dashboard/faculty/page.tsx**
   - Status: Fixed but depends on comment components
   - Action: Monitor for errors

3. **app/(dashboard)/dashboard/faculty/feedback/page.tsx**
   - Status: Depends on comment system
   - Action: Temporarily redirect to maintenance page

#### API Routes
1. **app/api/schedule-comments/route.ts**
   - Status: Needs review
   - Issue: May use old column names in queries

## Migration Details

### Database Changes (Completed)
```sql
-- Migration: 20251028145708_unified_schedule_comments.sql
ALTER TABLE schedule_comment RENAME COLUMN student_id TO author_id;
ALTER TABLE schedule_comment DROP CONSTRAINT schedule_comment_student_id_fkey;
ALTER TABLE schedule_comment ADD CONSTRAINT schedule_comment_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES user_roles(user_id);
```

### Code Changes Required

#### 1. Foreign Key References
**Before:**
```typescript
schedule_comment_student_id_fkey
```

**After:**
```typescript
schedule_comment_author_id_fkey
```

#### 2. Column References
**Before:**
```typescript
comment.student_id
```

**After:**
```typescript
comment.author_id
```

#### 3. Type Definitions
- Created `ScheduleCommentView` interface in `lib/db/schedule-comments.ts`
- Added `role` field to student object for role display

## Action Plan

### Phase 1: Critical Fixes ✅ COMPLETE
- [x] Fix `lib/db/schedule-comments.ts`
- [x] Fix `components/faculty/section-card.tsx`
- [x] Add maintenance page
- [x] Document affected areas

### Phase 2: Component Updates 🔄 IN PROGRESS
- [ ] Review and fix `components/schedule-comment-list.tsx`
- [ ] Review and fix `components/schedule-comment-form.tsx`
- [ ] Review and fix `components/student-comment-manager.tsx`
- [ ] Review and fix `components/faculty/comment-list-wrapper.tsx`

### Phase 3: API Routes
- [ ] Review `app/api/schedule-comments/route.ts`
- [ ] Review `app/api/schedule-comments/[id]/route.ts` (if exists)

### Phase 4: Testing
- [ ] Test student comment creation
- [ ] Test faculty comment viewing
- [ ] Test comment resolution (admin)
- [ ] Test comment editing/deletion
- [ ] Verify RLS policies work correctly

### Phase 5: Deployment
- [ ] Regenerate TypeScript types: `pnpm db:types`
- [ ] Run full test suite
- [ ] Update production database
- [ ] Remove maintenance redirects
- [ ] Monitor error logs

## Temporary Measures

### Maintenance Page
Created: `app/maintenance/page.tsx`
- User-friendly explanation of maintenance
- Technical details for developers
- Links back to working features
- ETA and status updates

### Redirects (Temporary)
```typescript
// In affected pages, add redirect:
import { redirect } from 'next/navigation'
redirect('/maintenance')
```

## Database Commands

### Regenerate Types
```bash
pnpm db:types
# or
supabase gen types typescript --local > lib/types/database.ts
```

### Check Migration Status
```bash
pnpm db:status
```

### View Database Logs
```bash
supabase logs db
```

## Testing Checklist

After fixes are complete:

- [ ] Student can create general comments
- [ ] Student can create section-specific comments
- [ ] Student can edit own unresolved comments
- [ ] Student can delete own unresolved comments
- [ ] Faculty can view all comments on their sections
- [ ] Faculty can create feedback comments
- [ ] Admin (scheduling/registrar) can resolve comments
- [ ] Comments display correct author information
- [ ] Comment stats calculate correctly
- [ ] No 500 errors in browser console
- [ ] No TypeScript errors in IDE

## Notes

1. **Multi-User Support**: The migration enables students, faculty, and staff to all create comments using the same table
2. **Backward Compatibility**: Old code using `student_id` needs updating to `author_id`
3. **RLS Policies**: Already updated to use `author_id` in migrations
4. **Type Safety**: Added proper TypeScript interfaces for comment views

## Contact

- **Developer**: AI Assistant
- **Issue Tracker**: GitHub Issues
- **Documentation**: See `src/docs/` folder

## References

- Migration File: `supabase/migrations/20251028145708_unified_schedule_comments.sql`
- RLS Policies: `supabase/migrations/20241027000002_rls_policies.sql`
- Helper Functions: `lib/db/schedule-comments.ts`

