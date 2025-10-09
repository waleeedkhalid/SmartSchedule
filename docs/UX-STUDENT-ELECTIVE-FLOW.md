# Student Elective Selection UX Flow Design

## Comprehensive User Experience Blueprint

---

## 1. Executive Summary

This document outlines the complete user experience design for the student elective course selection workflow in the SmartSchedule university management system. The design prioritizes intuitive navigation, clear visual feedback, and minimal cognitive load while ensuring data integrity and seamless backend integration.

---

## 2. User Journey Map

### 2.1 High-Level Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Authentication │ --> │  Course Browse  │ --> │   Selection     │
│   & Welcome     │     │  & Discovery    │     │  & Ranking      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
         ┌───────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Validation    │ --> │   Submission    │ --> │  Confirmation   │
│   & Review      │     │   Process       │     │  & Next Steps   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 2.2 Detailed Phase Breakdown

#### Phase 1: Authentication & Welcome (Duration: 30-60 seconds)

**Objective:** Secure student authentication and context setting

**User Actions:**

- Enter student ID/username
- Provide password
- Optional: Use SSO (Single Sign-On)

**System Response:**

- Validate credentials
- Fetch student profile (level, completed courses)
- Load available elective packages based on student level
- Display personalized welcome message

**Visual Elements:**

- Clean login card with university branding
- Clear input fields with validation states
- Loading spinner during authentication
- Error messages with recovery instructions

**Success Criteria:**

- Student authenticated within 3 attempts
- Profile data loaded < 2 seconds
- Clear indication of login success

---

#### Phase 2: Course Discovery & Browse (Duration: 2-5 minutes)

**Objective:** Help students understand available electives and requirements

**User Actions:**

- View elective packages (University Requirements, Department Electives, etc.)
- Filter courses by category
- Read course descriptions
- Check prerequisites
- View credit hour requirements

**System Response:**

- Display organized course cards
- Show prerequisite validation
- Highlight courses matching student's completed prerequisites
- Display remaining credit hour requirements per package

**Visual Elements:**

- Category filter chips (University Requirements, Department Electives, etc.)
- Course cards with:
  - Course code & name
  - Credit hours
  - Prerequisites (with validation badges)
  - Short description
  - Selection status
- Progress indicators showing package requirements (e.g., "0/4 hours selected")

**Interaction Patterns:**

- Hover states reveal more course details
- Click to expand full description
- Visual indicators for prerequisite met/unmet
- Disabled state for ineligible courses

**Success Criteria:**

- Students can identify eligible courses within 1 minute
- Clear understanding of package requirements
- No confusion about prerequisites

---

#### Phase 3: Course Selection & Ranking (Duration: 3-7 minutes)

**Objective:** Enable efficient multi-course selection with preference ranking

**User Actions:**

- Select courses from available electives
- Rank selections in order of preference (drag-and-drop or reorder buttons)
- Add/remove courses from selection
- Adjust rankings

**System Response:**

- Real-time validation:
  - Min/max course limits per package
  - Total credit hour constraints
  - Prerequisite verification
- Update selection counter
- Recalculate package fulfillment
- Show warning for incomplete packages

**Visual Elements:**

- **Selection Panel (Sidebar or Bottom Sheet):**

  - Selected course list with ranking numbers
  - Drag handles or reorder buttons
  - Remove buttons (X icon)
  - Package progress bars
  - Total credit hours counter

- **Course Cards (Main Area):**

  - Visual state changes (selected vs available)
  - Select/Deselect button
  - Badge showing rank number when selected

- **Validation Indicators:**
  - Green checkmarks for valid packages
  - Warning icons for incomplete packages
  - Error messages for conflicts

**Interaction Patterns:**

- **Selection:** Click "Select" button or card → adds to selection panel
- **Ranking:** Drag-and-drop reordering OR up/down arrow buttons
- **Removal:** Click X icon → removes from selection, reorders remaining
- **Real-time feedback:** Counters update immediately
- **Mobile-responsive:** Bottom sheet for selections on mobile

**Validation Rules:**

- Minimum selections per package must be met
- Maximum selections cannot be exceeded
- Prerequisite courses must be completed
- Total credit hours must align with degree requirements

**Success Criteria:**

- Students can select and rank 6-10 courses in < 5 minutes
- Zero confusion about ranking order
- Clear understanding of package completion status

---

#### Phase 4: Review & Validation (Duration: 1-2 minutes)

**Objective:** Allow students to review selections before final submission

**User Actions:**

- Review complete selection list
- Check package fulfillment summary
- Verify ranking order
- Make final adjustments
- Confirm understanding of commitment

**System Response:**

- Display comprehensive summary:
  - All selected courses by package
  - Ranking order (1st choice, 2nd choice, etc.)
  - Credit hour totals per package
  - Package completion status
- Show warnings for any issues
- Enable "Submit" button only when valid

**Visual Elements:**

- **Review Card:**

  - Grouped by elective package
  - Course list with rankings
  - Package status badges (Complete/Incomplete)
  - Total credit hours summary

- **Confirmation Checklist:**

  - [ ] I understand these are preferences, not guarantees
  - [ ] I have ranked courses in order of importance
  - [ ] I have reviewed prerequisite requirements

- **Action Buttons:**
  - "Edit Selections" → return to Phase 3
  - "Submit Preferences" → proceed to Phase 5

**Success Criteria:**

- Clear understanding of what's being submitted
- Easy path to make corrections
- No submission of invalid selections

---

#### Phase 5: Submission (Duration: 5-10 seconds)

**Objective:** Securely transmit preferences to backend system

**User Actions:**

- Click "Submit Preferences"
- Wait for confirmation

**System Response:**

- **Frontend:**

  - Disable submit button
  - Show loading spinner
  - Display progress message

- **Backend:**
  - Validate submission data
  - Store in database (Supabase):
    - Student ID
    - Selected course codes
    - Ranking/priority order
    - Submission timestamp
  - Trigger notification to scheduling committee
  - Generate submission ID

**Visual Elements:**

- Loading overlay with spinner
- Progress text: "Submitting your preferences..."
- No ability to navigate away during submission

**Error Handling:**

- Network errors → "Connection lost. Retrying..."
- Validation errors → Display specific issues
- Success → Proceed to Phase 6

**Success Criteria:**

- Data persisted successfully
- Committee dashboard receives submission
- No data loss

---

#### Phase 6: Confirmation & Next Steps (Duration: 30 seconds)

**Objective:** Confirm successful submission and set expectations

**User Actions:**

- Read confirmation message
- Note submission ID
- Understand next steps
- Optional: Download PDF receipt

**System Response:**

- Display success message with:
  - Submission ID
  - Timestamp
  - Summary of submitted preferences
  - Expected timeline for schedule generation
  - Contact information for questions

**Visual Elements:**

- **Success Card:**

  - Large checkmark icon
  - "Preferences Submitted Successfully" heading
  - Submission details
  - Ranked course list (read-only)
  - "What happens next?" section

- **Action Buttons:**
  - "Download Receipt" → PDF generation
  - "Return to Dashboard" → navigation
  - "View My Current Schedule" → link

**Success Criteria:**

- Student feels confident submission was received
- Clear expectations about next steps
- Easy reference for future inquiries (submission ID)

---

## 3. Information Architecture

### 3.1 Data Structure

```typescript
// Student Authentication Context
interface StudentSession {
  studentId: string;
  name: string;
  level: number; // 4-8
  completedCourses: string[]; // course codes
  email?: string;
}

// Elective Selection State
interface ElectiveSelection {
  id: string; // generated UUID
  studentId: string;
  timestamp: string; // ISO format
  selections: {
    packageId: string;
    courses: {
      code: string;
      name: string;
      credits: number;
      priority: number; // 1 = highest
    }[];
  }[];
  status: "draft" | "submitted" | "processed";
}

// Course Eligibility Check
interface CourseEligibility {
  courseCode: string;
  isEligible: boolean;
  reason?: string; // e.g., "Missing prerequisite: SWE211"
  prerequisitesMet: boolean;
  alreadyCompleted: boolean;
}
```

### 3.2 Navigation Structure

```
Student Portal
├── Dashboard (Home)
├── My Schedule
│   └── Current Courses
│   └── Exam Schedule
├── Elective Selection ⭐ (NEW)
│   ├── Browse Courses
│   ├── My Selections
│   └── Submission History
├── Feedback & Surveys
└── Profile Settings
```

---

## 4. Visual Design Specifications

### 4.1 Color System (Using Current Theme)

**Selection States:**

- Available: `bg-card` (default card background)
- Hovered: `bg-muted` (subtle highlight)
- Selected: `bg-primary/10` with `border-primary` (2px)
- Disabled: `opacity-50` with `cursor-not-allowed`

**Status Indicators:**

- Success: `text-green-600 dark:text-green-400`
- Warning: `text-yellow-600 dark:text-yellow-400`
- Error: `text-red-600 dark:text-red-400`
- Info: `text-blue-600 dark:text-blue-400`

**Progress Indicators:**

- Complete: `bg-green-500`
- Partial: `bg-yellow-500`
- Empty: `bg-gray-300 dark:bg-gray-700`

### 4.2 Typography

**Headings:**

- Page Title: `text-3xl font-bold`
- Section Title: `text-xl font-semibold`
- Card Title: `text-lg font-medium`

**Body Text:**

- Description: `text-sm text-muted-foreground`
- Course Name: `text-base font-medium`
- Helper Text: `text-xs text-muted-foreground`

### 4.3 Spacing & Layout

**Card Spacing:**

- Padding: `p-6`
- Gap between cards: `gap-4`
- Section spacing: `space-y-6`

**Grid Layouts:**

- Course Cards: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- Selection Panel: Fixed width `w-80` on desktop, full width on mobile

### 4.4 Iconography

**Icons (Lucide React):**

- Success: `CheckCircle2`
- Warning: `AlertTriangle`
- Error: `XCircle`
- Info: `Info`
- Selection: `Plus`, `Minus`, `X`
- Ranking: `GripVertical`, `ChevronUp`, `ChevronDown`
- Filter: `Filter`, `Search`
- Loading: `Loader2` with spin animation

---

## 5. Interaction Patterns

### 5.1 Selection Feedback

**Immediate Visual Response:**

```
User clicks "Select" →
1. Card border changes to primary color (150ms transition)
2. Checkmark appears in top-right corner
3. Card slides into selection panel (300ms animation)
4. Counter increments
5. Progress bar updates
```

**Deselection:**

```
User clicks "Remove" →
1. Card fades out of selection panel (200ms)
2. Remaining cards reorder smoothly
3. Main area card returns to available state
4. Counter decrements
5. Progress bar updates
```

### 5.2 Drag-and-Drop Ranking

**Desktop Experience:**

```
1. User hovers over course in selection panel
2. Drag handle becomes prominent
3. User clicks and drags
4. Other courses shift to make space (smooth animation)
5. Drop target highlights
6. Release → rankings update
```

**Mobile Alternative:**

```
1. Up/Down arrow buttons visible on each selected course
2. Tap to move up/down in list
3. Smooth reordering animation
4. Haptic feedback on action
```

### 5.3 Error Prevention

**Proactive Validation:**

- Disable "Select" button when max reached → Show tooltip
- Gray out ineligible courses → Show reason on hover
- Block submission with incomplete packages → Highlight issues
- Warn before navigating away with unsaved changes

**Clear Error Messages:**

```
❌ "Maximum courses reached for University Requirements (4/4 selected)"
❌ "Missing prerequisite: SWE211 must be completed"
❌ "Must select at least 4 credit hours from University Requirements"
✓ "All requirements met! Ready to submit"
```

---

## 6. Mobile Responsiveness

### 6.1 Layout Adaptations

**Desktop (≥1024px):**

- Two-column layout: Course grid (main) + Selection panel (sidebar)
- Drag-and-drop enabled
- All filters visible

**Tablet (768px - 1023px):**

- Single column with sticky selection summary header
- Bottom sheet for full selection panel
- Simplified filters (dropdown instead of chips)

**Mobile (<768px):**

- Vertical scrolling
- Floating action button showing selection count
- Full-screen selection panel modal
- Arrow buttons for ranking (no drag-and-drop)
- Accordion-style package filters

### 6.2 Touch Interactions

- Larger touch targets (min 44x44px)
- Swipe to remove from selection
- Pull-to-refresh on course list
- Bottom navigation for primary actions

---

## 7. Accessibility (WCAG 2.1 AA Compliance)

### 7.1 Keyboard Navigation

- Tab order: Filters → Course cards → Selection panel → Submit
- Enter/Space to select/deselect courses
- Arrow keys to navigate course grid
- Escape to close modals/panels
- Focus indicators on all interactive elements

### 7.2 Screen Reader Support

- Semantic HTML: `<main>`, `<nav>`, `<section>`, `<article>`
- ARIA labels: `aria-label="Select course SWE482"`
- ARIA live regions for dynamic updates: `aria-live="polite"`
- Status announcements: "Course added to selections. 3 of 4 required courses selected."

### 7.3 Visual Accessibility

- Color contrast ratio ≥4.5:1 for text
- No reliance on color alone (icons + text for status)
- Focus states clearly visible
- Text scalable to 200% without loss of function

---

## 8. Performance Requirements

### 8.1 Loading Times

- Initial page load: <2 seconds
- Course data fetch: <1 second
- Selection state update: <100ms
- Submission: <3 seconds
- Page transitions: <300ms

### 8.2 Optimization Strategies

- Lazy load course descriptions
- Virtual scrolling for large course lists
- Debounce search/filter inputs (300ms)
- Optimistic UI updates (immediate feedback, sync in background)
- Cache elective package data in local storage

---

## 9. Technical Integration Points

### 9.1 Frontend Components (React/Next.js)

**Key Components:**

1. `StudentAuthForm` - Login interface
2. `ElectiveBrowser` - Course discovery grid
3. `ElectiveSelectionPanel` - Selected courses sidebar
4. `CourseCard` - Individual course display
5. `PackageProgress` - Requirement tracker
6. `ElectiveSubmissionFlow` - Multi-step wizard
7. `ConfirmationScreen` - Success state

**State Management:**

- Use React Context for student session
- Local state (useState) for selections (with localStorage persistence)
- React Query for API data fetching

### 9.2 Backend API Endpoints

```typescript
// Authentication
POST /api/auth/student/login
  Body: { studentId: string, password: string }
  Response: { token: string, student: StudentSession }

// Electives Data
GET /api/electives/packages?level={level}
  Response: ElectivePackage[]

GET /api/electives/eligibility?studentId={id}
  Response: CourseEligibility[]

// Submission
POST /api/electives/submit
  Body: ElectiveSelection
  Response: { success: boolean, submissionId: string }

GET /api/electives/submissions?studentId={id}
  Response: ElectiveSelection[]
```

### 9.3 Database Schema (Supabase)

```sql
-- Elective Submissions Table
CREATE TABLE elective_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id TEXT NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'submitted', -- 'submitted', 'processed', 'scheduled'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Elective Preferences Table
CREATE TABLE elective_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES elective_submissions(id),
  student_id TEXT NOT NULL,
  course_code TEXT NOT NULL,
  priority INTEGER NOT NULL, -- 1 = highest
  package_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_submissions_student ON elective_submissions(student_id);
CREATE INDEX idx_preferences_submission ON elective_preferences(submission_id);
CREATE INDEX idx_preferences_student ON elective_preferences(student_id);
```

---

## 10. Success Metrics & KPIs

### 10.1 User Experience Metrics

- **Task Completion Rate:** >95% of students successfully submit preferences
- **Time to Complete:** Median time <10 minutes
- **Error Rate:** <5% of submissions fail validation
- **Return Rate:** <10% of students need to resubmit

### 10.2 System Performance Metrics

- **API Response Time:** p95 <500ms
- **Page Load Time:** p95 <3 seconds
- **Submission Success Rate:** >99%
- **Concurrent Users:** Support 500+ simultaneous sessions

### 10.3 Satisfaction Metrics

- **System Usability Scale (SUS):** Target score >75
- **Student Satisfaction:** >4.0/5.0 stars
- **Support Tickets:** <5% of students require assistance

---

## 11. Future Enhancements

### 11.1 Phase 2 Features

- **Smart Recommendations:** AI-suggested electives based on career goals
- **Course Comparison:** Side-by-side comparison of electives
- **Peer Insights:** View anonymous ratings/reviews from previous students
- **Schedule Preview:** Tentative schedule showing selected electives

### 11.2 Phase 3 Features

- **Waitlist Management:** Auto-enroll when elective becomes available
- **Change Requests:** Modify preferences before processing deadline
- **Notification System:** Email/SMS updates on preference processing
- **Mobile App:** Native iOS/Android application

---

## 12. Implementation Timeline

### Sprint 1 (Week 1-2): Foundation

- [ ] Set up authentication flow
- [ ] Create base components (CourseCard, SelectionPanel)
- [ ] Implement data fetching from existing mockData

### Sprint 2 (Week 3-4): Core Selection Flow

- [ ] Build course browser with filters
- [ ] Implement selection/deselection logic
- [ ] Add ranking/reordering functionality
- [ ] Real-time validation

### Sprint 3 (Week 5-6): Submission & Backend

- [ ] Create API endpoints
- [ ] Set up Supabase tables
- [ ] Implement submission workflow
- [ ] Build confirmation screens

### Sprint 4 (Week 7-8): Polish & Testing

- [ ] Mobile responsiveness
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] User acceptance testing

---

## 13. Design Mockup Descriptions

### 13.1 Login Screen

```
┌─────────────────────────────────────────┐
│  [University Logo]                       │
│                                          │
│  Welcome to SmartSchedule                │
│  Student Elective Selection              │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ Student ID                         │ │
│  │ [___________________________]      │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ Password                           │ │
│  │ [___________________________] [👁]│ │
│  └────────────────────────────────────┘ │
│                                          │
│  [ ] Remember me                         │
│                                          │
│  [     Login     ]  [SSO Options ▼]     │
│                                          │
│  Forgot password? | Need help?           │
└─────────────────────────────────────────┘
```

### 13.2 Course Browser (Main Screen)

```
┌─────────────────────────────────────────────────────────────────┐
│ SmartSchedule - Elective Selection         [Student Name] [🔔]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Select Your Elective Courses                                     │
│ Choose courses from each package to fulfill your degree reqs     │
│                                                                  │
│ Filters: [All] [University Req] [Dept Electives] [🔍 Search]   │
│                                                                  │
│ ┌──────────────────────┬──────────────────────┬────────────┐   │
│ │ Available Courses    │                      │ Selection  │   │
│ ├──────────────────────┤                      │ Panel      │   │
│ │ University Req (0/4) │                      │            │   │
│ │                      │                      │ 🎯 0/6     │   │
│ │ ┌─[Course Card]────┐ │ ┌─[Course Card]───┐ │ Selected   │   │
│ │ │ IC100            │ │ │ IC101           │ │            │   │
│ │ │ Prophet's Bio    │ │ │ Islamic Culture │ │ (empty)    │   │
│ │ │ 2 credits        │ │ │ 2 credits       │ │            │   │
│ │ │ ✓ Eligible       │ │ │ ✓ Eligible      │ │            │   │
│ │ │ [  Select  ]     │ │ │ [  Select  ]    │ │            │   │
│ │ └──────────────────┘ │ └─────────────────┘ │            │   │
│ │                      │                      │            │   │
│ │ Dept Electives (0/9) │                      │            │   │
│ │ ┌─[Course Card]────┐ │                      │            │   │
│ │ │ SWE482 ⭐        │ │                      │            │   │
│ │ │ HCI              │ │                      │ [Submit ▶] │   │
│ │ │ 3 credits        │ │                      └────────────┘   │
│ │ │ ⚠️ Need: SWE211  │ │                                       │
│ │ │ [ Disabled ]     │ │                                       │
│ │ └──────────────────┘ │                                       │
│ └──────────────────────┴──────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

### 13.3 Selection Panel (Populated)

```
┌────────────────────────────┐
│ Your Selections (4/6)      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━  │
│                            │
│ University Req ✓ (4/4)     │
│  1. [≡] IC100           [×]│
│         Prophet's Bio      │
│  2. [≡] IC101           [×]│
│         Islamic Culture    │
│                            │
│ Dept Electives ⚠️ (6/9)    │
│  3. [≡] CSC311          [×]│
│         Algorithms         │
│  4. [≡] SWE381          [×]│
│         Web Dev            │
│                            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━  │
│ Total: 10 credits          │
│                            │
│ [ Review & Submit ]        │
└────────────────────────────┘
```

---

## 14. Conclusion

This UX design blueprint provides a comprehensive foundation for implementing a student-centric elective selection system. The design prioritizes:

✅ **Clarity:** Students always know where they are and what to do next  
✅ **Efficiency:** Minimal clicks and cognitive load  
✅ **Confidence:** Real-time validation and clear feedback  
✅ **Accessibility:** Works for all students, all devices, all abilities  
✅ **Integration:** Seamlessly connects to backend scheduling system

The next phase will involve selecting appropriate shadcn UI components and implementing these designs with production-ready code.

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Author:** UX/UI Design Team  
**Status:** Ready for Implementation 🚀
