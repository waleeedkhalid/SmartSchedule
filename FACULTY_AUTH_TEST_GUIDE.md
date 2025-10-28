# Faculty Authentication Flow - Testing Guide

## Quick Test Checklist

Use this guide to verify faculty registration and login works correctly with the new faculty features.

---

## Pre-Test Setup

### 1. Ensure Database is Ready

```bash
# Apply all migrations
pnpm db:reset

# Verify tables exist
psql -d postgres -c "\dt"
# Should see: user_roles, instructor, section, schedule_comment
```

### 2. Start Development Server

```bash
pnpm dev
# Server should start at http://localhost:3000
```

---

## Test Scenario A: Standard Self-Service Faculty Registration

**Goal**: Verify complete self-service faculty workflow (NO admin setup needed)

### Step 1: Register Faculty Account (No Admin Action Required!)

1. Navigate to: `http://localhost:3000/register`
2. Fill form:
   - **Name**: Dr. Alice Johnson
   - **Email**: alice.johnson@university.edu
   - **Role**: Faculty
   - **Password**: TestPass123!
3. Click **Create Account**
4. Expect: "Just a step away! check your inbox for activation link"

### Step 3: Confirm Email

**Local Development (Email Interceptor)**:
```bash
# Check terminal for confirmation link
# Look for: "Confirm your signup: http://127.0.0.1:54321/auth/v1/verify?..."
# Click the link or copy to browser
```

**Production**:
- Check email inbox
- Click confirmation link

### Step 4: Login

1. Navigate to: `http://localhost:3000/login`
2. Enter credentials:
   - **Email**: alice.johnson@university.edu
   - **Password**: TestPass123!
3. Click **Sign In**
4. Expect: Redirect to `/onboarding`

### Step 5: Complete Onboarding

1. Should see minimal onboarding (no academic level questions)
2. Click **Confirm** checkbox
3. Click **Complete Setup**
4. Expect: Redirect to `/dashboard/faculty`

### Step 6: Verify Dashboard

**Expected Results**:
- ✅ Shows "Faculty Dashboard" header
- ✅ Shows welcome message with faculty name
- ✅ Shows "Assigned Sections" stat (likely 0)
- ✅ Shows "Weekly Load" stat
- ✅ Shows "Courses" stat
- ✅ "Update Availability" button is enabled (not disabled)
- ✅ "Submit Feedback" button is enabled
- ✅ Shows "Preferences" card with availability status
- ✅ Shows "Schedule Feedback Summary" card
- ❌ NO "Profile Not Linked" warning

### Step 7: Test Availability Features

1. Click **Update Availability** button
2. Expect: Redirect to `/dashboard/faculty/availability`
3. Verify page loads successfully:
   - ✅ Shows weekly time grid (Sun-Thu, 08:00-17:00)
   - ✅ Shows mode selection (Preferred/Unavailable)
   - ✅ Shows current settings (max load)
   - ✅ Shows stats (0 preferred slots, 0 unavailable slots)

4. **Test Grid Interaction**:
   - Click "Preferred Times" button (should turn green/active)
   - Click on Monday 09:00 cell
   - Expect: Cell turns green
   - Drag across Monday 09:00-11:00
   - Expect: Multiple cells turn green
   - Click "Save Preferences"
   - Expect: Success toast "Availability preferences saved successfully"

5. **Verify Persistence**:
   - Refresh page
   - Expect: Green cells still marked

### Step 8: Test Feedback Features

1. Navigate to: `/dashboard/faculty/feedback`
2. Verify page loads successfully:
   - ✅ Shows three tabs (Submit Feedback, My Comments, My Sections)
   - ✅ Shows statistics cards (Total, Unresolved, Resolved, Assigned Sections)

3. **Test General Feedback**:
   - In "Submit Feedback" tab
   - Select "General Feedback" option
   - Type: "Testing general schedule feedback"
   - Click "Submit Feedback"
   - Expect: Success toast "Comment submitted successfully"

4. **Verify Comments Tab**:
   - Click "My Comments (1)" tab
   - Expect: Shows the comment just created
   - Verify shows: Badge "Pending", content, timestamp

5. **Test Comment Editing**:
   - Click edit button on comment
   - Modify text: "Updated feedback text"
   - Click "Save"
   - Expect: Success toast, text updated

6. **Test Comment Deletion**:
   - Click delete button
   - Confirm in dialog
   - Expect: Comment removed from list

### Step 9: Return to Dashboard

1. Navigate to: `/dashboard/faculty`
2. Verify:
   - ✅ Stats updated (comment counts, availability status)
   - ✅ All buttons still enabled

---

## Test Scenario B: Verify Auto-Created Instructor Profile

**Goal**: Verify instructor profile was automatically created

### Step 1: Check Database

```sql
-- Open Supabase Studio: pnpm db:studio
-- Go to Table Editor → instructor

-- Verify instructor exists with email from Test Scenario A
SELECT * FROM instructor 
WHERE email = 'alice.johnson@university.edu';
```

### Step 2: Verify Default Values

**Expected Results**:
- ✅ `name`: 'Dr. Alice Johnson' (from registration form)
- ✅ `email`: 'alice.johnson@university.edu'
- ✅ `max_load_per_week`: 12 (default)
- ✅ `preferred_times`: [] (empty array)
- ✅ `unavailable_times`: [] (empty array)
- ✅ `created_at`: Recent timestamp
- ✅ `id`: Valid UUID

### Step 3: Test Profile Modification

1. As faculty user, navigate to `/dashboard/faculty/availability`
2. Set some preferred times (click cells)
3. Save preferences
4. Check database:

```sql
SELECT preferred_times FROM instructor 
WHERE email = 'alice.johnson@university.edu';
```

**Expected**: JSON array with time slots saved

---

## Test Scenario C: Complete Faculty Workflow

**Goal**: End-to-end test with section assignments

### Setup: Create Test Data

```sql
-- 1. Create instructor
INSERT INTO instructor (id, name, email, max_load_per_week)
VALUES ('11111111-1111-1111-1111-111111111111', 'Dr. Carol White', 'carol.white@uni.edu', 12);

-- 2. Create a course
INSERT INTO course (code, title, level, credits, weekly_hours, is_elective)
VALUES ('CS101', 'Introduction to Computer Science', 1, 3, 3, false);

-- 3. Create a room
INSERT INTO room (code, type)
VALUES ('LAB-101', 'Lab');

-- 4. Create a section assigned to this instructor
INSERT INTO section (
  id, 
  course_code, 
  section_no, 
  instructor_id, 
  room_code, 
  capacity, 
  meeting_pattern, 
  group_level, 
  state
)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'CS101',
  '01',
  '11111111-1111-1111-1111-111111111111',
  'LAB-101',
  30,
  '{"days": ["Sunday", "Tuesday"], "start": "09:00", "duration": 90, "is_lab": true}'::jsonb,
  1,
  'released'
);
```

### Test Flow

1. Register as: carol.white@uni.edu
2. Login and complete onboarding
3. Navigate to dashboard
4. **Verify**:
   - ✅ Shows "1" in Assigned Sections stat
   - ✅ Shows "1" in Weekly Load
   - ✅ Shows "1" in Courses
   - ✅ Shows section card with details:
     - CS101 - Introduction to Computer Science
     - Section 01 (Lab)
     - Days: Sunday, Tuesday
     - Time: 09:00 (90 min)
     - Room: LAB-101
     - Capacity: 30 students

5. Go to Feedback page → "My Sections" tab
6. **Verify**:
   - ✅ Shows same section card

7. Submit section-specific feedback:
   - Select "Section-Specific" option
   - Choose "CS101 - Introduction to Computer Science (Section 01)"
   - Add comment: "This time slot works well"
   - Submit
   - **Verify**: Appears in "My Comments" tab with section badge

---

## Common Issues & Solutions

### Issue: Email confirmation link doesn't work

**Solution**: 
- Check Supabase Studio → Authentication → URL Configuration
- Ensure Site URL is `http://localhost:3000`
- Check redirect URLs include `http://localhost:3000/**`

### Issue: "Profile Not Linked" always shows

**Solution**:
```sql
-- Check if instructor exists
SELECT * FROM instructor WHERE email = 'faculty@email.com';

-- Check email matches exactly (case-sensitive!)
SELECT email FROM user_roles WHERE user_id = 'user-id-here';
SELECT email FROM instructor WHERE email = 'faculty@email.com';
```

### Issue: Features return 403 Forbidden

**Solution**:
- Check user has 'faculty' role:
  ```sql
  SELECT role FROM user_roles WHERE email = 'faculty@email.com';
  ```
- Verify RLS policies applied:
  ```bash
  pnpm db:reset
  ```

### Issue: Grid doesn't save selections

**Solution**:
- Check browser console for errors
- Verify network request to `/api/faculty/availability` succeeds
- Check instructor_id is correct

### Issue: Comments don't appear

**Solution**:
- Check network request to `/api/schedule-comments` succeeds
- Verify user is authenticated
- Check browser console for errors

---

## Automated Test Script (Optional)

Create `test-faculty-flow.sh`:

```bash
#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Testing Faculty Authentication Flow..."

# Test 1: Check database
echo -n "1. Checking database connection... "
if psql -d postgres -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    exit 1
fi

# Test 2: Check tables exist
echo -n "2. Checking required tables... "
TABLES=$(psql -d postgres -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('user_roles', 'instructor', 'section', 'schedule_comment')")
if [ "$TABLES" -eq 4 ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC} (found $TABLES/4 tables)"
    exit 1
fi

# Test 3: Check server is running
echo -n "3. Checking development server... "
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "Run: pnpm dev"
    exit 1
fi

echo -e "\n${GREEN}All checks passed!${NC}"
echo "Ready to test faculty registration and login."
```

Run with: `bash test-faculty-flow.sh`

---

## Success Criteria

All tests pass if:

### Registration & Onboarding
- [ ] Faculty can register with email/password
- [ ] **Instructor profile is automatically created** during registration
- [ ] Faculty receives confirmation email
- [ ] Faculty can login after confirmation
- [ ] Onboarding is minimal (no academic questions for faculty)
- [ ] Redirects to `/dashboard/faculty` after onboarding

### Dashboard Access
- [ ] **NO "Profile Not Linked" warning appears** (automated creation)
- [ ] Shows full faculty dashboard immediately
- [ ] Statistics display correctly (sections, load, comments)
- [ ] All buttons are enabled (not disabled)

### Availability Features
- [ ] Can access `/dashboard/faculty/availability` without errors
- [ ] Can set preferred times on grid
- [ ] Can set unavailable times on grid
- [ ] Preferences save and persist to database
- [ ] Grid updates reflect in instructor table

### Feedback Features
- [ ] Can access `/dashboard/faculty/feedback` without errors
- [ ] Can submit general feedback
- [ ] Can submit section-specific feedback (if sections exist)
- [ ] Can view comment history
- [ ] Can edit unresolved comments
- [ ] Can delete unresolved comments
- [ ] Comments appear in unified `schedule_comment` table

### Database Verification
- [ ] Instructor record exists in database after registration
- [ ] Email matches between `user_roles` and `instructor` tables
- [ ] Default values are correct (max_load: 12, empty preferences)
- [ ] Updates to preferences save correctly

### Edge Cases
- [ ] Duplicate email registration handled gracefully
- [ ] No errors in browser console
- [ ] No errors in server logs
- [ ] RLS policies allow faculty access appropriately

---

**Testing Time**: ~30 minutes for full test suite  
**Prerequisites**: Local Supabase running, migrations applied  
**Status**: Ready to test

