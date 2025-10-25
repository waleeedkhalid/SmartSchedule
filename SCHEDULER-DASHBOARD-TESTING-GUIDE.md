# Scheduler Dashboard Testing Guide

## Quick Start Testing

### 1. Access the Dashboard

```bash
# Start the development server (if not running)
npm run dev

# Navigate to:
http://localhost:3000/committee/scheduler
```

### 2. Login Requirements
- Must be logged in with a scheduling committee account
- Use demo account: `scheduler@example.com` (check `src/data/demo-accounts.ts`)

## Test Scenarios

### ✅ Scenario 1: Empty State (No Schedules Generated)

**Expected Behavior:**
- Total Courses: Shows actual count from database
- Total Students: Shows actual count from database
- Generated Sections: **0**
- Section card shows: "Not generated yet"
- Active Conflicts: **0** (green indicator)
- Blue notice appears: "Schedule Generation Required"

**How to Test:**
1. Ensure no sections exist in the `section` table for active term
2. Refresh dashboard
3. Verify empty state displays correctly

### ✅ Scenario 2: With Generated Sections (Draft)

**Setup:**
```sql
-- Insert test sections
INSERT INTO section (id, course_code, term_code, capacity, status)
VALUES 
  ('SWE101-01', 'SWE101', 'FALL2025', 50, 'DRAFT'),
  ('SWE102-01', 'SWE102', 'FALL2025', 50, 'DRAFT');
```

**Expected Behavior:**
- Generated Sections: **2**
- Section card shows timestamp: "Last: X ago"
- Publication progress: **0 / 2** (0% bar)
- Schedule Status badge: **Draft** (secondary variant)

### ✅ Scenario 3: With Published Sections

**Setup:**
```sql
-- Update sections to published
UPDATE section 
SET status = 'PUBLISHED' 
WHERE term_code = 'FALL2025';
```

**Expected Behavior:**
- Generated Sections: **2**
- Publication progress: **2 / 2** (100% bar - full green)
- Schedule Status badge: **Published** (primary variant)
- No "Schedule Generation Required" notice

### ✅ Scenario 4: With Active Conflicts

**Setup:**
```sql
-- Insert test conflicts
INSERT INTO schedule_conflicts (
  schedule_id, 
  conflict_type, 
  severity, 
  title, 
  description, 
  affected_entities,
  resolved
)
VALUES 
  (
    (SELECT id FROM schedules LIMIT 1),
    'time_overlap',
    'critical',
    'Time Conflict',
    'Two sections overlap',
    '[{"type":"section","id":"SWE101-01"}]'::jsonb,
    false
  ),
  (
    (SELECT id FROM schedules LIMIT 1),
    'capacity_exceeded',
    'error',
    'Capacity Issue',
    'Section over capacity',
    '[{"type":"section","id":"SWE102-01"}]'::jsonb,
    false
  );
```

**Expected Behavior:**
- Active Conflicts: **2** (red indicator)
- Badges show: "1 Critical", "1 Error"
- Red notice appears: "Scheduling Conflicts Detected"
- Notice shows: "There are 2 unresolved conflicts..."
- System Overview shows conflicts in red

### ✅ Scenario 5: With Upcoming Events

**Setup:**
```sql
-- Insert test events
INSERT INTO term_events (
  term_code,
  event_type,
  category,
  title,
  description,
  start_date,
  end_date
)
VALUES 
  (
    'FALL2025',
    'registration',
    'registration',
    'Registration Opens',
    'Fall 2025 registration period begins',
    CURRENT_DATE + INTERVAL '1 day',
    CURRENT_DATE + INTERVAL '7 days'
  ),
  (
    'FALL2025',
    'elective_survey',
    'academic',
    'Elective Preferences Due',
    'Students must submit elective preferences',
    CURRENT_DATE + INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '5 days'
  );
```

**Expected Behavior:**
- Upcoming Events widget shows 2 events
- First event has orange/red dot (1 day away)
- Second event has orange dot (5 days away)
- Each event shows:
  - Title
  - Formatted date
  - "In X days" text
  - Category badge

### ✅ Scenario 6: With Student Enrollments

**Setup:**
```sql
-- Insert test enrollments
INSERT INTO section_enrollment (student_id, section_id, enrollment_status)
SELECT 
  s.id,
  'SWE101-01',
  'ENROLLED'
FROM students s
LIMIT 25;
```

**Expected Behavior:**
- System Overview shows: "Total Enrollments: 25"
- Blue-themed card displays correctly

### ✅ Scenario 7: With Elective Preferences

**Setup:**
```sql
-- Insert test preferences
INSERT INTO elective_preferences (
  student_id,
  course_code,
  term_code,
  preference_order,
  status
)
SELECT 
  s.id,
  'SWE401',
  'FALL2025',
  1,
  'SUBMITTED'
FROM students s
LIMIT 150;
```

**Expected Behavior:**
- System Overview shows preference count
- Submission rate calculated: `(150 / total_students) * 100`
- Progress bar shows submission percentage
- Purple-themed card displays correctly

### ✅ Scenario 8: Feedback Controls

**Test Actions:**
1. Toggle "Schedules Published" switch
2. Toggle "Feedback Period Open" switch

**Expected Behavior:**
- Switches update via API call
- Toast notification appears: "Settings updated"
- Current Status section updates immediately
- "Students Can Submit Feedback" shows:
  - ✅ Yes (when both switches ON)
  - ❌ No (when either switch OFF)

## Edge Cases to Test

### 🔍 Edge Case 1: No Active Term
**Setup:**
```sql
UPDATE academic_term SET is_active = false;
```

**Expected Behavior:**
- Dashboard still loads
- Uses fallback term "FALL2025"
- Shows "No upcoming events" if term has no events

### 🔍 Edge Case 2: Multiple Conflicts of Same Severity
**Setup:**
```sql
-- Insert 5 critical conflicts
INSERT INTO schedule_conflicts (...)
VALUES (...severity = 'critical'...) -- repeat 5 times
```

**Expected Behavior:**
- Badge shows: "5 Critical"
- Notice shows: "There are 5 unresolved conflicts..."

### 🔍 Edge Case 3: Old Generated Sections
**Setup:**
```sql
UPDATE section 
SET created_at = NOW() - INTERVAL '30 days'
WHERE term_code = 'FALL2025';
```

**Expected Behavior:**
- Timestamp shows: "Last: 30 days ago" or "Last: 1 month ago"
- Uses `formatDistanceToNow` from date-fns

### 🔍 Edge Case 4: 100% Preference Submission
**Setup:**
```sql
-- All students submit preferences
INSERT INTO elective_preferences (...)
SELECT id FROM students; -- for each student
```

**Expected Behavior:**
- Submission rate: **100%**
- Progress bar: Full green
- No overflow or calculation errors

## Performance Testing

### Load Time Test
```bash
# Open browser DevTools Network tab
# Measure initial load time
# Target: < 2 seconds for data fetch
```

**Expected:**
- All 9 queries run in parallel
- Total load time < 2 seconds
- No sequential waterfalls

### Refresh Test
```bash
# Refresh dashboard multiple times
# Check for consistency
```

**Expected:**
- Data loads correctly each time
- No stale data displayed
- Loading skeleton shows briefly

## Visual Testing Checklist

- [ ] All stat cards aligned properly
- [ ] Icons display correctly with proper colors
- [ ] Progress bars animate smoothly
- [ ] Badges have correct colors and text
- [ ] Cards have hover effects
- [ ] Responsive layout works on all screen sizes
- [ ] Dark mode displays correctly
- [ ] Empty states show appropriate messages
- [ ] Loading skeletons match card layout

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Android)

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader can read all content
- [ ] Color contrast meets WCAG standards
- [ ] Focus indicators visible
- [ ] Toggle switches accessible

## API Testing

### Test Feedback Settings API

```bash
# Get current settings
curl http://localhost:3000/api/committee/scheduler/feedback-settings

# Update settings
curl -X PATCH http://localhost:3000/api/committee/scheduler/feedback-settings \
  -H "Content-Type: application/json" \
  -d '{"feedback_open": true}'
```

**Expected:**
- GET returns current settings
- PATCH updates settings and returns success
- Dashboard reflects changes immediately

## Common Issues & Solutions

### Issue 1: "Cannot read property of undefined"
**Cause:** Data hasn't loaded yet
**Solution:** Verify loading states and null checks

### Issue 2: Incorrect conflict count
**Cause:** Resolved conflicts included
**Solution:** Verify query includes `.eq("resolved", false)`

### Issue 3: Empty event list when events exist
**Cause:** Events in wrong term or past dates
**Solution:** Check term code and date filters

### Issue 4: 0% preference submission rate
**Cause:** Division by zero or no students
**Solution:** Verify student count > 0 before calculation

### Issue 5: Progress bar stuck at 0%
**Cause:** Published sections = 0
**Solution:** Verify section status is "PUBLISHED"

## Debug Mode

Add this to component for debugging:

```typescript
useEffect(() => {
  console.log("Dashboard Stats:", dashboardStats);
  console.log("Upcoming Events:", upcomingEvents);
  console.log("Scheduler Data:", schedulerData);
}, [dashboardStats, upcomingEvents, schedulerData]);
```

## Success Criteria

✅ **Dashboard passes testing when:**
1. All data loads correctly from database
2. Empty states display appropriately
3. Stat cards show accurate counts
4. Conflicts display with correct severity
5. Events show with proper urgency indicators
6. Progress bars calculate correctly
7. Notices appear/disappear dynamically
8. Feedback controls work properly
9. Navigation links work
10. No console errors
11. Performance is acceptable (< 2s load)
12. Responsive design works on all screens

## Automated Testing (Future)

Consider adding these tests:

```typescript
// Example test structure
describe("Scheduler Dashboard", () => {
  it("should load dashboard stats", async () => {
    // Test implementation
  });

  it("should display conflicts when present", async () => {
    // Test implementation
  });

  it("should show empty state when no sections", async () => {
    // Test implementation
  });
});
```

## Reporting Issues

When reporting issues, include:
1. Browser and version
2. Steps to reproduce
3. Expected vs actual behavior
4. Console errors (if any)
5. Screenshot of issue
6. Database state (affected tables)

