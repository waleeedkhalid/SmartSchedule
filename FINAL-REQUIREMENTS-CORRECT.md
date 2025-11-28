# SmartSchedule: Final Requirements (The Real PRD)
**Date:** October 27, 2025  
**Source:** Your PRD Bible v1.1  
**Status:** This is the CORRECT requirements document

---

## 🎯 What SmartSchedule Actually Is

A **scheduling system** with:
1. **One-click conflict-free schedule generation** (≤10 seconds)
2. **Real-time collaborative editing** (yjs)
3. **Version control** (jsondiffpatch)
4. **Student self-service** (survey + registration)
5. **Dashboards** (Chart.js)

**NOT:** Complex AI optimizer, NOT just collaborative editor

---

## 📋 Core Features from PRD v1.1

### 1. Scheduler Engine ⚠️ PARTIALLY MISSING
**What it needs to do:**
- Generate conflict-free recommendations in one click (≤10 seconds)
- Validate room/time overlaps
- Use Google AI Studio for recommendations (not OR-Tools)
- Detect conflicts: student, instructor, room

**Current Status:**
- ✅ Conflict detector exists (`src/lib/validations/conflict-detector.ts`)
- ⚠️ "One-click generation" not implemented
- ❌ Google AI Studio integration not implemented
- ⚠️ Manual editing exists but basic

**What to Build:**
```typescript
// API: POST /api/scheduler/generate
async function generateSchedule(termCode: string): Promise<GenerationResult> {
  // 1. Load data (courses, sections, rooms, instructors, constraints)
  const data = await loadSchedulingData(termCode);
  
  // 2. Generate conflict-free assignments (≤10 seconds)
  const assignments = await generateConflictFreeSchedule(data);
  
  // 3. Optional: Use Google AI Studio for optimization suggestions
  const aiSuggestions = await getAIRecommendations(assignments);
  
  // 4. Validate and save
  const conflicts = detectConflicts(assignments);
  if (conflicts.length === 0) {
    await saveSchedule(termCode, assignments);
  }
  
  return {
    success: conflicts.length === 0,
    assignments,
    conflicts,
    aiSuggestions,
    executionTime: performance.now() - startTime
  };
}
```

---

### 2. Student Features ⚠️ SPLIT INTO TWO PARTS

#### Part A: Elective Survey ✅ DONE
**What:** Students submit ranked preferences  
**Status:** ✅ Already implemented (drag-and-drop UI)  
**Purpose:** Informs scheduling committee which electives to offer

#### Part B: Manual Elective Registration ❌ NOT DONE
**What:** Students register for open elective sections  
**Constraints:**
- Total credit hours ≤ 20
- Prerequisites must be passed
- No time conflicts
- No exam conflicts
- Section has open seats

**Status:** ❌ Not implemented

**What to Build:**
```typescript
// Component: ElectiveRegistration.tsx
export function ElectiveRegistration() {
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  
  async function handleRegister(sectionId: string) {
    // Validate constraints
    const validation = await validateRegistration({
      student_id: user.id,
      section_id: sectionId,
      current_sections: selectedSections
    });
    
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    
    // Register (insert into student_enrollment table)
    await supabase.from("student_enrollment").insert({
      student_id: user.id,
      section_id: sectionId
    });
    
    toast.success("Registered successfully!");
  }
  
  return (
    <div>
      <ElectiveBrowser onRegister={handleRegister} />
      <RegistrationSummary sections={selectedSections} />
    </div>
  );
}

// Validation function
async function validateRegistration(data) {
  const errors = [];
  
  // 1. Check credit hour limit
  const totalCH = await getTotalCreditHours(data.student_id, data.current_sections);
  const newSection = await getSection(data.section_id);
  if (totalCH + newSection.credits > 20) {
    errors.push("Exceeds 20 credit hour limit");
  }
  
  // 2. Check prerequisites
  const prereqsMet = await checkPrerequisites(data.student_id, newSection.course_code);
  if (!prereqsMet) {
    errors.push("Prerequisites not met");
  }
  
  // 3. Check time conflicts
  const timeConflict = await checkTimeConflict(data.student_id, data.section_id);
  if (timeConflict) {
    errors.push("Time conflict with existing schedule");
  }
  
  // 4. Check exam conflicts
  const examConflict = await checkExamConflict(data.student_id, newSection.course_code);
  if (examConflict) {
    errors.push("Exam conflict detected");
  }
  
  // 5. Check capacity
  if (newSection.enrolled_count >= newSection.capacity) {
    errors.push("Section is full");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

#### Part C: Auto-enrollment for Required Courses ❌ NOT DONE
**What:** System automatically enrolls students in required courses

**What to Build:**
```typescript
// Server Action or Cron Job
async function autoEnrollRequiredCourses(termCode: string) {
  const students = await getStudentsByTerm(termCode);
  
  for (const student of students) {
    const requiredCourses = await getRequiredCoursesByLevel(student.level);
    
    for (const courseCode of requiredCourses) {
      // Find available section
      const section = await findAvailableSectionForStudent(
        courseCode,
        student.id,
        termCode
      );
      
      if (section) {
        await supabase.from("student_enrollment").insert({
          student_id: student.id,
          section_id: section.id
        });
      } else {
        await logEnrollmentError(student.id, courseCode, "No capacity");
      }
    }
  }
}
```

---

### 3. Real-Time Collaboration ✅ BACKEND READY
**What:** Multiple users edit schedules simultaneously (yjs)

**Status:**
- ✅ Backend: `src/lib/collaboration/yjs-manager.ts` (18 tests)
- ✅ Hooks: `src/hooks/use-collaboration.ts`
- ❌ UI: Not connected

**What to Build:** Week 1 of implementation plan (already documented)

---

### 4. Version Control ✅ BACKEND READY
**What:** Named releases with jsondiffpatch history

**Status:**
- ✅ Backend: `src/lib/generators/version-diff.ts` (17 tests)
- ✅ Table: `schedule_versions` exists
- ❌ UI: Not connected

**What to Build:** Week 1 of implementation plan (already documented)

---

### 5. Dashboards ✅ BACKEND READY
**What:** Level and Course overviews (Chart.js)

**Status:**
- ✅ Backend: `src/lib/generators/charts-formatter.ts` (17 tests)
- ❌ UI: Not integrated

**Views Needed:**
1. **Level Overview:**
   - Per-level statistics
   - Instructors assigned
   - Section counts
   - Student distribution

2. **Course Overview:**
   - Room usage
   - Student load per section
   - Instructor assignments
   - Capacity utilization

**What to Build:** Week 3 of implementation plan (already documented)

---

### 6. In-App Notifications ❌ NOT DONE
**What:** Notify users of comments, updates, approvals

**Database:** `notification` table exists

**What to Build:**
```typescript
// Component: NotificationBell.tsx
export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notification',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, []);
  
  return (
    <Popover>
      <PopoverTrigger>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge variant="destructive">{unreadCount}</Badge>
        )}
      </PopoverTrigger>
      <PopoverContent>
        <NotificationList notifications={notifications} />
      </PopoverContent>
    </Popover>
  );
}

// API: POST /api/notifications
async function createNotification(data: {
  user_id: string;
  type: 'comment' | 'edit' | 'approval';
  payload: any;
}) {
  await supabase.from('notification').insert(data);
}
```

---

### 7. Comments System ⚠️ PARTIAL
**What:** Users can comment on schedules or sections

**Database:** `comment` table exists

**Status:**
- ⚠️ Feedback system exists for students/faculty
- ❌ Inline comments in collaborative editor not done

**What to Build:**
```typescript
// Component: CommentThread.tsx (for collaborative editor)
export function CommentThread({ docId, targetRef }: {
  docId: string;
  targetRef: string; // e.g., "section-123" or "schedule-fall-2025"
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  
  useEffect(() => {
    loadComments(docId, targetRef).then(setComments);
    
    // Real-time updates
    const channel = supabase
      .channel(`comments-${docId}-${targetRef}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comment',
        filter: `doc_id=eq.${docId} AND target_ref=eq.${targetRef}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setComments(prev => [...prev, payload.new]);
        }
      })
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, [docId, targetRef]);
  
  async function handleAddComment(text: string) {
    await supabase.from('comment').insert({
      doc_id: docId,
      target_ref: targetRef,
      author_id: user.id,
      text
    });
  }
  
  return (
    <div className="space-y-4">
      {comments.map(comment => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
      <CommentInput onSubmit={handleAddComment} />
    </div>
  );
}
```

---

### 8. Registrar Tools ⚠️ PARTIAL
**What:** Validate and release final schedule; export JSON

**Status:**
- ❌ Publish/release workflow not done
- ⚠️ JSON export partially exists

**What to Build:**
```typescript
// Page: RegistrarDashboard.tsx
export default function RegistrarDashboard() {
  const [scheduleStatus, setScheduleStatus] = useState<'draft' | 'review' | 'released'>('draft');
  
  async function handleRelease() {
    // 1. Final validation
    const conflicts = await validateEntireSchedule(termCode);
    if (conflicts.length > 0) {
      toast.error("Cannot release with conflicts");
      return;
    }
    
    // 2. Mark as released
    await supabase.from('schedules').update({
      status: 'released',
      released_at: new Date(),
      released_by: user.id
    }).eq('term_code', termCode);
    
    // 3. Create version snapshot
    await createVersionSnapshot(termCode, 'released');
    
    // 4. Notify all stakeholders
    await notifyAllUsers(termCode, 'schedule_released');
    
    toast.success("Schedule released successfully!");
    setScheduleStatus('released');
  }
  
  async function handleExportJSON() {
    const schedule = await exportScheduleAsJSON(termCode);
    downloadJSON(schedule, `schedule-${termCode}.json`);
  }
  
  return (
    <Card>
      <h2>Schedule Status</h2>
      <StatusBadge status={scheduleStatus} />
      
      {scheduleStatus === 'review' && (
        <Button onClick={handleRelease}>
          Release Schedule
        </Button>
      )}
      
      <Button variant="outline" onClick={handleExportJSON}>
        Export as JSON
      </Button>
    </Card>
  );
}
```

---

## 🔄 Correct Understanding Now

### Student Flow (Complete Picture)
1. **Phase 1: Preference Survey** ✅ DONE
   - Students submit ranked elective preferences
   - Used by committee to decide which electives to offer

2. **Phase 2: Schedule Generation** ⚠️ PARTIAL
   - Committee generates conflict-free schedule (one-click)
   - Required courses assigned
   - Electives allocated based on preferences + capacity
   - System auto-enrolls required courses

3. **Phase 3: Elective Registration** ❌ NOT DONE
   - Students can register for open elective sections
   - Must meet constraints (CH ≤ 20, prerequisites, no conflicts)
   - First-come-first-served within constraints

4. **Phase 4: View & Feedback** ✅ MOSTLY DONE
   - Students view final schedule
   - Students view exam timetable
   - Students provide feedback

---

## ✅ What You Actually Have

### Backend (75% Complete)
1. ✅ Yjs collaboration (ready)
2. ✅ jsondiffpatch versioning (ready)
3. ✅ Chart.js formatters (ready)
4. ✅ Conflict detector (working)
5. ✅ All validators (working)
6. ✅ Database schema (complete)
7. ✅ Authentication & RLS (complete)
8. ✅ Student preference survey (complete)
9. ✅ Feedback systems (complete)

### Missing (25%)
1. ❌ One-click schedule generation (≤10s)
2. ❌ Google AI Studio integration
3. ❌ Student elective registration system
4. ❌ Auto-enrollment for required courses
5. ❌ In-app notifications
6. ❌ Inline comments in editor
7. ❌ Registrar release workflow
8. ❌ JSON export/import
9. ❌ Collaboration UI
10. ❌ Version control UI
11. ❌ Chart dashboards UI

---

## 📋 Revised 3-Week Plan

### Week 1: Schedule Generation & Core Features (40 hours)

#### Day 1-2: One-Click Schedule Generator (16 hours)
**Build:**
- Schedule generation algorithm (conflict-free, ≤10s)
- Google AI Studio integration (recommendations)
- Auto-enrollment for required courses

**Code:**
```typescript
// src/lib/schedule/generator.ts
export async function generateConflictFreeSchedule(data: ScheduleData) {
  const assignments = [];
  
  // 1. Assign required courses to all students
  for (const student of data.students) {
    const required = getRequiredCourses(student.level);
    for (const courseCode of required) {
      const section = findBestSection(courseCode, student, assignments);
      if (section) {
        assignments.push({ student_id: student.id, section_id: section.id });
      }
    }
  }
  
  // 2. Assign electives based on preferences + capacity
  for (const student of data.students) {
    const preferences = getStudentPreferences(student.id);
    for (const pref of preferences.sort((a, b) => a.rank - b.rank)) {
      const section = findBestSection(pref.course_code, student, assignments);
      if (section && !hasConflict(student, section, assignments)) {
        assignments.push({ student_id: student.id, section_id: section.id });
        break; // Got one elective, move on
      }
    }
  }
  
  // 3. Optional: Get AI suggestions for optimization
  const aiSuggestions = await getAISuggestions(assignments);
  
  return { assignments, suggestions: aiSuggestions };
}
```

#### Day 3: Student Elective Registration (8 hours)
**Build:**
- Elective browser UI
- Registration with constraint validation
- Drop functionality

#### Day 4-5: Real-Time Collaboration UI (16 hours)
**Build:**
- Collaborative schedule editor
- Presence indicators
- Inline comments
**Use:** Existing Yjs backend

---

### Week 2: Version Control & Dashboards (40 hours)

#### Day 1-2: Version Control UI (16 hours)
**Build:**
- Version timeline
- Diff viewer (use existing jsondiffpatch)
- Rollback functionality

#### Day 3-4: Chart Dashboards (16 hours)
**Build:**
- Level overview dashboard
- Course overview dashboard
- Integration with existing Chart.js formatters

#### Day 5: In-App Notifications (8 hours)
**Build:**
- Notification bell component
- Real-time notification delivery
- Mark as read functionality

---

### Week 3: Registrar Tools & Polish (35 hours)

#### Day 1-2: Registrar Release Workflow (16 hours)
**Build:**
- Draft → Review → Released flow
- Final validation before release
- JSON export/import

#### Day 3: Comments System (8 hours)
**Build:**
- Inline comment threads in editor
- Comment notifications

#### Day 4-5: Testing & Deployment (11 hours)
- End-to-end testing
- Bug fixes
- Production deployment

---

## 📊 Feature Completion Matrix (Corrected)

| Feature | Backend | Frontend | Priority | Effort |
|---------|---------|----------|----------|--------|
| **Schedule Generation** | ⚠️ 40% | ❌ 0% | P0 | 2 days |
| **Auto-enrollment** | ❌ 0% | ❌ 0% | P0 | 0.5 days |
| **Student Registration** | ❌ 0% | ❌ 0% | P0 | 1 day |
| **Collaboration UI** | ✅ 100% | ❌ 0% | P0 | 2 days |
| **Version Control UI** | ✅ 100% | ❌ 0% | P1 | 2 days |
| **Chart Dashboards** | ✅ 100% | ❌ 0% | P1 | 2 days |
| **Notifications** | ⚠️ 50% | ❌ 0% | P1 | 1 day |
| **Comments** | ⚠️ 50% | ⚠️ 50% | P2 | 1 day |
| **Registrar Tools** | ⚠️ 30% | ❌ 0% | P1 | 2 days |

**Total Effort:** ~13.5 days (3 weeks at 40 hours/week)

---

## 🎯 Success Criteria (From PRD)

1. ✅ Zero time conflicts in released schedule
2. ✅ Schedule generation ≤10 seconds
3. ✅ Dashboard load ≤2 seconds
4. ✅ ≥80% stakeholder satisfaction in UAT

---

## 🚀 Next Steps

1. **Read this document** ✅ (you're doing it)
2. **Review PRD v1.1** (your source document)
3. **Start Week 1, Day 1:** Build schedule generator
4. **Follow 3-week plan** above

---

**This is the FINAL, CORRECT understanding based on your actual PRD.**

**Key Differences from Earlier Analysis:**
- There IS a schedule generator (one-click, ≤10s, not AI optimizer)
- Uses Google AI Studio (not OR-Tools)
- Students have TWO paths: Survey (preferences) + Registration (electives)
- Auto-enrollment exists for required courses
- Timeline is aggressive: 3 weeks

**You're about 75% done. Just need 3 weeks to complete.**

