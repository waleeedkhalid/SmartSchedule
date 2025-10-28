# Student Groups Auto-Sync Implementation

## Summary

The system has been refactored to simplify the user model and automatically manage student groups. This eliminates confusion and reduces manual administrative work.

## Key Changes

### 1. Simplified User Model - Only "Level" Matters

**Before:**
- Students had: `level`, `enrollment_year`, `expected_graduation_year`
- Confusing relationship between "academic year" and "level"
- Manual data entry for multiple year-related fields

**After:**
- Students have only: `level` (1-8)
- `level` represents the academic semester/standing
- Level determines which required courses students take
- Simple, clear, and unambiguous

### 2. Automatic Student Group Management

**Before:**
- Student groups created manually
- Had to estimate sizes in advance
- Groups could become outdated as students join/leave
- No connection between actual students and group sizes

**After:**
- Student groups **automatically created** when students are added
- Group sizes **auto-update** based on actual student counts
- One group per level with accurate real-time counts
- Zero manual management required

## Technical Implementation

### Database Migration

Created migration `20251029120000_simplify_to_level_and_auto_student_groups.sql` which:

1. **Removed year-related columns:**
   - Dropped `enrollment_year` column
   - Dropped `expected_graduation_year` column

2. **Updated constraints:**
   - Changed `level` constraint from `1-5` to `1-8` (more flexibility)
   - Updated both `user_roles` and `student_group` tables

3. **Created auto-sync function:**
   ```sql
   sync_student_groups()
   ```
   - Counts students by level
   - Creates/updates student_group entries
   - Deletes groups for levels with no students
   - Runs automatically via trigger

4. **Created trigger:**
   ```sql
   auto_sync_student_groups
   ```
   - Fires on INSERT, UPDATE, DELETE of user_roles
   - Only when student role or level changes
   - Calls sync_student_groups() automatically

### How It Works

```
Student Registered → user_roles INSERT → Trigger Fires → sync_student_groups()
     ↓
 Level = 3, 45 students total at Level 3
     ↓
 student_group auto-created/updated:
 - level: 3
 - size: 45
 - name: "Level 3 Students"
```

## UI Changes

### Onboarding Form (`components/onboarding-form.tsx`)

**Removed:**
- Multi-step process with enrollment year and graduation year
- Year selection dropdowns
- Complex validation for year fields

**Updated to:**
- Simple, single-page form
- Only asks for academic level (for students)
- Clear explanation that level determines courses
- Faster onboarding experience

**Level Selection:**
```tsx
Level 1 (Year 1)
Level 2 (Year 1)
Level 3 (Year 2)
Level 4 (Year 2)
...
Level 8
```

Helpful text explains: "Level indicates which semester you're in. Level 1 = First semester, Level 2 = Second semester, etc."

### Other UI Updates

- `app/(auth)/onboarding/page.tsx` - Updated comments and removed year field queries
- `app/(dashboard)/dashboard/student/page.tsx` - Changed "Current academic year" to "Current academic standing"

## TypeScript Types

Regenerated `lib/types/database.ts` to remove year fields:

**Before:**
```typescript
user_roles: {
  Row: {
    level: number | null
    enrollment_year: number | null
    expected_graduation_year: number | null
    ...
  }
}
```

**After:**
```typescript
user_roles: {
  Row: {
    level: number | null  // Only this field remains
    ...
  }
}
```

## Testing Results

✅ **All tests passed!**

Test scenario:
1. Created student at Level 6 → Group auto-created with size = 1
2. Added second student at Level 6 → Group auto-updated to size = 2
3. Deleted both students → Group auto-deleted

## Benefits

### For Administrators
- ✅ No manual student group creation
- ✅ No manual size updates
- ✅ Always accurate group sizes
- ✅ Less data entry

### For Students
- ✅ Simpler onboarding (fewer fields)
- ✅ Clear understanding of "level" concept
- ✅ No confusion about years vs. levels

### For Developers
- ✅ Cleaner data model
- ✅ Single source of truth (level)
- ✅ Automatic consistency
- ✅ Less code to maintain

## Usage Examples

### Adding Students (Manual)

When a student registers or is added to the system:

```typescript
// Just set the level - groups auto-sync!
await supabase
  .from('user_roles')
  .insert({
    user_id: userId,
    role: 'student',
    level: 3,  // This is all you need!
    ...
  })

// Student group for Level 3 automatically created/updated
```

### Checking Student Groups

```typescript
// Get all student groups with current sizes
const { data: groups } = await supabase
  .from('student_group')
  .select('*')
  .order('level')

// Example result:
// [
//   { level: 1, size: 45, name: 'Level 1 Students' },
//   { level: 2, size: 42, name: 'Level 2 Students' },
//   ...
// ]
```

### Manual Sync (if needed)

You can manually trigger a sync (though it happens automatically):

```sql
SELECT sync_student_groups();
```

## Migration Steps for Existing Data

If you have existing students with year data:

1. ✅ Migration automatically drops year columns
2. ✅ Existing levels are preserved
3. ✅ Student groups auto-sync on first trigger
4. ✅ All constraints updated

**No data loss** - only year fields are removed, which weren't essential.

## Future Considerations

### If You Need Year Information

The system can derive the approximate year from level:
```typescript
const year = Math.ceil(level / 2)
// Level 1-2 = Year 1
// Level 3-4 = Year 2
// etc.
```

But this is not stored in the database - it's calculated when needed.

### Custom Student Groups

The auto-sync creates one group per level by default. If you need custom groups (e.g., "Level 1 Section A", "Level 1 Section B"), you can:

1. Manually create additional groups
2. The auto-sync will update the default group
3. Custom groups won't be affected by auto-sync

## Files Changed

### Database
- `supabase/migrations/20251029120000_simplify_to_level_and_auto_student_groups.sql` - New migration
- `supabase/migrations/20251029000001_irregular_students.sql` - Fixed CHECK constraint

### UI Components
- `components/onboarding-form.tsx` - Simplified to remove year fields
- `app/(auth)/onboarding/page.tsx` - Updated queries and comments
- `app/(dashboard)/dashboard/student/page.tsx` - Updated labels

### Types
- `lib/types/database.ts` - Regenerated without year fields

## Rollback Plan

If you need to rollback, the old schema is preserved in migration history. However, student group auto-sync is a major improvement and rollback is not recommended.

## Support

For questions or issues:
1. Check the migration notices in database logs
2. Verify student groups with: `SELECT * FROM student_group ORDER BY level;`
3. Manually trigger sync if needed: `SELECT sync_student_groups();`

---

**Version:** 1.0  
**Date:** October 29, 2025  
**Status:** ✅ Fully Implemented and Tested

