# User Onboarding System Documentation

## Overview

The SmartSchedule onboarding system ensures that all new users provide essential academic information before accessing the main application. This interactive flow replaces the previous static warning message ("Your academic level is not set...") with a guided, user-friendly setup process.

## Problem Solved

**Before:** New users saw a static error message asking them to "contact the registrar" to set their academic level. This created friction and confusion.

**After:** New users are automatically guided through an interactive onboarding flow that collects all necessary information directly, without requiring administrator intervention.

## Architecture

### Database Schema

**Migration:** `supabase/migrations/20251028110001_user_onboarding_fields.sql`

**Fields in `user_roles` Table:**
- `department` (TEXT): Academic department/program (default: "Software Engineering")
- `level` (INT): Academic level 1-8 for students (determines required courses)
- `onboarding_completed` (BOOLEAN): Flag indicating if user has completed onboarding (default: FALSE)

**Note:** As of October 29, 2025, the system was simplified to use ONLY `level` (1-8) for student academic standing. Previous fields `enrollment_year` and `expected_graduation_year` were removed to eliminate confusion.

**Helper Functions:**

1. `needs_onboarding(user_id UUID) RETURNS BOOLEAN`
   - Checks if a user needs to complete onboarding
   - Returns TRUE if onboarding_completed is FALSE or required fields are missing
   - For students: checks for level only

2. `complete_onboarding(user_id UUID, level INT) RETURNS JSON`
   - Validates and updates user profile (only level parameter needed)
   - Sets onboarding_completed = TRUE
   - Returns success/error status
   - Level must be between 1 and 8

### Frontend Components

**File:** `components/onboarding-form.tsx`

A simplified, single-page form component built with shadcn/ui:

**For Students:**
- **Academic Level** (Required): Select level 1-8
  - Helpful text explains level indicates semester (Level 1 = First semester, Level 2 = Second semester, etc.)
  - Shows optional year mapping (Level 1-2 = Year 1, Level 3-4 = Year 2, etc.)
- **Program**: Software Engineering (prefilled, disabled)

**Confirmation Section (All Users):**
- Summary of entered information
- Confirmation checkbox with data accuracy acknowledgment
- Submit button that saves profile and redirects

**Features:**
- Simple, single-page interface (no multi-step complexity)
- Inline validation with helpful error messages
- No popup alerts (validation errors show inline)
- Loading states during submission
- Success toast notification
- Faster onboarding experience (1 page vs 3 steps)

### Routing

**File:** `app/(auth)/onboarding/page.tsx`

Server-rendered page that:
1. Checks user authentication (redirects to login if not authenticated)
2. Fetches user role and onboarding status
3. Redirects to dashboard if onboarding already completed
4. Renders OnboardingForm component if onboarding needed

**Route:** `/onboarding`

**Access Control:**
- Requires authentication
- Only accessible if onboarding_completed = FALSE
- Automatically redirects after completion

### Middleware Integration

**File:** `supabase/middleware.ts`

The middleware intercepts requests to dashboard routes and checks onboarding status:

```typescript
if (user && request.nextUrl.pathname.startsWith("/dashboard")) {
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('onboarding_completed, level, role')
    .eq('user_id', user.id)
    .single();
  
  // Check if onboarding needed
  let needsOnboarding = !userRole.onboarding_completed;
  
  // For students, also check level is set
  if (userRole.role === 'student' && !userRole.level) {
    needsOnboarding = true;
  }
  
  if (needsOnboarding) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }
}
```

## User Flow

### First-Time User Journey

1. **Registration/Login**
   - User creates account or logs in
   - Auth successful, user_roles entry created with onboarding_completed = FALSE

2. **Automatic Redirect**
   - User tries to access /dashboard
   - Middleware detects incomplete onboarding
   - User redirected to /onboarding

3. **Onboarding Process**
   - User sees welcoming interface
   - Completes simple single-page form
   - For students: Select academic level (1-8)
   - For other roles: Minimal setup (department already defaulted)
   - Final confirmation required

4. **Profile Update**
   - Form submission updates user_roles via Supabase client
   - onboarding_completed set to TRUE
   - All required fields populated

5. **Dashboard Access**
   - Success message shown
   - Auto-redirect to role-specific dashboard
   - Page refresh to update cached profile
   - Normal application access granted

### Returning User Journey

1. User logs in
2. Middleware checks onboarding_completed = TRUE
3. No redirect, direct access to dashboard
4. Onboarding never shown again (unless fields manually cleared)

## Validation Rules

### Client-Side Validation

**Academic Level (Students):**
- Required field
- Must be integer 1-8
- Error: "Please select your academic level"
- Explanation: Level indicates which semester (Level 1 = First semester, Level 2 = Second semester, etc.)

**Confirmation Checkbox:**
- Required before submission
- Must be checked before submission
- Error: "Please confirm that your information is accurate"

### Database-Level Validation

**Schema Constraints:**
```sql
CHECK (level >= 1 AND level <= 8)
```

**RLS Policies:**
- Users can only update their own profile
- Users cannot change their role during onboarding
- Prevents unauthorized profile modifications

## Security Considerations

### Row Level Security (RLS)

**Policy:** "Users can update own profile fields"
```sql
CREATE POLICY "Users can update own profile fields"
  ON user_roles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid() AND
    role = (SELECT role FROM user_roles WHERE user_id = auth.uid())
  );
```

**What This Means:**
- Users can only update their own user_roles record
- Users cannot change their assigned role
- Admins can still update any user via separate policies
- Prevents privilege escalation

### Data Validation

**Client-Side:**
- Immediate feedback for user experience
- Prevents unnecessary API calls
- React state management for validation errors

**Database-Level:**
- CHECK constraints enforce data integrity
- Prevents invalid data even if client bypassed
- Ensures consistency across all access methods

### Direct Supabase Mutations

**No Server Actions Required:**
- Form submits directly to Supabase from client
- Reduces latency
- Leverages RLS for security
- No custom API endpoints needed

**Why This Is Safe:**
- RLS policies prevent unauthorized updates
- Database constraints enforce valid data
- User can only update specific allowed fields
- Role field protected from modification

## Testing

### Manual Test Scenarios

**Scenario 1: New Student Registration**
1. Create new account with role = 'student'
2. Login
3. Verify redirect to /onboarding
4. Select academic level (e.g., Level 3)
5. Check confirmation box and submit
6. Verify redirect to /dashboard/student
7. Check database: onboarding_completed = TRUE, level set

**Scenario 2: Validation Errors**
1. Start onboarding
2. Try to proceed without selecting level
3. Verify inline error message appears
4. Try to submit without confirming
5. Verify confirmation error appears

**Scenario 3: Returning User**
1. Login with user who has onboarding_completed = TRUE
2. Verify direct access to dashboard
3. Try to manually navigate to /onboarding
4. Verify redirect back to dashboard

**Scenario 4: Non-Student Roles**
1. Login with faculty or other non-student role
2. Verify simpler onboarding (no level selection)
3. Verify successful submission
4. Check database: onboarding_completed = TRUE, level is NULL (expected for non-students)

### Database Testing

**Check Existing Users:**
```sql
-- Verify existing users marked as completed
SELECT user_id, role, onboarding_completed, level
FROM user_roles
WHERE created_at < '2025-10-29';
-- Should all have onboarding_completed = TRUE
```

**Check New Users:**
```sql
-- Verify new users need onboarding
SELECT user_id, role, onboarding_completed, level
FROM user_roles
WHERE created_at >= '2025-10-29';
-- Should have onboarding_completed = FALSE (unless manually completed)
```

**Test Helper Functions:**
```sql
-- Test needs_onboarding function
SELECT needs_onboarding('user-uuid-here');

-- Test complete_onboarding function (simplified - only level parameter)
SELECT complete_onboarding(
  'user-uuid-here',
  3  -- level (1-8)
);
```

## Customization

### Adding New Fields

To add additional onboarding fields:

1. **Update Migration:**
   ```sql
   ALTER TABLE user_roles ADD COLUMN new_field TYPE;
   ```

2. **Update OnboardingForm Component:**
   - Add new step or add to existing step
   - Add form field with validation
   - Update summary display
   - Update submission logic

3. **Update complete_onboarding Function:**
   - Add parameter for new field
   - Add validation logic
   - Include in UPDATE statement

### Role-Specific Customization

The system already supports role-specific flows:

```typescript
// Students see level selection, other roles see minimal setup
{userRole === 'student' && (
  <div>
    {/* Level selection UI */}
  </div>
)}
```

To add custom fields for other roles:
1. Add role check in component
2. Render role-specific field
3. Update validation logic
4. Update submission to include role-specific data

## Maintenance

### Future Considerations

**Multi-Language Support:**
- All text is currently in component
- Consider moving to i18n files
- Maintain translations for all microcopy

**Field Changes:**
- If removing required fields, update validation
- If adding required fields, plan migration for existing users
- Consider versioning onboarding flow

**Analytics:**
- Consider tracking onboarding completion rate
- Monitor drop-off points between steps
- Track time to complete

**Accessibility:**
- All form fields have proper labels
- Keyboard navigation supported
- Screen reader friendly
- Consider adding skip navigation

## Troubleshooting

### User Stuck in Onboarding Loop

**Symptoms:** User completes onboarding but keeps getting redirected back

**Possible Causes:**
1. Database update failed
2. Session not refreshed
3. Browser cache issue

**Solutions:**
```sql
-- Manually mark user as completed
UPDATE user_roles 
SET onboarding_completed = TRUE 
WHERE user_id = 'affected-user-id';

-- Check for missing required fields
SELECT * FROM user_roles WHERE user_id = 'affected-user-id';
```

### Middleware Not Redirecting

**Symptoms:** Users with incomplete profiles can access dashboard

**Check:**
1. Verify middleware is running (check logs)
2. Verify onboarding_completed flag in database
3. Check if route is excluded from middleware

**Debug:**
```typescript
// Add logging to middleware
console.log('Checking onboarding for user:', user.id);
console.log('Onboarding status:', userRole);
```

### Validation Errors Not Showing

**Symptoms:** Form submits without required fields

**Check:**
1. Verify validateStep() is being called
2. Check errors state is being set
3. Verify error display logic in JSX

## Related Files

### Core Implementation
- `supabase/migrations/20251028110001_user_onboarding_fields.sql` - Database schema
- `components/onboarding-form.tsx` - Main form component
- `app/(auth)/onboarding/page.tsx` - Onboarding page
- `supabase/middleware.ts` - Routing logic

### Supporting Files
- `lib/types/database.ts` - TypeScript types (auto-generated)
- `app/(dashboard)/dashboard/student/page.tsx` - Updated to remove warning
- `app/(auth)/actions.ts` - User registration (creates user_roles with onboarding_completed = FALSE)

## References

- [PRD.md](../../PRD.md) - Product requirements
- [timeline.md](../../timeline.md) - Implementation timeline
- [RLS_FIX_SUMMARY.md](./RLS_FIX_SUMMARY.md) - Row Level Security implementation

---

**Last Updated:** October 29, 2025
**Version:** 2.0 - Simplified to Level-Only System
**Author:** SmartSchedule Development Team

## Changelog

### Version 2.0 (October 29, 2025)
- **BREAKING CHANGE**: Removed `enrollment_year` and `expected_graduation_year` fields
- Simplified to use ONLY `level` (1-8) for student academic standing
- Updated `complete_onboarding()` function to only accept level parameter
- Changed from multi-step to single-page form (faster onboarding)
- Updated all validation logic and UI components
- Student groups now automatically sync based on level

### Version 1.0 (October 28, 2025)
- Initial onboarding system implementation
- Multi-step form with year fields
- Progress bar and step navigation

