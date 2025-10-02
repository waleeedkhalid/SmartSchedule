# Schedule Generation - Student Perspective View

## Overview

The Scheduler Committee main page (`/demo/committee/scheduler`) now features a **Course Editor** and **Schedule Previewer** that allows the committee to act as a student and view all possible conflict-free schedule combinations for a given level.

## Implementation Date

October 1, 2025

## Components Created

### 1. `schedule-generator.ts` (Core Algorithm)

**Location:** `/src/lib/schedule-generator.ts`

**Key Functions:**

- `generateSchedules()` - Full cartesian product approach
- `generateSchedulesBacktracking()` - Efficient backtracking with early pruning
- `getCoursesByLevel()` - Filter courses by student level
- `getCoursesByCodes()` - Filter courses by specific codes

**Algorithm Features:**

- Detects time conflicts between sections
- Supports multiple sections per course
- Handles different days and time ranges
- Returns all valid schedules with metadata

**Conflict Detection:**

- Parse day strings (e.g., "Sunday Tuesday")
- Convert time strings to minutes since midnight
- Check for overlapping time ranges on common days
- Early exit on first conflict found (backtracking)

### 2. `CourseEditor.tsx` (Course Selection)

**Location:** `/src/components/committee/scheduler/CourseEditor.tsx`

**Features:**

- Level selection dropdown (filters courses by level)
- Select all / Deselect all functionality
- Individual course checkboxes
- Real-time statistics (selected count, total credits)
- Course metadata display (code, name, credits, sections count)
- Generate button with loading state

**User Experience:**

- Simple, clean design per user requirement
- Responsive layout with scrollable course list
- Visual feedback with badges and hover states
- Clear selection state

### 3. `SchedulePreviewer.tsx` (Results Display)

**Location:** `/src/components/committee/scheduler/SchedulePreviewer.tsx`

**Features:**

- Navigation between valid schedules (Previous/Next)
- Weekly grid view (time slots × days)
- Course information cards
- Generation statistics
- Empty state with helpful guidance

**Display Elements:**

- Time slot labels (08:00 - 20:00)
- Day columns (Sunday - Saturday)
- Color-coded course blocks with:
  - Course code
  - Instructor name
  - Room number
  - Time range
- Pagination controls
- Metadata summary (courses count, total combinations, valid schedules)

## Page Implementation

### Main Page: `/app/demo/committee/scheduler/page.tsx`

**State Management:**

```typescript
- generatedSchedules: GeneratedSchedule[]
- generationStats: ScheduleGenerationResult | undefined
- isGenerating: boolean
```

**Data Flow:**

1. Transform mockCourseOfferings to course list (SWE only)
2. User selects level and courses
3. Click "Generate Schedules"
4. Filter courses by selection
5. Run backtracking algorithm (limit: 100 schedules)
6. Display results in previewer
7. Console log all data for API prototyping

**Console Logging:**

```typescript
console.log("Generating schedules for:", { selectedCourses, level, timestamp });
console.log("Courses to schedule:", coursesToSchedule);
console.log("Schedule generation result:", { totalCombinations, validCount, ... });
```

## Algorithm Reference

Based on the provided Express router algorithm with these adaptations:

**Original Algorithm:**

- Groups lecture + lab/tutorial pairs
- Cartesian product of all options
- Filters out conflicting schedules
- Optional backtracking for efficiency

**Our Implementation:**

- TypeScript with full type safety
- Integrated with mockCourseOfferings structure
- Uses backtracking by default (more efficient)
- Limit to first 100 valid schedules for performance
- SWE department courses only

## Key Differences from Original

1. **Data Structure:** Uses `CourseOffering` with `Section[]` instead of flat sections array
2. **Type Safety:** Full TypeScript interfaces for schedules, options, and results
3. **Component Integration:** React components instead of Express routes
4. **Optimization:** Default limit of 100 schedules to prevent browser freeze
5. **Department Filtering:** Automatically filters to SWE courses only

## Usage Example

```typescript
// Generate schedules for Level 4 students
const level4Courses = getCoursesByLevel(mockCourseOfferings, 4);
const result = generateSchedulesBacktracking(level4Courses, { limit: 100 });

console.log(`Found ${result.validCount} valid schedules`);
console.log(`Generated in ${result.generationMs}ms`);
```

## Performance Considerations

- **Cartesian Product:** O(n^k) where n = avg sections per course, k = number of courses
- **Backtracking:** Prunes early, typically much faster for large sets
- **Limit Parameter:** Prevents excessive computation for high-combination scenarios
- **Typical Performance:** 5 courses × 3 sections each = 243 combinations in ~5-15ms

## Phase 3 Scope

✅ **In Scope:**

- Course selection by level
- Conflict detection (time only)
- Visual schedule grid
- Navigation between valid schedules
- Console logging for API development

❌ **Out of Scope (Phase 4+):**

- Exam conflict detection
- Faculty availability constraints
- Room capacity limits
- Persistent storage
- Real API endpoints
- Individual student preferences
- Optimization algorithms (minimize gaps, preferred times, etc.)

## Future Enhancements (Phase 4+)

1. **Advanced Conflict Detection:**

   - Exam schedule conflicts
   - Faculty double-booking
   - Room capacity violations

2. **Optimization Goals:**

   - Minimize gaps between classes
   - Prefer morning/afternoon schedules
   - Balance student distribution

3. **Persistence:**

   - Save generated schedules
   - Version control
   - Committee approval workflow

4. **Student Integration:**

   - Map individual students to sections
   - Handle irregular students
   - Apply elective preferences

5. **Export Features:**
   - PDF generation
   - Excel export
   - iCal format

## Related Files

- `/src/lib/schedule-generator.ts` - Core algorithm
- `/src/components/committee/scheduler/CourseEditor.tsx` - Course selection UI
- `/src/components/committee/scheduler/SchedulePreviewer.tsx` - Results display
- `/src/components/committee/scheduler/index.ts` - Barrel exports
- `/src/app/demo/committee/scheduler/page.tsx` - Main integration
- `/docs/plan.md` - Task tracking (COM-18)

## Task Reference

**Task ID:** COM-18  
**Status:** DONE  
**Decision:** DEC-16 - Scheduler shows student perspective with all conflict-free options
