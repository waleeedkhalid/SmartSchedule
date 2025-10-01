# ElectiveSurvey - Category Filters Feature

## Overview
Added interactive category filters to help students quickly find and select elective courses by requirement type.

**Date:** October 1, 2025  
**Component:** `src/components/student/electives/ElectiveSurvey.tsx`

## Feature Summary

### What Was Added
- **Category Filter Chips** - Clickable badges to filter courses by category
- **Smart Counters** - Shows available/total courses per category
- **Active Filter Indicator** - Visual feedback for selected filter
- **Clear Filter Button** - Quick reset to show all courses
- **Dynamic Placeholder** - Select dropdown text updates based on active filter

## User Experience

### Visual Design

```
┌─────────────────────────────────────────────────────┐
│ 🔍 Filter by category              [Clear filter]   │
│                                                      │
│ [All Courses (12)]  [Islamic Studies (3/3)]         │
│ [Math/Statistics (1/3)]  [General Science (3/3)]    │
│ [Department Electives (3/3)]                        │
└─────────────────────────────────────────────────────┘
```

### Filter States

**1. All Courses (Default)**
- Badge: Solid/filled style (default variant)
- Shows: All 12 elective courses
- Counter: Total course count

**2. Category Selected**
- Active badge: Solid/filled style
- Inactive badges: Outline style
- Shows: Only courses from selected category
- Counter: Available courses / Total courses in category
- "Clear filter" button appears

### Counter Logic

**Format:** `(available/total)`

- **Available** = Courses not yet selected
- **Total** = All courses in category

**Examples:**
- `Islamic Studies (3/3)` - All 3 courses available
- `Math/Statistics (1/3)` - 1 available, 2 already selected
- `Department Electives (0/3)` - All selected

### Smart Placeholder Text

The dropdown placeholder updates based on filter state:

**No Filter:**
- Available: "Select a course..."
- Max reached: "Maximum 6 courses selected"
- All selected: "All courses selected"

**Filter Active:**
- Available: "Select from Islamic Studies..."
- All category selected: "All Islamic Studies courses selected"

## Implementation Details

### State Management

```typescript
const [activeFilter, setActiveFilter] = useState<string>("all");
```

**Values:**
- `"all"` - Show all courses (default)
- `<category name>` - Show specific category only

### Filter Logic

```typescript
// Extract unique categories from courses
const categories = Array.from(
  new Set(electiveCourses.map((c) => c.category))
);

// Apply filter to available courses
const availableCourses = electiveCourses
  .filter((course) => 
    !selectedCourses.find((selected) => selected.code === course.code)
  )
  .filter((course) =>
    activeFilter === "all" ? true : course.category === activeFilter
  );
```

### UI Components

**Filter Section:**
```tsx
<div className="space-y-2">
  <div className="flex items-center gap-2">
    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
    <Label className="text-xs font-medium text-muted-foreground">
      Filter by category
    </Label>
    {activeFilter !== "all" && (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-5 px-2 text-xs"
        onClick={() => setActiveFilter("all")}
      >
        Clear filter
      </Button>
    )}
  </div>
  <div className="flex flex-wrap gap-2">
    {/* Filter badges */}
  </div>
</div>
```

**Filter Badges:**
```tsx
<Badge
  variant={activeFilter === category ? "default" : "outline"}
  className="cursor-pointer hover:bg-accent transition-colors"
  onClick={() => setActiveFilter(category)}
>
  {category} ({availableCount}/{count})
</Badge>
```

## Benefits

### For Students

1. **Faster Course Discovery**
   - Quickly narrow down to specific requirement types
   - No need to scroll through all 12 courses

2. **Better Organization**
   - See courses grouped by academic requirements
   - Understand which requirement each course fulfills

3. **Visual Progress**
   - Counters show how many courses selected per category
   - Easy to balance selections across requirements

4. **Flexible Navigation**
   - Switch between categories instantly
   - Clear filter to see full list again

### For Academic Planning

1. **Requirement Awareness**
   - Students see electives organized by SWE plan structure
   - Encourages balanced course selection

2. **Informed Choices**
   - Category context helps students understand requirements
   - Can strategically select across different areas

3. **Efficient Selection**
   - Reduces decision fatigue with focused views
   - Faster preference submission

## Usage Scenarios

### Scenario 1: Browsing All Courses
```
1. Student opens preference form
2. Default view shows "All Courses (12)"
3. Dropdown shows all 12 elective courses
4. Student explores full catalog
```

### Scenario 2: Focused Selection
```
1. Student wants Islamic Studies course
2. Clicks "Islamic Studies (3/3)" filter
3. Dropdown now shows only ISL101, ISL102, ISL103
4. Selects ISL101
5. Filter updates to "Islamic Studies (2/3)"
6. Student clicks "Math/Statistics (3/3)" to switch category
```

### Scenario 3: Category Completion
```
1. Student selects all 3 Math/Statistics courses
2. Filter shows "Math/Statistics (0/3)"
3. Badge indicates category is fully selected
4. Student switches to Department Electives
```

### Scenario 4: Quick Reset
```
1. Student has "General Science" filter active
2. Wants to see all courses again
3. Clicks "Clear filter" button
4. Returns to "All Courses" view
```

## Technical Specifications

### Filter Badge Styling
- **Active:** `variant="default"` (solid background)
- **Inactive:** `variant="outline"` (border only)
- **Hover:** `hover:bg-accent` (subtle highlight)
- **Transition:** `transition-colors` (smooth animation)
- **Cursor:** `cursor-pointer` (indicates clickability)

### Counter Calculation
```typescript
const count = electiveCourses.filter(
  (c) => c.category === category
).length;

const availableCount = electiveCourses.filter(
  (c) =>
    c.category === category &&
    !selectedCourses.find((s) => s.code === c.code)
).length;
```

### Accessibility
- Semantic HTML with proper `<Label>` elements
- Keyboard navigation supported via Button/Badge components
- Clear visual indicators for active/inactive states
- Screen-reader friendly counter text

## Future Enhancements

### 1. Credit Hours Display
Show credit hour totals per category:
```
Islamic Studies (2/3) • 2/4 hours
```

### 2. Requirement Progress Bar
Visual indicator of category requirements:
```
Islamic Studies ████████░░ 2/4 hours (2 of 3 courses)
```

### 3. Smart Recommendations
Highlight categories needing more selections:
```
⚠️ Math/Statistics (3/3) • Select 0-6 hours required
```

### 4. Multi-Select Filters
Allow filtering by multiple categories simultaneously:
```
[Islamic Studies ✓]  [Math/Statistics ✓]  [Apply]
```

### 5. Search Within Filters
Combine category filter with text search:
```
[Islamic Studies ▼]  [Search: "culture"]
```

### 6. Saved Filter Preferences
Remember last used filter:
```typescript
localStorage.setItem('lastElectiveFilter', category);
```

## Category Configuration

Current categories from `mockElectivePackages`:

| Category | Courses | Hours | Requirements |
|----------|---------|-------|--------------|
| Islamic Studies | 3 | 2-4 | Required minimum 2 hours |
| Math/Statistics | 3 | 0-6 | Optional up to 6 hours |
| General Science | 3 | 0-3 | Optional up to 3 hours |
| Department Electives | 3 | 0-9 | Optional up to 9 hours |

**Total:** 12 courses across 4 categories

## Testing Checklist

- [x] Filter badges display correctly
- [x] All Courses shows all 12 courses
- [x] Category filter shows only courses from that category
- [x] Counters update when courses selected
- [x] Clear filter button appears/disappears correctly
- [x] Placeholder text updates with filter
- [x] Selected courses remain visible regardless of filter
- [ ] Hover states work on all badges
- [ ] Keyboard navigation works
- [ ] Mobile responsive layout

## Integration Notes

### No Breaking Changes
- Component props unchanged
- External API remains the same
- State management isolated to component

### Performance
- Category array computed once (memoization candidate)
- Filter operation on small dataset (12 courses)
- No additional API calls needed

### Compatibility
- Works with existing `mockElectivePackages` structure
- Compatible with current selection logic
- Integrates seamlessly with ranking system

## Related Documentation
- `docs/elective-survey-redesign.md` - Original redesign documentation
- `docs/elective-survey-swe-plan.md` - SWE plan data integration
- `docs/navigation-implementation.md` - Navigation system overview

## Design Decisions

### Why Badge Components?
- Consistent with existing UI (category badges in dropdown/list)
- Familiar interaction pattern (clickable chips)
- Clean, modern appearance
- Built-in hover/active states

### Why "all" Instead of null?
- Explicit state management
- Easier to check filter status
- Prevents undefined comparison issues
- Clear intent in code

### Why Show Counters?
- Provides context about category size
- Shows progress (available vs. total)
- Helps students balance selections
- Indicates when category fully selected

### Why Clear Button vs. Clicking "All"?
- Provides both options for flexibility
- "All Courses" badge for explicit selection
- "Clear filter" for quick reset
- Better UX with redundant controls

## User Feedback Considerations

**Potential improvements based on usage:**
1. Add course code prefixes to filters (e.g., "ISL - Islamic Studies")
2. Show credit hours in filter badges
3. Add tooltips with category descriptions
4. Implement filter persistence across sessions
5. Add "Recently viewed" or "Popular" smart filters
