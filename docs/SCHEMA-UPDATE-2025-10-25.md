# Schema Documentation Update - October 25, 2025

## 📋 Summary

Updated SmartSchedule schema documentation to properly reflect its nature as a **TIMETABLING/SCHEDULING SYSTEM** rather than a traditional enrollment system.

---

## 🎯 Key Changes

### 1. Updated Schema Overview (`docs/schema/overview.md`)

**Added:**
- System type declaration at the top explaining SmartSchedule is a timetabling system
- Clear distinction between Pre-Semester Phase (active) and Semester Phase (passive)
- Complete Student Module section with 9 tables properly documented
- Data flow diagrams showing the complete timetabling workflow
- Table purpose matrix explaining when each table is used

**Enhanced:**
- Relationships diagram to show all student-related connections
- RLS policies documentation
- Index specifications for performance

### 2. Created Student Schema Summary (`docs/schema/STUDENT-SCHEMA-SUMMARY.md`)

**New quick reference document including:**
- At-a-glance table purpose matrix
- Complete SQL schemas for all 9 student tables
- Common query patterns for each table
- Integration queries combining multiple tables
- Security (RLS) summary
- Data flow explanation

**Tables Documented:**
1. `students` - Core profile
2. `elective_preferences` - Student input for scheduler
3. `schedules` - Generated timetables (OUTPUT)
4. `enrollment` - Historical records
5. `feedback` - Schedule feedback
6. `irregular_students` - Special cases tracking
7. `student_package_progress` - Package completion tracking
8. `elective_package` - Elective course groups
9. `package_course` - Package-course junction

### 3. Created Timetabling System Guide (`docs/TIMETABLING-SYSTEM-GUIDE.md`)

**Comprehensive guide explaining:**
- What type of system SmartSchedule is (timetabling vs enrollment)
- Complete system timeline (pre-semester → semester → post-semester)
- Data flow (inputs → generator → outputs)
- Common misconceptions and corrections
- When to use each table
- Developer guidelines with code examples
- Real-world scenario walkthrough
- Critical reminders for developers and users

---

## 📊 Student Schema Structure

### Core Architecture

```
users (Auth & Profile)
  └─→ students (1:1) ──┐
                       │
  ┌────────────────────┴────────────────────┐
  │                                         │
  v                                         v
elective_preferences              irregular_students
(Pre-Semester INPUT)              (Special Cases)
  │                                         
  │ ┌──────────────────┐                   
  ├─→ Scheduler Runs  │                   
  │ └──────────────────┘                   
  v                                         
schedules (GENERATED OUTPUT)               
  │                                         
  └─→ Students VIEW (read-only)            
                                            
enrollment (Historical)                    
  └─→ Transcript/GPA                       
                                            
feedback                                   
  └─→ Quality improvement                  
                                            
Package System:                            
  elective_package                         
    ├─→ package_course                     
    └─→ student_package_progress           
```

---

## 🔄 System Phases Clarified

### Pre-Semester (System ACTIVE)

**Purpose:** Collect data and generate schedules

**Activities:**
1. Students submit `elective_preferences` (ranked 1-10)
2. Faculty submit `faculty_availability`
3. Committee assigns sections
4. **SCHEDULER RUNS** → Creates `schedules` for all students
5. Committee reviews conflicts
6. Committee **PUBLISHES** schedules

**Key Tables Modified:**
- `elective_preferences` (student input)
- `schedules` (generated output)
- `section`, `section_time` (scheduler creates)
- `irregular_students` (issues flagged)

### Semester (System PASSIVE)

**Purpose:** Students and faculty view schedules (READ-ONLY)

**Activities:**
1. Students view `schedules` (no modifications)
2. Faculty view teaching `schedules` (no modifications)
3. Students provide `feedback`

**Key Tables Used:**
- `schedules` (read-only viewing)
- `feedback` (student input)

### Post-Semester

**Purpose:** Record historical data

**Activities:**
1. Registrar enters grades → `enrollment`
2. System calculates `student_package_progress`
3. Students advance to next level

**Key Tables Modified:**
- `enrollment` (historical records)
- `student_package_progress` (auto-calculated)
- `students.level` (advancement)

---

## 🔍 Critical Distinctions

### 1. **Preferences vs Enrollment**

| Aspect | `elective_preferences` | Traditional Enrollment |
|--------|------------------------|------------------------|
| **What** | Student's WISHES | Student's REGISTRATION |
| **When** | Before scheduling | During registration |
| **Status** | pending/assigned/rejected | enrolled/dropped |
| **Guaranteed** | No (best effort) | Yes (if available) |
| **Purpose** | INPUT to scheduler | COMMITMENT to take course |

### 2. **Schedules vs Enrollment**

| Aspect | `schedules` | `enrollment` |
|--------|-------------|--------------|
| **What** | Generated timetable | Historical course record |
| **Format** | JSONB (sections, times) | Relational (course, grade) |
| **Phase** | Pre-Semester → Semester | Post-Semester |
| **Access** | Students VIEW only | Registrar manages |
| **Contains** | Current schedule | Past courses + grades |

### 3. **Current vs Historical**

| Table | Current Semester | Historical |
|-------|------------------|------------|
| `schedules` | ✅ Current (is_published) | ❌ Not for history |
| `enrollment` | ❌ Not for current | ✅ Past with grades |
| `elective_preferences` | ✅ Input phase | ❌ Not historical |

---

## 📚 Documentation Files

### Created/Updated:

1. **`docs/schema/overview.md`** (Updated)
   - Added timetabling system explanation
   - Added complete Student Module section
   - Added data flow diagrams
   - 757 lines total

2. **`docs/schema/STUDENT-SCHEMA-SUMMARY.md`** (New)
   - Quick reference for developers
   - All 9 student tables documented
   - Common queries included
   - 450 lines

3. **`docs/TIMETABLING-SYSTEM-GUIDE.md`** (New)
   - Conceptual guide for understanding the system
   - Developer guidelines
   - Common misconceptions addressed
   - Real-world examples
   - 400 lines

---

## 🎯 Key Takeaways for Developers

### When Building Student Features:

1. **Elective Selection Page:**
   - Write to `elective_preferences`
   - Check `term_events` for survey open period
   - Validate against `student_package_progress`

2. **Schedule Viewing Page:**
   - Read from `schedules` WHERE `is_published = true`
   - Parse JSONB data
   - Show read-only (no edit capability)

3. **Transcript/GPA Page:**
   - Read from `enrollment` WHERE `status = 'completed'`
   - Calculate GPA from grades
   - Show historical data only

4. **Feedback Page:**
   - Write to `feedback`
   - Reference `schedule_id` if available
   - Allow updates within feedback period

### When Building Committee Features:

1. **Schedule Generator:**
   - Input: `elective_preferences`, `students`, `faculty_availability`, `courses`
   - Output: `schedules`, `section_time`
   - Update: `elective_preferences.status`

2. **Irregular Students:**
   - Flag in `irregular_students`
   - Don't show to students directly
   - Committee resolves issues

---

## ⚠️ Common Pitfalls to Avoid

### ❌ DON'T:

1. **Build real-time enrollment features** - This is a timetabling system
2. **Let students modify schedules** - Schedules are generated, not built
3. **Use enrollment for current semester** - It's historical data only
4. **Treat preferences as enrollments** - They're input to the generator
5. **Skip the generator algorithm** - Don't manually assign students

### ✅ DO:

1. **Use the schedule generator** - It optimizes for everyone
2. **Collect preferences in advance** - Gives time for generation
3. **Publish schedules before semester** - Students need to see complete schedule
4. **Use JSONB for schedules** - Flexible format for complex data
5. **Implement feedback system** - Improve future generations

---

## 🔧 Next Steps

### Recommended Actions:

1. **Review Components:**
   - Check student portal components align with timetabling model
   - Update any enrollment-like language to preference language
   - Ensure schedule viewing is read-only

2. **Update Types:**
   - Verify TypeScript types match documented schema
   - Add JSDoc comments referencing documentation

3. **Test Scenarios:**
   - Test complete pre-semester workflow
   - Verify schedule generation
   - Test read-only viewing during semester

4. **API Routes:**
   - Review `/api/student/*` routes
   - Ensure they follow timetabling model
   - Check RLS policies are applied correctly

---

## 📖 How to Use This Documentation

### For New Developers:

1. Start with: `TIMETABLING-SYSTEM-GUIDE.md`
2. Then read: `schema/STUDENT-SCHEMA-SUMMARY.md`
3. Deep dive: `schema/overview.md`

### For Experienced Developers:

1. Quick reference: `schema/STUDENT-SCHEMA-SUMMARY.md`
2. Schema details: `schema/overview.md`
3. Conceptual refresh: `TIMETABLING-SYSTEM-GUIDE.md`

### For Understanding Data Flow:

1. System overview: `TIMETABLING-SYSTEM-GUIDE.md` → System Timeline section
2. Schema flow: `schema/overview.md` → Data Flow section
3. Workflows: `system/workflows.md`

---

## ✅ Validation Checklist

- [x] All 9 student tables documented with complete schemas
- [x] RLS policies documented for each table
- [x] Indexes specified for performance
- [x] Data flow diagrams included
- [x] Phase distinctions clearly explained
- [x] Common queries provided
- [x] Integration examples shown
- [x] Misconceptions addressed
- [x] Developer guidelines written
- [x] Real-world examples included

---

## 🎓 Summary

SmartSchedule is now properly documented as a **TIMETABLING/SCHEDULING SYSTEM**:

- **Pre-Semester:** Collect preferences → Run generator → Publish schedules
- **Semester:** Students VIEW schedules (read-only)
- **Post-Semester:** Record grades → Calculate progress

The student schema is designed to support this workflow, not traditional real-time enrollment.

---

*Documentation updated: October 25, 2025*  
*Schema version: 1.0*  
*Next review: Before next major feature*

