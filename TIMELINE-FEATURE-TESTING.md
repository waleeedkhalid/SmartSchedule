# Timeline-Based Feature Gating - Testing Checklist

> **Purpose:** Verify that timeline-based feature gating works correctly and features lock/unlock based on event dates.
> 
> **Last Updated:** 2025-10-25

---

## 🎯 Overview

This checklist validates the timeline-based feature gating system, which dynamically controls access to student features (feedback submission, elective surveys) based on academic calendar events.

**Key Components Tested:**
- `/api/student/status` - Timeline-based status checks
- `/api/academic/events` - Event management
- `/student/feedback` - Feedback feature gating
- `/student/electives` - Elective survey feature gating
- Database queries for active events

---

## 🔧 Prerequisites

### 1. Database State
- [ ] Database migrations applied: `20250126_academic_events.sql`
- [ ] `term_events` table exists with indexes
- [ ] `event_type` and `event_category` enums created
- [ ] Active academic term exists in `academic_term` table

### 2. Test User Accounts
- [ ] Student account available for testing
- [ ] Committee account available for event management

### 3. Development Environment
- [ ] Next.js dev server running (`npm run dev`)
- [ ] Supabase connection working
- [ ] Browser with DevTools for network inspection

---

## ✅ Test Scenarios

### Scenario 1: Elective Survey Feature Gating

#### Test 1.1: Survey Open - Valid Access
**Setup:**
```sql
-- Create an active elective survey event
INSERT INTO term_events (term_code, title, event_type, category, start_date, end_date, metadata)
VALUES (
  '471',
  'Test Elective Survey',
  'elective_survey',
  'registration',
  NOW() - INTERVAL '1 day',  -- Started yesterday
  NOW() + INTERVAL '7 days', -- Ends in 7 days
  '{"priority": "high", "requires_action": true, "url": "/student/electives"}'::jsonb
);
```

**Steps:**
1. [ ] Log in as a student
2. [ ] Navigate to `/student/electives`
3. [ ] Verify page loads with elective selection interface
4. [ ] Call `/api/student/status`
5. [ ] Verify response shows:
   - `electiveSurveyOpen: true`
   - `canSubmitElectives: true`
   - `electiveEvent` object with event details

**Expected Result:**
- ✅ Elective selection page is accessible
- ✅ Alert shows survey is open
- ✅ Can browse and select courses
- ✅ Submit button is enabled

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 1.2: Survey Closed - Before Start Date
**Setup:**
```sql
-- Update event to start in the future
UPDATE term_events 
SET start_date = NOW() + INTERVAL '2 days',
    end_date = NOW() + INTERVAL '9 days'
WHERE event_type = 'elective_survey';
```

**Steps:**
1. [ ] Refresh `/student/electives` page
2. [ ] Call `/api/student/status`
3. [ ] Verify response shows:
   - `electiveSurveyOpen: false`
   - `canSubmitElectives: false`
   - `electiveEvent: null`

**Expected Result:**
- ✅ Red alert shows "survey is currently closed"
- ✅ Cannot submit selections
- ✅ Page shows when survey will open

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 1.3: Survey Closed - After End Date
**Setup:**
```sql
-- Update event to be in the past
UPDATE term_events 
SET start_date = NOW() - INTERVAL '10 days',
    end_date = NOW() - INTERVAL '3 days'
WHERE event_type = 'elective_survey';
```

**Steps:**
1. [ ] Refresh `/student/electives` page
2. [ ] Verify survey closed message appears
3. [ ] Check that no selections can be submitted

**Expected Result:**
- ✅ Survey closed message displayed
- ✅ Cannot submit new preferences

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 1.4: Already Submitted - During Open Period
**Setup:**
```sql
-- Make survey active again
UPDATE term_events 
SET start_date = NOW() - INTERVAL '1 day',
    end_date = NOW() + INTERVAL '7 days'
WHERE event_type = 'elective_survey';

-- Mark student's preferences as submitted
UPDATE elective_preferences
SET status = 'SUBMITTED', submitted_at = NOW()
WHERE student_id = 'YOUR_STUDENT_ID';
```

**Steps:**
1. [ ] Refresh `/student/electives` page
2. [ ] Call `/api/student/status`
3. [ ] Verify response shows:
   - `electiveSurveyOpen: true`
   - `canSubmitElectives: false` (already submitted)
   - `hasSubmittedPreferences: true`

**Expected Result:**
- ✅ Page shows "already submitted" state
- ✅ Green checkmark badge visible
- ✅ Cannot modify existing selections

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

### Scenario 2: Feedback Feature Gating

#### Test 2.1: Feedback Open - Can Submit
**Setup:**
```sql
-- Create active feedback period event
INSERT INTO term_events (term_code, title, event_type, category, start_date, end_date, metadata)
VALUES (
  '471',
  'Course Feedback Period',
  'feedback_period',
  'academic',
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '14 days',
  '{"priority": "medium", "requires_action": true, "url": "/student/feedback"}'::jsonb
);

-- Ensure student has a schedule
-- (Manually verify in database or create via UI)
```

**Steps:**
1. [ ] Log in as student
2. [ ] Navigate to `/student/feedback`
3. [ ] Call `/api/student/status`
4. [ ] Verify response shows:
   - `feedbackOpen: true`
   - `canSubmitFeedback: true`
   - `hasSchedule: true`
   - `feedbackEvent` object with details

**Expected Result:**
- ✅ Feedback form is displayed
- ✅ Rating slider works
- ✅ Text area is enabled
- ✅ Submit button is enabled
- ✅ Shows deadline in card header

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 2.2: Feedback Closed - No Event Active
**Setup:**
```sql
-- Delete or deactivate feedback event
DELETE FROM term_events WHERE event_type = 'feedback_period';
```

**Steps:**
1. [ ] Navigate to `/student/feedback`
2. [ ] Call `/api/student/status`
3. [ ] Verify response shows:
   - `feedbackOpen: false`
   - `canSubmitFeedback: false`

**Expected Result:**
- ✅ Shows "Feedback Period Closed" message
- ✅ Lock icon displayed
- ✅ "Return to Dashboard" button shown
- ✅ No feedback form visible

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 2.3: No Schedule - Cannot Submit
**Setup:**
```sql
-- Create active feedback event but ensure student has no schedule
DELETE FROM schedules WHERE student_id = 'YOUR_STUDENT_ID';

INSERT INTO term_events (term_code, title, event_type, category, start_date, end_date)
VALUES ('471', 'Feedback Period', 'feedback_period', 'academic', NOW() - INTERVAL '1 day', NOW() + INTERVAL '7 days');
```

**Steps:**
1. [ ] Navigate to `/student/feedback`
2. [ ] Call `/api/student/status`
3. [ ] Verify response shows:
   - `hasSchedule: false`
   - `canSubmitFeedback: false`

**Expected Result:**
- ✅ Shows "No Schedule Available" empty state
- ✅ Calendar icon displayed
- ✅ Explanation message shown

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 2.4: Already Submitted Feedback
**Setup:**
```sql
-- Ensure active feedback period and student has schedule
-- Insert feedback record
INSERT INTO feedback (student_id, schedule_id, feedback_text, rating)
VALUES ('YOUR_STUDENT_ID', 'SCHEDULE_ID', 'Test feedback', 4);
```

**Steps:**
1. [ ] Navigate to `/student/feedback`
2. [ ] Call `/api/student/status`
3. [ ] Verify response shows:
   - `feedbackOpen: true`
   - `canSubmitFeedback: false`
   - `hasSubmittedFeedback: true`

**Expected Result:**
- ✅ Shows "Feedback Already Submitted" card
- ✅ Green checkmark icon
- ✅ Thank you message
- ✅ Cannot submit again

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

### Scenario 3: API Endpoint Tests

#### Test 3.1: Get Active Events
**Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/academic/events?active=true"
```

**Steps:**
1. [ ] Execute request
2. [ ] Verify response contains only currently active events
3. [ ] Check each event's `start_date` <= NOW and `end_date` >= NOW
4. [ ] Verify response format matches API documentation

**Expected Result:**
```json
{
  "success": true,
  "data": [/* active events */],
  "count": 2
}
```

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 3.2: Get Events by Type
**Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/academic/events?event_type=elective_survey"
```

**Steps:**
1. [ ] Execute request
2. [ ] Verify only `elective_survey` events returned
3. [ ] Check count matches expected

**Expected Result:**
- ✅ All returned events have `event_type: "elective_survey"`
- ✅ Count is accurate

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 3.3: Get Upcoming Events
**Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/academic/events?upcoming=true&days_ahead=30"
```

**Steps:**
1. [ ] Execute request
2. [ ] Verify all events have `start_date` in the next 30 days
3. [ ] Check events are sorted by `start_date`

**Expected Result:**
- ✅ All events start within 30 days
- ✅ Chronologically ordered

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 3.4: Student Status API
**Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/student/status"
```

**Steps:**
1. [ ] Execute request as student
2. [ ] Verify all expected fields present:
   - Schedule fields (hasSchedule, scheduleId, schedulePublished)
   - Feedback fields (feedbackOpen, canSubmitFeedback, hasSubmittedFeedback, feedbackEvent)
   - Elective fields (electiveSurveyOpen, canSubmitElectives, hasSubmittedPreferences, electiveEvent)
   - Term fields (activeTerm, activeTermCode)

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "hasSchedule": true,
    "feedbackOpen": true,
    "electiveSurveyOpen": false,
    "canSubmitFeedback": true,
    "canSubmitElectives": false,
    "feedbackEvent": { /* event details */ },
    "electiveEvent": null,
    ...
  }
}
```

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

### Scenario 4: Edge Cases

#### Test 4.1: Multiple Overlapping Events
**Setup:**
```sql
-- Create two overlapping feedback events
INSERT INTO term_events (term_code, title, event_type, category, start_date, end_date)
VALUES 
  ('471', 'Feedback Period 1', 'feedback_period', 'academic', NOW() - INTERVAL '5 days', NOW() + INTERVAL '5 days'),
  ('471', 'Feedback Period 2', 'feedback_period', 'academic', NOW() - INTERVAL '3 days', NOW() + INTERVAL '7 days');
```

**Steps:**
1. [ ] Call `/api/student/status`
2. [ ] Verify system handles multiple active events gracefully
3. [ ] Check only one event is returned in `feedbackEvent`

**Expected Result:**
- ✅ No errors occur
- ✅ Feature gate is still `true`
- ✅ One event shown (typically first found)

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 4.2: Event at Exact Boundary
**Setup:**
```sql
-- Create event ending exactly now
INSERT INTO term_events (term_code, title, event_type, category, start_date, end_date)
VALUES ('471', 'Boundary Test', 'elective_survey', 'registration', NOW() - INTERVAL '1 hour', NOW());
```

**Steps:**
1. [ ] Immediately call `/api/student/status`
2. [ ] Wait 1 second
3. [ ] Call again
4. [ ] Verify event is no longer considered active

**Expected Result:**
- ✅ Event is active at `end_date`
- ✅ Event becomes inactive immediately after

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 4.3: Timezone Handling
**Setup:**
```sql
-- Create events with explicit timezone
INSERT INTO term_events (term_code, title, event_type, category, start_date, end_date)
VALUES ('471', 'TZ Test', 'feedback_period', 'academic', 
  '2024-12-01 08:00:00+03:00',  -- 8 AM Saudi time
  '2024-12-31 23:59:59+03:00'   -- 11:59 PM Saudi time
);
```

**Steps:**
1. [ ] Verify event shows correct local times in UI
2. [ ] Check server logs show correct timezone
3. [ ] Verify active check works correctly across timezones

**Expected Result:**
- ✅ Times displayed correctly in UI
- ✅ Active status calculated correctly

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

### Scenario 5: Permission & Security

#### Test 5.1: Student Cannot Create Events
**Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"term_code": "471", "title": "Hack", "event_type": "feedback_period", "category": "academic", "start_date": "2024-01-01T00:00:00Z", "end_date": "2024-12-31T23:59:59Z"}' \
  "http://localhost:3000/api/academic/events"
```

**Expected Result:**
```json
{
  "error": "Insufficient permissions. Committee role required."
}
```
- ✅ Status code 403

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 5.2: Committee Can Create Events
**Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer COMMITTEE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"term_code": "471", "title": "Test Event", "event_type": "other", "category": "academic", "start_date": "2024-01-01T00:00:00Z", "end_date": "2024-12-31T23:59:59Z"}' \
  "http://localhost:3000/api/academic/events"
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "term_code": "471",
    ...
  }
}
```
- ✅ Status code 201
- ✅ Event created in database

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

### Scenario 6: Data Consistency

#### Test 6.1: Database Functions
**SQL Tests:**
```sql
-- Test get_active_events function
SELECT * FROM get_active_events('471');
-- Should return only active events for term 471

-- Test get_upcoming_events function
SELECT * FROM get_upcoming_events('471', 30);
-- Should return events starting in next 30 days
```

**Steps:**
1. [ ] Execute both queries
2. [ ] Verify results match expected date ranges
3. [ ] Compare with API results

**Expected Result:**
- ✅ Functions return correct data
- ✅ Results match API responses

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 6.2: Index Performance
**Test Query:**
```sql
EXPLAIN ANALYZE
SELECT * FROM term_events
WHERE event_type = 'elective_survey'
  AND start_date <= NOW()
  AND end_date >= NOW();
```

**Steps:**
1. [ ] Run query with `EXPLAIN ANALYZE`
2. [ ] Verify indexes are used
3. [ ] Check execution time is < 10ms

**Expected Result:**
- ✅ Index scans used (not sequential)
- ✅ Fast execution time

**Actual Result:**
- [ ] Pass / [ ] Fail
- Query plan: _______________

---

## 📊 Test Results Summary

### Overall Results
- **Total Tests:** 25
- **Passed:** ___
- **Failed:** ___
- **Skipped:** ___

### Critical Issues Found
1. _______________
2. _______________
3. _______________

### Non-Critical Issues
1. _______________
2. _______________

### Performance Notes
- Average API response time: ___ ms
- Database query performance: ___ ms
- Page load time: ___ ms

---

## 🐛 Common Issues & Fixes

### Issue 1: Events Not Detected as Active
**Symptom:** Event exists but `feedbackOpen: false`

**Diagnosis:**
```sql
-- Check event dates
SELECT id, title, event_type, start_date, end_date, NOW()
FROM term_events
WHERE event_type = 'feedback_period';
```

**Fix:**
- Verify dates are in correct format with timezone
- Check `NOW()` returns expected timestamp
- Ensure no typos in event_type

### Issue 2: Permission Denied
**Symptom:** 403 errors when accessing API

**Diagnosis:**
- Check auth token is valid
- Verify user role in database
- Check RLS policies

**Fix:**
```sql
-- Check user role
SELECT id, email, role FROM users WHERE id = 'USER_ID';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'term_events';
```

### Issue 3: Stale Data Displayed
**Symptom:** UI shows outdated event status

**Diagnosis:**
- Check SWR cache settings
- Verify revalidation works

**Fix:**
- Clear browser cache
- Check `revalidateOnFocus` setting
- Force refresh with `mutate()`

---

## 📝 Sign-Off

### Tester Information
- **Name:** _______________
- **Date:** _______________
- **Environment:** Development / Staging / Production

### Test Completion
- [ ] All critical tests passed
- [ ] Documentation updated
- [ ] Issues logged in issue tracker
- [ ] Stakeholders notified

### Approval
- [ ] Ready for deployment
- [ ] Needs fixes before deployment
- [ ] Requires additional testing

**Notes:**
_______________
_______________
_______________

---

## 🔗 Related Documentation

- [Timeline API Documentation](./src/docs/api/timeline-api.md)
- [Schema Documentation](./docs/schema/overview.md)
- [Academic Events Migration](./supabase/migrations/20250126_academic_events.sql)

---

**Testing Checklist Version:** 1.0  
**Last Updated:** 2025-10-25  
**Next Review Date:** _______________

