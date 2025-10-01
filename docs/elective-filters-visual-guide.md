# ElectiveSurvey - Filter Feature Quick Reference

## Visual Overview

### Component Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Elective Course Preferences                                 │
│ Select up to 6 elective courses in order of preference      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 🔍 Filter by category              [Clear filter]           │
│                                                              │
│ ┌──────────────┐  ┌──────────────────────┐                 │
│ │ All Courses  │  │ Islamic Studies      │                 │
│ │    (12)      │  │       (3/3)          │                 │
│ └──────────────┘  └──────────────────────┘                 │
│                                                              │
│ ┌──────────────────────┐  ┌──────────────────────┐         │
│ │ Math/Statistics      │  │ General Science      │         │
│ │       (3/3)          │  │       (3/3)          │         │
│ └──────────────────────┘  └──────────────────────┘         │
│                                                              │
│ ┌──────────────────────┐                                    │
│ │ Department Electives │                                    │
│ │       (3/3)          │                                    │
│ └──────────────────────┘                                    │
│                                                              │
│ Choose courses in order                                     │
│ ┌──────────────────────────────────────────────┐           │
│ │ Select a course...                        ▼  │           │
│ └──────────────────────────────────────────────┘           │
│ 0 of 6 courses selected                                     │
│                                                              │
│ Your Ranked Preferences (0 selected)                        │
│ (No courses selected yet)                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Filter States

#### 1. Default State (All Courses)

```
🔍 Filter by category

[All Courses (12)]  [Islamic Studies (3/3)]  [Math/Statistics (3/3)]
[General Science (3/3)]  [Department Electives (3/3)]
```

- "All Courses" badge is solid/filled (active)
- All other badges have outline style (inactive)
- Dropdown shows all 12 courses

#### 2. Islamic Studies Filter Active

```
🔍 Filter by category                     [Clear filter]

[All Courses (12)]  [Islamic Studies (3/3)]  [Math/Statistics (3/3)]
[General Science (3/3)]  [Department Electives (3/3)]
```

- "Islamic Studies" badge is solid/filled (active)
- "Clear filter" button appears
- Dropdown shows only: ISL101, ISL102, ISL103
- Placeholder: "Select from Islamic Studies..."

#### 3. After Selecting 2 Islamic Studies Courses

```
🔍 Filter by category                     [Clear filter]

[All Courses (12)]  [Islamic Studies (1/3)]  [Math/Statistics (3/3)]
[General Science (3/3)]  [Department Electives (3/3)]
```

- Counter updates to "Islamic Studies (1/3)"
- Shows 1 available out of 3 total
- Dropdown shows only: ISL103 (remaining course)

#### 4. All Islamic Studies Courses Selected

```
🔍 Filter by category                     [Clear filter]

[All Courses (12)]  [Islamic Studies (0/3)]  [Math/Statistics (3/3)]
[General Science (3/3)]  [Department Electives (3/3)]
```

- Counter shows "Islamic Studies (0/3)"
- Dropdown placeholder: "All Islamic Studies courses selected"
- Dropdown is empty (all 3 courses selected)

## Dropdown Display Examples

### With "All Courses" Filter

```
┌──────────────────────────────────────────────┐
│ ISL101  [Islamic Studies]                   │
│ Islamic Culture                              │
├──────────────────────────────────────────────┤
│ ISL102  [Islamic Studies]                   │
│ Quranic Studies                              │
├──────────────────────────────────────────────┤
│ MATH202 [Math/Statistics]                   │
│ Calculus II                                  │
├──────────────────────────────────────────────┤
│ STAT201 [Math/Statistics]                   │
│ Probability                                  │
├──────────────────────────────────────────────┤
│ PHYS102 [General Science]                   │
│ Physics II                                   │
├──────────────────────────────────────────────┤
│ CS201   [Department Electives]              │
│ Data Structures                              │
└──────────────────────────────────────────────┘
```

### With "Math/Statistics" Filter

```
┌──────────────────────────────────────────────┐
│ MATH202 [Math/Statistics]                   │
│ Calculus II                                  │
├──────────────────────────────────────────────┤
│ STAT201 [Math/Statistics]                   │
│ Probability                                  │
├──────────────────────────────────────────────┤
│ MATH301 [Math/Statistics]                   │
│ Linear Algebra                               │
└──────────────────────────────────────────────┘
```

## Selected Courses Display

### With Mixed Categories

```
Your Ranked Preferences (4 selected)

┌──────────────────────────────────────────────────┐
│ #1  ISL101  [Islamic Studies]                [X]│
│     Islamic Culture                              │
├──────────────────────────────────────────────────┤
│ #2  MATH202 [Math/Statistics]                [X]│
│     Calculus II                                  │
├──────────────────────────────────────────────────┤
│ #3  PHYS102 [General Science]                [X]│
│     Physics II                                   │
├──────────────────────────────────────────────────┤
│ #4  CS301   [Department Electives]           [X]│
│     Algorithms                                   │
└──────────────────────────────────────────────────┘
```

## Filter Interactions

### Click "All Courses" Badge

- Shows all 12 elective courses in dropdown
- "Clear filter" button disappears
- Counters show total available per category

### Click Category Badge

- Filters dropdown to show only that category's courses
- "Clear filter" button appears
- Badge turns solid (active style)
- Placeholder updates to "Select from [Category]..."

### Click "Clear filter" Button

- Returns to "All Courses" view
- Same as clicking "All Courses" badge
- Button disappears

### Select Course

- Course added to ranked list with category badge
- Counter decrements for that category
- Dropdown updates to remove selected course
- If category filter active and all category courses selected:
  - Placeholder becomes "All [Category] courses selected"

### Remove Course

- Course returns to dropdown
- Counter increments for that category
- Rank numbers re-adjust automatically

## Counter Behavior Examples

### Initial State

```
All Courses (12)          - All 12 courses available
Islamic Studies (3/3)     - 3 available, 3 total
Math/Statistics (3/3)     - 3 available, 3 total
General Science (3/3)     - 3 available, 3 total
Department Electives (3/3)- 3 available, 3 total
```

### After Selecting 2 Islamic + 1 Math Course

```
All Courses (9)           - 9 available, 12 total selected courses
Islamic Studies (1/3)     - 1 available, 2 selected
Math/Statistics (2/3)     - 2 available, 1 selected
General Science (3/3)     - 3 available, 0 selected
Department Electives (3/3)- 3 available, 0 selected
```

### After Selecting All Islamic + All Math

```
All Courses (6)           - 6 available, 6 selected
Islamic Studies (0/3)     - 0 available, 3 selected ✓
Math/Statistics (0/3)     - 0 available, 3 selected ✓
General Science (3/3)     - 3 available, 0 selected
Department Electives (3/3)- 3 available, 0 selected
```

## Category Requirements Reference

| Category             | Code Prefix    | Courses | Hour Range | Notes                    |
| -------------------- | -------------- | ------- | ---------- | ------------------------ |
| Islamic Studies      | ISL            | 3       | 2-4 hours  | Minimum 2 hours required |
| Math/Statistics      | MATH/STAT      | 3       | 0-6 hours  | Optional, up to 6 hours  |
| General Science      | PHYS/BIOL/CHEM | 3       | 0-3 hours  | Optional, up to 3 hours  |
| Department Electives | CS             | 3       | 0-9 hours  | Optional, up to 9 hours  |

## Keyboard Navigation

- **Tab** - Move between filter badges and dropdown
- **Enter/Space** - Activate filter badge or dropdown
- **Arrow keys** - Navigate dropdown options
- **Esc** - Close dropdown

## Responsive Behavior

### Desktop

- Filter badges in single row
- Dropdown full width
- Selected courses in single column

### Mobile

- Filter badges wrap to multiple rows
- Dropdown full width
- Selected courses remain single column
- Badges may wrap text if needed

## Performance Notes

- Filter operation is instant (client-side)
- No API calls for filtering
- Works on small dataset (12 courses)
- Smooth transitions with Tailwind animations

## Accessibility Features

- Semantic HTML labels
- Clear counter text for screen readers
- Keyboard navigation support
- Focus indicators on all interactive elements
- High contrast badge styles
- ARIA labels where needed

## Usage Tips

### For Students

1. **Browse by Requirement** - Click category badges to see specific requirement types
2. **Check Availability** - Counter shows how many courses available in each category
3. **Quick Reset** - Use "Clear filter" to see all courses again
4. **Visual Feedback** - Active filter badge is highlighted
5. **Smart Placeholder** - Dropdown text tells you what's filtered

### For Advisors

1. Filters help students organize choices by requirement
2. Counters show progress toward category completion
3. Category badges reinforce degree plan structure
4. Students less likely to miss requirement categories
5. Faster preference submission process

## Technical Implementation

### State

```typescript
const [activeFilter, setActiveFilter] = useState<string>("all");
```

### Filter Logic

```typescript
const availableCourses = electiveCourses
  .filter((course) => !selectedCourses.find((s) => s.code === course.code))
  .filter((course) =>
    activeFilter === "all" ? true : course.category === activeFilter
  );
```

### Counter Calculation

```typescript
const count = electiveCourses.filter((c) => c.category === category).length;
const availableCount = electiveCourses.filter(
  (c) =>
    c.category === category && !selectedCourses.find((s) => s.code === c.code)
).length;
```

## Future Enhancements

1. **Credit Hour Tracking** - Show hours per category in badge
2. **Requirement Progress** - Visual progress bar for hour requirements
3. **Smart Sorting** - Sort filtered courses by popularity or code
4. **Multi-Select Filters** - Allow combining multiple categories
5. **Search Integration** - Add text search within filtered results
6. **Filter Presets** - "Required Only", "Optional Only", "My Plan"
7. **Keyboard Shortcuts** - Alt+1-4 to quick-switch categories
8. **Filter History** - Remember last used filter per session

## Testing Scenarios

✅ **Basic Filtering**

1. Click "Islamic Studies" → Only ISL courses show
2. Click "Math/Statistics" → Only MATH/STAT courses show
3. Click "General Science" → Only science courses show
4. Click "Department Electives" → Only CS courses show
5. Click "All Courses" → All 12 courses show

✅ **Counter Updates**

1. Select course → Category counter decrements
2. Remove course → Category counter increments
3. Select all in category → Counter shows (0/X)
4. Remove all → Counter shows (X/X)

✅ **Clear Filter**

1. Activate any category filter
2. "Clear filter" button appears
3. Click button → Returns to "All Courses"
4. Button disappears

✅ **Placeholder Updates**

1. All filter: "Select a course..."
2. Category filter: "Select from [Category]..."
3. All selected: "All [Category] courses selected"

✅ **Visual States**

1. Active filter badge is solid style
2. Inactive filter badges are outline style
3. Hover effects work on all badges
4. Smooth transition animations
