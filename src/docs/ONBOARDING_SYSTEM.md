# User Onboarding System Documentation

## Overview

The SmartSchedule onboarding system ensures that all new users provide essential academic information before accessing the main application. This interactive flow replaces the previous static warning message ("Your academic level is not set...") with a guided, user-friendly setup process.

## Problem Solved

**Before:** New users saw a static error message asking them to "contact the registrar" to set their academic level. This created friction and confusion.

**After:** New users are automatically guided through an interactive onboarding flow that collects all necessary information directly, without requiring administrator intervention.

## Architecture

### Database Schema

**Migration:** `supabase/migrations/20251028110001_user_onboarding_fields.sql`

**New Columns in `user_roles` Table:**
- `department` (TEXT): Academic department/program (default: "Software Engineering")
- `enrollment_year` (INT): Year the user enrolled (2020-2030)
- `expected_graduation_year` (INT): Expected graduation year, optional (2020-2035)
- `onboarding_completed` (BOOLEAN): Flag indicating if user has completed onboarding (default: FALSE)

**Helper Functions:**

1. `needs_onboarding(user_id UUID) RETURNS BOOLEAN`
   - Checks if a user needs to complete onboarding
   - Returns TRUE if onboarding_completed is FALSE or required fields are missing
   - For students: checks for level and enrollment_year

2. `complete_onboarding(user_id UUID, level INT, enrollment_year INT, expected_graduation_year INT) RETURNS JSON`
   - Validates and updates user profile
   - Sets onboarding_completed = TRUE
   - Returns success/error status

### Frontend Components

**File:** `components/onboarding-form.tsx`

A multi-step form component built with shadcn/ui:

**Step 1 (Students Only):** Academic Level
- Select level 1-8 (typically years 1-5 for undergrad)
- Explains how level affects course enrollment
- Visual indicators and helpful descriptions

**Step 2 (Students Only):** Enrollment Details
- Program: Software Engineering (prefilled, disabled)
- Enrollment Year: When student joined (required)
- Expected Graduation Year: Optional field for planning

**Step 3 (All Users):** Review & Confirm
- Summary of entered information
- Confirmation checkbox with data accuracy acknowledgment
- Submit button that saves profile and redirects

**Features:**
- Progress bar showing completion percentage
- Step counter (Step X of Y)
- Inline validation with helpful error messages
- No popup alerts (validation errors show inline)
- Smooth fade animations between steps
- Loading states during submission
- Success toast notification

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
    .select('onboarding_completed, level, enrollment_year, role')
    .eq('user_id', user.id)
    .single();
  
  // Check if onboarding needed
  let needsOnboarding = !userRole.onboarding_completed;
  
  // For students, also check required fields
  if (userRole.role === 'student' && (!userRole.level || !userRole.enrollment_year)) {
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
   - User sees welcoming interface with progress bar
   - Completes multi-step form (2-3 steps depending on role)
   - Each step validated before proceeding
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

**Enrollment Year (Students):**
- Required field
- Must be between (current year - 10) and current year
- Error: "Please select your enrollment year"

**Expected Graduation Year (Students):**
- Optional field
- If provided, must be between current year and (current year + 10)
- No error if left empty

**Confirmation Checkbox:**
- Required on final step
- Must be checked before submission
- Error: "Please confirm that your information is accurate"

### Database-Level Validation

**Schema Constraints:**
```sql
CHECK (enrollment_year >= 2020 AND enrollment_year <= 2030)
CHECK (expected_graduation_year >= 2020 AND expected_graduation_year <= 2035)
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
4. Complete all steps with valid data
5. Verify redirect to /dashboard/student
6. Check database: onboarding_completed = TRUE, level and enrollment_year set

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

**Scenario 4: Optional Fields**
1. Complete onboarding
2. Leave graduation year empty
3. Verify successful submission
4. Check database: expected_graduation_year is NULL (allowed)

### Database Testing

**Check Existing Users:**
```sql
-- Verify existing users marked as completed
SELECT user_id, role, onboarding_completed, level, enrollment_year
FROM user_roles
WHERE created_at < '2025-10-28';
-- Should all have onboarding_completed = TRUE
```

**Check New Users:**
```sql
-- Verify new users need onboarding
SELECT user_id, role, onboarding_completed
FROM user_roles
WHERE created_at >= '2025-10-28';
-- Should have onboarding_completed = FALSE (unless manually completed)
```

**Test Helper Functions:**
```sql
-- Test needs_onboarding function
SELECT needs_onboarding('user-uuid-here');

-- Test complete_onboarding function
SELECT complete_onboarding(
  'user-uuid-here',
  3,  -- level
  2024,  -- enrollment_year
  2027  -- expected_graduation_year
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

### Changing Step Count

To add/remove steps:

1. Update `totalSteps` calculation in OnboardingForm
2. Add/remove step rendering logic
3. Update progress calculation
4. Update navigation logic

### Role-Specific Customization

The system already supports role-specific flows:

```typescript
const totalSteps = userRole === 'student' ? 3 : 2;
```

To add custom steps for other roles:
1. Add role check in component
2. Render role-specific step content
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

**Last Updated:** October 28, 2025
**Version:** 1.0
**Author:** SmartSchedule Development Team

