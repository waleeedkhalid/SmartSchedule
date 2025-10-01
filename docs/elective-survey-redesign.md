# ElectiveSurvey Component Redesign

## Overview

Completely redesigned the ElectiveSurvey component with a modern, intuitive interface that uses single-select dropdown with removable ranked list pattern.

**Date:** October 1, 2025

## Design Philosophy

### Before (Old Design)

- ❌ Multiple dropdown selects (one per rank)
- ❌ Confusing when choosing same course twice
- ❌ Hard to see overview of all choices
- ❌ Not intuitive - had to fill all ranks before submit
- ❌ Used hardcoded demo data

### After (New Design)

- ✅ Single dropdown selector
- ✅ Add courses one at a time in order
- ✅ Clear visual list of ranked choices
- ✅ Easy to remove and reorder (automatically renumbers)
- ✅ Can submit with any number of choices (1 to max)
- ✅ **Uses mockCourseOfferings as single source of truth**

## Key Changes

### 1. Data Source Integration

**Now uses mockData.ts:**

```typescript
import { mockCourseOfferings } from "@/data/mockData";

const electiveCourses = mockCourseOfferings
  .filter((course) => course.type === "ELECTIVE")
  .map((course) => ({
    code: course.code,
    name: course.name,
    department: course.department,
  }));
```

**Benefits:**

- Single source of truth
- Automatically shows all available elective courses
- No manual course list maintenance
- Consistent with rest of application

### 2. User Interface Pattern

**Selection Flow:**

1. User opens dropdown
2. Selects a course → Added to list with rank #1
3. Dropdown resets, ready for next selection
4. Selects another course → Added with rank #2
5. Continue until satisfied (up to max 6 courses)
6. Can remove any course → List auto-renumbers
7. Submit with any number of courses (minimum 1)

**Visual Hierarchy:**

```
┌─────────────────────────────────────┐
│ Elective Course Preferences          │
│ Select up to 6 courses in order      │
├─────────────────────────────────────┤
│                                       │
│ [Dropdown: Select a course...]       │
│ 2 of 6 courses selected              │
│                                       │
│ Your course preferences (in order):  │
│ ┌───────────────────────────────┐   │
│ │ #1  SWE455 - Software Maint.. [X]│ │
│ │ #2  CEN415 - Computer Arch..  [X]│ │
│ └───────────────────────────────┘   │
│                                       │
│ [Submit Preferences (2 courses)]     │
└─────────────────────────────────────┘
```

### 3. Props Simplification

**Before:**

```typescript
{
  options?: ElectiveOption[];      // Manual course list
  numChoices?: number;             // Fixed number required
  title?: string;
  subtitle?: string;
  onSubmitChoices?: (codes: string[]) => void;
}
```

**After:**

```typescript
{
  maxChoices?: number;             // Maximum allowed (default: 6)
  onSubmitChoices?: (codes: string[]) => void;
}
```

**Removed:**

- `options` - Now auto-fetched from mockData
- `title` - Fixed to "Elective Course Preferences"
- `subtitle` - Dynamic based on maxChoices
- `numChoices` - Changed to `maxChoices` (more flexible)

### 4. Features Added

**Badge with Order Number:**

```tsx
<Badge variant="secondary" className="shrink-0 font-semibold">
  #{course.order}
</Badge>
```

**Remove Button:**

```tsx
<Button
  type="button"
  variant="ghost"
  size="sm"
  onClick={() => removeCourse(course.code)}
  className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
>
  <X className="h-4 w-4" />
</Button>
```

**Progress Indicator:**

```tsx
<p className="text-xs text-muted-foreground">
  {selectedCourses.length} of {maxChoices} courses selected
</p>
```

**Dynamic Submit Button:**

```tsx
<Button disabled={selectedCourses.length === 0 || submitting}>
  Submit Preferences ({selectedCourses.length} course{s})
</Button>
```

**Dropdown Placeholder Updates:**

- Shows "Select a course..." when choices available
- Shows "Maximum 6 courses selected" when limit reached
- Shows "All courses selected" when all electives chosen

### 5. Auto-Reordering Logic

When a course is removed, remaining courses automatically renumber:

```typescript
const removeCourse = (codeToRemove: string) => {
  const updatedCourses = selectedCourses
    .filter((course) => course.code !== codeToRemove)
    .map((course, index) => ({ ...course, order: index + 1 }));
  setSelectedCourses(updatedCourses);
};
```

**Example:**

```
Before removal:        After removing #2:
#1 SWE455             #1 SWE455
#2 CEN415  [X]        #2 IS442
#3 IS442              #3 MATH203
#4 MATH203
```

### 6. Submission Success State

Enhanced confirmation screen:

```tsx
if (submitted) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>✓ Preferences Submitted!</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Your elective preferences have been recorded successfully.</p>

        {/* Shows ranked list for confirmation */}
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium">Your ranked choices:</p>
          {selectedCourses.map((course) => (
            <div key={course.code}>
              <span>#{course.order}</span> {course.code} - {course.name}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Technical Implementation

### State Management

```typescript
interface SelectedCourse {
  code: string;
  name: string;
  order: number;
}

const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([]);
const [submitting, setSubmitting] = useState(false);
const [submitted, setSubmitted] = useState(false);
```

**Single state array** tracks all selections with order.

### Available Courses Filter

```typescript
const availableCourses = electiveCourses.filter(
  (course) => !selectedCourses.find((selected) => selected.code === course.code)
);
```

Dynamically filters out already-selected courses from dropdown.

### Dropdown Reset Pattern

```typescript
<Select
  key={selectedCourses.length}  // Key changes → forces reset
  onValueChange={handleCourseSelect}
>
```

Dropdown automatically resets after each selection.

## User Experience Improvements

### Clarity

- ✅ Always know how many courses selected
- ✅ See full list of choices at all times
- ✅ Clear visual hierarchy with order numbers
- ✅ Obvious how to add/remove courses

### Flexibility

- ✅ Can select 1 to 6 courses (not forced to fill all)
- ✅ Easy to change mind - just remove and re-add
- ✅ Order automatically maintained

### Feedback

- ✅ Progress indicator (X of 6 selected)
- ✅ Button text shows count
- ✅ Disabled state when max reached
- ✅ Confirmation screen with ranked list

### Accessibility

- ✅ Proper labels for screen readers
- ✅ Keyboard navigation works
- ✅ Clear button states
- ✅ High contrast remove buttons

## Data Flow

```
mockCourseOfferings
  ↓
Filter by type === "ELECTIVE"
  ↓
electiveCourses (all available electives)
  ↓
availableCourses (exclude already selected)
  ↓
Dropdown options
  ↓
User selects → Added to selectedCourses[]
  ↓
Auto-order numbering
  ↓
onSubmitChoices(rankedCodes)
```

## Integration with Demo Page

The student preferences page now works seamlessly:

```tsx
// /demo/student/preferences/page.tsx
<student.electives.ElectiveSurvey
  maxChoices={6}
  onSubmitChoices={(codes) => {
    console.log("Submitting preferences:", codes);
    // TODO: POST to API endpoint
  }}
/>
```

## Validation Rules

1. **Minimum:** At least 1 course required
2. **Maximum:** Up to 6 courses allowed (configurable)
3. **Uniqueness:** Cannot select same course twice
4. **Order:** Automatically maintained (1, 2, 3...)

## Testing Checklist

- [x] Courses load from mockCourseOfferings
- [x] Only ELECTIVE type courses shown
- [x] Can add courses one by one
- [x] Order numbers display correctly
- [x] Remove button works and renumbers
- [x] Dropdown disables when max reached
- [x] Submit button disabled when no courses
- [x] Submit button shows count
- [x] Success screen shows ranked list
- [x] Can't select same course twice
- [ ] Integration with API endpoint (pending)

## Benefits Summary

### For Users

1. **Intuitive** - Single dropdown is familiar pattern
2. **Flexible** - Choose 1 to 6 courses, not forced
3. **Clear** - Always see full list of choices
4. **Forgiving** - Easy to change mind
5. **Informative** - Progress and count always visible

### For Developers

1. **Maintainable** - Uses mockData as single source
2. **Simpler** - Less state, clearer logic
3. **Reusable** - Easy to adjust maxChoices
4. **Type-safe** - Full TypeScript support
5. **Testable** - Clear data flow

### For System

1. **Consistent** - Matches data model
2. **Scalable** - Works with any number of electives
3. **Validated** - Prevents invalid selections
4. **Traceable** - Clear order tracking

## Future Enhancements

1. **Drag-and-drop reordering** - Let users rearrange order
2. **Course details popover** - Show instructor, times on hover
3. **Conflict warnings** - Highlight time conflicts
4. **Save draft** - Allow saving without submitting
5. **Edit after submit** - Reopen form to modify
6. **Prerequisites check** - Warn if prerequisites not met
7. **Department filtering** - Filter electives by department
8. **Search functionality** - Search courses by name/code

## Migration Notes

**Breaking Changes:**

- Props interface changed (removed options, title, subtitle)
- Behavior changed (can select fewer than max)
- Data source changed (mockData vs props)

**Migration Path:**
Existing usage can simply remove the props:

```typescript
// Before:
<ElectiveSurvey
  options={courseList}
  numChoices={3}
  title="Pick courses"
/>

// After:
<ElectiveSurvey maxChoices={6} />
```

Component is now more autonomous and requires less configuration!
