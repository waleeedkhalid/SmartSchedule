# Elective Preference Survey System

## Overview
The elective preference survey system collects student preferences for elective courses to help plan which courses to offer in upcoming terms. **This is NOT course registration** - it's a planning tool.

## Purpose
- 📊 Collect student demand data for elective courses
- 📈 Help administration decide which electives to offer
- 🎯 Ensure offered courses align with student interests
- 📅 Plan resources and faculty assignments effectively

## Database Schema

### New Table: `elective_preferences`

```sql
CREATE TABLE public.elective_preferences (
  id uuid PRIMARY KEY,
  student_id uuid REFERENCES users(id),
  course_code text REFERENCES course(code),
  term_code text REFERENCES academic_term(code),
  preference_order integer CHECK (preference_order > 0),
  created_at timestamptz,
  updated_at timestamptz,
  UNIQUE(student_id, course_code, term_code)
);
```

**Key Features:**
- Stores student preferences (NOT enrollments)
- References `course` table where `type='ELECTIVE'`
- Each student can only submit one preference per course per term
- Priority order (1-6) indicates student ranking

### Academic Term Control

The `academic_term` table has a flag: `electives_survey_open`
- When `true`: Students can submit preferences for that term
- When `false`: Survey is closed
- Only one term can have survey open at a time

## User Flow

### 1. Student Perspective

#### Accessing the Survey
1. Navigate to `/student/electives`
2. System checks if `electives_survey_open = true` for any term
3. If yes, displays the survey with term information
4. If no, shows "No active survey" message

#### Filling Out Preferences
1. Browse elective courses organized by packages
2. Select 1-6 courses across all packages
3. Drag to reorder selections (priority ranking)
4. Click "Review & Submit"
5. Confirm submission

#### What Students See
- Clear notice: "This is a preference survey, NOT registration"
- Survey term displayed (e.g., "Survey for: Spring 2026")
- All elective courses from `course` table with `type='ELECTIVE'`
- No prerequisite checking (commented out for now)
- Course details: code, name, credits, description, prerequisites

#### Submission Rules
- Minimum: 1 course
- Maximum: 6 courses
- Can resubmit/update preferences before survey closes
- Previous preferences are replaced on resubmission

### 2. Administration Perspective

#### Opening a Survey
```sql
UPDATE academic_term
SET electives_survey_open = true
WHERE code = 'TERM_CODE';
```

#### Closing a Survey
```sql
UPDATE academic_term
SET electives_survey_open = false
WHERE code = 'TERM_CODE';
```

#### Viewing Results
```sql
-- Top 10 most preferred electives for a term
SELECT 
  ep.course_code,
  c.name,
  COUNT(*) as student_count,
  AVG(ep.preference_order) as avg_priority
FROM elective_preferences ep
JOIN course c ON c.code = ep.course_code
WHERE ep.term_code = 'TERM_CODE'
GROUP BY ep.course_code, c.name
ORDER BY student_count DESC, avg_priority ASC
LIMIT 10;
```

```sql
-- Individual student preferences
SELECT 
  u.full_name,
  u.email,
  ep.course_code,
  c.name,
  ep.preference_order
FROM elective_preferences ep
JOIN users u ON u.id = ep.student_id
JOIN course c ON c.code = ep.course_code
WHERE ep.term_code = 'TERM_CODE'
ORDER BY u.full_name, ep.preference_order;
```

## API Endpoints

### GET `/api/student/electives`
Fetches elective packages and survey information.

**Response:**
```json
{
  "electivePackages": [
    {
      "id": "departmentElectives",
      "label": "Department Electives",
      "description": "...",
      "minHours": 9,
      "maxHours": 9,
      "courses": [
        {
          "code": "SWE401",
          "name": "Software Architecture",
          "credits": 3,
          "description": "...",
          "prerequisites": ["SWE301"]
        }
      ]
    }
  ],
  "completedCourses": [],
  "currentPreferences": [
    { "code": "SWE401", "priority": 1 },
    { "code": "AI401", "priority": 2 }
  ],
  "surveyTerm": {
    "code": "472",
    "name": "Spring 2026",
    "electives_survey_open": true
  }
}
```

### POST `/api/student/electives/submit`
Submits student preferences.

**Request:**
```json
{
  "selections": [
    { "course_code": "SWE401", "term_code": "472" },
    { "course_code": "AI401", "term_code": "472" },
    { "course_code": "DS401", "term_code": "472" }
  ]
}
```

**Validations:**
- ✅ Student must exist
- ✅ 1-6 selections required
- ✅ All courses must be type='ELECTIVE'
- ✅ All selections must be for same term
- ✅ Term must have `electives_survey_open = true`
- ✅ All course codes must be valid

**Response:**
```json
{
  "success": true,
  "message": "Your elective preferences have been recorded successfully",
  "count": 3,
  "term": "Spring 2026"
}
```

## UI Components

### Page: `/student/electives/page.tsx`
- Main survey page
- Shows survey notice and term
- Handles data fetching and submission
- Displays success message after submission

### Component: `ElectiveBrowser`
- Tab-based navigation between packages
- Shows "All Courses" + individual package tabs
- Maximum 6 selections enforced
- Drag-to-reorder priority ranking

### Component: `CourseCard`
- Enhanced design with gradients for selected courses
- Priority badge in corner
- Eligibility status (currently all eligible)
- Prerequisites display
- Select/Deselect button

### Component: `SelectionPanel`
- Sticky sidebar showing selected courses
- Priority order with up/down buttons
- Progress indicator (x/6)
- Package requirements summary
- Submit button

## Configuration

### Current Settings
- **Max Selections**: 6 courses
- **Min Selections**: 1 course
- **Prerequisite Checking**: Disabled (all courses appear eligible)
- **Completed Course Filtering**: Disabled

### Package Requirements (Display Only)
The package requirements (min/max credits) are shown for information but not enforced in the survey. Students can select any mix of courses from any packages.

## Security

### Row Level Security (RLS)
```sql
-- Students can only view/manage their own preferences
CREATE POLICY "Students can view their own preferences"
  ON elective_preferences FOR SELECT
  USING (auth.uid() = student_id);

-- Committee members can view all preferences for planning
CREATE POLICY "Committee members can view all preferences"
  ON elective_preferences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('scheduling_committee', 'registrar', 'teaching_load_committee')
    )
  );
```

## Benefits

### For Students
- 📝 Simple, clear interface for expressing preferences
- 🎯 Helps ensure courses they want are offered
- ✨ No commitment - can change preferences before survey closes
- 📊 Visual feedback with priority ranking

### For Administration
- 📈 Data-driven decisions on which courses to offer
- 💰 Better resource allocation
- 👥 Faculty assignment planning
- 📅 Advance notice for course preparation

### For Faculty
- 🎓 Know which courses will likely be taught
- 📚 Time to prepare materials
- 👨‍🏫 Better workload planning

## Future Enhancements

1. **Analytics Dashboard**
   - Visualize preference data
   - Show demand trends
   - Compare across terms

2. **Email Notifications**
   - Alert students when survey opens
   - Reminder before survey closes
   - Confirmation after submission

3. **Prerequisites Enforcement**
   - Check student eligibility
   - Show only available courses
   - Warn about prerequisites

4. **Multi-Term Survey**
   - Allow preferences for multiple future terms
   - Year-long planning

5. **Export Functionality**
   - CSV export of all preferences
   - Reports by package/department
   - Integration with course scheduling systems

## Testing

### Enable Survey for Testing
```sql
UPDATE academic_term
SET electives_survey_open = true
WHERE code = '472'; -- Spring 2026
```

### Test Data Available
- 16 elective courses seeded
- 4 packages configured
- Spring 2026 term active with survey open

### Test User Flow
1. Log in as student
2. Navigate to `/student/electives`
3. Select 3-6 courses
4. Reorder by dragging
5. Submit preferences
6. Check database for saved preferences

## Notes

- Survey responses are **NOT** course enrollments
- Students must still register during official registration period
- Preferences help planning but don't guarantee course offerings
- System uses `course` table exclusively (not legacy `electives` table)
- Survey can be opened/closed per term independently

