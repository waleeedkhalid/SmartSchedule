# Scheduler Dashboard - Visual Layout

## Dashboard Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     SCHEDULING COMMITTEE DASHBOARD                       │
│                       Welcome back, [Scheduler Name]                     │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────── ROW 1: QUICK STATS ────────────────────────────────────┐
│                                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │📚 Courses   │  │👥 Students  │  │📅 Sections  │  │⚠️  Conflicts│                  │
│  │             │  │             │  │             │  │             │                  │
│  │    125      │  │    450      │  │     89      │  │      3      │                  │
│  │             │  │             │  │ Last: 2d ago│  │  🔴 Critical│                  │
│  │ SWE-managed │  │ Active      │  │ ▓▓▓▓▓░ 85%  │  │  🟠 Error   │                  │
│  │             │  │             │  │  Published  │  │  🟡 Warning │                  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘                  │
│                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────── ROW 2: WIDGETS ─────────────────────────────────────────┐
│                                                                                          │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐                     │
│  │  🕐 UPCOMING EVENTS          │  │  📊 SYSTEM OVERVIEW         │                     │
│  │  ─────────────────────────   │  │  ─────────────────────────  │                     │
│  │  🔴 Registration Opens       │  │  ┌─────────────────────┐   │                     │
│  │     Jan 15, 2025 • Today     │  │  │ 📚 Total Enrollments│   │                     │
│  │     [registration]           │  │  │        1,245        │   │                     │
│  │                              │  │  └─────────────────────┘   │                     │
│  │  🟠 Elective Survey Due      │  │  ┌─────────────────────┐   │                     │
│  │     Jan 18, 2025 • In 3 days│  │  │ 📋 Elective Prefs   │   │                     │
│  │     [academic]               │  │  │        892          │   │                     │
│  │                              │  │  │  ▓▓▓▓▓░░ 68%        │   │                     │
│  │  🔵 Add/Drop Deadline        │  │  └─────────────────────┘   │                     │
│  │     Jan 25, 2025 • In 10 days│  │  ┌─────────────────────┐   │                     │
│  │     [registration]           │  │  │ ✓ Schedule Status   │   │                     │
│  │                              │  │  │  Status: Published  │   │                     │
│  └─────────────────────────────┘  │  │  Sections: 89       │   │                     │
│                                    │  │  Conflicts: 3       │   │                     │
│                                    │  └─────────────────────┘   │                     │
│                                    └─────────────────────────────┘                     │
└──────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────── ROW 3: MAIN ACTIONS ────────────────────────────────────┐
│                                                                                          │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐                     │
│  │  📚 COURSE MANAGEMENT       │  │  👥 STUDENT ENROLLMENT      │                     │
│  │  Manage courses, sections,  │  │  Track enrollment and       │                     │
│  │  and course offerings       │  │  manage section capacities  │                     │
│  │  • View and edit catalog    │  │  • View enrollment by level │                     │
│  │  • Manage sections          │  │  • Monitor capacities       │                     │
│  │  • Set prerequisites        │  │  • Track elective prefs     │                     │
│  │  [Manage Courses →]         │  │  [View Enrollment →]        │                     │
│  └─────────────────────────────┘  └─────────────────────────────┘                     │
│                                                                                          │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐                     │
│  │  📅 SCHEDULE GENERATION     │  │  📝 EXAM MANAGEMENT         │                     │
│  │  Generate and manage        │  │  Schedule and manage exam   │                     │
│  │  academic schedules         │  │  dates and times            │                     │
│  │  • Generate schedules       │  │  • Schedule midterm exams   │                     │
│  │  • Review and edit          │  │  • Plan final exam periods  │                     │
│  │  • Resolve conflicts        │  │  • Avoid exam conflicts     │                     │
│  │  [Generate Schedule →]      │  │  [Manage Exams →]           │                     │
│  └─────────────────────────────┘  └─────────────────────────────┘                     │
│                                                                                          │
│  ┌─────────────────────────────┐                                                       │
│  │  ⚙️  RULES & SETTINGS        │                                                       │
│  │  Configure scheduling rules │                                                       │
│  │  and system settings        │                                                       │
│  │  • Set constraints          │                                                       │
│  │  • Configure time slots     │                                                       │
│  │  • Manage room assignments  │                                                       │
│  │  [Configure Rules →]        │                                                       │
│  └─────────────────────────────┘                                                       │
│                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────── ROW 4: FEEDBACK CONTROLS ────────────────────────────────────┐
│                                                                                          │
│  💬 STUDENT FEEDBACK CONTROLS                                                           │
│  Manage when students can submit feedback about their schedules                        │
│                                                                                          │
│  ℹ️  Use these controls to open or close the feedback period for students.              │
│     Students can only submit feedback when both their schedule is assigned and          │
│     the feedback period is open.                                                        │
│                                                                                          │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐                   │
│  │ Schedules Published    [ON ] │  │ Feedback Period Open   [OFF] │                   │
│  │ Mark schedules as published  │  │ Allow students to submit     │                   │
│  │ and visible to students      │  │ feedback about schedules     │                   │
│  └──────────────────────────────┘  └──────────────────────────────┘                   │
│                                                                                          │
│  Current Status:                                                                        │
│  • Schedules Published: ✅ Yes                                                          │
│  • Feedback Open: ❌ No                                                                 │
│  • Students Can Submit Feedback: ❌ No                                                  │
│                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────── ROW 5: DYNAMIC NOTICES ────────────────────────────────────┐
│                                                                                          │
│  ⚠️  SCHEDULING CONFLICTS DETECTED                                                       │
│     There are 3 unresolved conflicts in the current schedule.                           │
│     Please review and resolve them before publishing.                                   │
│     [View Conflicts]  [🔴 3 Critical]                                                   │
│                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

## Color Coding

### Stat Cards
- **Courses**: Primary blue (theme color)
- **Students**: Blue (#3B82F6)
- **Sections**: Purple (#8B5CF6)
- **Conflicts**: Red (#EF4444) when conflicts exist, Green (#10B981) when none

### Widget Cards
- **Upcoming Events**: Urgency indicators
  - 🔴 Red dot: ≤ 3 days away
  - 🟠 Orange dot: 4-7 days away
  - 🔵 Blue dot: > 7 days away

- **System Overview**:
  - Enrollments: Blue background (#DBEAFE)
  - Elective Preferences: Purple background (#EDE9FE)
  - Schedule Status: Neutral/white

### Notices
- **Info/Required Action**: Blue background (#DBEAFE)
- **Critical/Error**: Red background (#FEE2E2)

## Responsive Behavior

### Desktop (≥ 1024px)
- Row 1: 4 columns (stat cards)
- Row 2: 2 columns (widgets)
- Row 3: 2 columns (main action cards)

### Tablet (768px - 1023px)
- Row 1: 2 columns (stat cards)
- Row 2: 2 columns (widgets)
- Row 3: 2 columns (main action cards)

### Mobile (< 768px)
- All rows: 1 column (stacked)

## Interactive Elements

### Clickable Areas
1. All stat cards (hover effect)
2. Event list items (hover: background change)
3. Action cards (hover: shadow + border highlight)
4. All buttons and links
5. Toggle switches (feedback controls)

### Progress Bars
- Section publication progress (in Sections card)
- Elective preference submission rate (in System Overview)

### Badges
- Conflict severity (Critical, Error, Warning)
- Event categories (academic, registration, exam, etc.)
- Schedule status (Published, Draft, Not Generated)

## Key Features Highlighted

1. **At-a-Glance Status**: Top row provides immediate system overview
2. **Timeline Awareness**: Upcoming events keep committee informed of deadlines
3. **Actionable Insights**: Conflict indicators and notices prompt action
4. **Progress Tracking**: Visual progress bars show completion status
5. **Quick Navigation**: Direct links to all major features
6. **Dynamic Content**: Notices appear/disappear based on system state

## Empty States

When data is not available, the dashboard shows appropriate empty states:

- **No Events**: Calendar icon + "No upcoming events"
- **No Sections**: "Not generated yet" text
- **No Conflicts**: Green checkmark + "0" with positive styling
- **No Preferences**: "0%" with empty progress bar

## Data Refresh

- Dashboard data loads on component mount
- All queries run in parallel for performance
- Loading skeleton shows during data fetch
- Error toast if data fetch fails

