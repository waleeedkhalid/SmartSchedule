# ElectiveSurvey - SWE Plan Integration Update

## Overview

Updated ElectiveSurvey component to use SWE plan electives from `mockElectivePackages` instead of filtering all course offerings.

**Date:** October 1, 2025

## Change Summary

### Data Source Change

**Before:**

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

**After:**

```typescript
import { mockElectivePackages } from "@/data/mockData";

const electiveCourses = mockElectivePackages.flatMap((pkg) =>
  pkg.courses.map((course) => ({
    code: course.code,
    name: course.name,
    category: pkg.label,
    credits: course.credits,
  }))
);
```

## Why This Change?

### Problem with Previous Approach

- ❌ `mockCourseOfferings` contains ALL elective courses (MATH, PHY, CSC, IS, CEN, etc.)
- ❌ Not all of these are part of the SWE degree plan
- ❌ Students should only see electives defined in their program

### Solution: Use SWE Plan Data

- ✅ `mockElectivePackages` contains only electives from the SWE degree plan
- ✅ Organized by category (Islamic Studies, Math/Stats, General Science, Department Electives)
- ✅ Includes credit hours and constraints (min/max hours per category)
- ✅ Represents what students actually need to choose from

## SWE Elective Categories

From `mockElectivePackages`:

### 1. Islamic Studies (2-4 hours)

- ISL101 - Islamic Culture (2 credits)
- ISL102 - Quranic Studies (2 credits)
- ISL103 - Islamic History (2 credits)

### 2. Math/Statistics (0-6 hours)

- MATH202 - Calculus II (3 credits)
- STAT201 - Probability (3 credits)
- MATH301 - Linear Algebra (3 credits)

### 3. General Science (0-3 hours)

- PHYS102 - Physics II (3 credits)
- BIOL101 - Biology I (3 credits)
- CHEM102 - Chemistry II (3 credits)

### 4. Department Electives (0-9 hours)

- CS201 - Data Structures (3 credits)
- CS301 - Algorithms (3 credits)
- CS401 - Machine Learning (3 credits)

**Total:** 12 elective courses organized in 4 categories

## Interface Updates

### Added Category Display

**Dropdown Items:**

```tsx
<SelectItem value={course.code}>
  <div className="flex flex-col items-start">
    <div className="flex items-center gap-2">
      <span className="font-medium">{course.code}</span>
      <Badge variant="outline" className="text-[10px]">
        {course.category}
      </Badge>
    </div>
    <span className="text-xs text-muted-foreground">{course.name}</span>
  </div>
</SelectItem>
```

**Selected Course Cards:**

```tsx
<div className="flex items-center gap-2">
  <span className="font-medium text-sm">{course.code}</span>
  <Badge variant="outline" className="text-[10px]">
    {course.category}
  </Badge>
</div>
<div className="text-xs text-muted-foreground truncate">
  {course.name}
</div>
```

### Visual Example

**Dropdown:**

```
┌─────────────────────────────────────────┐
│ ISL101  [Islamic Studies]              │
│ Islamic Culture                         │
├─────────────────────────────────────────┤
│ MATH202 [Math/Statistics]              │
│ Calculus II                             │
├─────────────────────────────────────────┤
│ CS401   [Department Electives]         │
│ Machine Learning                        │
└─────────────────────────────────────────┘
```

**Selected List:**

```
┌─────────────────────────────────────────┐
│ #1  ISL101 [Islamic Studies]        [X]│
│     Islamic Culture                     │
├─────────────────────────────────────────┤
│ #2  MATH202 [Math/Statistics]       [X]│
│     Calculus II                         │
└─────────────────────────────────────────┘
```

## Type Updates

### SelectedCourse Interface

```typescript
interface SelectedCourse {
  code: string;
  name: string;
  category: string; // NEW: Shows which elective package
  order: number;
}
```

## Benefits

### For Students

1. **Clear Categorization** - See which requirement each course fulfills
2. **Relevant Choices** - Only see courses from their degree plan
3. **Better Understanding** - Know if selecting Islamic, Math, Science, or Department elective
4. **Visual Clarity** - Category badges help distinguish course types

### For System

1. **Accurate Data** - Uses official SWE plan electives
2. **Maintainable** - Single source of truth for SWE electives
3. **Extensible** - Easy to add more elective packages
4. **Consistent** - Matches academic requirements

### For Academic Planning

1. **Requirement Tracking** - Can track hours per category
2. **Validation** - Can enforce min/max hours per category
3. **Advising** - Students make informed choices about requirements
4. **Reporting** - Can analyze elective distribution

## Future Enhancements

### Category Constraints (Future)

Could add validation for min/max hours per category:

```typescript
const categoryHours = selectedCourses.reduce((acc, course) => {
  const cat = course.category;
  acc[cat] = (acc[cat] || 0) + getCreditHours(course.code);
  return acc;
}, {});

// Validate against mockElectivePackages constraints
mockElectivePackages.forEach((pkg) => {
  const hours = categoryHours[pkg.label] || 0;
  if (hours < pkg.minHours || hours > pkg.maxHours) {
    // Show warning
  }
});
```

### Category Grouping in Dropdown

Could group courses by category:

```tsx
<SelectContent>
  {mockElectivePackages.map((pkg) => (
    <SelectGroup key={pkg.id}>
      <SelectLabel>
        {pkg.label} ({pkg.rangeLabel})
      </SelectLabel>
      {pkg.courses.map((course) => (
        <SelectItem value={course.code}>...</SelectItem>
      ))}
    </SelectGroup>
  ))}
</SelectContent>
```

### Category Statistics

Show progress toward requirements:

```
Islamic Studies: 2/4 hours (1 course selected)
Math/Statistics: 0/6 hours (0 courses selected)
General Science: 3/3 hours ✓ (1 course selected)
Department Electives: 6/9 hours (2 courses selected)
```

## Data Structure

### mockElectivePackages Structure

```typescript
{
  id: string; // Unique identifier
  label: string; // Display name (category)
  rangeLabel: string; // "2-4 hours", "0-6 hours"
  minHours: number; // Minimum required hours
  maxHours: number; // Maximum allowed hours
  courses: Array<{
    code: string; // Course code
    name: string; // Course name
    credits: number; // Credit hours
  }>;
}
```

## Integration Impact

### No Breaking Changes

- Component props remain the same
- External API unchanged
- Still submits array of course codes

### Internal Changes Only

- Data source switched
- Category field added to internal state
- UI enhanced with category badges

## Testing Checklist

- [x] Courses load from mockElectivePackages
- [x] All 12 elective courses available
- [x] Category badges display in dropdown
- [x] Category badges display in selected list
- [x] Selection/removal works correctly
- [x] Order numbering works correctly
- [ ] Category constraints validation (future)
- [ ] Credit hours tracking (future)

## Migration Notes

**No migration needed** - This is an internal data source change. The component interface remains compatible with existing usage.

**Data Source:**

- Old: `mockCourseOfferings` (all courses with type="ELECTIVE")
- New: `mockElectivePackages` (SWE plan electives only)

**Course Count:**

- Old: 13 elective courses (includes non-SWE electives)
- New: 12 elective courses (SWE plan only)

## Alignment with System Scope

This change reinforces the system scope:

- ✅ **SWE Department Only** - Shows only SWE plan electives
- ✅ **Single Source of Truth** - Uses mockElectivePackages
- ✅ **Academic Accuracy** - Matches official degree requirements
- ✅ **Clear Requirements** - Categories show requirement types

Students now see exactly what's in their degree plan, not a generic list of electives from all departments.
