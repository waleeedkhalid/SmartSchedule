# SmartSchedule: 3-Week Implementation Plan
**Based on:** Clear requirements from user  
**Date:** October 27, 2025  
**Timeline:** 3 weeks to MVP launch

---

## 🎯 The Real System

SmartSchedule is a **collaborative scheduling tool** with:
1. Real-time co-editing (Yjs) ✅ Backend ready
2. Version control (jsondiffpatch) ✅ Backend ready
3. Student self-registration (NOT algorithmic assignment)
4. Conflict validation
5. Dashboard analytics

**NOT an AI optimizer!** The original PRD was wrong.

---

## ✅ What You Already Have

### Backend (80% Complete)
- ✅ Yjs collaboration manager (`src/lib/collaboration/yjs-manager.ts`)
- ✅ jsondiffpatch version control (`src/lib/generators/version-diff.ts`)
- ✅ Chart.js formatters (`src/lib/generators/charts-formatter.ts`)
- ✅ Conflict detector (`src/lib/validations/conflict-detector.ts`)
- ✅ All validators (capacity, preferences, schedule, irregular)
- ✅ Database schema (complete)
- ✅ Authentication & RLS (complete)

### Frontend (60% Complete)
- ✅ Dashboard UIs (all roles)
- ✅ CRUD interfaces (courses, sections, rooms, etc.)
- ✅ Student preference submission
- ✅ Faculty feedback system
- ❌ Real-time collaboration UI
- ❌ Version control UI
- ❌ Student registration UI
- ❌ Chart dashboards

---

## 📋 3-Week Roadmap

### Week 1: Real-Time Collaboration & Versioning (35 hours)

#### Day 1-2: Collaborative Schedule Editor (16 hours)
**Goal:** Committee members can edit schedules together

**File:** `src/app/committee/scheduler/collaborative/page.tsx`

```typescript
"use client";

import { useCollaboration } from "@/hooks/use-collaboration";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

export default function CollaborativeScheduler() {
  const {
    text,
    updateText,
    users, // Active users
    isConnected,
    comments
  } = useCollaboration("schedule-draft-fall-2025", "schedule-editor");
  
  return (
    <div className="grid grid-cols-[1fr_300px] gap-4">
      {/* Main Editor */}
      <Card>
        <h2>Schedule Editor</h2>
        
        {/* Presence Indicators */}
        <div className="flex gap-2 mb-4">
          {users.map(user => (
            <Avatar key={user.id} style={{ borderColor: user.color }}>
              {user.name}
            </Avatar>
          ))}
        </div>
        
        {/* Schedule Grid */}
        <ScheduleGrid
          data={text}
          onChange={updateText}
          readOnly={!isConnected}
        />
      </Card>
      
      {/* Comments Sidebar */}
      <Card>
        <CommentThread comments={comments} />
      </Card>
    </div>
  );
}
```

**Components to Build:**
1. `ScheduleGrid.tsx` - Editable schedule table
2. `PresenceIndicators.tsx` - Show active users
3. `CommentThread.tsx` - Inline comments
4. `ScheduleCell.tsx` - Individual time slot

**API:**
- ✅ Already exists: `/api/collaboration/[documentId]/route.ts`

**Tasks:**
- [ ] Create collaborative page
- [ ] Build schedule grid component
- [ ] Add presence indicators
- [ ] Implement inline comments
- [ ] Test with 2+ users

---

#### Day 3-4: Version Control UI (12 hours)
**Goal:** See schedule history and compare versions

**File:** `src/app/committee/scheduler/versions/page.tsx`

```typescript
import { getScheduleVersions } from "@/lib/schedule/versions";
import { generateVersionDiff } from "@/lib/generators/version-diff";

export default async function VersionHistory() {
  const versions = await getScheduleVersions("fall-2025");
  
  return (
    <div className="grid grid-cols-[300px_1fr] gap-4">
      {/* Version Timeline */}
      <Card>
        <h3>Version History</h3>
        <VersionTimeline versions={versions} />
      </Card>
      
      {/* Version Comparison */}
      <Card>
        <VersionComparison
          v1={selectedV1}
          v2={selectedV2}
        />
      </Card>
    </div>
  );
}

function VersionComparison({ v1, v2 }) {
  const diff = generateVersionDiff(v1.data, v2.data);
  
  return (
    <div>
      <h3>Changes from v{v1.version} to v{v2.version}</h3>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Added" value={diff.summary.added} color="green" />
        <StatCard label="Modified" value={diff.summary.modified} color="yellow" />
        <StatCard label="Deleted" value={diff.summary.deleted} color="red" />
      </div>
      
      {/* Diff View */}
      <DiffViewer diff={diff} />
    </div>
  );
}
```

**Components to Build:**
1. `VersionTimeline.tsx` - List of versions
2. `VersionComparison.tsx` - Compare two versions
3. `DiffViewer.tsx` - Show changes (use jsondiffpatch)
4. `RollbackButton.tsx` - Restore previous version

**API Endpoints:**
```typescript
// GET /api/scheduler/versions?term_code=fall-2025
// POST /api/scheduler/versions/rollback { version_id }
```

**Tasks:**
- [ ] Create version history page
- [ ] Build version timeline
- [ ] Implement diff viewer
- [ ] Add rollback functionality
- [ ] Test version comparison

---

#### Day 5: Integration & Testing (7 hours)
- [ ] Test collaboration with multiple users
- [ ] Test version control workflows
- [ ] Fix bugs
- [ ] Performance optimization

---

### Week 2: Student Self-Registration (40 hours)

#### Day 1-3: Elective Browse & Register (24 hours)
**Goal:** Students can register for electives themselves

**File:** `src/app/student/register/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ElectiveRegistration() {
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [validation, setValidation] = useState<ValidationResult>({
    totalCredits: 0,
    conflicts: [],
    prerequisitesMet: true
  });
  
  async function handleRegister(sectionId: string) {
    // Real-time validation
    const result = await validateRegistration({
      student_id: user.id,
      section_id: sectionId,
      current_sections: selectedSections
    });
    
    if (!result.valid) {
      toast.error(result.error);
      return;
    }
    
    // Register
    await registerForSection(sectionId);
    setSelectedSections([...selectedSections, sectionId]);
    toast.success("Registered successfully!");
  }
  
  return (
    <div className="grid grid-cols-[1fr_400px] gap-4">
      {/* Available Electives */}
      <div className="space-y-4">
        <h2>Available Electives</h2>
        
        {electives.map(section => (
          <ElectiveCard
            key={section.id}
            section={section}
            onRegister={() => handleRegister(section.id)}
            disabled={!canRegister(section)}
          />
        ))}
      </div>
      
      {/* Registration Summary */}
      <Card>
        <h3>Your Registration</h3>
        
        {/* Current Credits */}
        <div className="mb-4">
          <p>Total Credits: {validation.totalCredits} / 20</p>
          <Progress value={(validation.totalCredits / 20) * 100} />
        </div>
        
        {/* Registered Sections */}
        <div className="space-y-2">
          {selectedSections.map(id => (
            <RegisteredSectionCard
              key={id}
              sectionId={id}
              onDrop={() => dropSection(id)}
            />
          ))}
        </div>
        
        {/* Conflicts */}
        {validation.conflicts.length > 0 && (
          <Alert variant="destructive">
            <AlertTitle>Conflicts Detected</AlertTitle>
            <AlertDescription>
              {validation.conflicts.map(c => <p key={c}>{c}</p>)}
            </AlertDescription>
          </Alert>
        )}
      </Card>
    </div>
  );
}

function ElectiveCard({ section, onRegister, disabled }) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h4>{section.course_code} - {section.course_name}</h4>
          <p className="text-sm text-muted-foreground">
            {section.instructor_name}
          </p>
          <p className="text-sm">
            {section.day_time} • {section.room}
          </p>
          <p className="text-sm">
            {section.enrolled_count} / {section.capacity} enrolled
          </p>
        </div>
        
        <Button
          onClick={onRegister}
          disabled={disabled}
          variant={section.enrolled_count >= section.capacity ? "outline" : "default"}
        >
          {section.enrolled_count >= section.capacity ? "Full" : "Register"}
        </Button>
      </div>
    </Card>
  );
}
```

**API Endpoints:**
```typescript
// GET /api/student/electives/available - Get available electives
// POST /api/student/register { section_id } - Register for section
// DELETE /api/student/register/[section_id] - Drop section
// POST /api/student/register/validate - Real-time validation
```

**Validation Logic:**
```typescript
async function validateRegistration(data: {
  student_id: string;
  section_id: string;
  current_sections: string[];
}): Promise<ValidationResult> {
  const student = await getStudent(data.student_id);
  const section = await getSection(data.section_id);
  const currentSchedule = await getStudentSchedule(data.student_id);
  
  const errors = [];
  
  // 1. Check credit hour limit (≤20)
  const totalCredits = calculateTotalCredits(currentSchedule, section);
  if (totalCredits > 20) {
    errors.push("Exceeds 20 credit hour limit");
  }
  
  // 2. Check prerequisites
  const prereqsMet = await checkPrerequisites(student, section.course_code);
  if (!prereqsMet) {
    errors.push("Prerequisites not met");
  }
  
  // 3. Check seat availability
  if (section.enrolled_count >= section.capacity) {
    errors.push("Section is full");
  }
  
  // 4. Check time conflicts
  const hasConflict = detectTimeConflict(currentSchedule, section);
  if (hasConflict) {
    errors.push("Time conflict with existing schedule");
  }
  
  return {
    valid: errors.length === 0,
    errors,
    totalCredits
  };
}
```

**Tasks:**
- [ ] Create elective browser page
- [ ] Build registration UI
- [ ] Implement validation logic
- [ ] Add real-time validation API
- [ ] Build registration summary
- [ ] Test registration workflow

---

#### Day 4: Auto-Enrollment in Required Courses (8 hours)
**Goal:** System auto-enrolls students in required courses

```typescript
// Server Action
async function autoEnrollRequiredCourses(studentId: string, termCode: string) {
  const student = await getStudent(studentId);
  const requiredCourses = await getRequiredCourses(student.level);
  
  for (const courseCode of requiredCourses) {
    // Find section with capacity
    const section = await findAvailableSection(courseCode, termCode);
    
    if (section) {
      await enrollStudent(studentId, section.id);
    } else {
      // Log error: No capacity for required course
      await logEnrollmentError(studentId, courseCode, "No capacity");
    }
  }
}
```

**Tasks:**
- [ ] Implement auto-enrollment logic
- [ ] Run at term start
- [ ] Handle capacity issues
- [ ] Send notifications

---

#### Day 5: Testing & Polish (8 hours)
- [ ] Test registration workflow
- [ ] Test validation
- [ ] Test edge cases (full sections, conflicts)
- [ ] Performance testing

---

### Week 3: Dashboards & Publishing (35 hours)

#### Day 1-2: Chart Dashboards (16 hours)
**Goal:** Visualize schedule data with Chart.js

**File:** `src/app/committee/analytics/page.tsx`

```typescript
import { formatSatisfactionForChart, formatRoomUtilizationForChart } from "@/lib/generators/charts-formatter";
import { Bar, Heatmap } from "react-chartjs-2";

export default async function AnalyticsDashboard() {
  const term = await getActiveTerm();
  
  // Fetch data
  const enrollmentStats = await getEnrollmentStats(term.term_code);
  const roomUtilization = await getRoomUtilization(term.term_code);
  const loadDistribution = await getFacultyLoadDistribution(term.term_code);
  
  // Format for Chart.js
  const satisfactionData = formatSatisfactionForChart(enrollmentStats);
  const utilizationData = formatRoomUtilizationForChart(roomUtilization);
  
  return (
    <div className="space-y-8">
      {/* Level Overview */}
      <Card>
        <h3>Enrollment by Level</h3>
        <Bar data={satisfactionData} options={...} />
      </Card>
      
      {/* Room Utilization */}
      <Card>
        <h3>Room Utilization Heatmap</h3>
        <Heatmap data={utilizationData} options={...} />
      </Card>
      
      {/* Faculty Load */}
      <Card>
        <h3>Faculty Load Distribution</h3>
        <Bar data={loadDistribution} options={...} />
      </Card>
    </div>
  );
}
```

**Tasks:**
- [ ] Create analytics page
- [ ] Integrate Chart.js
- [ ] Use existing formatters
- [ ] Add level overview chart
- [ ] Add room utilization heatmap
- [ ] Add faculty load chart

---

#### Day 3-4: Publish Workflow (12 hours)
**Goal:** Registrar can validate and publish schedules

**States:** `draft` → `review` → `published` → `archived`

```typescript
// API: POST /api/scheduler/publish
export async function POST(req: Request) {
  const { term_code, status } = await req.json();
  
  // Validate: Check for conflicts
  if (status === "published") {
    const conflicts = await detectCriticalConflicts(term_code);
    if (conflicts.length > 0) {
      return NextResponse.json({
        error: "Cannot publish with critical conflicts",
        conflicts
      }, { status: 400 });
    }
  }
  
  // Update status
  await supabase
    .from("schedules")
    .update({
      status,
      published_at: new Date(),
      published_by: (await getUser()).id
    })
    .eq("term_code", term_code);
  
  // Create version
  await createScheduleVersion(term_code, status);
  
  return NextResponse.json({ success: true });
}
```

**UI Component:**
```typescript
function PublishWorkflow({ termCode }) {
  const [status, setStatus] = useState("draft");
  
  async function handlePublish() {
    if (!confirm("Publish schedules to all students?")) return;
    
    await fetch("/api/scheduler/publish", {
      method: "POST",
      body: JSON.stringify({ term_code: termCode, status: "published" })
    });
    
    toast.success("Schedules published!");
    setStatus("published");
  }
  
  return (
    <Card>
      <h3>Publication Status</h3>
      
      <StatusBadge status={status} />
      
      {status === "draft" && (
        <Button onClick={() => handlePublish()}>
          Publish Schedules
        </Button>
      )}
      
      {status === "published" && (
        <Button variant="outline" onClick={() => setStatus("draft")}>
          Unpublish (Revert to Draft)
        </Button>
      )}
    </Card>
  );
}
```

**Tasks:**
- [ ] Create publish API endpoint
- [ ] Build status workflow UI
- [ ] Add validation before publish
- [ ] Implement unpublish
- [ ] Add export JSON

---

#### Day 5: Final Testing & Launch (7 hours)
- [ ] End-to-end testing (all workflows)
- [ ] Performance testing
- [ ] Bug fixes
- [ ] Documentation
- [ ] Deploy to production

---

## ✅ Deliverables

### Week 1
- ✅ Real-time collaborative schedule editor
- ✅ Version control UI with diff viewer
- ✅ Presence indicators
- ✅ Inline comments

### Week 2
- ✅ Student self-registration system
- ✅ Auto-enrollment in required courses
- ✅ Real-time validation
- ✅ Registration management (drop, view)

### Week 3
- ✅ Chart dashboards (Chart.js)
- ✅ Publish workflow (draft → published)
- ✅ Export JSON
- ✅ Production deployment

---

## 🧪 Testing Checklist

### Week 1: Collaboration
- [ ] 2 users edit simultaneously
- [ ] Changes sync in real-time
- [ ] Comments appear for all users
- [ ] Version history shows all changes
- [ ] Rollback works correctly

### Week 2: Registration
- [ ] Student can browse electives
- [ ] Registration validates correctly
- [ ] Credit limit enforced (≤20)
- [ ] Prerequisites checked
- [ ] Time conflicts detected
- [ ] Full sections blocked
- [ ] Drop works correctly

### Week 3: Publishing
- [ ] Charts display correctly
- [ ] Publish validates conflicts
- [ ] Students see published schedules
- [ ] Unpublish works
- [ ] JSON export works

---

## 📊 Success Metrics

**After 3 weeks, you will have:**
- ✅ Complete collaborative scheduling tool
- ✅ Student self-registration working
- ✅ Real-time collaboration (Yjs)
- ✅ Version control (jsondiffpatch)
- ✅ Chart dashboards (Chart.js)
- ✅ Publish workflow
- ✅ All 8 core features implemented

**User Impact:**
- Committee can collaborate in real-time
- Students register for electives themselves
- Conflicts detected automatically
- Schedule history tracked
- Data visualized with charts

---

## 🚀 Ready to Start

### Today (Day 0)
1. ✅ Read CLEAR-REQUIREMENTS.md
2. ✅ Read this implementation plan
3. ✅ Review existing code:
   - `src/lib/collaboration/yjs-manager.ts`
   - `src/lib/generators/version-diff.ts`
   - `src/lib/generators/charts-formatter.ts`
4. ⏳ Set up development environment

### Tomorrow (Day 1)
Start Week 1: Collaborative Schedule Editor

---

**Plan Owner:** Technical Implementation  
**Timeline:** 3 weeks (105 hours total)  
**Status:** Ready to implement  
**Start Date:** Tomorrow

