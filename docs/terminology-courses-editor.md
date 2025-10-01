# Terminology Update: "Courses Editor" vs "External Slots"

## Change Summary

**Date:** October 1, 2025

### Navigation Update

**Previous:**

- Label: "External Slots"
- Route: `/demo/committee/scheduler/external`
- Description: "Manage external course time slots"

**Updated:**

- Label: "Courses Editor"
- Route: `/demo/committee/scheduler/courses`
- Description: "Manage SWE and external department course offerings"

## Rationale

### Why "Courses Editor" is More Accurate

1. **Primary Function:** The page manages SWE department courses (create, edit, delete)
2. **Secondary Function:** Views external department courses for reference
3. **Not Just Time Slots:** The editor handles full course definitions, not just time slots
4. **Clearer Intent:** "Courses Editor" immediately communicates the page purpose

### Terminology Clarification

#### ✅ Correct Terms

- **"SWE courses"** - Courses managed by the Software Engineering Department
- **"External department courses"** - Courses from other departments (MATH, PHY, CSC, etc.)
- **"Course offerings"** - The complete set of courses being offered in a semester

#### ❌ Avoid These Terms

- ~~"External slots"~~ - Too narrow; implies only time slot management
- ~~"External courses"~~ - Ambiguous; could mean courses outside the university
- ~~"Non-SWE courses"~~ - Negative framing; use positive "external department courses"

## Implementation Details

### Component Used

**CoursesEditor** (`/src/components/committee/scheduler/courses-editor/CoursesEditor.tsx`)

This component:

- Manages SWE course data (editable)
- Displays external department courses from `external-departments.json` (view-only)
- Handles course metadata: code, name, credits, department, level, type
- Manages sections, times, instructors, and rooms
- Schedules exams (midterm, optional midterm2, final)

### Page Implementation

**Location:** `/src/app/demo/committee/scheduler/courses/page.tsx`

Features:

- Info banner clarifying that only SWE courses are editable
- Uses CoursesEditor component
- Consistent navigation and page layout with other scheduler pages

```tsx
<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
  <p className="text-sm text-blue-900">
    <strong>Note:</strong> This editor manages SWE department courses only.
    External department courses (MATH, PHY, CSC, etc.) are shown for reference
    but cannot be edited from this interface.
  </p>
</div>
```

## System Scope Reminder

### ⚠️ CRITICAL: SWE Department Only

This system is **exclusively for the Software Engineering (SWE) Department:**

✅ **What We Manage:**

- SWE course offerings (SWE211, SWE312, SWE314, etc.)
- SWE sections and meetings
- SWE faculty assignments
- SWE student schedules and preferences

❌ **What We DON'T Manage:**

- External department courses (MATH, PHY, CSC, etc.)
- External department scheduling
- Cross-departmental coordination (beyond viewing their courses)

### External Department Courses in the System

**Purpose:** Reference only

- Shown to avoid scheduling conflicts
- Students may have these in their schedules
- Used for prerequisite checking
- Cannot be created, edited, or deleted by SWE committee

**Data Source:** `src/data/external-departments.json`

## Updated Navigation Structure

### Committee (Scheduling) Navigation

1. **Schedule Grid** - Main scheduling interface
2. **Exams** - Exam scheduling and management
3. **Rules & Conflicts** - Constraint validation
4. **Courses Editor** ← Updated from "External Slots"
5. **Versions** - Schedule version history

## Files Modified

### Updated Files

1. `src/components/shared/navigation-config.ts`

   - Changed label from "External Slots" to "Courses Editor"
   - Updated href from `/demo/committee/scheduler/external` to `/demo/committee/scheduler/courses`
   - Updated description to reflect both SWE and external department courses

2. `src/app/demo/committee/scheduler/courses/page.tsx` (NEW)

   - Created new page with CoursesEditor component
   - Added info banner explaining scope
   - Uses PersonaNavigation and PageContainer

3. `docs/navigation-implementation.md`

   - Updated navigation structure documentation
   - Added terminology clarification section
   - Updated sub-pages list

4. `docs/sub-pages-implementation.md`
   - Replaced "External Slots Page" entry with "Courses Editor Page"
   - Updated description and purpose

### Files to Remove (Legacy)

- `src/app/demo/committee/scheduler/external/page.tsx` (old implementation)
  - Can be deleted as it's been replaced by `/courses/page.tsx`

## User Benefit

### Before (External Slots)

- Unclear what "slots" meant
- Implied only time slot management
- Didn't convey the full editing capability
- Confusing relationship to SWE courses

### After (Courses Editor)

- Clear primary function: edit SWE courses
- Obvious it's more than just time slots
- Info banner explains external courses are view-only
- Aligns with user mental model of "editing courses"

## Future Considerations

If external department coordination becomes a requirement in future phases:

1. Create separate "External Department Coordination" section
2. Add read-only external course viewing capability
3. Implement conflict notifications for external course changes
4. Add communication channel with other departments

For now, the system correctly scopes to SWE department management with external courses as reference data only.
