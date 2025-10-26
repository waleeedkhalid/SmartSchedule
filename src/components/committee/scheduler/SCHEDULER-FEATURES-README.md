# Scheduler Features UI Documentation

## Overview

This document provides comprehensive documentation for the newly implemented Scheduler Features UI components. All components are built with **shadcn/ui**, use **mock data**, and are designed for easy backend integration.

## 🎯 Features Implemented

### 1. **Student Management** (`student-management-v2/`)
Complete student tracking and management system for the scheduling committee.

#### Components:
- **`StudentManagementOverview.tsx`** - Dashboard with quick statistics
  - Total students count
  - Enrollment status breakdown
  - Irregular students tracking
  - Average course load metrics
  
- **`StudentListTable.tsx`** - Filterable and searchable student list
  - Search by name, email, or student number
  - Filter by level (1-4) and status (regular/irregular)
  - View student details
  - Send notifications
  - Export to CSV (placeholder)
  
- **`IrregularStudentsTracker.tsx`** - Track students requiring special attention
  - Pending, notified, and resolved status tracking
  - Courses needed display
  - Notification system
  - Resolution workflow
  
- **`StudentManagementPage.tsx`** - Main container with tab navigation

**Demo Route:** `/committee/scheduler/features-demo` → Student Management tab

---

### 2. **Course & Section Management** (`course-section-v2/`)
Comprehensive course catalog and section management interface.

#### Components:
- **`CourseCatalogGrid.tsx`** - Visual course catalog with filters
  - Card-based display with course details
  - Search by code or name
  - Filter by level, type (CORE/REQUIRED/ELECTIVE), and department
  - Quick actions: Add, Edit, Duplicate, Delete
  - Manage sections button
  - Prerequisites display
  
- **`SectionManagementTable.tsx`** - Detailed section management
  - Summary cards (total sections, capacity, utilization)
  - Section list with enrollment tracking
  - Time slots display
  - Instructor and room assignments
  - Status indicators (DRAFT/PUBLISHED/CANCELLED)
  - Progress bars for enrollment
  
- **`CourseAndSectionPage.tsx`** - Main container with tab switching

**Demo Route:** `/committee/scheduler/features-demo` → Courses tab

---

### 3. **Timeline Management** (`timeline-v2/`)
Academic calendar and phase tracking visualization.

#### Components:
- **`AcademicTimelineVisualization.tsx`** - Visual timeline with phases
  - Phase progression indicator
  - Progress tracking per phase
  - Task lists with completion status
  - Days remaining counter
  - Upcoming events and deadlines
  - Priority indicators (HIGH/MEDIUM/LOW)
  - Event countdown badges
  
- **`TimelineManagementPage.tsx`** - Main container

**Demo Route:** `/committee/scheduler/features-demo` → Timeline tab

---

### 4. **Rules Management** (`rules-v2/`)
Configure scheduling rules and priority weights.

#### Components:
- **`RulesConfigurationTable.tsx`** - Scheduling rules management
  - Rule types (Time, Room, Instructor, Enrollment, Custom)
  - Priority levels (1-10 scale)
  - Active/Inactive toggle
  - Test rule functionality
  - CRUD operations
  
- **`PriorityWeightsConfig.tsx`** - Priority weights configuration
  - Interactive sliders for weight adjustment
  - Real-time total calculation (must equal 100%)
  - Categories: Student Preferences, Faculty Availability, Room Optimization, Time Distribution
  - Save/Reset functionality
  - Visual feedback for balanced weights
  
- **`RulesManagementPage.tsx`** - Main container with tabs

**Demo Route:** `/committee/scheduler/features-demo` → Rules tab

---

## 📁 File Structure

```
src/
├── types/
│   └── scheduler-mock.ts              # All TypeScript types for mock data
├── lib/
│   └── mock-data/
│       └── scheduler-data.ts          # Mock data generators
└── components/
    └── committee/
        └── scheduler/
            ├── student-management-v2/
            │   ├── StudentManagementOverview.tsx
            │   ├── StudentListTable.tsx
            │   ├── IrregularStudentsTracker.tsx
            │   ├── StudentManagementPage.tsx
            │   └── index.ts
            ├── course-section-v2/
            │   ├── CourseCatalogGrid.tsx
            │   ├── SectionManagementTable.tsx
            │   ├── CourseAndSectionPage.tsx
            │   └── index.ts
            ├── timeline-v2/
            │   ├── AcademicTimelineVisualization.tsx
            │   ├── TimelineManagementPage.tsx
            │   └── index.ts
            └── rules-v2/
                ├── RulesConfigurationTable.tsx
                ├── PriorityWeightsConfig.tsx
                ├── RulesManagementPage.tsx
                └── index.ts
```

---

## 🔌 Mock Data System

### Type Definitions (`src/types/scheduler-mock.ts`)

All types are designed to match your database schema for seamless migration:

```typescript
// Student Management
- MockStudent
- MockEnrollment
- MockCapacityThreshold
- MockIrregularStudent
- MockStudentEnrollmentSummary

// Course & Section
- MockCourse
- MockSection
- MockTimeSlot
- MockRoom
- MockCourseWithSections

// Timeline
- MockAcademicTerm
- MockAcademicEvent
- MockTimelinePhase
- MockPhaseTask
- AcademicPhase (enum)

// Rules
- MockSchedulingRule
- MockRulePriority
- MockConstraint
- MockRuleViolation
```

### Mock Data (`src/lib/mock-data/scheduler-data.ts`)

Pre-populated data for testing:
- 5 sample students (Arabic names)
- 5 sample courses (SWE department)
- 3 course sections with time slots
- 5 rooms across different buildings
- Academic timeline with 3 phases
- 3 upcoming events
- 3 scheduling rules
- 4 priority weight categories

---

## 🎨 UI Components Used

All components use **shadcn/ui** primitives:

- `Card` - Container for content sections
- `Table` - Data display
- `Badge` - Status indicators
- `Button` - Actions
- `Input` - Text input with search
- `Select` - Dropdowns for filters
- `Tabs` - Navigation between views
- `Progress` - Visual progress indicators
- `Slider` - Weight adjustment (rules)
- `Switch` - Toggle states
- `Dialog` - Modal windows (placeholders for forms)

**Icons:** All icons from `lucide-react`

---

## 🚀 Usage Examples

### Import and Use Student Management

```typescript
import { StudentManagementPage } from "@/components/committee/scheduler/student-management-v2";

export default function SchedulerPage() {
  return <StudentManagementPage />;
}
```

### Import and Use Course Management

```typescript
import { CourseAndSectionPage } from "@/components/committee/scheduler/course-section-v2";

export default function CoursesPage() {
  return <CourseAndSectionPage />;
}
```

### Custom Integration Example

```typescript
import { StudentListTable } from "@/components/committee/scheduler/student-management-v2";

export default function CustomPage() {
  const students = mockStudents; // Replace with API call
  
  const handleViewDetails = (id: string) => {
    // Your logic
  };
  
  return (
    <StudentListTable 
      students={students}
      onViewDetails={handleViewDetails}
    />
  );
}
```

---

## 🔄 Backend Migration Guide

### Step 1: Replace Mock Data Imports

**Before:**
```typescript
import { mockStudents } from "@/lib/mock-data/scheduler-data";
```

**After:**
```typescript
import { getStudents } from "@/lib/api/students";
const students = await getStudents();
```

### Step 2: Implement API Functions

Create API functions that return the same type structure:

```typescript
// src/lib/api/students.ts
import { MockStudent } from "@/types/scheduler-mock";

export async function getStudents(): Promise<MockStudent[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("students")
    .select("*");
  
  if (error) throw error;
  return data;
}
```

### Step 3: Update Event Handlers

Replace placeholder toast notifications with actual API calls:

```typescript
// Before
const handleDeleteStudent = (id: string) => {
  toast({ title: "Delete Student", description: "Student deleted" });
};

// After
const handleDeleteStudent = async (id: string) => {
  try {
    await deleteStudent(id);
    toast({ title: "Success", description: "Student deleted" });
    revalidatePath("/committee/scheduler/students");
  } catch (error) {
    toast({ 
      title: "Error", 
      description: error.message,
      variant: "destructive" 
    });
  }
};
```

---

## 🎯 Key Features & Best Practices

### 1. **Performance Optimized**
- Memoized filters and search (useMemo)
- Efficient re-rendering
- Server Components where possible

### 2. **User Experience**
- Clear visual hierarchy
- Intuitive filters and search
- Real-time feedback with toasts
- Loading states ready for API integration
- Empty states with helpful messages

### 3. **Accessibility**
- Semantic HTML
- ARIA labels
- Keyboard navigation support
- Screen reader friendly

### 4. **Responsive Design**
- Mobile-first approach
- Grid layouts adapt to screen size
- Touch-friendly buttons and inputs

### 5. **Type Safety**
- Full TypeScript coverage
- Proper interface definitions
- Type-safe event handlers

---

## 🧪 Testing the Demo

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the demo page:**
   ```
   http://localhost:3000/committee/scheduler/features-demo
   ```

3. **Test each feature:**
   - Click through all tabs
   - Test filters and search
   - Try quick actions (buttons)
   - Check responsiveness (resize browser)

---

## 📋 TODO for Production

- [ ] Connect Student Management to Supabase
- [ ] Connect Course Management to Supabase
- [ ] Connect Timeline to Supabase
- [ ] Connect Rules to Supabase
- [ ] Implement form dialogs for CRUD operations
- [ ] Add proper error boundaries
- [ ] Add loading skeletons
- [ ] Implement CSV export functionality
- [ ] Add confirmation dialogs for destructive actions
- [ ] Implement rule testing logic
- [ ] Add pagination for large datasets
- [ ] Implement real-time updates (Supabase subscriptions)
- [ ] Add comprehensive error handling
- [ ] Write unit tests for components
- [ ] Add E2E tests for workflows

---

## 🎨 Design Tokens

### Colors Used
- **Blue**: Primary actions, student-related
- **Green**: Success states, active items
- **Red**: Destructive actions, critical alerts
- **Orange**: Warnings, irregular students
- **Purple**: Electives, special categories
- **Gray**: Neutral, inactive states

### Typography
- **Headings**: Bold, tracking-tight
- **Body**: Regular, readable line height
- **Captions**: Small, muted foreground

---

## 🆘 Troubleshooting

### Issue: Components not showing
**Solution:** Check imports and make sure all dependencies are installed:
```bash
npm install
```

### Issue: Type errors
**Solution:** Ensure TypeScript is up to date and types are properly imported:
```bash
npm run build
```

### Issue: Styling issues
**Solution:** Verify Tailwind CSS is configured correctly and run:
```bash
npm run dev
```

---

## 📞 Support

For questions or issues:
1. Check this documentation first
2. Review mock data types in `scheduler-mock.ts`
3. Examine mock data in `scheduler-data.ts`
4. Test components in the demo page

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Status:** ✅ Ready for Backend Integration

