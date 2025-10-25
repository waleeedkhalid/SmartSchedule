# Faculty Availability Enhancement

## Overview

Enhanced the faculty availability submission system with a new database flag `is_faculty_availability_open` that controls when faculty members can submit or edit their teaching availability preferences. The UI has been simplified and streamlined for better user experience.

## Database Changes

### New Column: `is_faculty_availability_open`

Added to the `academic_term` table:

```sql
ALTER TABLE public.academic_term 
ADD COLUMN IF NOT EXISTS is_faculty_availability_open boolean DEFAULT false;
```

**Purpose**: Controls whether faculty can submit/edit their teaching availability preferences for a specific term.

**Default**: `false` (closed by default, must be explicitly opened by administrators)

## Implementation Details

### 1. Database Layer

**Migration**: `add_is_faculty_availability_open`
- Adds the new boolean column to `academic_term` table
- Sets default value to `false`
- Includes helpful comment for documentation
- Updates active term to `true` for testing purposes

**Database Type Updates**:
- Updated `src/types/database.ts` to include `is_faculty_availability_open` in `academic_term` Row, Insert, and Update types

### 2. Permission System

**Updated**: `src/lib/faculty-permissions.ts`

**Changes**:
- `canSubmitSuggestions()` now checks `is_faculty_availability_open` instead of `schedule_published`
- More accurate error messages: "Faculty availability submission is currently closed"
- Added new phase: `availability_submission` to distinguish when availability is open

**Permission Flow**:
```typescript
if (!term.is_faculty_availability_open) {
  return {
    allowed: false,
    reason: "Faculty availability submission is currently closed."
  };
}
```

### 3. API Route

**Updated**: `src/app/api/faculty/availability/route.ts`

**POST Endpoint Changes**:
- Direct check of `activeTerm.is_faculty_availability_open` before allowing submission
- Returns 403 Forbidden if submission window is closed
- Cleaner error messages
- Removed unused imports (`canSubmitSuggestions`, `AcademicTerm` type)

**GET Endpoint**:
- No changes needed
- Continues to fetch availability data regardless of submission status
- Allows viewing past submissions even when closed

### 4. Client Component (Simplified & Compact)

**Updated**: `src/app/faculty/availability/FacultyAvailabilityClient.tsx`

**Improvements**:
- **Reduced from 93 lines to 66 lines** (29% smaller)
- Removed redundant alert boxes
- Added compact status badge showing "Open for Submission" or "Submission Closed"
- Moved term info inline with header
- Only shows error alert when submission is actually closed
- Cleaner, more modern UI with better visual hierarchy

**Key Features**:
1. **Status Badge**: 
   - Green badge with checkmark when open
   - Gray badge with alert icon when closed
   - Positioned prominently in the header

2. **Compact Layout**:
   - Header and term info combined
   - Removed excessive help text and instructions
   - Only shows critical information

3. **Visual Feedback**:
   - Green highlighting for selected time slots (already implemented in form component)
   - Clear status indicators
   - Proper disabled states

### 5. Form Component

**No Changes Needed**: `src/components/faculty/availability/FacultyAvailabilityForm.tsx`

The form already includes:
- ✅ Green color highlighting for selected slots (`bg-green-500/90`)
- ✅ Proper disabled states based on `canSubmit` prop
- ✅ Visual feedback for available/unavailable slots
- ✅ Row/column toggle functionality
- ✅ Auto-save indicators

## User Flow

### For Faculty Members

1. **Navigate to Availability Page**
   - Go to `/faculty/availability`

2. **Check Status**
   - See clear status badge: "Open for Submission" (green) or "Submission Closed" (gray)
   - View current term information

3. **Submit Availability** (when open)
   - Click time slots to mark availability
   - Selected slots turn green with checkmark
   - Use row/column toggles for quick selection
   - Click "Save Availability" button
   - See confirmation badge

4. **View Past Submissions** (when closed)
   - Can view previously submitted availability
   - Cannot edit (form is disabled)
   - See clear message explaining submission is closed

### For Administrators

**Opening Submission Window**:
```sql
UPDATE academic_term 
SET is_faculty_availability_open = true 
WHERE code = 'CURRENT_TERM_CODE';
```

**Closing Submission Window**:
```sql
UPDATE academic_term 
SET is_faculty_availability_open = false 
WHERE code = 'CURRENT_TERM_CODE';
```

## Visual Design

### Status Badges

**Open State**:
```
┌─────────────────────────────┐
│ ✓ Open for Submission       │  (Green background)
└─────────────────────────────┘
```

**Closed State**:
```
┌─────────────────────────────┐
│ ⚠ Submission Closed         │  (Gray background)
└─────────────────────────────┘
```

### Selected Time Slots

Available slots show as:
- **Background**: Green (`bg-green-500/90`)
- **Border**: Darker green (`border-green-600`)
- **Icon**: White checkmark
- **Hover**: Slightly darker green (`hover:bg-green-600`)

## Technical Benefits

1. **Database-Driven Control**: No code changes needed to open/close submissions
2. **Clear Separation of Concerns**: Permission logic centralized in `faculty-permissions.ts`
3. **Type Safety**: Full TypeScript support with updated types
4. **User-Friendly**: Clear visual indicators of submission status
5. **Backward Compatible**: Existing functionality preserved
6. **Simplified UI**: 29% reduction in component size, cleaner code

## Testing

### Test Scenarios

1. **Submission Open**:
   - ✅ Faculty can view and edit availability
   - ✅ Green status badge displays
   - ✅ Save button is enabled
   - ✅ Slots can be toggled

2. **Submission Closed**:
   - ✅ Faculty can view past submissions
   - ✅ Gray status badge displays
   - ✅ Edit functionality is disabled
   - ✅ Clear error message shown
   - ✅ API returns 403 on POST attempts

3. **No Active Term**:
   - ✅ Appropriate error handling
   - ✅ User-friendly message

### API Testing

```bash
# Test GET (should work regardless of status)
curl -X GET http://localhost:3000/api/faculty/availability \
  -H "Cookie: sb-access-token=YOUR_TOKEN"

# Test POST when open (should succeed)
curl -X POST http://localhost:3000/api/faculty/availability \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"availability": {"Sunday-08:00": true}}'

# Test POST when closed (should return 403)
curl -X POST http://localhost:3000/api/faculty/availability \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"availability": {"Sunday-08:00": true}}'
```

## Future Enhancements

1. **Scheduled Open/Close**: Add start_date and end_date for automatic window management
2. **Email Notifications**: Notify faculty when submission window opens
3. **Submission Statistics**: Show how many faculty have submitted
4. **Deadline Countdown**: Display time remaining until submission closes
5. **Change History**: Track all availability changes with timestamps

## Files Modified

1. `supabase/migrations/[timestamp]_add_is_faculty_availability_open.sql` - New
2. `src/types/database.ts` - Updated
3. `src/lib/faculty-permissions.ts` - Updated
4. `src/app/api/faculty/availability/route.ts` - Updated
5. `src/app/faculty/availability/FacultyAvailabilityClient.tsx` - Simplified
6. `docs/features/faculty-availability-enhancement.md` - New (this file)

## Migration Applied

✅ Migration successfully applied to project: `kpmvguvncbqcflaskcmi`

## Summary

The faculty availability system now provides:
- ✅ Database-controlled submission windows
- ✅ Simplified, compact UI (29% code reduction)
- ✅ Clear visual status indicators
- ✅ Green highlighting for selected availability
- ✅ Proper permission enforcement
- ✅ Type-safe implementation
- ✅ Better user experience

