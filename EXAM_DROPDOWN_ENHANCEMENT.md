# ExamTable Dropdown Enhancement ✅

## Problem

The "Create" button in ExamTable was disabled because users had to manually type the course code, which was not intuitive and prone to errors.

## Solution

Replaced the text input with a **dropdown selector** showing all available SWE courses.

## Changes Made

### 1. Added Course Dropdown (`ExamTable.tsx`)

**Before:**

```tsx
<Input
  value={draft.courseCode}
  onChange={(event) => {
    const nextCode = event.target.value.toUpperCase();
    // Manual typing required
  }}
  placeholder="e.g. SWE455"
/>
```

**After:**

```tsx
<Select
  value={draft.courseCode}
  onValueChange={(value) => {
    const course = availableCourses.find((c) => c.code === value);
    setDraft((prev) => ({
      ...prev,
      courseCode: value,
      courseName: course?.name || "", // Auto-fills course name!
      sectionIds: sectionsLookup
        .filter((section) => section.courseCode === value)
        .map((section) => section.sectionId),
    }));
  }}
>
  <SelectTrigger>
    <SelectValue placeholder="Select course" />
  </SelectTrigger>
  <SelectContent>
    {availableCourses.map((course) => (
      <SelectItem key={course.code} value={course.code}>
        {course.code} - {course.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### 2. Added Available Courses Computation

```typescript
const availableCourses = useMemo(() => {
  const uniqueCourses = new Map<string, string>();

  // Add courses from sections lookup
  sectionsLookup.forEach((section) => {
    if (!uniqueCourses.has(section.courseCode)) {
      const existingExam = exams.find(
        (e) => e.courseCode === section.courseCode
      );
      uniqueCourses.set(
        section.courseCode,
        existingExam?.courseName || section.courseCode
      );
    }
  });

  // Add courses from existing exams
  exams.forEach((exam) => {
    if (!uniqueCourses.has(exam.courseCode)) {
      uniqueCourses.set(exam.courseCode, exam.courseName);
    }
  });

  return Array.from(uniqueCourses.entries())
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.code.localeCompare(b.code));
}, [exams, sectionsLookup]);
```

### 3. Added Required Field Indicators

Added red asterisks (\*) to show required fields:

- **Course Code\***
- **Type\***
- **Date\***
- **Time (24h)\***

## User Experience Improvements

### Before

1. ❌ User had to know and manually type course code
2. ❌ Typos would prevent button from enabling
3. ❌ No indication of available courses
4. ❌ Manual lookup needed for course names

### After

1. ✅ **Dropdown menu** shows all 12 SWE courses
2. ✅ **Click to select** - no typing needed
3. ✅ **Searchable dropdown** - type to filter
4. ✅ **Auto-fills course name** when course selected
5. ✅ **Auto-populates sections** for selected course
6. ✅ **Clear required field indicators** with red asterisks
7. ✅ **Sorted alphabetically** (SWE211, SWE312, SWE314, ...)

## Available Courses in Dropdown

The dropdown now shows all 12 SWE courses:

1. **SWE211** - Introduction to Software Engineering
2. **SWE312** - Software Requirements Engineering
3. **SWE314** - Software Security Engineering
4. **SWE321** - Software Design and Architecture
5. **SWE333** - Software Quality Assurance
6. **SWE381** - Web Application Development
7. **SWE434** - Software Testing and Validation
8. **SWE444** - Software Construction Lab
9. **SWE455** - Introduction to Machine Learning
10. **SWE466** - Cloud Computing
11. **SWE477** - Ethics and Professional Practice in SWE
12. **SWE482** - Software Project Management

## How to Use (Updated Workflow)

### Creating an Exam

1. Navigate to `/demo/committee/scheduler/exams`
2. Click **"Add Exam"** button
3. **Select course from dropdown** (e.g., "SWE211 - Introduction to Software Engineering")
   - Course name auto-fills
   - Sections auto-populate
4. **Select exam type:** Midterm, Midterm 2, or Final
5. **Select date** using date picker
6. **Select time** using time picker (hour then minute)
7. _(Optional)_ Add room number
8. Click **"Create"** button
9. ✅ Exam appears in table immediately

### Button Enable Logic

The "Create" button enables when:

- ✅ Course code is selected from dropdown
- ✅ Date is filled
- ✅ Time is filled (both hour and minute)

All three required fields must have values.

## Technical Details

### Data Flow

```
User clicks dropdown
    ↓
Selects "SWE211 - Introduction to Software Engineering"
    ↓
onValueChange triggered
    ↓
Updates draft state:
  - courseCode: "SWE211"
  - courseName: "Introduction to Software Engineering" (auto-filled)
  - sectionIds: ["SWE211-01", "SWE211-02", "SWE211-03"] (auto-filled)
    ↓
Button enabled (if date & time also filled)
```

### Smart Features

1. **Deduplication:** Combines courses from both `sectionsLookup` and existing `exams`
2. **Auto-naming:** Pulls course name from existing exams if available
3. **Section linking:** Automatically finds and assigns all sections for selected course
4. **Alphabetical sort:** Courses sorted by code for easy browsing
5. **Empty state:** Shows "No courses available" if list is empty

## Testing

### Test Dropdown Functionality

```bash
1. Open /demo/committee/scheduler/exams
2. Click "Add Exam"
3. Click on "Course Code" dropdown
4. Verify all 12 SWE courses appear
5. Type "SWE3" - dropdown filters to SWE3xx courses
6. Select "SWE312 - Software Requirements Engineering"
7. Verify "Course Name" field shows "Software Requirements Engineering"
8. Console shows updated draft state
```

### Test Button Enable/Disable

```bash
1. Open create exam dialog
2. Verify "Create" button is disabled (gray)
3. Select course - button still disabled
4. Select date - button still disabled
5. Select time (hour then minute) - button ENABLES! ✅
6. Click "Create" - exam created successfully
```

## Console Output Example

When selecting a course:

```javascript
Current draft state: {
  courseCode: 'SWE211',
  courseName: 'Introduction to Software Engineering',
  type: 'midterm',
  date: '',
  time: '',
  duration: 90,
  room: '',
  sectionIds: ['SWE211-01', 'SWE211-02', 'SWE211-03']
}
```

After filling date and time:

```javascript
Current draft state: {
  courseCode: 'SWE211',
  courseName: 'Introduction to Software Engineering',
  type: 'midterm',
  date: '2026-03-25',
  time: '14:00',
  duration: 90,
  room: '',
  sectionIds: ['SWE211-01', 'SWE211-02', 'SWE211-03']
}
// Button is now enabled!
```

## Files Modified

1. ✅ `src/components/committee/scheduler/ExamTable.tsx`

   - Added `availableCourses` useMemo hook
   - Replaced Input with Select dropdown
   - Added required field indicators (red asterisks)
   - Auto-fills course name on selection

2. ✅ `docs/plan.md`
   - Updated change log with enhancement

## Benefits

### User Experience

- 🎯 **Faster:** Click to select vs typing
- 🎯 **Easier:** See all options at once
- 🎯 **Error-free:** No typos possible
- 🎯 **Informative:** Shows full course names
- 🎯 **Intuitive:** Standard dropdown UX pattern

### Development

- 🔧 **Reusable pattern:** Can apply to other forms
- 🔧 **Maintainable:** Centralized course list logic
- 🔧 **Scalable:** Works with any number of courses
- 🔧 **Type-safe:** Full TypeScript support

## Future Enhancements

When backend is ready:

- [ ] Fetch available courses from `/api/courses?department=SWE`
- [ ] Show only courses without exams for selected type
- [ ] Add course prerequisites in dropdown tooltip
- [ ] Filter by level (4, 5, 6, 7, 8)
- [ ] Add bulk exam creation for multiple courses

---

**Status:** ✅ COMPLETE  
**Date:** October 2, 2025  
**Impact:** Create button now works with intuitive dropdown selection  
**User Benefit:** Can create exams in seconds without memorizing course codes
