# Critical Gaps: Detailed Analysis
**Date:** October 27, 2025  
**Purpose:** Document exactly what's missing and why the system doesn't work

---

## 🔴 Gap #1: Schedule Generator (CRITICAL)

### What the PRD Promises
From PRD.md (FR-005):
```
AI Schedule Generator (CRITICAL)
- Input: Student preferences, faculty availability, irregular students, rules, constraints
- Algorithm: Google OR-Tools constraint satisfaction solver
- Processing time: <5 minutes for 500 students
- Output: Optimal schedule with sections, times, rooms, instructor assignments
- Explainability: "Student X got course Y because they ranked it #1 and section had space"
```

### What Actually Exists
File: `src/lib/schedule-generator.ts` (248 lines)

```typescript
export function generateScheduleForStudent(
  student: Student,
  availableSections: Section[]
): GeneratedSchedule {
  const warnings: string[] = [];
  const assignedSections: Section[] = [];
  
  // Get required courses for student level
  const requiredCourses = getRequiredCoursesForLevel(student.level);
  
  // Try to assign each required course
  requiredCourses.forEach(courseCode => {
    const courseSections = availableSections.filter(s => s.course_code === courseCode);
    
    if (courseSections.length === 0) {
      warnings.push(`No sections available for required course: ${courseCode}`);
      return;
    }
    
    // Find section with available capacity
    const availableSection = courseSections.find(
      s => s.enrolled_count < s.capacity
    );
    
    if (!availableSection) {
      warnings.push(`All sections full for course: ${courseCode}`);
      return;
    }
    
    // Check for time conflicts
    const hasConflict = assignedSections.some(assigned =>
      sectionsConflict(assigned, availableSection)
    );
    
    if (!hasConflict) {
      assignedSections.push(availableSection);
    } else {
      warnings.push(`Time conflict prevents assignment of ${courseCode}`);
    }
  });
  
  return {
    student_id: student.id,
    sections: assignedSections,
    statistics: {
      total_credits: assignedSections.length * 3,
      total_courses: assignedSections.length,
      conflicts: warnings.filter(w => w.includes('conflict')).length,
    },
    warnings,
  };
}
```

### What's Missing
1. ❌ **No elective assignment** - Only assigns required courses
2. ❌ **Preferences ignored** - Doesn't read `elective_preferences` table
3. ❌ **Faculty availability ignored** - Doesn't read `faculty_availability` table
4. ❌ **Irregular students not handled** - Doesn't read `irregular_students` table
5. ❌ **No optimization** - First-fit algorithm, no preference satisfaction
6. ❌ **No Python backend** - Just a simple JS function
7. ❌ **No OR-Tools** - Not even installed
8. ❌ **No explainability** - Just warnings, no reasoning

### Impact
- **Students:** Submit preferences that are completely ignored
- **Faculty:** Submit availability that has no effect on assignments
- **Committee:** Gets incomplete schedules (only required courses)
- **Irregular Students:** Data collected but not used in generation
- **System:** Cannot deliver on core value proposition

### What Needs to Be Built
**Option A: Simple Preference Matcher (Recommended)**
```typescript
// New implementation needed (300-400 lines)
async function generateScheduleWithPreferences(termCode: string) {
  // 1. Load all data
  const students = await getStudents(termCode);
  const sections = await getSections(termCode);
  const preferences = await getElectivePreferences(termCode);
  const irregular = await getIrregularStudents(termCode);
  
  // 2. For each student
  for (const student of students) {
    const schedule = [];
    
    // 2a. Assign required courses (existing logic)
    schedule.push(...assignRequiredCourses(student, sections));
    
    // 2b. NEW: Assign electives based on preferences
    const studentPrefs = preferences.filter(p => p.student_id === student.id);
    for (const pref of studentPrefs.sort((a, b) => a.order - b.order)) {
      const section = findAvailableSection(pref.course_code, sections);
      if (section && !hasConflict(schedule, section)) {
        schedule.push(section);
        section.enrolled_count++; // Update capacity
        break; // Got one elective, move on
      }
    }
    
    // 2c. Handle irregular students
    if (irregular.find(i => i.student_id === student.id)) {
      schedule.push(...assignIrregularCourses(student, sections));
    }
    
    // 3. Save schedule
    await saveSchedule(student.id, termCode, schedule);
  }
  
  return { success: true, stats: {...} };
}
```

**Option B: Full OR-Tools Solver**
- Set up Python FastAPI backend (2-3 days)
- Install OR-Tools (1 day)
- Model constraints (3-5 days)
- Implement solver (5-7 days)
- Connect to Next.js (2 days)
- Total: 4-6 weeks

---

## 🟡 Gap #2: Publication Workflow (HIGH)

### What the PRD Promises
From PRD.md (FR-008):
```
Schedule Publication Workflow
- States: draft → published_draft → final → archived
- Notification sent to all stakeholders on state change
- Can roll back to previous version if needed
- Audit log tracks who published and when
```

### What Actually Exists
**Database:**
- ✅ `schedules` table has `is_published` column
- ✅ `status` column exists (never used)
- ✅ `published_at`, `published_by` columns (null)

**Code:**
- ❌ No publish endpoint
- ❌ No state management
- ❌ No validation before publish
- ❌ No notifications

**UI:**
- ❌ No publish button
- ❌ No state indicator
- ❌ No confirmation dialog

### Impact
- Committee cannot officially publish schedules
- Students see draft data (may change)
- No clear "final" status
- Cannot track publication history

### What Needs to Be Built
```typescript
// API: POST /api/committee/publish-schedule
export async function POST(req: Request) {
  const { term_code } = await req.json();
  
  // 1. Validate (no critical conflicts)
  const conflicts = await checkConflicts(term_code);
  if (conflicts.critical.length > 0) {
    return NextResponse.json({
      error: "Cannot publish with critical conflicts",
      conflicts
    }, { status: 400 });
  }
  
  // 2. Update status
  await supabase
    .from("schedules")
    .update({
      is_published: true,
      status: "published",
      published_at: new Date().toISOString(),
      published_by: (await getUser()).id
    })
    .eq("term_code", term_code);
  
  // 3. Send notifications (future: email)
  // For now: just return success
  
  return NextResponse.json({ success: true });
}
```

**UI Component:**
```typescript
// PublishButton.tsx
export function PublishButton({ termCode }: { termCode: string }) {
  const [loading, setLoading] = useState(false);
  
  async function handlePublish() {
    if (!confirm("Publish schedules to 200 students?")) return;
    
    setLoading(true);
    const res = await fetch("/api/committee/publish-schedule", {
      method: "POST",
      body: JSON.stringify({ term_code: termCode })
    });
    
    if (res.ok) {
      toast.success("Schedules published!");
      router.refresh();
    } else {
      const { error } = await res.json();
      toast.error(error);
    }
    setLoading(false);
  }
  
  return (
    <Button onClick={handlePublish} disabled={loading}>
      {loading ? "Publishing..." : "Publish Schedules"}
    </Button>
  );
}
```

**Effort:** 1-2 days

---

## 🟡 Gap #3: Manual Schedule Adjustment (MEDIUM)

### What the PRD Promises
From PRD.md (FR-015):
```
Manual Schedule Adjustment Tools
- Drag-and-drop students between sections
- Drag-and-drop sections to different time slots
- System warns if change creates conflict
- Can override warnings with documented reason
- Changes logged in version history
```

### What Actually Exists
- ❌ No adjustment UI
- ❌ No drag-and-drop functionality
- ❌ No conflict checking on manual changes
- ❌ No version history integration

### Impact
- Committee cannot fix generator errors
- Must use database directly for adjustments
- No safety checks on manual changes
- Risk of introducing conflicts

### What Needs to Be Built
```typescript
// Component: ScheduleAdjustmentTool.tsx
export function ScheduleAdjustmentTool() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  async function moveStudentToSection(
    studentId: string,
    oldSectionId: string,
    newSectionId: string
  ) {
    // 1. Check conflicts
    const conflicts = await checkConflictForMove(studentId, newSectionId);
    if (conflicts.length > 0) {
      const proceed = confirm(
        `Warning: This creates conflicts:\n${conflicts.join('\n')}\n\nProceed anyway?`
      );
      if (!proceed) return;
    }
    
    // 2. Update schedule
    await updateStudentSchedule(studentId, oldSectionId, newSectionId);
    
    // 3. Log change
    await logScheduleChange({
      student_id: studentId,
      action: "section_change",
      from: oldSectionId,
      to: newSectionId,
      reason: "Manual adjustment by committee"
    });
    
    toast.success("Student moved successfully");
  }
  
  return (
    <div>
      <StudentSearch onSelect={setSelectedStudent} />
      {selectedStudent && (
        <ScheduleEditor
          student={selectedStudent}
          onSectionChange={moveStudentToSection}
        />
      )}
    </div>
  );
}
```

**Effort:** 3-4 days

---

## 🟢 Gap #4: Analytics Dashboard (LOW)

### What the PRD Promises
From PRD.md (FR-013):
```
Analytics Dashboard (Committee)
- Elective satisfaction rate (bar chart)
- Room utilization per time slot (heatmap)
- Faculty load distribution (histogram)
- Comparison with previous semesters
```

### What Actually Exists
- ✅ `charts-formatter.ts` implemented (17 passing tests)
- ✅ Chart.js library installed
- ❌ No UI components using charts
- ❌ No data aggregation functions
- ❌ No dashboard page

### Impact
- Committee cannot visualize schedule quality
- No data-driven optimization
- Cannot compare with past semesters
- Missing "nice-to-have" feature

### What Needs to Be Built
```typescript
// Page: app/committee/analytics/page.tsx
export default async function AnalyticsPage() {
  const termCode = await getActiveTerm();
  
  // Aggregate data
  const satisfactionData = await getElectiveSatisfactionRate(termCode);
  const utilizationData = await getRoomUtilization(termCode);
  const loadData = await getFacultyLoadDistribution(termCode);
  
  return (
    <div>
      <SatisfactionChart data={satisfactionData} />
      <UtilizationHeatmap data={utilizationData} />
      <LoadDistributionChart data={loadData} />
    </div>
  );
}

// Use existing charts-formatter functions
import { formatSatisfactionForChart } from "@/lib/generators/charts-formatter";
```

**Effort:** 2-3 days (but NOT MVP-critical)

---

## 🟢 Gap #5: Version Control UI (LOW)

### What the PRD Promises
From PRD.md (FR-012):
```
Version Control System
- Track all changes to schedules over time
- Show diffs between versions
- Can compare any two versions
- Can restore previous version
- Visual diff: Green for added, red for removed
```

### What Actually Exists
- ✅ `schedule_versions` table created
- ✅ `version-diff.ts` implemented (17 passing tests)
- ✅ jsondiffpatch installed
- ❌ No UI for version comparison
- ❌ No integration with schedule generation
- ❌ No restore functionality

### Impact
- Cannot see what changed between generations
- No rollback capability
- Missing audit trail visualization
- Committee has less confidence in changes

### What Needs to Be Built
```typescript
// Page: app/committee/schedule/versions/page.tsx
export default async function VersionHistoryPage() {
  const versions = await getScheduleVersions(termCode);
  
  return (
    <div>
      <VersionTimeline versions={versions} />
      <VersionComparison
        v1={selectedVersion1}
        v2={selectedVersion2}
        onCompare={showDiff}
      />
      <DiffViewer diff={computedDiff} />
    </div>
  );
}

// Use existing version-diff functions
import { generateVersionDiff } from "@/lib/generators/version-diff";
```

**Effort:** 2-3 days (but NOT MVP-critical)

---

## 🟢 Gap #6: Real-Time Collaboration UI (LOW)

### What the PRD Promises
From PRD.md (FR-011):
```
Real-Time Collaboration on Rules
- Multiple committee members can edit rules simultaneously
- Shows active users' cursors/selections
- Conflict-free merging of edits
- Works on: Scheduling rules, constraint configuration
```

### What Actually Exists
- ✅ `yjs-manager.ts` implemented (18 passing tests)
- ✅ Yjs CRDT library installed
- ✅ Supabase Realtime configured
- ✅ React hooks created (`use-collaboration.ts`)
- ❌ No UI using collaboration
- ❌ No rules editor component
- ❌ No presence indicators

### Impact
- Committee members work in isolation
- Risk of overwriting each other's changes
- No real-time feedback
- Nice-to-have feature missing

### What Needs to Be Built
```typescript
// Component: CollaborativeRulesEditor.tsx
import { useCollaboration } from "@/hooks/use-collaboration";

export function CollaborativeRulesEditor({ documentId }: { documentId: string }) {
  const {
    text,
    updateText,
    users,
    isConnected
  } = useCollaboration(documentId, "rules-editor");
  
  return (
    <div>
      <PresenceIndicators users={users} />
      <TextEditor
        value={text}
        onChange={updateText}
        readOnly={!isConnected}
      />
    </div>
  );
}
```

**Effort:** 2-3 days (but NOT MVP-critical)

---

## 📊 Summary Matrix

| Gap | Priority | Impact | Effort | Blocks MVP? |
|-----|----------|--------|--------|-------------|
| **Schedule Generator** | 🔴 Critical | Extreme | 2-6 weeks | ✅ YES |
| **Publication Workflow** | 🟡 High | High | 1-2 days | ✅ YES |
| **Manual Adjustments** | 🟡 Medium | Medium | 3-4 days | ⚠️ Recommended |
| **Analytics Dashboard** | 🟢 Low | Low | 2-3 days | ❌ NO |
| **Version Control UI** | 🟢 Low | Low | 2-3 days | ❌ NO |
| **Collaboration UI** | 🟢 Low | Very Low | 2-3 days | ❌ NO |

---

## 🎯 Minimum to Ship

### Must Fix (Blocks MVP)
1. **Schedule Generator** - Core product feature
2. **Publication Workflow** - Makes schedules official

### Should Fix (Makes MVP Usable)
3. **Manual Adjustments** - Committee needs to fix errors

### Can Wait (Nice-to-Have)
4. Analytics Dashboard
5. Version Control UI
6. Collaboration UI

---

## ⏱️ Time Estimates

### Simple Approach (Recommended)
- Gap #1: 1-2 weeks (simple preference matcher)
- Gap #2: 1-2 days (publish workflow)
- Gap #3: 3-4 days (manual adjustments)
- **Total: 2-3 weeks to shippable MVP**

### AI Approach (Original PRD)
- Gap #1: 4-6 weeks (OR-Tools + Python backend)
- Gap #2: 1-2 days (publish workflow)
- Gap #3: 3-4 days (manual adjustments)
- **Total: 6-8 weeks to shippable MVP**

---

## ✅ Recommendation

**Implement Simple Approach:**
1. Week 1: Build simple preference matcher
2. Week 2: Add publication workflow + manual adjustments
3. Week 3: Test, polish, deploy
4. Future: Add analytics, version control, collaboration

**Why:**
- Gets working product in 3 weeks vs. 8 weeks
- Can iterate based on real feedback
- Simple matcher achieves 70%+ satisfaction (acceptable)
- Committee can manually fix remaining cases

**Defer to v2.0:**
- AI optimization (when you have user data)
- Real-time collaboration (when multiple users confirmed)
- Advanced analytics (when you have historical data)

---

**Document Owner:** Technical Analysis  
**Date:** October 27, 2025  
**Status:** Ready for Decision


