# Product Requirements Document: SmartSchedule
**Version:** 2.0  
**Date:** October 26, 2025  
**Status:** Approved  
**Owner:** Product Team  

---

## Executive Summary

### Product Vision
SmartSchedule is an AI-powered academic timetabling platform that transforms the manual, error-prone process of schedule creation into an automated, optimized workflow. By collecting student preferences and faculty availability upfront, our intelligent engine generates fair, conflict-free schedules in minutes—saving weeks of committee work while improving student satisfaction.

### The Problem
Academic scheduling is broken:
- **Committees spend 2-3 weeks** manually building schedules each semester
- **Students face registration stress** with first-come-first-served systems
- **Irregular students fall through the cracks** due to complex requirements
- **Faculty receive unfair load distributions** without transparency
- **Version control is non-existent** leading to communication breakdowns
- **No optimization occurs** resulting in suboptimal room utilization and student experience

### The Solution
SmartSchedule is a **timetabling system** (not a traditional enrollment platform) that:
1. **Collects inputs** (preferences, availability, constraints) before semester starts
2. **Runs AI scheduler** to generate optimal timetables for entire departments
3. **Enables collaboration** for committee review and refinement
4. **Publishes schedules** with version control and stakeholder notifications
5. **Gathers feedback** to improve future iterations

### Target Market
- **Primary:** Small-medium universities (1,000-5,000 students per department)
- **Secondary:** Large universities (department-level pilots)
- **Geography:** Middle East (Arabic/English), expanding to North America

### Success Metrics
- **Time to Schedule:** <3 days (vs. 2-3 weeks baseline)
- **Committee Hours:** 80% reduction in manual work
- **Student Conflicts:** <2% in final published schedules
- **Student Satisfaction (NPS):** >40
- **System Adoption:** >90% of students submit preferences

---

## Table of Contents
1. [Problem Statement](#problem-statement)
2. [User Personas](#user-personas)
3. [User Journeys](#user-journeys)
4. [Functional Requirements](#functional-requirements)
5. [Non-Functional Requirements](#non-functional-requirements)
6. [Technical Architecture](#technical-architecture)
7. [Roadmap & Priorities](#roadmap--priorities)
8. [Success Metrics](#success-metrics)
9. [Risks & Mitigation](#risks--mitigation)
10. [Appendices](#appendices)

---

## 1. Problem Statement

### 1.1 Current State (Manual Scheduling)
Academic departments currently follow this painful process:

**Week 4 Before Semester:**
- Registrar manually counts students per level → Excel sheets
- Committee emails other departments for course slot availability
- Irregular student data gathered via phone calls/WhatsApp
- Data scattered across 5+ communication channels

**Week 3:**
- Committee manually creates Google Forms for elective preferences
- Responses exported to Excel, manually tallied
- No validation of prerequisites or credit limits

**Week 2:**
- Committee builds schedule in Excel/PowerPoint grid
- 20-30 hours of manual slot allocation
- Frequent conflicts discovered after publishing
- Teaching Load Committee reviews via email → endless back-and-forth

**Week 1:**
- Schedule shared as PDF/image via WhatsApp groups
- Students reply with conflicts in unstructured text
- Committee manually tracks feedback in notebooks
- Last-minute changes cause cascading conflicts

**Problems Identified:**
1. **Time Waste:** 40-60 committee hours per semester
2. **Errors:** 15-20% of students report conflicts on first draft
3. **Unfairness:** Popular electives fill up randomly, not by preference
4. **No Traceability:** Changes made without documentation
5. **Communication Chaos:** 100+ WhatsApp messages, lost context
6. **Student Stress:** Uncertainty about schedule until last minute
7. **Faculty Frustration:** Schedules assigned without consultation

### 1.2 Market Gap
Existing solutions fail to address university needs:

| Solution | Why It Fails |
|----------|-------------|
| **Banner/PeopleSoft** | $500K+ cost, 12+ month implementation, designed for large US universities |
| **Excel/Manual** | No automation, error-prone, doesn't scale |
| **Generic Project Tools** | (Trello, Notion) Not purpose-built for scheduling constraints |
| **Ad Astra/CollegeNET** | Enterprise-only, poor UX, no AI optimization |

### 1.3 Opportunity
- **TAM:** 5,000+ universities globally needing scheduling tools
- **SAM:** 500+ universities in MENA region (Arabic support key)
- **SOM:** 50 universities in first 24 months (1% market share)

---

## 2. User Personas

### 2.1 Primary Users

#### Persona 1: Sarah - Scheduling Committee Member
**Demographics:**
- Age: 35-50
- Role: Associate Professor + Committee Chair
- Tech Savvy: Medium (uses email, WhatsApp, basic Excel)

**Goals:**
- Publish conflict-free schedules on time
- Minimize complaints from students/faculty
- Reduce manual work by 80%
- Maintain flexibility for special cases (irregular students)

**Pain Points:**
- Spends 40+ hours/semester on manual scheduling
- Receives 50+ emails/messages about conflicts
- No way to track what changed and why
- Difficult to balance competing constraints (room capacity, faculty preferences, student needs)

**Success Criteria:**
- Schedule published 5 days before semester start
- <5 student complaints after publication
- Can explain reasoning behind any decision

---

#### Persona 2: Ahmed - Computer Science Student (Level 3)
**Demographics:**
- Age: 20-22
- Status: Regular student (on track)
- Tech Savvy: High (uses Discord, GitHub, mobile-first)

**Goals:**
- Get into preferred elective courses
- Have schedule with 1-2 days off per week
- Avoid 8 AM classes if possible
- See schedule early to plan part-time work

**Pain Points:**
- No input into elective selection (feels like lottery)
- Schedule arrives 2 days before semester → can't plan life
- Conflicts discovered too late to fix
- No transparency into why certain courses unavailable

**Success Criteria:**
- Gets top 3 elective choices 80% of the time
- Sees schedule 10+ days before semester
- Zero course conflicts
- Can provide feedback if issues arise

---

#### Persona 3: Dr. Fatima - Faculty Member
**Demographics:**
- Age: 40-55
- Role: Assistant/Associate Professor
- Teaching Load: 9-12 credit hours/semester
- Tech Savvy: Medium

**Goals:**
- Fair teaching load distribution
- Preferred time slots (no 8 AM if possible)
- Consecutive course slots (minimize campus trips)
- Know teaching schedule 2 weeks in advance

**Pain Points:**
- Schedule assigned without consultation
- Sometimes gets unfair load (3 preps vs. colleagues' 2)
- Learns about assignment 3 days before semester
- No way to indicate availability for new courses

**Success Criteria:**
- Provides availability preferences upfront
- Receives draft schedule 2 weeks early
- Can flag conflicts before finalization
- Balanced load compared to peers

---

#### Persona 4: Layla - Teaching Load Committee Member
**Demographics:**
- Age: 35-50
- Role: Senior faculty member
- Tech Savvy: Medium

**Goals:**
- Fair faculty workload distribution
- Match courses to faculty expertise
- Respect faculty preferences when possible
- Coordinate with scheduling committee seamlessly

**Pain Points:**
- Back-and-forth emails with scheduling committee
- No visibility into room/time constraints
- Manual tracking of faculty loads in spreadsheets
- Changes made without notifying both committees

**Success Criteria:**
- Real-time view of proposed schedule
- Ability to comment on assignments
- Dashboard showing load distribution fairness
- Notification when schedules updated

---

#### Persona 5: Omar - Irregular Student (Level 4 with Level 2 courses remaining)
**Demographics:**
- Age: 21-24
- Status: Behind due to failed courses
- Tech Savvy: Medium
- Anxiety: High (fears delayed graduation)

**Goals:**
- Complete remaining old courses + current level courses
- Graduate within 1-2 extra semesters
- Clear plan for course completion
- Avoid schedule conflicts between levels

**Pain Points:**
- Manually tracked by registrar (error-prone)
- Schedule built for regular students doesn't fit
- Discovers conflicts after schedule published
- No visibility into graduation path

**Success Criteria:**
- Registrar enters requirements correctly
- System generates conflict-free schedule
- Can see course completion roadmap
- Priority given to required courses

---

### 2.2 Secondary Users

#### Persona 6: Registrar
- **Role:** Data entry, grade management, student records
- **Goals:** Accurate irregular student tracking, easy data entry
- **Pain Points:** Manual data entry, no validation, unclear deadlines

#### Persona 7: Department Head
- **Role:** Final approval, strategic oversight
- **Goals:** High-level visibility, compliance with university rules
- **Pain Points:** No dashboard, learns about issues after publication

---

## 3. User Journeys

### 3.1 Student Journey: Elective Preference Submission

**Trigger:** Notification 3 weeks before semester  
**Goal:** Successfully submit ranked elective preferences  

```
┌─────────────────────────────────────────────────────────────┐
│ Week 3 Before Semester                                       │
└─────────────────────────────────────────────────────────────┘

1. Student receives email/SMS notification
   ├─ "Elective preference survey now open"
   └─ Deadline: 10 days to complete

2. Student logs into SmartSchedule
   ├─ Dashboard shows "Action Required" banner
   └─ Click "Submit Elective Preferences"

3. System displays available electives
   ├─ Filters by level and prerequisites
   ├─ Shows course descriptions, credit hours
   ├─ Indicates expected availability (e.g., "2 sections planned")
   └─ AI Recommendation: "Based on your GPA and interests, consider..."

4. Student ranks electives (drag-and-drop)
   ├─ Must rank at least 5 options
   ├─ Real-time validation: "You need 1 more humanities elective"
   └─ Save draft (auto-save every 30 seconds)

5. Student submits preferences
   ├─ Confirmation modal: "You ranked X as #1. Confirm?"
   ├─ Email confirmation sent
   └─ Can edit until deadline

┌─────────────────────────────────────────────────────────────┐
│ Week 1 Before Semester                                       │
└─────────────────────────────────────────────────────────────┘

6. Student receives notification: "Draft schedule ready"
   └─ Click to view generated schedule

7. Student views schedule (read-only)
   ├─ Calendar grid view with course details
   ├─ Shows: Got 3/5 top elective choices
   └─ Option to "Report Conflict" or "Provide Feedback"

8. [If conflict] Student submits feedback
   ├─ Describes issue: "Two courses overlap on Sunday 10 AM"
   ├─ Committee reviews and may adjust
   └─ Student notified of resolution

9. Final schedule published
   ├─ Student receives notification
   ├─ Downloads PDF and adds to calendar (iCal export)
   └─ Journey complete ✓
```

**Success Metrics:**
- 90%+ students complete survey before deadline
- 80%+ students satisfied with elective assignments
- <2% report conflicts after publication

---

### 3.2 Committee Journey: Schedule Generation & Publication

**Trigger:** Academic calendar deadline approaching  
**Goal:** Publish optimized, conflict-free schedule on time  

```
┌─────────────────────────────────────────────────────────────┐
│ Week 4 Before Semester: Setup Phase                         │
└─────────────────────────────────────────────────────────────┘

1. Committee receives automated reminder
   └─ "Start scheduling process for [Term Code]"

2. Committee member logs in → Dashboard
   ├─ Shows: Current phase "Setup"
   ├─ Checklist: 
   │   ☐ Enter student enrollment counts
   │   ☐ Collect irregular student data
   │   ☐ Enter external course constraints
   │   ☐ Configure scheduling rules
   └─ Progress bar: 0/4 tasks complete

3. Enter enrollment data
   ├─ Upload CSV from Edugate OR manual entry
   ├─ System calculates ideal section count
   │   Example: 125 Level 3 students ÷ 25 per section = 5 sections
   ├─ Committee can override (e.g., make it 4 sections)
   └─ Task marked complete ✓

4. Notify registrar to enter irregular students
   ├─ Click "Request Irregular Student Data"
   ├─ Registrar receives notification + deadline
   └─ System tracks completion

5. Registrar enters irregular student details
   ├─ Search student by ID
   ├─ Select remaining courses from past levels
   ├─ Select current level courses
   ├─ System validates prerequisites
   └─ Submit (visible to committee)

6. Enter external constraints
   ├─ "CS111 offered by CS dept: Sun/Tue 10-11:30 AM"
   ├─ "Math courses: Mon/Wed 12-2 PM"
   └─ System blocks these slots for SWE scheduling

7. Review/modify scheduling rules
   ├─ View existing rules:
   │   • No classes during 12-1 PM (break time)
   │   • Electives should accommodate multiple levels
   │   • 2-hour labs must be continuous blocks
   ├─ Add new rule: "Reserve Mon/Wed 12-2 PM for midterms"
   ├─ Uses real-time collaboration (Yjs)
   │   → Multiple committee members can edit simultaneously
   └─ Save rules

┌─────────────────────────────────────────────────────────────┐
│ Week 3 Before Semester: Preference Collection               │
└─────────────────────────────────────────────────────────────┘

8. Launch student elective survey
   ├─ Click "Open Preference Survey"
   ├─ System sends notifications to all eligible students
   └─ Dashboard shows real-time completion rate: "45/120 students (37%)"

9. Send reminder notifications
   ├─ Automated: 3 days before deadline
   ├─ Manual: "Send Reminder" button
   └─ Track who hasn't submitted

10. Launch faculty availability survey
    ├─ Faculty indicate preferred days/times
    ├─ Dashboard shows: "8/12 faculty completed"
    └─ Deadline: 7 days

┌─────────────────────────────────────────────────────────────┐
│ Week 2 Before Semester: Schedule Generation                 │
└─────────────────────────────────────────────────────────────┘

11. Review collected data
    ├─ Student preferences: 95% completion ✓
    ├─ Faculty availability: 100% completion ✓
    ├─ Irregular students: 12 students entered ✓
    └─ Ready to generate schedule

12. Configure scheduler parameters
    ├─ Optimization priorities (drag to reorder):
    │   1. Satisfy irregular student requirements
    │   2. Maximize student elective preferences
    │   3. Respect faculty availability
    │   4. Minimize room conflicts
    │   5. Balance day-off distribution
    └─ Advanced settings: "Allow 8 AM classes: Yes/No"

13. Run AI scheduler
    ├─ Click "Generate Schedule"
    ├─ Progress indicator: "Processing 120 students, 45 courses..."
    ├─ Wait time: 2-5 minutes
    └─ System outputs:
        • Generated schedule (calendar view)
        • Statistics dashboard
        • Conflict report (if any)

14. Review generated schedule
    ├─ Calendar view: All sections, times, rooms, instructors
    ├─ Statistics:
    │   • 85% of students got top 3 elective choices
    │   • 0 hard conflicts detected
    │   • 3 soft conflicts (warnings)
    ├─ Drill down by:
    │   • Level → See each student group's schedule
    │   • Course → See all sections, enrollment
    │   • Room → See utilization rate
    │   • Faculty → See teaching load
    └─ AI Insights: "Room E201 overbooked on Sunday 10 AM"

15. Collaborate with Teaching Load Committee
    ├─ Click "Share with Load Committee"
    ├─ Load Committee members receive notification
    ├─ They review faculty assignments
    ├─ Real-time comments (Yjs):
    │   "Dr. Ali has 3 preps, can we consolidate?"
    ├─ Committee responds or adjusts
    └─ Version auto-saved every change

16. [If needed] Adjust schedule manually
    ├─ Drag-and-drop to move section to different slot
    ├─ System warns: "This creates conflict with CS111"
    ├─ Committee resolves conflict
    └─ Re-run optimizer: "Optimize around my changes"

17. Publish draft schedule to students
    ├─ Click "Publish Draft"
    ├─ Status changes: "Setup" → "Draft Published"
    ├─ All students receive notification
    ├─ Students can view schedule + submit feedback
    └─ Feedback window: 5 days

┌─────────────────────────────────────────────────────────────┐
│ Week 1 Before Semester: Finalization                        │
└─────────────────────────────────────────────────────────────┘

18. Review student feedback
    ├─ Dashboard shows: "8 feedback items received"
    ├─ Filter by: Conflicts vs. Preferences
    ├─ Priority issues:
    │   🔴 Hard conflict: "Two courses overlap" (3 students)
    │   🟡 Soft issue: "Prefer different time" (5 students)
    └─ Assign to committee members to investigate

19. Resolve conflicts
    ├─ Investigate: Student "Ahmad123" has CS301 + SWE302 at same time
    ├─ Options:
    │   a) Move student to different section
    │   b) Adjust section time slot
    │   c) Mark as exception (manual resolution)
    ├─ Choose option + document reason
    └─ Notify student: "We've moved you to Section 2"

20. Generate final version
    ├─ Click "Generate Final Schedule"
    ├─ System creates Version 3.0
    ├─ Version history shows:
    │   v1.0 - Initial generation (Oct 20)
    │   v2.0 - After Load Committee feedback (Oct 22)
    │   v3.0 - After student feedback (Oct 24) ← FINAL
    └─ Diff view shows what changed between versions

21. Publish final schedule
    ├─ Click "Publish Final"
    ├─ Confirmation modal: "This will notify 120 students. Confirm?"
    ├─ Status changes: "Draft" → "Published"
    ├─ All stakeholders receive notification:
    │   • Students: "Your final schedule is ready"
    │   • Faculty: "Your teaching assignments confirmed"
    │   • Registrar: "Schedule locked for term [code]"
    └─ Schedule becomes read-only (edits require approval)

22. Monitor post-publication
    ├─ Dashboard shows adoption metrics:
    │   • 98% students viewed schedule
    │   • 2 late conflicts reported
    │   • NPS score: 42 (good!)
    └─ Journey complete ✓
```

**Success Metrics:**
- Schedule published within 3-day target
- <10 feedback items requiring action
- 80%+ committee satisfaction with process
- Zero major conflicts after publication

---

### 3.3 Faculty Journey: Availability Submission & Schedule Review

```
┌─────────────────────────────────────────────────────────────┐
│ Week 3 Before Semester                                       │
└─────────────────────────────────────────────────────────────┘

1. Faculty receives notification
   └─ "Submit your availability for [Term]"

2. Faculty logs in → Dashboard
   ├─ Shows: "Action Required"
   └─ Click "Set Availability"

3. Faculty indicates availability
   ├─ Grid view: Days × Time slots
   ├─ Mark preferences:
   │   🟢 Preferred times
   │   🟡 Available if needed
   │   🔴 Unavailable
   ├─ Add notes: "Prefer no 8 AM classes (childcare)"
   └─ Submit

┌─────────────────────────────────────────────────────────────┐
│ Week 1 Before Semester                                       │
└─────────────────────────────────────────────────────────────┘

4. Faculty receives draft schedule notification
   └─ "Your teaching assignments are ready for review"

5. Faculty views schedule
   ├─ Courses assigned: CS301 (2 sections), CS401 (1 section)
   ├─ Total load: 9 credit hours ✓ (matches contract)
   ├─ Time slots: Mostly preferred times ✓
   └─ Compare with colleagues: Load distribution fair ✓

6. [If issue] Faculty submits feedback
   ├─ "CS301 Section 1 overlaps with my research meeting"
   └─ Committee reviews and adjusts

7. Faculty receives final schedule
   ├─ Export to personal calendar
   └─ Journey complete ✓
```

---

## 4. Functional Requirements

### 4.1 Priority Framework (MoSCoW Method)

- **MUST HAVE (P0):** Core features blocking MVP launch
- **SHOULD HAVE (P1):** Important for user satisfaction
- **COULD HAVE (P2):** Nice-to-have enhancements
- **WON'T HAVE (P3):** Out of scope for v1.0

---

### 4.2 Core Features (P0 - MUST HAVE)

#### FR-001: Multi-User Authentication & Authorization
**Description:** Secure login system with role-based access control

**User Stories:**
- As a **student**, I want to log in with my university credentials so that I can access my schedule securely
- As a **committee member**, I want different permissions than students so that I can manage schedules
- As a **system admin**, I want to assign roles to users so that access is properly controlled

**Acceptance Criteria:**
- ✅ User can register with email + password
- ✅ User can log in and session persists for 7 days
- ✅ Role-based dashboard redirects (student → `/student`, committee → `/committee`)
- ✅ RLS policies enforce data access by role
- ✅ Password reset via email
- ✅ Support for university SSO (future enhancement)

**Technical Details:**
- Supabase Auth with RLS
- Roles: `student`, `faculty`, `scheduling_committee`, `teaching_load_committee`, `registrar`, `admin`
- Session management via cookies (httpOnly)

**Dependencies:** Supabase setup
**Estimate:** 5 days (COMPLETE ✓)

---

#### FR-002: Student Elective Preference Survey
**Description:** Interface for students to rank elective course preferences

**User Stories:**
- As a **student**, I want to rank my elective preferences so that the system assigns courses I'm interested in
- As a **student**, I want to see course descriptions so that I can make informed choices
- As a **student**, I want to save drafts so that I don't lose my progress

**Acceptance Criteria:**
- ✅ Student sees list of eligible electives based on level and prerequisites
- ✅ Drag-and-drop interface to rank courses (1-10)
- ✅ Shows course details: code, name, description, credit hours, expected availability
- ✅ Validation: Must rank minimum 5 courses
- ✅ Validation: Must meet package requirements (e.g., 1 humanities elective)
- ✅ Auto-save every 30 seconds
- ✅ Can edit until deadline
- ✅ Confirmation email after submission
- ✅ Mobile-responsive design

**UI Mockup:**
```
┌─────────────────────────────────────────────────────────┐
│ Elective Preference Survey - Spring 2025               │
│ Deadline: March 1, 2025                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Available Electives (Drag to rank)                     │
│                                                         │
│ ┌─ Your Rankings ────────────────────────────────────┐ │
│ │ 1. 🔵 CS401 - Machine Learning (3 credits)        │ │
│ │ 2. 🔵 CS402 - Computer Vision (3 credits)         │ │
│ │ 3. 🟢 HUM301 - Philosophy of Tech (2 credits)     │ │
│ │ 4. [Drop here to add]                             │ │
│ └───────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Unranked Courses ─────────────────────────────────┐ │
│ │ • CS403 - Blockchain (3 credits)                  │ │
│ │   Expected: 2 sections available                  │ │
│ │ • CS404 - Game Dev (3 credits)                    │ │
│ │ • SWE401 - DevOps (3 credits)                     │ │
│ └───────────────────────────────────────────────────┘ │
│                                                         │
│ ℹ️ You need at least 1 humanities elective            │
│                                                         │
│ [Save Draft]  [Submit Preferences]                     │
└─────────────────────────────────────────────────────────┘
```

**Technical Details:**
- Database: `elective_preferences` table
- Frontend: React DnD or dnd-kit library
- Validation: Server-side + client-side
- API: `POST /api/students/preferences`

**Dependencies:** Course catalog loaded, academic term configured
**Estimate:** 8 days

---

#### FR-003: Faculty Availability Submission
**Description:** Interface for faculty to indicate teaching availability

**User Stories:**
- As a **faculty member**, I want to indicate my preferred teaching times so that my schedule aligns with personal commitments
- As a **faculty member**, I want to add notes about constraints so that the committee understands my needs

**Acceptance Criteria:**
- ✅ Faculty sees weekly grid (Sun-Thu, 8 AM-5 PM in 1-hour slots)
- ✅ Can mark each slot: Preferred / Available / Unavailable
- ✅ Can add text notes (e.g., "Childcare pickup at 3 PM")
- ✅ Can indicate maximum teaching load preference
- ✅ Can save draft and edit until deadline
- ✅ Confirmation after submission

**UI Mockup:**
```
┌────────────────────────────────────────────────────────────┐
│ Faculty Availability - Spring 2025                         │
│ Dr. Fatima Al-Hamadi | Deadline: March 1, 2025            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│     Sun    Mon    Tue    Wed    Thu                       │
│ 8   🟢     🟢     🟢     🟢     🔴                         │
│ 9   🟢     🟢     🟢     🟢     🟢                         │
│ 10  🟢     🟡     🟢     🟡     🟢                         │
│ 11  🟢     🟢     🟢     🟢     🟢                         │
│ 12  🔴     🔴     🔴     🔴     🔴 (Lunch break)           │
│ 1   🟡     🟢     🟡     🟢     🟢                         │
│ 2   🟡     🟢     🟡     🟢     🟢                         │
│ 3   🔴     🟡     🔴     🟡     🔴 (Childcare pickup)      │
│ 4   🔴     🔴     🔴     🔴     🔴                         │
│                                                            │
│ 🟢 Preferred  🟡 Available if needed  🔴 Unavailable       │
│                                                            │
│ Additional Notes:                                          │
│ ┌────────────────────────────────────────────────────┐   │
│ │ I prefer morning classes. Thursdays I have faculty│   │
│ │ meetings at 8 AM, so please avoid that time.      │   │
│ └────────────────────────────────────────────────────┘   │
│                                                            │
│ [Save Draft]  [Submit Availability]                       │
└────────────────────────────────────────────────────────────┘
```

**Technical Details:**
- Database: `faculty_availability` table
- Storage: JSONB for grid data
- API: `POST /api/faculty/availability`

**Dependencies:** Academic term configured
**Estimate:** 6 days

---

#### FR-004: Irregular Student Management
**Description:** System for registrar to enter special student requirements

**User Stories:**
- As a **registrar**, I want to enter irregular student course requirements so that the scheduler accounts for them
- As a **registrar**, I want to search for students easily so that data entry is fast

**Acceptance Criteria:**
- ✅ Registrar can search student by ID or name
- ✅ Can select courses from past levels student still needs
- ✅ Can select current level courses student should take
- ✅ System validates prerequisites
- ✅ System flags if total credits exceed maximum
- ✅ Can mark student as "priority" for scheduling
- ✅ Committee can view list of all irregular students

**Technical Details:**
- Database: `irregular_students` table (already exists)
- Validation: Check `course` table for prerequisites
- API: `POST /api/registrar/irregular-students`

**Dependencies:** Student and course data loaded
**Estimate:** 5 days

---

#### FR-005: AI Schedule Generator (CRITICAL)
**Description:** Automated constraint solver that generates optimal schedules

**User Stories:**
- As a **committee member**, I want to generate schedules automatically so that I save 80% of manual work
- As a **committee member**, I want the system to respect all rules so that schedules are valid
- As a **committee member**, I want to see why certain decisions were made so that I can trust the system

**Acceptance Criteria:**
- ✅ Input: Student preferences, faculty availability, irregular students, rules, constraints
- ✅ Algorithm considers:
  - Hard constraints (MUST be satisfied):
    • No student has overlapping courses
    • All irregular students get required courses
    • Course sections don't exceed room capacity
    • Faculty don't teach overlapping sections
    • Reserved time slots respected (lunch, midterms)
  - Soft constraints (SHOULD be optimized):
    • Maximize student elective preference satisfaction
    • Respect faculty availability preferences
    • Balance day-off distribution
    • Minimize room changes for students
    • Schedule electives early morning or late afternoon
- ✅ Output: Complete schedule with sections, times, rooms, instructor assignments
- ✅ Generates conflict report if any hard constraints violated
- ✅ Statistics: % of students satisfied, room utilization, load distribution
- ✅ Processing time: <5 minutes for 500 students
- ✅ Explainability: "Student X got course Y because they ranked it #1 and section had space"

**Algorithm Options:**

**Option A: Constraint Satisfaction Problem (CSP) Solver**
- Tool: Google OR-Tools (open source)
- Pros: Fast, proven, handles complex constraints
- Cons: Requires Python backend, learning curve

**Option B: AI API Integration**
- Tool: OpenAI GPT-4 with function calling or Claude
- Pros: Natural language rule input, easy iteration
- Cons: API costs, less deterministic, slower

**Option C: Genetic Algorithm (Custom)**
- Pros: Full control, optimized for specific needs
- Cons: Long development time (4+ weeks)

**RECOMMENDATION: Start with Option A (OR-Tools), add Option B for rule suggestions**

**Technical Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│ Frontend (Next.js)                                      │
│ ┌───────────────────────────────────────────────────┐   │
│ │ Committee clicks "Generate Schedule"              │   │
│ │ ↓                                                 │   │
│ │ POST /api/scheduler/generate                      │   │
│ └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ Next.js API Route                                       │
│ ┌───────────────────────────────────────────────────┐   │
│ │ 1. Fetch all inputs from Supabase                │   │
│ │ 2. Format data for scheduler                     │   │
│ │ 3. Call Python scheduler service                 │   │
│ │ 4. Parse results                                 │   │
│ │ 5. Store schedule in `schedules` table (JSONB)   │   │
│ │ 6. Return statistics to frontend                 │   │
│ └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ Python Scheduler Service (FastAPI)                     │
│ ┌───────────────────────────────────────────────────┐   │
│ │ from ortools.sat.python import cp_model           │   │
│ │                                                   │   │
│ │ 1. Parse constraints                             │   │
│ │ 2. Create CP-SAT model                           │   │
│ │ 3. Add variables (section assignments)           │   │
│ │ 4. Add constraints (no overlaps, etc.)           │   │
│ │ 5. Solve (timeout: 300 seconds)                  │   │
│ │ 6. Return optimal schedule                       │   │
│ └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Dependencies:** 
- All preference/availability data collected
- Rules configured
- Python environment set up

**Estimate:** 15 days (BLOCKING MVP)

---

#### FR-006: Schedule Viewing (Students & Faculty)
**Description:** Read-only calendar view of generated schedules

**User Stories:**
- As a **student**, I want to view my schedule in a calendar format so that I understand my weekly routine
- As a **student**, I want to export my schedule so that I can add it to my personal calendar
- As a **faculty member**, I want to view my teaching schedule so that I know my commitments

**Acceptance Criteria:**
- ✅ Calendar view: Weekly grid showing courses
- ✅ Each course block shows: Code, name, time, room, instructor
- ✅ Color-coded by course type (required vs elective)
- ✅ List view alternative for accessibility
- ✅ Export options: PDF, iCal, CSV
- ✅ Print-friendly layout
- ✅ Only shows published schedules (not drafts)

**UI Mockup:**
```
┌──────────────────────────────────────────────────────────┐
│ My Schedule - Spring 2025                                │
│ Ahmad Al-Rashid | Level 3 | 16 Credit Hours             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ 🔵 Required  🟢 Elective  🟡 Lab                         │
│                                                          │
│     Sun       Mon       Tue       Wed       Thu         │
│ 8   🔵CS301   -----     🔵CS301   -----     -----       │
│     E201      -----     E201      -----     -----       │
│ 9   🔵CS301   🟢HUM301  🔵CS301   🟢HUM301  -----       │
│     E201      B103      E201      B103      -----       │
│ 10  🟡CS301L  🔵SWE302  -----     🔵SWE302  🟡CS302L    │
│     Lab A     E301      -----     E301      Lab B       │
│ 11  🟡CS301L  🔵SWE302  -----     🔵SWE302  🟡CS302L    │
│     Lab A     E301      -----     E301      Lab B       │
│ 12  ----- LUNCH BREAK -----                             │
│ 1   🔵MATH301 -----     🔵MATH301 -----     -----       │
│     E101      -----     E101      -----     -----       │
│ 2   -----     🔵CS302   -----     🔵CS302   -----       │
│     -----     E202      -----     E202      -----       │
│                                                          │
│ [Export to iCal] [Download PDF] [Print]                 │
└──────────────────────────────────────────────────────────┘
```

**Technical Details:**
- Database: Read from `schedules` table (JSONB)
- Frontend: FullCalendar.js or custom grid
- Export: iCal library, PDF via jsPDF

**Dependencies:** Schedule generated and published
**Estimate:** 6 days

---

#### FR-007: Committee Dashboard
**Description:** Central control panel for scheduling committee

**User Stories:**
- As a **committee member**, I want a dashboard showing current status so that I know what needs attention
- As a **committee member**, I want to see progress metrics so that I can report to leadership

**Acceptance Criteria:**
- ✅ Shows current scheduling phase (Setup / Preferences / Generation / Review / Published)
- ✅ Checklist of tasks with completion status
- ✅ Real-time metrics:
  - Student preference survey completion: 85/120 (71%)
  - Faculty availability completion: 10/12 (83%)
  - Irregular students entered: 12
- ✅ Quick actions: "Send Reminder", "Generate Schedule", "Publish Draft"
- ✅ Recent activity feed: "Dr. Ali submitted availability 2 hours ago"
- ✅ Deadline countdown: "5 days until schedule must be published"

**UI Mockup:**
```
┌──────────────────────────────────────────────────────────┐
│ Scheduling Dashboard - Spring 2025                       │
│ Current Phase: 📊 Preference Collection                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ⏰ Deadline: March 5, 2025 (5 days remaining)            │
│                                                          │
│ ┌─ Setup Phase ──────────────────────────────────────┐  │
│ │ ✅ Enrollment data entered                         │  │
│ │ ✅ Irregular students: 12 entered                  │  │
│ │ ✅ External constraints configured                 │  │
│ │ ✅ Scheduling rules reviewed                       │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌─ Preference Collection (Current) ──────────────────┐  │
│ │ 📊 Student Preferences: 85/120 completed (71%)     │  │
│ │    [████████████░░░░░░░░] [Send Reminder]          │  │
│ │                                                    │  │
│ │ 📊 Faculty Availability: 10/12 completed (83%)     │  │
│ │    [██████████████░░░░░░] [Send Reminder]          │  │
│ │                                                    │  │
│ │ ⚠️ Missing: Dr. Ahmad, Dr. Layla                   │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌─ Recent Activity ───────────────────────────────────┐ │
│ │ • Dr. Fatima submitted availability (2h ago)       │ │
│ │ • 15 students completed survey (4h ago)            │ │
│ │ • Registrar updated irregular student data (1d)    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ [View All Students] [View Rules] [Generate Schedule]    │
└──────────────────────────────────────────────────────────┘
```

**Technical Details:**
- Real-time data from Supabase
- Use React Query for auto-refresh
- Charts: Recharts or Chart.js

**Dependencies:** Core features implemented
**Estimate:** 5 days

---

#### FR-008: Schedule Publication Workflow
**Description:** Status management for schedule lifecycle

**User Stories:**
- As a **committee member**, I want to publish drafts for feedback so that I can iterate before finalizing
- As a **committee member**, I want to control who sees what version so that incomplete work isn't shared

**Acceptance Criteria:**
- ✅ Schedule has states: `draft`, `published_draft`, `final`, `archived`
- ✅ Only `published_draft` and `final` visible to students
- ✅ Transitions require confirmation modal
- ✅ Notification sent to all stakeholders on state change
- ✅ Can roll back to previous version if needed
- ✅ Audit log tracks who published and when

**State Machine:**
```
     draft
       ↓
[Publish Draft] → published_draft
       ↓                ↓
[Publish Final] →    final
       ↓                ↓
[Archive] →         archived
```

**Technical Details:**
- Database: `status` column in `schedules` table
- Add `published_at`, `published_by` columns
- API: `POST /api/scheduler/publish`

**Dependencies:** Schedule generation
**Estimate:** 3 days

---

#### FR-009: Basic Conflict Detection
**Description:** Automated validation of schedule integrity

**User Stories:**
- As a **committee member**, I want the system to detect conflicts so that I don't publish broken schedules

**Acceptance Criteria:**
- ✅ Detects hard conflicts:
  - Student has overlapping courses
  - Faculty teaches overlapping sections
  - Room double-booked
  - Section exceeds room capacity
- ✅ Displays conflict report before publication
- ✅ Blocks publication if hard conflicts exist
- ✅ Warns about soft issues (doesn't block)

**Technical Details:**
- Server-side validation function
- Runs before publish action
- Returns structured error list

**Dependencies:** Schedule data model
**Estimate:** 4 days

---

#### FR-010: Notification System
**Description:** Email/SMS alerts for key events

**User Stories:**
- As a **student**, I want to be notified when schedules are published so that I see them promptly
- As a **committee member**, I want to send reminders so that deadlines are met

**Acceptance Criteria:**
- ✅ Automated notifications:
  - Survey deadline approaching (3 days before)
  - Draft schedule published
  - Final schedule published
- ✅ Manual notifications:
  - Committee can send custom messages to groups
- ✅ Notification channels: Email (required), SMS (optional)
- ✅ User can configure preferences (email only, both, etc.)
- ✅ Notification history/log

**Technical Details:**
- Service: SendGrid or Resend for email
- Twilio for SMS (future)
- Database: `notifications` table for history

**Dependencies:** User management
**Estimate:** 4 days

---

### 4.3 Important Features (P1 - SHOULD HAVE)

#### FR-011: Real-Time Collaboration on Rules
**Description:** Multiple committee members can edit rules simultaneously

**User Stories:**
- As a **committee member**, I want to see changes other members make in real-time so that we don't overwrite each other's work

**Acceptance Criteria:**
- ✅ Uses Yjs for CRDT synchronization
- ✅ Shows active users' cursors/selections
- ✅ Conflict-free merging of edits
- ✅ Works on: Scheduling rules, constraint configuration
- ✅ Auto-saves every 10 seconds
- ✅ User presence indicators

**Technical Stack:**
- Yjs + y-websocket
- WebSocket server (Next.js API route or separate)
- Store documents in `y-indexeddb` + Supabase backup

**Dependencies:** WebSocket server setup
**Estimate:** 10 days

---

#### FR-012: Version Control System
**Description:** Track all changes to schedules over time

**User Stories:**
- As a **committee member**, I want to see what changed between versions so that I can track decisions
- As a **committee member**, I want to roll back to a previous version if needed

**Acceptance Criteria:**
- ✅ Every save creates new version (auto-increment)
- ✅ Version metadata: timestamp, author, description
- ✅ Diff view shows added/removed/changed sections
- ✅ Can compare any two versions
- ✅ Can restore previous version (creates new version, doesn't delete history)
- ✅ Visual diff: Green for added, red for removed, yellow for modified

**UI Mockup:**
```
┌──────────────────────────────────────────────────────────┐
│ Version History - Spring 2025 Schedule                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ┌─ Version 3.0 (Current) ─────────────────────────────┐ │
│ │ Published: Oct 24, 2025 10:30 AM                    │ │
│ │ By: Dr. Sarah Al-Mansour                            │ │
│ │ Changes: Resolved 3 student conflicts               │ │
│ │ [View] [Compare]                                    │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─ Version 2.0 ────────────────────────────────────────┐ │
│ │ Published: Oct 22, 2025 3:15 PM                     │ │
│ │ By: Dr. Sarah Al-Mansour                            │ │
│ │ Changes: Adjusted based on Load Committee feedback  │ │
│ │ [View] [Compare] [Restore]                          │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─ Version 1.0 ────────────────────────────────────────┐ │
│ │ Published: Oct 20, 2025 11:00 AM                    │ │
│ │ By: System (Auto-generated)                         │ │
│ │ Changes: Initial schedule generation                │ │
│ │ [View] [Compare] [Restore]                          │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘

Comparing v2.0 → v3.0:
┌──────────────────────────────────────────────────────────┐
│ Changes Summary:                                         │
│ + Added: Student Ahmad123 moved to CS301 Section 2      │
│ - Removed: Student Ahmad123 from CS301 Section 1        │
│ ~ Modified: CS301 Section 2 enrollment: 24 → 25         │
└──────────────────────────────────────────────────────────┘
```

**Technical Details:**
- Library: jsondiffpatch
- Database: Store full schedule JSONB in `schedule_versions` table
- Compute diff on-demand (don't store diffs)

**Dependencies:** Schedule data model
**Estimate:** 8 days

---

#### FR-013: Analytics Dashboard (Committee)
**Description:** Visualizations for schedule quality metrics

**User Stories:**
- As a **committee member**, I want to see statistics about schedule quality so that I can optimize

**Acceptance Criteria:**
- ✅ Charts (Chart.js):
  - Elective satisfaction rate (bar chart)
  - Room utilization per time slot (heatmap)
  - Faculty load distribution (histogram)
  - Day-off distribution (pie chart)
  - Preference ranking achieved (stacked bar)
- ✅ Can filter by: Level, course type, day
- ✅ Can export data as CSV
- ✅ Comparison with previous semesters

**UI Mockup:**
```
┌──────────────────────────────────────────────────────────┐
│ Schedule Analytics - Spring 2025                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ┌─ Elective Satisfaction ──────────────────────────────┐ │
│ │                                                      │ │
│ │  100% ┤                                             │ │
│ │   80% ┤ ████████████                                │ │
│ │   60% ┤ ████████████ ███████████                    │ │
│ │   40% ┤ ████████████ ███████████ ████████           │ │
│ │   20% ┤ ████████████ ███████████ ████████ ███       │ │
│ │    0% └──────────────────────────────────────────   │ │
│ │         1st Choice  2nd Choice  3rd  4th  5th+      │ │
│ │                                                      │ │
│ │  62% got 1st choice | 83% got top 3 choices         │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─ Room Utilization Heatmap ───────────────────────────┐ │
│ │      Sun   Mon   Tue   Wed   Thu                    │ │
│ │  8   🟢    🟡    🟢    🟡    ⚪                     │ │
│ │  9   🔴    🟢    🔴    🟢    🟡                     │ │
│ │ 10   🔴    🔴    🟢    🔴    🟢                     │ │
│ │ 11   🟢    🔴    🟢    🔴    🟡                     │ │
│ │  1   🟡    🟢    🟡    🟢    🟢                     │ │
│ │  2   🟢    🟡    🟢    🟡    ⚪                     │ │
│ │                                                      │ │
│ │ 🔴 >80% full  🟡 50-80%  🟢 <50%  ⚪ Empty          │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ [Export CSV] [Compare with Fall 2024]                   │
└──────────────────────────────────────────────────────────┘
```

**Technical Details:**
- Chart.js for visualizations
- Aggregate queries on schedule data
- Server-side calculations for performance

**Dependencies:** Schedule generated
**Estimate:** 7 days

---

#### FR-014: Student Feedback Collection
**Description:** Interface for students to report issues with published schedules

**User Stories:**
- As a **student**, I want to report conflicts so that the committee can fix them before finalization

**Acceptance Criteria:**
- ✅ Student can submit feedback with categories:
  - 🔴 Hard conflict (two courses overlap)
  - 🟡 Preference issue (didn't get desired elective)
  - 🔵 Other feedback
- ✅ Can attach screenshots
- ✅ Committee sees feedback in dashboard
- ✅ Can mark feedback as resolved
- ✅ Student notified when issue addressed

**UI Mockup (Student):**
```
┌──────────────────────────────────────────────────────────┐
│ Report Schedule Issue                                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Issue Type:                                              │
│ ( ) Hard Conflict - Two courses overlap                 │
│ ( ) Preference Issue - Didn't get desired elective      │
│ (•) Other Feedback                                       │
│                                                          │
│ Description:                                             │
│ ┌────────────────────────────────────────────────────┐  │
│ │ I have a part-time job on Sundays at 2 PM. Is it  │  │
│ │ possible to move my CS301 section to a different  │  │
│ │ day?                                               │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ Attach Screenshot (optional):                            │
│ [Upload File]                                            │
│                                                          │
│ [Cancel] [Submit Feedback]                               │
└──────────────────────────────────────────────────────────┘
```

**Technical Details:**
- Database: `feedback` table (already exists)
- File upload: Supabase Storage
- API: `POST /api/students/feedback`

**Dependencies:** Schedule viewing
**Estimate:** 5 days

---

#### FR-015: Manual Schedule Adjustment Tools
**Description:** Committee can manually tweak generated schedules

**User Stories:**
- As a **committee member**, I want to manually move a student to a different section so that I can handle edge cases

**Acceptance Criteria:**
- ✅ Can drag-and-drop students between sections
- ✅ Can drag-and-drop sections to different time slots
- ✅ System warns if change creates conflict
- ✅ Can override warnings with documented reason
- ✅ Changes logged in version history
- ✅ Can re-run optimizer after manual changes

**Technical Details:**
- Interactive grid UI (React DnD)
- Validation runs on every change
- API: `PATCH /api/scheduler/manual-adjustment`

**Dependencies:** Schedule generation
**Estimate:** 10 days

---

#### FR-016: Faculty Load Dashboard
**Description:** Teaching Load Committee view of faculty assignments

**User Stories:**
- As a **load committee member**, I want to see all faculty loads so that I can ensure fairness

**Acceptance Criteria:**
- ✅ Table view of all faculty with:
  - Name
  - Courses assigned
  - Total credit hours
  - Number of preparations (distinct courses)
  - Office hours requirement
- ✅ Sort by: Load, number of preps, name
- ✅ Highlight: Over/under contract load
- ✅ Comparison with previous semester
- ✅ Export to Excel

**UI Mockup:**
```
┌──────────────────────────────────────────────────────────┐
│ Faculty Load Distribution - Spring 2025                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Faculty Name    | Courses        | Hours | Preps | Load │
│─────────────────┼────────────────┼───────┼───────┼──────│
│ Dr. Ahmad       │ CS301(x2)      │  9    │  2    │ ✅   │
│                 │ CS401          │       │       │      │
│─────────────────┼────────────────┼───────┼───────┼──────│
│ Dr. Fatima      │ CS302          │ 12    │  3    │ 🟡   │
│                 │ CS303          │       │       │ High │
│                 │ CS401          │       │       │      │
│─────────────────┼────────────────┼───────┼───────┼──────│
│ Dr. Layla       │ SWE301(x3)     │  9    │  1    │ ✅   │
│─────────────────┼────────────────┼───────┼───────┼──────│
│                                                          │
│ Average Load: 10 hours | Std Dev: 1.5                    │
│                                                          │
│ [Export Excel] [Compare with Fall 2024]                  │
└──────────────────────────────────────────────────────────┘
```

**Technical Details:**
- Query faculty assignments from schedule
- Calculate statistics server-side
- Frontend: TanStack Table for sorting/filtering

**Dependencies:** Schedule generation
**Estimate:** 6 days

---

### 4.4 Enhancement Features (P2 - COULD HAVE)

#### FR-017: AI-Powered Recommendations
**Description:** Intelligent suggestions throughout the system

**Examples:**
- **For Students:** "Based on your GPA (3.8) and past courses, we recommend CS401 (Machine Learning)"
- **For Committee:** "Room E201 is consistently overbooked on Sundays. Consider scheduling fewer sections then."
- **For Faculty:** "You expressed interest in teaching CS401. It's available this semester."

**Technical Details:**
- OpenAI API or Claude for recommendations
- Analyze historical data (past preferences, grades, satisfaction)
- Show as cards/tooltips throughout UI

**Dependencies:** Historical data available
**Estimate:** 12 days

---

#### FR-018: Mobile App (PWA)
**Description:** Mobile-optimized progressive web app

**Acceptance Criteria:**
- ✅ Installable on iOS/Android home screens
- ✅ Offline schedule viewing
- ✅ Push notifications
- ✅ Mobile-optimized layouts
- ✅ Touch gestures (swipe between weeks)

**Technical Details:**
- Next.js already supports PWA
- Add `next-pwa` package
- Service worker for offline caching
- Web Push API for notifications

**Dependencies:** Core features stable
**Estimate:** 8 days

---

#### FR-019: Advanced Search & Filtering
**Description:** Powerful search across all system data

**Acceptance Criteria:**
- ✅ Global search bar: "Search schedules, courses, students..."
- ✅ Filters: By level, course code, instructor, room, time
- ✅ Saved searches/filters
- ✅ Export filtered results

**Technical Details:**
- PostgreSQL full-text search
- Frontend: Algolia-style instant search

**Dependencies:** Core data models
**Estimate:** 6 days

---

#### FR-020: Integration with University Systems
**Description:** Import/export data from existing systems

**Acceptance Criteria:**
- ✅ Import student data from Banner/Edugate
- ✅ Export schedules to university SIS
- ✅ SSO integration (SAML/OAuth)
- ✅ API for third-party integrations

**Technical Details:**
- CSV import/export
- REST API with authentication
- SAML library for SSO

**Dependencies:** Production-ready system
**Estimate:** 15 days

---

#### FR-021: Multi-Language Support
**Description:** Interface in Arabic and English

**Acceptance Criteria:**
- ✅ User can switch language
- ✅ All UI text translated
- ✅ RTL support for Arabic
- ✅ Date/time formatting respects locale

**Technical Details:**
- next-i18next library
- Translation files (JSON)
- RTL CSS with Tailwind

**Dependencies:** Core features complete
**Estimate:** 10 days

---

#### FR-022: Audit Trail & Compliance
**Description:** Detailed logging for security/compliance

**Acceptance Criteria:**
- ✅ Log all data access/modifications
- ✅ Who, what, when, why recorded
- ✅ Searchable audit log
- ✅ Export for compliance reports

**Technical Details:**
- Database: `audit_log` table
- Trigger-based logging
- Retention policy (7 years)

**Dependencies:** Production deployment
**Estimate:** 5 days

---

## 5. Non-Functional Requirements

### NFR-001: Performance
- **Page Load Time:** <2 seconds (p95) on 4G connection
- **Schedule Generation:** <5 minutes for 500 students
- **Database Queries:** <100ms (p95) with proper indexing
- **Real-Time Sync:** <200ms latency for collaborative editing

**Monitoring:** Vercel Analytics, Supabase Performance Insights

---

### NFR-002: Scalability
- **Concurrent Users:** Support 200+ simultaneous users
- **Data Volume:** Handle 10,000+ students per deployment
- **Database:** PostgreSQL can scale to millions of rows
- **API Rate Limiting:** 100 requests/minute per user

**Strategy:** Horizontal scaling via Vercel Serverless, read replicas for Supabase

---

### NFR-003: Security
- **Authentication:** Industry-standard (Supabase Auth)
- **Authorization:** Row-Level Security (RLS) policies
- **Data Encryption:** In transit (TLS 1.3) and at rest
- **Input Validation:** Server-side validation on all endpoints
- **SQL Injection:** Prevention via parameterized queries
- **XSS Prevention:** React escapes by default
- **CSRF Protection:** SameSite cookies

**Compliance:** GDPR-ready (with data export/deletion features)

---

### NFR-004: Reliability
- **Uptime:** 99.5% (excluding scheduled maintenance)
- **Data Backup:** Daily automated backups (Supabase)
- **Disaster Recovery:** RTO < 4 hours, RPO < 1 hour
- **Error Handling:** Graceful degradation, user-friendly messages

**Monitoring:** Uptime robot, error tracking (Sentry)

---

### NFR-005: Usability
- **Accessibility:** WCAG 2.1 AA compliance
  - Keyboard navigation
  - Screen reader support
  - Color contrast ratios met
- **Mobile Responsiveness:** Works on screens ≥360px wide
- **Browser Support:** Chrome, Safari, Firefox, Edge (last 2 versions)
- **Help Documentation:** Inline tooltips, user guide, video tutorials

---

### NFR-006: Maintainability
- **Code Quality:** TypeScript strict mode, ESLint, Prettier
- **Test Coverage:** >70% for critical paths (Jest, Vitest)
- **Documentation:** Code comments, README, architecture diagrams
- **Version Control:** Git with semantic versioning

---

### NFR-007: Compatibility
- **Browsers:** Modern browsers (last 2 versions)
- **Devices:** Desktop, tablet, mobile (iOS 14+, Android 10+)
- **Network:** Works on 3G+ connections (graceful degradation)

---

## 6. Technical Architecture

### 6.1 Technology Stack

**Frontend:**
- **Framework:** Next.js 15 (App Router, React 19)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** React hooks + Server Components
- **Forms:** React Hook Form + Zod validation
- **Charts:** Chart.js or Recharts
- **Calendar:** FullCalendar.js or custom grid
- **Real-Time:** Yjs + y-websocket
- **Drag-and-Drop:** dnd-kit

**Backend:**
- **API:** Next.js API Routes (serverless)
- **Database:** Supabase (PostgreSQL 15)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (for file uploads)
- **Email:** SendGrid or Resend
- **Scheduler Service:** Python FastAPI + Google OR-Tools

**Infrastructure:**
- **Hosting:** Vercel (frontend + API)
- **Database:** Supabase (managed PostgreSQL)
- **CDN:** Vercel Edge Network
- **Domain:** Custom domain with SSL
- **Monitoring:** Vercel Analytics, Supabase Dashboard

### 6.2 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USERS (Browser/Mobile)                   │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│              Vercel CDN (Global Edge Network)               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  Next.js 15 Application                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ App Router                                            │  │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │  │
│  │ │/student │ │/faculty │ │/committee│ │/registrar│    │  │
│  │ └─────────┘ └─────────┘ └─────────┘ └─────────┘    │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ API Routes                                            │  │
│  │ /api/scheduler/generate                               │  │
│  │ /api/students/preferences                             │  │
│  │ /api/faculty/availability                             │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Server Components (React 19)                          │  │
│  │ - Data fetching with React.cache()                    │  │
│  │ - Cached auth from lib/auth/cached-auth.ts            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          ↓                    ↓                    ↓
┌────────────────┐  ┌─────────────────────┐  ┌──────────────┐
│ Supabase       │  │ Python Scheduler    │  │ SendGrid     │
│ - PostgreSQL   │  │ (FastAPI)           │  │ Email API    │
│ - Auth         │  │ - Google OR-Tools   │  │              │
│ - Storage      │  │ - Constraint Solver │  │              │
│ - RLS          │  │                     │  │              │
└────────────────┘  └─────────────────────┘  └──────────────┘
```

### 6.3 Database Schema Highlights

**Key Tables:**
- `users` - Authentication
- `students` - Student profiles
- `faculty` - Faculty profiles
- `course` - Course catalog
- `section` - Course sections
- `section_time` - Time slot assignments
- `elective_preferences` - Student input (INPUT)
- `faculty_availability` - Faculty input (INPUT)
- `irregular_students` - Special cases (INPUT)
- `schedules` - Generated timetables (OUTPUT - JSONB)
- `schedule_versions` - Version history
- `feedback` - Student feedback
- `scheduling_rules` - Constraint configuration
- `notifications` - Message log

**Critical Performance:**
- All auth.uid() wrapped in subqueries (RLS)
- Indexes on frequently queried columns
- JSONB indexes on schedule data

### 6.4 Data Flow: Schedule Generation

```
1. Committee clicks "Generate Schedule"
        ↓
2. POST /api/scheduler/generate
        ↓
3. Fetch inputs from Supabase:
   - Student preferences (elective_preferences)
   - Faculty availability (faculty_availability)
   - Irregular students (irregular_students)
   - Rules (scheduling_rules)
   - Courses & sections (course, section)
        ↓
4. Format data → JSON payload
        ↓
5. Call Python Scheduler Service (HTTP)
        ↓
6. OR-Tools solves constraint problem (2-5 min)
        ↓
7. Receive optimal schedule (JSON)
        ↓
8. Store in database:
   - schedules table (JSONB)
   - schedule_versions table (history)
        ↓
9. Calculate statistics:
   - Satisfaction rates
   - Conflict count
   - Load distribution
        ↓
10. Return to frontend → Display results
```

---

## 7. Roadmap & Priorities

### 7.1 MVP (Minimum Viable Product) - 10 Weeks

**Goal:** Launch functional system for pilot with 1 department (120 students)

**Phase 1: Foundation (Weeks 1-3)**
- ✅ User authentication & role management (COMPLETE)
- ✅ Database schema & RLS policies (COMPLETE)
- FR-004: Irregular student management
- FR-001: Multi-user dashboards (basic)

**Phase 2: Core Scheduling (Weeks 4-6)** ⚠️ CRITICAL PATH
- FR-002: Student preference survey
- FR-003: Faculty availability survey
- FR-005: AI Scheduler integration (BLOCKING)
  - Week 4: Python service setup, OR-Tools POC
  - Week 5: Integration with Next.js API
  - Week 6: Testing with synthetic data

**Phase 3: Publishing & Viewing (Weeks 7-8)**
- FR-006: Schedule viewing (calendar UI)
- FR-008: Publication workflow
- FR-009: Conflict detection
- FR-010: Notification system

**Phase 4: Feedback & Polish (Weeks 9-10)**
- FR-014: Student feedback collection
- FR-007: Committee dashboard
- Bug fixes, performance optimization
- User acceptance testing with pilot group

**MVP Deliverables:**
- Students can submit preferences → View generated schedules
- Committee can configure rules → Generate → Publish schedules
- Faculty can submit availability → View assignments
- Basic notifications & feedback

---

### 7.2 Post-MVP: Iteration 1 (Weeks 11-16)

**Goal:** Add collaboration & analytics for production use

**Collaboration Features:**
- FR-011: Real-time rule editing (Yjs)
- FR-012: Version control (jsondiffpatch)
- FR-015: Manual schedule adjustments

**Analytics:**
- FR-013: Committee analytics dashboard
- FR-016: Faculty load dashboard

**Improvements:**
- Performance optimization (caching, indexes)
- Mobile responsiveness improvements
- Accessibility audit & fixes

---

### 7.3 Future Roadmap (6-12 Months)

**Quarter 2:**
- FR-017: AI recommendations
- FR-018: Mobile app (PWA)
- FR-021: Arabic language support
- Scale to 3-5 departments

**Quarter 3:**
- FR-019: Advanced search
- FR-020: University system integrations
- FR-022: Audit trail
- Multi-university deployments

**Quarter 4:**
- Mobile native apps (React Native)
- Advanced AI (predictive analytics)
- Marketplace for third-party rules/algorithms

---

### 7.4 Critical Path Dependencies

**BLOCKING MVP:**
1. FR-005: AI Scheduler (must be completed by Week 6)
2. FR-008: Publication workflow (blocks FR-006 viewing)

**BLOCKING POST-MVP:**
1. FR-011: Real-time collab (requires WebSocket infrastructure)
2. FR-015: Manual adjustments (requires FR-005 complete)

---

## 8. Success Metrics

### 8.1 Product Metrics (OKRs)

**Objective 1: Reduce Committee Workload**
- **KR1:** Committee spends <10 hours on scheduling (vs. 40-60 baseline)
- **KR2:** Schedule published within 3 days of preference deadline
- **KR3:** <5 manual adjustments needed after generation

**Objective 2: Improve Student Satisfaction**
- **KR1:** 80%+ students get top 3 elective choices
- **KR2:** Student NPS score >40
- **KR3:** <10 conflict reports per 100 students

**Objective 3: Drive System Adoption**
- **KR1:** 90%+ students complete preference survey
- **KR2:** 100% faculty submit availability
- **KR3:** Committee uses system for 100% of scheduling (no Excel fallback)

### 8.2 Technical Metrics

**Performance:**
- Page load time: <2s (p95)
- Schedule generation: <5 min for 500 students
- API response time: <200ms (p95)

**Reliability:**
- Uptime: >99.5%
- Error rate: <0.1% of requests
- Zero data loss incidents

**Quality:**
- Test coverage: >70%
- Zero critical bugs in production
- <5% rollback rate for deployments

### 8.3 Business Metrics

**Pilot Phase (First Semester):**
- 1 department (100-150 students)
- 1 university
- $0 revenue (proof of concept)

**Year 1:**
- 10 departments across 3 universities
- 2,000+ students using system
- $50K ARR (if monetized at $2K/semester/department)

**Year 2:**
- 50 departments across 15 universities
- 10,000+ students
- $300K ARR

---

## 9. Risks & Mitigation

### 9.1 Technical Risks

**Risk 1: AI Scheduler Performance (HIGH)**
- **Impact:** Cannot generate schedules in reasonable time
- **Probability:** Medium (untested with real data)
- **Mitigation:**
  - Start with small dataset (25 students) for POC
  - Set timeout limits (5 min max)
  - Fallback: Committee manually adjusts if optimizer times out
  - Consider commercial solver (Gurobi) if OR-Tools insufficient

**Risk 2: Real-Time Collaboration Complexity (MEDIUM)**
- **Impact:** Bugs, data loss in collaborative editing
- **Probability:** Medium (Yjs has learning curve)
- **Mitigation:**
  - Implement in P1 (not MVP-blocking)
  - Extensive testing with synthetic users
  - Auto-save every 10 seconds as backup
  - Read-only mode if sync fails

**Risk 3: Database Performance at Scale (MEDIUM)**
- **Impact:** Slow queries as data grows
- **Probability:** Low (RLS already optimized)
- **Mitigation:**
  - Load testing before production
  - Query monitoring dashboards
  - Read replicas if needed
  - Connection pooling (pgBouncer)

**Risk 4: Browser Compatibility Issues (LOW)**
- **Impact:** Features break on older devices
- **Probability:** Low (modern stack)
- **Mitigation:**
  - Test on target browsers (last 2 versions)
  - Progressive enhancement approach
  - Graceful degradation for older browsers

### 9.2 Product Risks

**Risk 5: Low Student Adoption (HIGH)**
- **Impact:** Not enough preference data to generate good schedules
- **Probability:** Medium (students may ignore survey)
- **Mitigation:**
  - Multiple reminder notifications
  - Gamification: "85% of your classmates completed this!"
  - Incentive: "Complete by [date] for early schedule access"
  - Make survey mandatory (block registration if not done)

**Risk 6: Committee Resistance to Change (MEDIUM)**
- **Impact:** Committee prefers manual Excel process
- **Probability:** Medium (change management challenge)
- **Mitigation:**
  - Involve committee early in design process
  - Training sessions before launch
  - Pilot with champion committee member
  - Show time savings with data

**Risk 7: Generated Schedules Don't Meet Expectations (HIGH)**
- **Impact:** Committee loses trust, falls back to manual
- **Probability:** Medium (algorithm may need tuning)
- **Mitigation:**
  - Set expectations: "First iteration may need adjustments"
  - Provide manual override tools
  - Iteratively improve algorithm based on feedback
  - A/B test different optimization priorities

**Risk 8: Scope Creep (MEDIUM)**
- **Impact:** Delays MVP launch
- **Probability:** Medium (stakeholders request features)
- **Mitigation:**
  - Strict prioritization framework (MoSCoW)
  - Product owner has final say
  - Log feature requests for post-MVP
  - Timeboxed sprints

### 9.3 Business Risks

**Risk 9: University Procurement Process (HIGH)**
- **Impact:** Long sales cycles, bureaucracy
- **Probability:** High (government institutions)
- **Mitigation:**
  - Start with free pilot (no procurement needed)
  - Build champion within university
  - Case study from pilot for future sales
  - Partner with existing university vendors

**Risk 10: Data Privacy Concerns (MEDIUM)**
- **Impact:** University unwilling to use cloud system
- **Probability:** Medium (GDPR, local laws)
- **Mitigation:**
  - Use synthetic data for prototype
  - GDPR compliance built-in
  - Offer self-hosted option (future)
  - SOC 2 compliance (if scaling)

**Risk 11: Competitor Entry (LOW)**
- **Impact:** Larger player enters market
- **Probability:** Low (niche market initially)
- **Mitigation:**
  - Move fast, establish early adopters
  - Focus on customer success (high retention)
  - Build network effects (more users = better algorithm)
  - Differentiate on UX and AI

---

## 10. Appendices

### A. Glossary

- **Timetabling System:** Software that generates schedules algorithmically (vs. enrollment system where students self-register)
- **Elective:** Optional course student can choose
- **Irregular Student:** Student behind schedule, taking courses from multiple levels
- **Section:** Instance of a course (e.g., CS301 Section 1, Section 2)
- **Constraint Solver:** Algorithm that finds solutions satisfying multiple constraints
- **RLS:** Row-Level Security (PostgreSQL feature for data access control)
- **JSONB:** JSON data type in PostgreSQL (Binary, indexed)
- **CRDT:** Conflict-Free Replicated Data Type (for real-time collaboration)

### B. User Roles & Permissions Matrix

| Feature | Student | Faculty | Scheduling Committee | Load Committee | Registrar | Admin |
|---------|---------|---------|---------------------|----------------|-----------|-------|
| View own schedule | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit preferences | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Submit availability | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View all schedules | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Generate schedule | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Publish schedule | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Configure rules | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Enter irregular students | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| View analytics | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Manual adjustments | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Comment on schedule | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### C. Sample Data Requirements

**For MVP Testing:**
- 120 students (3 levels × 40 students each)
- 45 courses (15 required + 10 electives per level)
- 12 faculty members
- 8 irregular students
- 20 scheduling rules
- 15 classrooms

**Synthetic Data Generators:**
- Faker.js for names, emails
- Custom scripts for preferences (following realistic distributions)
- Historical data from similar universities (anonymized)

### D. API Endpoints Overview

**Authentication:**
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/reset-password` - Password reset

**Students:**
- `GET /api/students/schedule` - Get student schedule
- `POST /api/students/preferences` - Submit elective preferences
- `GET /api/students/preferences` - Get submitted preferences
- `POST /api/students/feedback` - Submit feedback

**Faculty:**
- `GET /api/faculty/schedule` - Get teaching schedule
- `POST /api/faculty/availability` - Submit availability
- `GET /api/faculty/availability` - Get submitted availability

**Committee:**
- `GET /api/committee/dashboard` - Dashboard data
- `POST /api/scheduler/generate` - Generate schedule
- `POST /api/scheduler/publish` - Publish schedule
- `GET /api/scheduler/versions` - Version history
- `PATCH /api/scheduler/manual-adjustment` - Manual edits
- `GET /api/analytics/satisfaction` - Student satisfaction stats
- `GET /api/analytics/load-distribution` - Faculty load stats

**Registrar:**
- `POST /api/registrar/irregular-students` - Add irregular student
- `GET /api/registrar/irregular-students` - List irregular students

**Admin:**
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `PATCH /api/admin/users/:id` - Update user role

### E. Scheduling Rules Examples

**Hard Constraints (MUST be satisfied):**
1. No student has overlapping courses
2. No faculty teaches overlapping sections
3. No room is double-booked
4. Section enrollment ≤ room capacity
5. Reserve 12-1 PM for lunch (no classes)
6. Reserve Mon/Wed 12-2 PM for midterm exams
7. Labs must be continuous 2-hour blocks
8. Irregular students get ALL required courses

**Soft Constraints (SHOULD be optimized):**
1. Maximize % of students getting top 3 elective choices
2. Respect faculty availability preferences
3. Balance day-off distribution (each group gets 1-2 days off)
4. Minimize room changes for students (same room for multiple courses)
5. Schedule electives early AM (8-10) or late PM (3-5)
6. Faculty with multiple sections: schedule on same days
7. Minimize gaps in student schedules (no 1-hour idle periods)
8. Courses with prerequisites: schedule at different times (not same slot)

**Configurable Parameters:**
- Students per section (default: 25, range: 20-30)
- Maximum credits per student (default: 18)
- Maximum faculty load (default: 12 credits)
- Elective sections offered per course (e.g., "CS401: 2 sections")

### F. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Oct 26, 2025 | Product Team | Initial draft based on project brief |
| 2.0 | Oct 26, 2025 | Product Team | Complete PRD with detailed requirements |

### G. References & Resources

**Documentation:**
- [SmartSchedule System Architecture](docs/system/architecture.md)
- [Timetabling System Guide](docs/TIMETABLING-SYSTEM-GUIDE.md)
- [Database Schema Overview](docs/schema/overview.md)

**Libraries & Tools:**
- [Google OR-Tools](https://developers.google.com/optimization)
- [Yjs (Real-time Collaboration)](https://yjs.dev)
- [jsondiffpatch (Version Control)](https://github.com/benjamine/jsondiffpatch)
- [Chart.js (Visualizations)](https://www.chartjs.org)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)

**Research:**
- "University Timetabling: A Survey" (2020)
- "Constraint Satisfaction in Academic Scheduling" (2018)
- Case studies: MIT, Stanford scheduling systems

---

## Summary

### What Makes SmartSchedule Different?

1. **AI-First Approach:** Algorithm does 90% of work, humans review/refine
2. **Modern UX:** Beautiful, mobile-responsive, 2025 design standards
3. **Real Collaboration:** Committee works together in real-time (not endless emails)
4. **Transparency:** Students see why they got certain courses
5. **Fair & Optimal:** Algorithm considers ALL constraints simultaneously
6. **Fast Iteration:** Version control + feedback loop = continuous improvement

### MVP in One Sentence
> Students submit preferences, faculty indicate availability, committee clicks "Generate" → System produces conflict-free schedules in minutes, committee reviews/publishes, students view schedules.

### Next Steps (Immediate Actions)

**Week 1:**
1. ✅ Finalize PRD (this document)
2. ⬜ Set up Python scheduler environment
3. ⬜ Design preference survey UI mockups
4. ⬜ Create sprint backlog in project management tool

**Week 2-3:**
1. ⬜ Implement FR-002 (Preference Survey)
2. ⬜ Implement FR-003 (Faculty Availability)
3. ⬜ Build OR-Tools POC with 25 students

**Week 4-6:**
1. ⬜ Integrate scheduler with Next.js API
2. ⬜ Test with synthetic dataset (120 students)
3. ⬜ Build schedule viewing UI

**Week 7-10:**
1. ⬜ Publication workflow + notifications
2. ⬜ Committee dashboard
3. ⬜ User acceptance testing
4. ⬜ MVP Launch! 🚀

---

**Questions or feedback on this PRD?**  
Contact: Product Team | Last Updated: October 26, 2025

