# Student Registration Fix - Auto-Assignment Removed

## Problem
When students created new accounts, the onboarding process was trying to auto-assign them to student groups immediately. This caused errors because:
1. Student groups don't exist during initial registration
2. Groups should only be created by the scheduling committee when preparing schedules
3. The error message "Auto assigned..." was confusing for new students

## Error Message Seen
```
"Auto assigned ..." 
OR
"Error auto-assigning to group: [error details]"
```

## Root Cause
In `components/onboarding-form.tsx`, the `handleSubmit` function was calling:
```typescript
await supabase.rpc('auto_assign_student_to_group', {
  p_student_id: userId,
  p_level: parseInt(academicLevel)
});
```

This tried to assign students to groups that didn't exist yet.

## Solution Applied

### Changed File: `components/onboarding-form.tsx`

**Removed** (lines 148-160):
```typescript
// Auto-assign student to group (for students only)
if (userRole === 'student') {
  const { error: groupError } = await supabase.rpc('auto_assign_student_to_group', {
    p_student_id: userId,
    p_level: parseInt(academicLevel)
  });
  
  if (groupError) {
    console.error('Error auto-assigning to group:', groupError);
    toast.warning('Profile saved, but group assignment needs manual setup.');
  }
}
```

**Replaced with** (lines 148-149):
```typescript
// Note: Student group assignment happens during schedule generation
// by the scheduling committee, not during registration
```

## New Student Registration Flow

### 1. Student Registers (No Changes for User)
- Student creates account
- Fills in name, email, password, role
- Account created successfully

### 2. Student Completes Onboarding (No Group Assignment)
- Student selects academic level (1-8)
- Profile saved to database
- **`student_group_id` remains NULL** (not assigned yet)
- Success message: "Welcome to SmartSchedule! Your profile is all set up."
- Redirect to student dashboard

### 3. Student Views Dashboard (Before Schedule Generation)
- Can see profile information
- Can view available courses
- **Cannot see assigned sections yet** (no group = no schedule)
- Message should indicate "Schedule not yet available"

### 4. Scheduling Committee Creates Groups (Later)
- Navigate to Setup page
- Create student groups for each level
- Assign students to groups (auto-balance or manual)

### 5. Scheduling Committee Generates Schedule
- Run schedule generation
- Sections created for each group/level
- Students can now see their schedules

### 6. Students View Schedule (After Generation)
- Required courses appear based on group assignment
- Can register for elective sections
- Can view complete timetable

## Benefits

✅ **No More Errors**: Students register successfully without group-related errors

✅ **Proper Workflow**: Groups created only when needed by scheduling committee

✅ **Better Control**: Scheduling committee decides when to create groups based on enrollment numbers

✅ **Cleaner UX**: Students don't see confusing group assignment messages during registration

## Database Schema Impact

### `user_roles` table
- `student_group_id` column remains but is **optional** (can be NULL)
- Students complete onboarding with `student_group_id = NULL`
- Gets populated later when scheduling committee assigns groups

### No Breaking Changes
- Existing students with group assignments: **Unchanged**
- New students without groups: **Work fine, assigned later**
- API endpoints: **No changes needed**
- RLS policies: **No changes needed**

## For Scheduling Committee

### When to Create Student Groups
1. **After registration period closes** - You know final enrollment numbers
2. **Before generating schedule** - Groups needed for section creation
3. **Each semester** - Groups are semester-specific

### How to Create Groups
See `STUDENT_GROUP_MANAGEMENT.md` for detailed instructions on:
- Creating groups via Setup page
- Auto-assigning students to balance groups
- Manual group management
- Best practices for group sizing

## Testing

### Test Scenario 1: New Student Registration
1. Register as new student
2. Complete onboarding, select level
3. ✅ **Expected**: Success message, no errors
4. ✅ **Expected**: Redirected to dashboard

### Test Scenario 2: Student Without Group Views Schedule
1. Login as student (no group assigned)
2. Navigate to schedule view
3. ✅ **Expected**: Message "Schedule not yet available" or similar
4. ✅ **Expected**: No crashes or errors

### Test Scenario 3: Scheduling Committee Assigns Groups
1. Login as scheduling committee
2. Navigate to Setup → Student Groups
3. Create groups for level 1
4. Assign students to groups
5. ✅ **Expected**: Students now have `student_group_id` populated

### Test Scenario 4: Student Views Schedule After Assignment
1. Login as student (with group assigned)
2. Navigate to schedule view
3. ✅ **Expected**: Can see required course sections
4. ✅ **Expected**: Can register for electives

## Related Fixes

This fix is part of the complete registration flow fix which includes:
1. ✅ **RLS Policy Fix** - Added INSERT policy for `user_roles`
2. ✅ **Middleware Fix** - Fixed infinite redirect loops
3. ✅ **Onboarding Error Handling** - Show errors instead of redirecting
4. ✅ **Registration Error Display** - Enhanced error messages
5. ✅ **Auto-Assignment Removal** - This fix (no group assignment during registration)

## Rollback Plan

If you need to restore auto-assignment (not recommended):
```typescript
// In components/onboarding-form.tsx, after line 146
if (userRole === 'student') {
  await supabase.rpc('auto_assign_student_to_group', {
    p_student_id: userId,
    p_level: parseInt(academicLevel)
  }).catch(console.error);
}
```

**Note**: This will cause errors if groups don't exist!

