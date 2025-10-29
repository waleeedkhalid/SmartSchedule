# Frontend Migration Guide - SmartSchedule V1 API Refactoring

## 🎯 Overview

This guide helps frontend developers migrate from the old API structure to the new refactored API that supports semester-based scheduling.

## ⚠️ Critical Breaking Changes

### 1. Semester Context is Now Required

**All section, exam, and enrollment queries require a semester_id.**

#### Before (❌ Will Break)
```typescript
// Old API calls without semester
const response = await fetch('/api/sections');
const response = await fetch('/api/exams');
const response = await fetch('/api/student/enrollments');
```

#### After (✅ Correct)
```typescript
// Get current semester first
const semesterResponse = await fetch('/api/semesters?current=true');
const semester = await semesterResponse.json();

// Then use semester.id in all queries
const sections = await fetch(`/api/sections?semester_id=${semester.id}`);
const exams = await fetch(`/api/exams?semester_id=${semester.id}`);
const enrollments = await fetch(`/api/student/enrollments?semester_id=${semester.id}`);
```

### 2. Student Level Location Changed

Student level is no longer in `user_roles` table - it's now in `student_profile`.

#### Before (❌)
```typescript
const { data: user } = await supabase
  .from('user_roles')
  .select('level')
  .eq('user_id', userId)
  .single();

const level = user.level; // undefined
```

#### After (✅)
```typescript
const { data: profile } = await supabase
  .from('student_profile')
  .select('current_level')
  .eq('user_id', userId)
  .single();

const level = profile.current_level; // correct
```

### 3. Course Fields Renamed

#### Before (❌)
```typescript
<h2>{course.title}</h2>
<Badge>{course.is_elective ? 'Elective' : 'Required'}</Badge>
```

#### After (✅)
```typescript
<h2>{course.name}</h2>
<Badge>{course.course_type === 'elective' ? 'Elective' : 'Required'}</Badge>
```

### 4. Enrollment Flow Changed

The enrollment process now uses database functions instead of direct table inserts.

#### Before (❌)
```typescript
// Old: Single table insert
const response = await fetch('/api/student/enrollments', {
  method: 'POST',
  body: JSON.stringify({ section_id: sectionId })
});
```

#### After (✅)
```typescript
// New: Dual model with validation
const response = await fetch('/api/student/enrollments', {
  method: 'POST',
  body: JSON.stringify({ 
    section_id: sectionId,
    enrollment_type: 'elective' // optional: 'required' | 'elective' | 'retake'
  })
});

// Response includes validation details
const result = await response.json();
if (result.success) {
  console.log('Enrolled!', result.enrollment_id);
}
```

### 5. Drop Enrollment Parameter Changed

The `[id]` parameter is now `section_id` instead of `enrollment_id`.

#### Before (❌)
```typescript
// Old: Used enrollment_id
await fetch(`/api/student/enrollments/${enrollmentId}`, {
  method: 'DELETE'
});
```

#### After (✅)
```typescript
// New: Uses section_id
await fetch(`/api/student/enrollments/${sectionId}`, {
  method: 'DELETE'
});
```

---

## 📱 Component Migration Examples

### Example 1: Course List Component

#### Before
```typescript
// pages/courses.tsx
function CoursesPage() {
  const { data: courses } = useQuery('courses', async () => {
    const res = await fetch('/api/courses');
    return res.json();
  });

  return (
    <div>
      {courses?.map(course => (
        <CourseCard
          key={course.code}
          title={course.title}
          isElective={course.is_elective}
          weeklyHours={course.weekly_hours}
        />
      ))}
    </div>
  );
}
```

#### After
```typescript
// pages/courses.tsx
function CoursesPage() {
  const { data: courses } = useQuery('courses', async () => {
    const res = await fetch('/api/courses');
    return res.json();
  });

  return (
    <div>
      {courses?.map(course => (
        <CourseCard
          key={course.code}
          name={course.name} // changed from title
          courseType={course.course_type} // changed from is_elective
          // weeklyHours removed
        />
      ))}
    </div>
  );
}
```

### Example 2: Section List Component

#### Before
```typescript
// pages/sections.tsx
function SectionsPage({ level }: { level: number }) {
  const { data: sections } = useQuery(['sections', level], async () => {
    const res = await fetch(`/api/sections?level=${level}`);
    return res.json();
  });

  return <SectionList sections={sections} />;
}
```

#### After
```typescript
// pages/sections.tsx
function SectionsPage({ level }: { level: number }) {
  // Get current semester first
  const { data: semester } = useQuery('currentSemester', async () => {
    const res = await fetch('/api/semesters?current=true');
    return res.json();
  });

  const { data: sections } = useQuery(
    ['sections', semester?.id, level],
    async () => {
      if (!semester?.id) return [];
      const res = await fetch(
        `/api/sections?semester_id=${semester.id}&level=${level}`
      );
      return res.json();
    },
    { enabled: !!semester?.id } // only fetch when semester is loaded
  );

  return <SectionList sections={sections} semester={semester} />;
}
```

### Example 3: Student Schedule Component

#### Before
```typescript
// pages/student/schedule.tsx
function SchedulePage() {
  const { data: schedule } = useQuery('schedule', async () => {
    const res = await fetch('/api/student/schedule');
    return res.json();
  });

  return (
    <div>
      <h1>My Schedule</h1>
      {schedule?.sections.map(section => (
        <ScheduleItem key={section.id} {...section} />
      ))}
    </div>
  );
}
```

#### After
```typescript
// pages/student/schedule.tsx
function SchedulePage() {
  // Get current semester
  const { data: semester } = useQuery('currentSemester', async () => {
    const res = await fetch('/api/semesters?current=true');
    return res.json();
  });

  const { data: schedule } = useQuery(
    ['schedule', semester?.id],
    async () => {
      if (!semester?.id) return null;
      const res = await fetch(
        `/api/student/schedule?semester_id=${semester.id}`
      );
      return res.json();
    },
    { enabled: !!semester?.id }
  );

  return (
    <div>
      <h1>My Schedule - {semester?.name}</h1>
      {schedule?.schedule.map(enrollment => (
        <div key={enrollment.id}>
          <h3>{enrollment.course.name}</h3>
          {enrollment.section_assignments?.map(assignment => (
            <ScheduleItem 
              key={assignment.id} 
              section={assignment.section}
              type={assignment.assignment_type}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Example 4: Enrollment Component

#### Before
```typescript
// components/EnrollButton.tsx
function EnrollButton({ sectionId }: { sectionId: string }) {
  const enrollMutation = useMutation(async () => {
    const res = await fetch('/api/student/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section_id: sectionId })
    });
    
    if (!res.ok) throw new Error('Failed to enroll');
    return res.json();
  });

  return (
    <button onClick={() => enrollMutation.mutate()}>
      Enroll
    </button>
  );
}
```

#### After
```typescript
// components/EnrollButton.tsx
function EnrollButton({ 
  sectionId, 
  enrollmentType = 'elective' 
}: { 
  sectionId: string;
  enrollmentType?: 'required' | 'elective' | 'retake';
}) {
  const enrollMutation = useMutation(async () => {
    const res = await fetch('/api/student/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        section_id: sectionId,
        enrollment_type: enrollmentType 
      })
    });
    
    const result = await res.json();
    
    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Failed to enroll');
    }
    
    return result;
  });

  return (
    <button 
      onClick={() => enrollMutation.mutate()}
      disabled={enrollMutation.isLoading}
    >
      {enrollMutation.isLoading ? 'Enrolling...' : 'Enroll'}
    </button>
  );
}
```

### Example 5: Drop Enrollment Component

#### Before
```typescript
// components/DropButton.tsx
function DropButton({ enrollmentId }: { enrollmentId: string }) {
  const dropMutation = useMutation(async () => {
    const res = await fetch(`/api/student/enrollments/${enrollmentId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to drop');
    return res.json();
  });

  return <button onClick={() => dropMutation.mutate()}>Drop</button>;
}
```

#### After
```typescript
// components/DropButton.tsx
// IMPORTANT: Parameter is now section_id, not enrollment_id
function DropButton({ sectionId }: { sectionId: string }) {
  const dropMutation = useMutation(async () => {
    const res = await fetch(`/api/student/enrollments/${sectionId}`, {
      method: 'DELETE'
    });
    
    const result = await res.json();
    
    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Failed to drop');
    }
    
    return result;
  });

  return (
    <button 
      onClick={() => dropMutation.mutate()}
      disabled={dropMutation.isLoading}
    >
      {dropMutation.isLoading ? 'Dropping...' : 'Drop'}
    </button>
  );
}
```

---

## 🎣 React Hooks Examples

### Custom Hook: useSemester

Create a reusable hook to manage semester context:

```typescript
// hooks/useSemester.ts
import { useQuery } from '@tanstack/react-query';

export function useSemester(semesterId?: string) {
  // If specific semester ID provided, fetch that one
  if (semesterId) {
    return useQuery(['semester', semesterId], async () => {
      const res = await fetch(`/api/semesters/${semesterId}`);
      if (!res.ok) throw new Error('Failed to fetch semester');
      return res.json();
    });
  }

  // Otherwise, fetch current semester
  return useQuery('currentSemester', async () => {
    const res = await fetch('/api/semesters?current=true');
    if (!res.ok) throw new Error('No current semester');
    return res.json();
  });
}
```

### Custom Hook: useSections

```typescript
// hooks/useSections.ts
import { useQuery } from '@tanstack/react-query';
import { useSemester } from './useSemester';

export function useSections(filters?: {
  level?: number;
  courseCode?: string;
  state?: 'draft' | 'released';
}) {
  const { data: semester } = useSemester();

  return useQuery(
    ['sections', semester?.id, filters],
    async () => {
      if (!semester?.id) return [];
      
      const params = new URLSearchParams({
        semester_id: semester.id,
        ...filters
      });
      
      const res = await fetch(`/api/sections?${params}`);
      if (!res.ok) throw new Error('Failed to fetch sections');
      return res.json();
    },
    { enabled: !!semester?.id }
  );
}
```

### Custom Hook: useEnrollment

```typescript
// hooks/useEnrollment.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useEnrollment() {
  const queryClient = useQueryClient();

  const enroll = useMutation(
    async ({ sectionId, type }: { 
      sectionId: string; 
      type?: 'required' | 'elective' | 'retake' 
    }) => {
      const res = await fetch('/api/student/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          section_id: sectionId,
          enrollment_type: type || 'elective'
        })
      });
      
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to enroll');
      }
      
      return result;
    },
    {
      onSuccess: () => {
        // Invalidate related queries
        queryClient.invalidateQueries(['schedule']);
        queryClient.invalidateQueries(['enrollments']);
        queryClient.invalidateQueries(['sections']);
      }
    }
  );

  const drop = useMutation(
    async (sectionId: string) => {
      const res = await fetch(`/api/student/enrollments/${sectionId}`, {
        method: 'DELETE'
      });
      
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to drop');
      }
      
      return result;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['schedule']);
        queryClient.invalidateQueries(['enrollments']);
        queryClient.invalidateQueries(['sections']);
      }
    }
  );

  return { enroll, drop };
}
```

---

## 🎨 Context Provider Pattern

Create a semester context to avoid prop drilling:

```typescript
// contexts/SemesterContext.tsx
import { createContext, useContext, ReactNode } from 'react';
import { useSemester } from '@/hooks/useSemester';

interface SemesterContextType {
  semester: any; // Replace with actual type
  isLoading: boolean;
  error: any;
}

const SemesterContext = createContext<SemesterContextType | null>(null);

export function SemesterProvider({ children }: { children: ReactNode }) {
  const { data: semester, isLoading, error } = useSemester();

  return (
    <SemesterContext.Provider value={{ semester, isLoading, error }}>
      {children}
    </SemesterContext.Provider>
  );
}

export function useCurrentSemester() {
  const context = useContext(SemesterContext);
  if (!context) {
    throw new Error('useCurrentSemester must be used within SemesterProvider');
  }
  return context;
}
```

Usage:

```typescript
// app/layout.tsx
import { SemesterProvider } from '@/contexts/SemesterContext';

export default function Layout({ children }) {
  return (
    <SemesterProvider>
      {children}
    </SemesterProvider>
  );
}

// components/SectionList.tsx
import { useCurrentSemester } from '@/contexts/SemesterContext';

function SectionList() {
  const { semester } = useCurrentSemester();
  
  // No need to pass semester as prop anymore
  const { data: sections } = useQuery(['sections', semester?.id], ...);
  
  return <div>Sections for {semester?.name}</div>;
}
```

---

## 📋 Migration Checklist

### Global Changes
- [ ] Install/update dependencies if needed
- [ ] Create semester context provider
- [ ] Create custom hooks (useSemester, useSections, etc.)
- [ ] Update TypeScript types (after regenerating from Supabase)

### Component-Level Changes
- [ ] Update all course displays to use `name` instead of `title`
- [ ] Update all course filters to use `course_type` instead of `is_elective`
- [ ] Remove references to `weekly_hours`
- [ ] Add semester context to all section queries
- [ ] Add semester context to all exam queries
- [ ] Add semester context to all enrollment queries
- [ ] Update student level references to use `student_profile`
- [ ] Update enrollment flow to use new API
- [ ] Update drop enrollment to use `section_id` instead of `enrollment_id`
- [ ] Update schedule display to show dual enrollment structure

### Testing
- [ ] Test semester switching
- [ ] Test section enrollment with validation
- [ ] Test section drop
- [ ] Test schedule display
- [ ] Test course filtering by type
- [ ] Test exam display by semester
- [ ] Test student profile display

---

## 🐛 Common Errors & Solutions

### Error: "No semester found"
**Solution:** Ensure a current semester is set in the database.
```sql
UPDATE academic_semester SET is_current = true WHERE id = 'your-semester-id';
```

### Error: "Student profile not found"
**Solution:** Ensure student has a profile in `student_profile` table.
```sql
INSERT INTO student_profile (user_id, student_id, current_level, ...)
VALUES ('user-id', 'student-id', 4, ...);
```

### Error: "section_id is required"
**Solution:** Make sure you're passing `section_id` in enrollment requests, not `enrollment_id`.

### Error: "Query missing semester_id"
**Solution:** Always include `semester_id` parameter when querying sections or exams.

---

## 🚀 New Features Available

### 1. Semester Management
```typescript
// List all semesters
const semesters = await fetch('/api/semesters').then(r => r.json());

// Get current semester
const current = await fetch('/api/semesters?current=true').then(r => r.json());

// Create new semester (scheduling role only)
await fetch('/api/semesters', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Fall 2025',
    code: '2025F',
    start_date: '2025-09-01',
    end_date: '2025-12-31',
    ...
  })
});
```

### 2. Survey Periods
```typescript
// List surveys for semester
const surveys = await fetch(
  `/api/survey-periods?semester_id=${semesterId}`
).then(r => r.json());

// Check if student can respond
const eligible = await fetch(
  `/api/survey-periods/check-eligibility?type=elective_survey`
).then(r => r.json());
```

### 3. Student Profiles
```typescript
// Get student profile
const profile = await fetch(
  `/api/student-profiles/${userId}`
).then(r => r.json());

console.log(profile.current_level);
console.log(profile.academic_status);
console.log(profile.max_credits_allowed);
```

---

## 📞 Need Help?

- **Documentation**: See `REFACTORING_SUMMARY.md` for complete technical details
- **Database Functions**: Check `DEVELOPER_QUICK_START.md` for function reference
- **Schema Details**: Review `DATA_MODEL_IMPLEMENTATION_SUMMARY.md`

---

## ✅ Quick Win Checklist

Start with these easy wins:

1. ✅ Create `useSemester()` hook
2. ✅ Wrap app in `<SemesterProvider>`
3. ✅ Update course displays: `title` → `name`
4. ✅ Update course filters: `is_elective` → `course_type`
5. ✅ Add `semester_id` to section queries
6. ✅ Test enrollment flow

Then tackle the harder ones:

7. ⏳ Update enrollment components
8. ⏳ Update schedule display
9. ⏳ Update student profile references
10. ⏳ Test everything thoroughly

Good luck! 🎉


