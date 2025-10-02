# Quick Start: Schedule Generator (Student Perspective View)

## How to Use

### 1. Start the Development Server

```bash
cd /Users/waleedkhalid/Documents/Projects/Semester_Scheduler
npm run dev
```

### 2. Navigate to the Scheduler

Open your browser and go to:

```
http://localhost:3000/demo/committee/scheduler
```

### 3. Generate Schedules

#### Step 1: Select Student Level

- Use the dropdown to choose a level (4, 5, 6, 7, or 8)
- The course list will automatically filter to show only SWE courses for that level

#### Step 2: Select Courses

- Check the boxes next to courses you want to include
- Or click "Select All" to include all courses for that level
- Watch the badges update to show:
  - Number of courses selected
  - Total credit hours

#### Step 3: Generate

- Click the "Generate Schedules" button
- The system will calculate all possible conflict-free combinations
- Results appear in the Schedule Preview below

### 4. View Results

#### Navigation

- Use "Previous" and "Next" buttons to browse through valid schedules
- See "Schedule X of Y" to track your position

#### Grid View

- **Time slots** are shown vertically (08:00 - 20:00)
- **Days** are shown horizontally (Sunday - Saturday)
- **Classes** appear as colored blocks showing:
  - Course code
  - Instructor name
  - Room number
  - Time range

#### Statistics

- View metadata at the bottom:
  - Number of courses scheduled
  - Total combinations checked
  - Number of valid schedules found
  - Generation time in milliseconds

## Example Usage Scenarios

### Scenario 1: Level 4 Full Schedule

```
1. Select Level: 4
2. Click "Select All" (includes all Level 4 SWE courses)
3. Click "Generate Schedules"
4. Browse through 10-50 possible schedules
5. Each shows a complete weekly calendar
```

### Scenario 2: Custom Course Selection

```
1. Select Level: 5
2. Manually check: SWE312, SWE314, SWE321
3. Click "Generate Schedules"
4. See all conflict-free combinations for just these 3 courses
5. Fewer combinations = faster generation
```

### Scenario 3: Check Console Logs

```
1. Open browser DevTools (F12)
2. Go to Console tab
3. Generate schedules
4. See detailed logs:
   - Selected courses and level
   - Courses being scheduled
   - Generation statistics
   - All data structures for API development
```

## Navigation to Other Features

### From the Main Scheduler Page:

- **Exams** - Schedule midterm and final exams
- **Rules & Conflicts** - Configure scheduling rules
- **Courses Editor** - Manage course offerings
- **Versions** - View schedule history

Click any nav item in the top navigation bar.

## Performance Tips

### For Faster Generation:

- Select fewer courses (3-5 courses)
- Choose courses with fewer sections
- Results limited to 100 schedules automatically

### For More Results:

- Modify the limit in `page.tsx`:
  ```typescript
  const result = generateSchedulesBacktracking(coursesToSchedule, {
    limit: 200, // Increase from 100
  });
  ```

### For Different Algorithm:

- Switch from backtracking to full cartesian:
  ```typescript
  import { generateSchedules } from "@/lib/schedule-generator";
  const result = generateSchedules(coursesToSchedule, { limit: 100 });
  ```

## Technical Notes

### Data Source

- All data comes from `mockCourseOfferings` in `/src/data/mockData.ts`
- Only SWE department courses are included
- Each course has sections with times, rooms, and instructors

### Algorithm

- **Backtracking with early pruning** (default)
- Checks time conflicts between sections
- Finds all valid combinations
- Stops at 100 schedules to prevent browser freeze

### Console Output

All operations are logged for API development:

```javascript
// When clicking Generate
console.log("Generating schedules for:", { selectedCourses, level, timestamp });
console.log("Courses to schedule:", coursesToSchedule);
console.log("Schedule generation result:", { totalCombinations, validCount, ... });
```

## Troubleshooting

### No Schedules Found

**Issue:** "0 valid schedules" shown after generation

**Solutions:**

1. Check if courses have conflicting required times
2. Try selecting fewer courses
3. Check console for errors
4. Verify mockData has sections for selected courses

### Generation Takes Too Long

**Issue:** Browser freezes or waits indefinitely

**Solutions:**

1. Select fewer courses (max 5-6)
2. Check if courses have many sections (3+ each)
3. Reduce limit in code to 50 or less
4. Use backtracking instead of full cartesian

### Empty Course List

**Issue:** No courses shown after selecting level

**Solutions:**

1. Verify mockData has SWE courses for that level
2. Check browser console for errors
3. Try a different level (4, 5, or 6 are populated)

## Next Steps (Phase 4+)

This is a Phase 3 prototype. Future enhancements will include:

1. **API Integration**

   - POST /api/schedules/generate endpoint
   - Persistent storage of generated schedules
   - Save/load functionality

2. **Advanced Conflict Detection**

   - Exam schedule conflicts
   - Faculty availability
   - Room capacity limits

3. **Optimization Goals**

   - Minimize gaps between classes
   - Prefer morning or afternoon schedules
   - Balance student distribution

4. **Export Features**

   - Download as PDF
   - Export to Excel
   - iCal format for calendars

5. **Individual Student Mapping**
   - Assign specific students to sections
   - Handle irregular students
   - Apply elective preferences

## Related Documentation

- **Full Feature Doc:** `/docs/SCHEDULER_STUDENT_VIEW.md`
- **Implementation Plan:** `/docs/plan.md` (Task COM-18)
- **Master Plan:** `/docs/persona_feature_implementation_plan.md`
- **Algorithm Reference:** Original Express router code (in user request)

## Support

For questions or issues:

1. Check console logs for detailed error messages
2. Review mockData.ts to verify course data
3. Read SCHEDULER_STUDENT_VIEW.md for technical details
4. Check plan.md for implementation status
