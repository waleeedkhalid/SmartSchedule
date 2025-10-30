# Schema Migration Guide - Comment System Update

## 🎯 Overview

The SSv2 application is undergoing a database schema migration to update the comment system from student-only to multi-user support (students, faculty, staff). This guide documents the changes, affected components, and steps to complete the migration.

## 📊 Migration Status

**Current Status:** 🟡 Phase 1 Complete, Phase 2 Pending  
**Date Started:** October 30, 2025  
**Last Updated:** October 30, 2025

### Progress Tracker

- ✅ Phase 1: Critical Database Access Layer (100%)
- ⚠️ Phase 2: UI Components (0%)
- ⏳ Phase 3: API Routes (Not Started)
- ⏳ Phase 4: Testing (Not Started)
- ⏳ Phase 5: Deployment (Not Started)

## 🗄️ Database Changes

### Schema Update
```sql
-- From: schedule_comment.student_id
-- To:   schedule_comment.author_id

ALTER TABLE schedule_comment RENAME COLUMN student_id TO author_id;
ALTER TABLE schedule_comment DROP CONSTRAINT schedule_comment_student_id_fkey;
ALTER TABLE schedule_comment ADD CONSTRAINT schedule_comment_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES user_roles(user_id);
```

**Migration File:** `supabase/migrations/20251028145708_unified_schedule_comments.sql`

### Why This Change?
- **Before:** Only students could create comments (limited to student_id)
- **After:** All users (students, faculty, staff) can create comments (using author_id)
- **Benefit:** Better collaboration and feedback from all stakeholders

## ✅ Completed Fixes (Phase 1)

### 1. Database Access Layer
**File:** `lib/db/schedule-comments.ts`

**Changes:**
- ✅ Updated foreign key references from `schedule_comment_student_id_fkey` to `schedule_comment_author_id_fkey`
- ✅ Updated column references from `comment.student_id` to `comment.author_id`
- ✅ Added `ScheduleCommentView` interface definition
- ✅ Added `role` field to support multi-user display

**Functions Fixed:**
- `getUserComments()` ✅
- `getSectionComments()` ✅
- `getGeneralComments()` ✅

### 2. Component Fix
**File:** `components/faculty/section-card.tsx`

**Changes:**
- ✅ Removed reference to non-existent `section.activity` property
- ✅ Simplified section display logic

### 3. Maintenance Infrastructure
**Files Created:**
- ✅ `app/maintenance/page.tsx` - User-friendly maintenance page
- ✅ `MAINTENANCE_LOG.md` - Detailed technical log
- ✅ `SCHEMA_MIGRATION_GUIDE.md` - This guide

**Pages Updated with Redirects:**
- ✅ `app/(dashboard)/dashboard/student/page.tsx` → `/maintenance`
- ✅ `app/(dashboard)/dashboard/faculty/feedback/page.tsx` → `/maintenance`
- ✅ `app/(dashboard)/dashboard/faculty/page.tsx` - Disabled feedback section with notice

## ⚠️ Pending Fixes (Phase 2)

### Components Requiring Updates

#### 1. `components/schedule-comment-list.tsx`
**Status:** 🔴 Not Started  
**Priority:** High  
**Issues:**
- May reference old API response format
- Edit/Delete functions may use incorrect field names

**Required Changes:**
```typescript
// Update any references from:
comment.student_id → comment.author_id

// Verify API calls match new schema
```

#### 2. `components/schedule-comment-form.tsx`
**Status:** 🔴 Not Started  
**Priority:** High  
**Issues:**
- API endpoint `/api/schedule-comments` may need review
- Form submission may use old field names

**Required Changes:**
- Review POST request body
- Ensure `author_id` is used instead of `student_id`

#### 3. `components/student-comment-manager.tsx`
**Status:** 🔴 Not Started  
**Priority:** High  
**Issues:**
- Complex component with multiple schema interactions
- May have hardcoded `student_id` references

**Required Changes:**
- Full review of all database interactions
- Update state management to use `author_id`
- Update API calls

#### 4. `components/faculty/comment-list-wrapper.tsx`
**Status:** 🔴 Not Started  
**Priority:** Medium  
**Issues:**
- Props interface may need updating
- May pass incorrect field names to child components

**Required Changes:**
- Review prop types
- Verify data transformation logic

## 🔌 API Routes to Review

### 1. `app/api/schedule-comments/route.ts`
**Status:** 🔴 Not Reviewed  
**Priority:** High

**Check Points:**
- [ ] POST handler uses `author_id` instead of `student_id`
- [ ] GET handler returns correct field names
- [ ] Authentication properly identifies `author_id`

### 2. `app/api/schedule-comments/[id]/route.ts` (if exists)
**Status:** 🔴 Not Reviewed  
**Priority:** Medium

**Check Points:**
- [ ] PATCH/PUT handlers use `author_id`
- [ ] DELETE handler validates ownership correctly
- [ ] Response format matches new schema

## 🧪 Testing Checklist

After completing all fixes, test these scenarios:

### Comment Creation
- [ ] Student can create general comment
- [ ] Student can create section-specific comment
- [ ] Faculty can create feedback comment
- [ ] Staff can create comment (if applicable)

### Comment Management
- [ ] User can view their own comments
- [ ] User can edit unresolved comments
- [ ] User can delete unresolved comments
- [ ] Resolved comments are read-only

### Comment Resolution
- [ ] Admin (scheduling) can resolve comments
- [ ] Registrar can resolve comments
- [ ] Resolution displays correct resolver info
- [ ] Resolved comments show timestamp

### Display
- [ ] Comment author shows correct name and role
- [ ] Section-specific comments link to correct section
- [ ] General comments display without section info
- [ ] Comment stats calculate correctly

### Permissions
- [ ] RLS policies enforce correct access control
- [ ] Users can only edit/delete their own comments
- [ ] Admins can resolve any comment
- [ ] Faculty can view comments on their sections

## 🚀 Deployment Steps

### Pre-Deployment
1. [ ] Complete all Phase 2 component fixes
2. [ ] Review and fix all API routes
3. [ ] Regenerate TypeScript types: `pnpm db:types`
4. [ ] Run linter: `pnpm lint`
5. [ ] Fix all TypeScript errors
6. [ ] Test locally with `pnpm dev`

### Testing Phase
1. [ ] Complete all items in Testing Checklist
2. [ ] Test with different user roles
3. [ ] Check browser console for errors
4. [ ] Verify no 500 errors in Network tab
5. [ ] Test on staging environment

### Deployment
1. [ ] Backup production database
2. [ ] Apply migrations to production (already done via supabase)
3. [ ] Remove maintenance redirects
4. [ ] Deploy updated code
5. [ ] Monitor error logs
6. [ ] Verify with production tests

### Post-Deployment
1. [ ] Remove temporary maintenance notices
2. [ ] Update documentation
3. [ ] Notify users of new features
4. [ ] Monitor for issues (24-48 hours)

## 🔧 Quick Commands

### Development
```bash
# Start local development
pnpm dev

# Regenerate types after schema changes
pnpm db:types

# Check database status
pnpm db:status

# Open Supabase Studio
pnpm db:studio

# Run linter
pnpm lint
```

### Testing Specific Features
```bash
# Test as student
# Register with: role='student', level=2

# Test as faculty
# Register with: role='faculty'

# Test as admin
# Register with: role='scheduling'
```

## 📝 Code Patterns

### Correct Usage (After Migration)

#### Querying Comments
```typescript
// ✅ Correct
const { data } = await supabase
  .from('schedule_comment')
  .select(`
    *,
    author:user_roles!schedule_comment_author_id_fkey(user_id, name, email, role)
  `)
  .eq('author_id', userId)
```

#### Creating Comments
```typescript
// ✅ Correct
const { data } = await supabase
  .from('schedule_comment')
  .insert({
    author_id: userId,
    section_id: sectionId || null,
    comment_text: text,
    is_resolved: false
  })
```

#### Displaying Author Info
```typescript
// ✅ Correct
<div>
  <p>{comment.author.name}</p>
  <Badge>{comment.author.role}</Badge>
</div>
```

### Incorrect Usage (Old Schema)

```typescript
// ❌ Wrong - don't use these
schedule_comment_student_id_fkey
comment.student_id
student:user_roles!schedule_comment_student_id_fkey
```

## 🐛 Troubleshooting

### Issue: 500 Error on Comment Pages
**Cause:** Component using old schema references  
**Solution:** Check foreign key names and column references

### Issue: TypeScript Errors
**Cause:** Types out of sync with database  
**Solution:** Run `pnpm db:types`

### Issue: RLS Policy Errors
**Cause:** Policies may reference old column names  
**Solution:** Check `supabase/migrations/20251029*_performance*.sql`

### Issue: Comments Not Showing
**Cause:** Incorrect join syntax in queries  
**Solution:** Verify foreign key constraint names

## 📚 Related Documentation

- [MAINTENANCE_LOG.md](./MAINTENANCE_LOG.md) - Detailed maintenance log
- [PRD.md](./PRD.md) - Product requirements
- [src/docs/LOCAL_DEVELOPMENT.md](./src/docs/LOCAL_DEVELOPMENT.md) - Development guide
- [.cursor/rules/supabase-cli.mdc](./.cursor/rules/supabase-cli.mdc) - Supabase CLI guide

## 👥 Contact & Support

- **Issue Tracker:** GitHub Issues
- **Documentation:** `/src/docs/`
- **Database Schema:** `supabase/migrations/`

## 📅 Timeline

| Phase | Status | Duration | Target Date |
|-------|--------|----------|-------------|
| Phase 1: Critical Fixes | ✅ Complete | 2 hours | Oct 30, 2025 |
| Phase 2: Components | ⏳ Pending | ~4 hours | TBD |
| Phase 3: API Routes | ⏳ Pending | ~2 hours | TBD |
| Phase 4: Testing | ⏳ Pending | ~3 hours | TBD |
| Phase 5: Deployment | ⏳ Pending | ~1 hour | TBD |

**Estimated Total Time:** 12 hours  
**Status:** 17% Complete

---

**Last Updated:** October 30, 2025  
**Maintained By:** Development Team  
**Version:** 1.0

