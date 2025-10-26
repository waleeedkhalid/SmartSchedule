# SmartSchedule: Timetabling System Guide

> **Created:** 2025-10-25  
> **Purpose:** Critical understanding of SmartSchedule as a TIMETABLING system

## 🎯 What Type of System is SmartSchedule?

SmartSchedule is a **TIMETABLING/SCHEDULING SYSTEM**, not a traditional course enrollment system.

### Key Difference

| Traditional Enrollment System | SmartSchedule (Timetabling) |
|-------------------------------|------------------------------|
| Students enroll in courses in real-time | Students submit **preferences** |
| First-come, first-served | Algorithm optimizes for everyone |
| Courses may fill up quickly | Capacity managed by scheduler |
| Students see conflicts immediately | Conflicts resolved by algorithm |
| Continuous enrollment period | One-time preference submission |
| Real-time schedule building | Batch schedule generation |

---

## 📅 System Timeline

### Phase 1: Pre-Semester (ACTIVE) - 2-4 Weeks Before Start

**Week 1-2: Data Collection**
```
Students → Submit elective preferences (ranked 1-10)
Faculty → Submit availability windows
Registrar → Set up academic term + events
Teaching Load Committee → Assign faculty to sections
```

**Week 3: Schedule Generation**
```
Scheduling Committee → Run generator
System → Creates timetables for ALL students
Committee → Review conflicts
Committee → Adjust and re-run if needed
Committee → PUBLISH schedules
```

**Week 4: Review Period**
```
Students → View generated schedules
Students → Provide feedback (if needed)
Committee → Make final adjustments
```

### Phase 2: During Semester (PASSIVE) - READ-ONLY

```
Students → View schedules (NO changes)
Faculty → View teaching schedules (NO changes)
Students → Attend classes as scheduled
Students → Provide feedback on scheduling quality
```

### Phase 3: Post-Semester - Historical Recording

```
Registrar → Enter final grades
System → Update enrollment history
System → Calculate package progress
System → Prepare for next cycle
```

---

## 🔄 Data Flow

### Inputs (Before Generation)

```
┌─────────────────────┐
│  STUDENT INPUTS     │
├─────────────────────┤
│ • Elective prefs    │ ──┐
│ • Current level     │   │
│ • Package progress  │   │
└─────────────────────┘   │
                          │
┌─────────────────────┐   │
│  FACULTY INPUTS     │   │
├─────────────────────┤   ├──→ SCHEDULER
│ • Availability      │   │      ALGORITHM
│ • Teaching load     │   │
└─────────────────────┘   │
                          │
┌─────────────────────┐   │
│  SYSTEM DATA        │   │
├─────────────────────┤   │
│ • Courses catalog   │ ──┘
│ • Rooms available   │
│ • Past enrollment   │
│ • Prerequisites     │
│ • Package rules     │
└─────────────────────┘
```

### Outputs (After Generation)

```
┌─────────────────────────────────────┐
│        GENERATED SCHEDULES           │
├─────────────────────────────────────┤
│  For Each Student:                  │
│  • Full semester schedule           │
│  • All sections assigned            │
│  • Times & rooms confirmed          │
│  • Electives allocated (best match) │
│  • No conflicts                     │
└─────────────────────────────────────┘
           │
           ├──→ Students view (read-only)
           ├──→ Faculty view teaching schedule
           └──→ Committee monitors
```

---

## 🗃️ Database Schema Understanding

### Student-Related Tables

#### 1. **`students`** - Profile
- **What:** Core student identity
- **When:** Created at signup
- **Modified by:** Registrar, Student
- **Contains:** Level, status, current term

#### 2. **`elective_preferences`** - INPUT
- **What:** Student's ranked elective choices
- **When:** Pre-semester (before generation)
- **Modified by:** Student (submit), Scheduler (status update)
- **Contains:** Course code, preference order (1-10)

#### 3. **`schedules`** - OUTPUT
- **What:** Generated timetable (JSONB)
- **When:** After generation runs
- **Modified by:** Scheduling Committee ONLY
- **Contains:** All sections, times, rooms, instructors

#### 4. **`enrollment`** - HISTORICAL
- **What:** Past course completions
- **When:** Post-semester (after grades)
- **Modified by:** Registrar
- **Contains:** Grades, completion status

#### 5. **`feedback`** - QUALITY
- **What:** Student schedule feedback
- **When:** During/after semester
- **Modified by:** Student
- **Contains:** Rating, comments

---

## 🚫 Common Misconceptions

### ❌ WRONG: "Students enroll in courses"
✅ CORRECT: Students submit **preferences** which the scheduler uses as input

### ❌ WRONG: "Schedules table shows current enrollments"
✅ CORRECT: Schedules table contains **generated timetables** (read-only for students)

### ❌ WRONG: "Students can drop/add courses during semester"
✅ CORRECT: Schedules are **fixed** after publication (exceptions handled manually by committee)

### ❌ WRONG: "Enrollment table tracks current courses"
✅ CORRECT: Enrollment table is **historical** (past semesters with grades)

### ❌ WRONG: "First student to submit preferences gets priority"
✅ CORRECT: All preferences collected, then algorithm **optimizes for everyone**

---

## 💡 When to Use Each Table

### Writing Student Features?

**If you need to:**
- Show student profile → Use `students`
- Let student select electives → Use `elective_preferences`
- Display current schedule → Use `schedules` (WHERE is_published = true)
- Show transcript/GPA → Use `enrollment`
- Collect feedback → Use `feedback`

### Writing Committee Features?

**If you need to:**
- Run schedule generator → Read from `elective_preferences`, Write to `schedules`
- Check student status → Use `students`
- Flag special cases → Use `irregular_students`
- View what students want → Use `elective_preferences`
- See what was generated → Use `schedules`

### Writing Registrar Features?

**If you need to:**
- Enter grades → Update `enrollment`
- Manage student records → Update `students`
- Set up terms → Update `academic_term`
- Handle exceptions → Update `irregular_students`

---

## 🔧 Developer Guidelines

### When Building Student Portal

```typescript
// ✅ CORRECT: Check if elective survey is open
const canSubmitPreferences = await checkIfEventActive('elective_survey', term_code);

// ✅ CORRECT: Show generated schedule (read-only)
const schedule = await getPublishedSchedule(student_id, term_code);

// ❌ WRONG: Allow student to "enroll" in courses
// This is NOT an enrollment system!
```

### When Building Committee Portal

```typescript
// ✅ CORRECT: Run schedule generator
await scheduleGenerator.run({
  term_code,
  elective_preferences: await getPreferences(term_code),
  students: await getActiveStudents(),
  courses: await getCourses(),
  faculty_availability: await getFacultyAvailability()
});

// ✅ CORRECT: Publish schedules
await publishSchedules(term_code);

// ❌ WRONG: Let committee manually assign every student
// Use the GENERATOR algorithm!
```

---

## 📊 Database Queries - Dos and Don'ts

### ✅ DO

```sql
-- Get student's published schedule for current term
SELECT * FROM schedules
WHERE student_id = $1 
  AND term_code = $2
  AND is_published = true;

-- Check if student submitted preferences
SELECT EXISTS(
  SELECT 1 FROM elective_preferences
  WHERE student_id = $1 
    AND term_code = $2
    AND submitted_at IS NOT NULL
);

-- Get student's historical enrollments
SELECT * FROM enrollment
WHERE student_id = $1
  AND status = 'completed'
ORDER BY term_code DESC;
```

### ❌ DON'T

```sql
-- ❌ DON'T try to get "current enrollments" from schedules
-- Schedules are JSONB generated timetables, not enrollment records

-- ❌ DON'T query enrollment for current semester courses
-- Enrollment is historical (past semesters only)

-- ❌ DON'T use elective_preferences as enrollment
-- It's student wishes, not actual assignments
```

---

## 🎓 Real-World Example

### Scenario: Level 6 Student - Sarah

**Week -3 (Pre-Semester):**
1. Sarah logs in to SmartSchedule
2. System shows her 15 available electives
3. Sarah selects and ranks 6 electives (priority 1-6)
4. Sarah clicks "Submit Preferences"
5. Record created in `elective_preferences` with `status = 'pending'`

**Week -2:**
6. Scheduling Committee runs generator
7. Algorithm considers Sarah's preferences + all constraints
8. Sarah gets her top 2 preferences assigned
9. System creates record in `schedules` table (JSONB)
10. `elective_preferences` status updated to 'assigned' or 'rejected'

**Week -1:**
11. Committee publishes schedules (`is_published = true`)
12. Sarah logs in and sees her complete schedule (read-only)
13. Schedule shows: 5 required courses + 2 electives
14. Sarah sees which preferences were met: "4/6 preferences matched"

**During Semester:**
15. Sarah views schedule daily (no changes allowed)
16. Sarah attends classes as scheduled
17. Sarah provides feedback: "Great schedule! No gaps."

**Post-Semester:**
18. Registrar enters Sarah's grades
19. Grades saved to `enrollment` table
20. Sarah's `student_package_progress` updated automatically
21. Sarah advances to Level 7

---

## 📚 Key Documentation

1. **Schema Overview:** [`docs/schema/overview.md`](schema/overview.md) - Complete database schema
2. **Student Schema:** [`docs/schema/STUDENT-SCHEMA-SUMMARY.md`](schema/STUDENT-SCHEMA-SUMMARY.md) - Quick reference
3. **Architecture:** [`docs/system/architecture.md`](system/architecture.md) - System design
4. **Workflows:** [`docs/system/workflows.md`](system/workflows.md) - Process flows

---

## ⚠️ Critical Reminders

### For Developers:

1. **This is NOT an enrollment system** - Don't build real-time enrollment features
2. **Schedules are GENERATED** - Don't let students manually build schedules
3. **Preferences ≠ Enrollment** - `elective_preferences` is INPUT, `schedules` is OUTPUT
4. **Enrollment is historical** - For transcripts/grades, not current semester
5. **Read-only during semester** - No schedule changes after publication

### For Users:

1. **Submit preferences early** - Algorithm needs time to optimize
2. **Rank honestly** - Your preferences help the algorithm
3. **Preferences not guaranteed** - System tries to satisfy most students
4. **Schedule is final** - Exceptions handled by committee only
5. **Provide feedback** - Helps improve future generation

---

## 🎯 Summary

SmartSchedule is designed to:
- ✅ Collect student preferences in advance
- ✅ Generate conflict-free schedules for everyone
- ✅ Optimize based on preferences and constraints
- ✅ Publish complete schedules before semester starts

SmartSchedule is NOT designed to:
- ❌ Allow real-time course enrollment
- ❌ Let students build their own schedules
- ❌ Operate on first-come-first-served basis
- ❌ Allow schedule changes during semester

**When in doubt, remember:** 
> SmartSchedule generates timetables BEFORE the semester. Students view what was generated, they don't build it themselves.

---

*Last Updated: 2025-10-25*

