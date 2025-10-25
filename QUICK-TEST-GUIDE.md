# Quick Test Guide - Academic Events API

This guide will help you quickly verify that the Academic Events system is working correctly.

## Prerequisites

1. ✅ Database migration has been applied
2. ✅ Development server is running (`npm run dev`)
3. ✅ You have a user account (any role for read, committee role for write)

---

## Quick Verification Steps

### Step 1: Check Database

Open your database client and run:

```sql
-- Check that term_events table exists and has data
SELECT term_code, COUNT(*) as event_count 
FROM public.term_events 
GROUP BY term_code;

-- Expected output:
-- 471 | 11
-- 472 | 11
-- 475 | 6
```

If you see the expected output, the migration succeeded! ✅

---

### Step 2: Test Read Endpoints (Works for All Users)

Open your browser or use curl to test these endpoints:

#### Test 1: Get All Terms
```
http://localhost:3000/api/academic/terms
```

**Expected:** JSON response with 3 academic terms (471, 472, 475)

#### Test 2: Get Events for Fall Term
```
http://localhost:3000/api/academic/events?term_code=471
```

**Expected:** JSON response with 11 events for Fall 2024/2025

#### Test 3: Get Timeline for Fall Term
```
http://localhost:3000/api/academic/timeline/471
```

**Expected:** Comprehensive JSON with:
- Term information
- Events grouped by category
- Statistics
- Active and upcoming events

---

### Step 3: Quick Browser Test

1. Open your browser to `http://localhost:3000`
2. Log in with any account
3. Open DevTools Console (F12)
4. Run this code:

```javascript
// Test Terms API
fetch('/api/academic/terms')
  .then(r => r.json())
  .then(d => console.log('✅ Terms:', d.count, 'terms found'));

// Test Events API
fetch('/api/academic/events?term_code=471')
  .then(r => r.json())
  .then(d => console.log('✅ Events:', d.count, 'events found'));

// Test Timeline API
fetch('/api/academic/timeline/471')
  .then(r => r.json())
  .then(d => console.log('✅ Timeline:', d.data.statistics));
```

**Expected Console Output:**
```
✅ Terms: 3 terms found
✅ Events: 11 events found
✅ Timeline: {total_events: 11, active_events: X, upcoming_events: X, ...}
```

---

### Step 4: Run Automated Test Script

```bash
# Make script executable (if not already)
chmod +x tests/api/academic/test-academic-api.sh

# Run the test script
./tests/api/academic/test-academic-api.sh
```

This will test all endpoints and show results with ✓ or ✗ indicators.

---

## Expected Test Results

### ✅ Successful Response Examples

**Terms API:**
```json
{
  "success": true,
  "data": [
    {
      "code": "471",
      "name": "Fall 2024/2025",
      "type": "fall",
      "is_active": true,
      ...
    }
  ],
  "count": 3
}
```

**Events API:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "term_code": "471",
      "title": "Registration Opens",
      "event_type": "registration",
      "category": "registration",
      ...
    }
  ],
  "count": 11
}
```

**Timeline API:**
```json
{
  "success": true,
  "data": {
    "term": {
      "code": "471",
      "progress_percentage": 45,
      "days_remaining": 75,
      ...
    },
    "events": {
      "all": [...],
      "by_category": {...},
      "active": [...],
      "upcoming": [...]
    },
    "statistics": {
      "total_events": 11,
      ...
    }
  }
}
```

---

## Common Issues & Solutions

### Issue: 401 Unauthorized

**Solution:** You're not logged in. Log in through the UI first, then try again.

### Issue: 404 Not Found

**Solution:** Check that the URL is correct and the server is running on port 3000.

### Issue: No events returned

**Solution:** 
1. Verify migration was applied: `SELECT COUNT(*) FROM term_events;`
2. Check date filters - events might be in the past or future
3. Try without filters: `/api/academic/events`

### Issue: 403 Forbidden on POST/PATCH/DELETE

**Solution:** These operations require committee role. This is expected for students and faculty.

---

## Quick Feature Tests

### Test 1: Filter by Event Type
```
http://localhost:3000/api/academic/events?event_type=registration
```
**Expected:** Only registration events

### Test 2: Get Active Events
```
http://localhost:3000/api/academic/events?active=true
```
**Expected:** Only events happening RIGHT NOW

### Test 3: Get Upcoming Events (Next 2 Weeks)
```
http://localhost:3000/api/academic/events?upcoming=true&days_ahead=14
```
**Expected:** Events starting within the next 14 days

### Test 4: Get Exam Schedule
```
http://localhost:3000/api/academic/events?category=exam&term_code=471
```
**Expected:** All midterm and final exams for Fall term

---

## Performance Checks

Run these queries to verify indexes are working:

```sql
-- Should be very fast (indexed)
EXPLAIN ANALYZE 
SELECT * FROM term_events WHERE term_code = '471';

-- Should be very fast (indexed)
EXPLAIN ANALYZE 
SELECT * FROM term_events WHERE event_type = 'registration';

-- Should be very fast (indexed)
EXPLAIN ANALYZE 
SELECT * FROM term_events 
WHERE start_date >= NOW() 
AND start_date <= NOW() + INTERVAL '30 days';
```

All queries should show "Index Scan" in the plan.

---

## Next Steps

Once all tests pass:

1. ✅ Integration: Start using the API in your frontend components
2. ✅ Notifications: Build event notification system
3. ✅ Calendar Views: Create calendar UI components
4. ✅ Mobile: Expose timeline API to mobile apps

---

## Support Resources

- **Full API Docs:** `tests/api/academic/README.md`
- **Implementation Details:** `ACADEMIC-EVENTS-IMPLEMENTATION.md`
- **Test Suite:** `tests/api/academic/academic.test.ts`
- **Migration File:** `supabase/migrations/20250126_academic_events.sql`

---

## One-Line Verification

Run this single command to verify everything is working:

```bash
curl -s http://localhost:3000/api/academic/timeline/471 | jq '.data.statistics'
```

**Expected Output:**
```json
{
  "total_events": 11,
  "active_events": 0,
  "upcoming_events": 5,
  "completed_events": 6,
  "by_category": {
    "academic": 4,
    "registration": 3,
    "exam": 3,
    "administrative": 1
  }
}
```

If you see this output, **everything is working! 🎉**

