# Phase 3.2: Student API Endpoints Implementation

**Priority:** HIGH  
**Status:** READY TO START  
**Estimated Duration:** 1-2 days  
**Approach:** Test-Driven Development (TDD)

---

## 🎯 Objective

Implement API endpoints for student interactions following TDD methodology. All integration tests are already written - we need to adapt them and implement the corresponding API endpoints.

---

## 📊 Current Status

### Completed ✅
- ✅ Phase 1: Core Validators (97 tests passing)
- ✅ Phase 2: Core Generators (63 tests passing)
- ✅ Phase 3.1: Test Infrastructure (14 tests passing)
- **Total: 174 tests passing (100% pass rate)**

### Phase 3.2 Goal
- Adapt 18 existing integration tests
- Implement student API endpoints
- Target: ~192 total tests passing

---

## 📝 Phase 3.2 Tasks

### Task 1: Adapt Existing Integration Tests ⏳
**File:** `tests/integration/student-api.test.ts`  
**Current Status:** 18 tests exist but need adaptation  
**What to do:**

1. Update the test file to use `createTestClient()` instead of `createServerClient()`
2. Follow the pattern from `tests/integration/student-api-simple.test.ts`
3. Remove fixture loading that causes schema mismatches
4. Use inline test data or existing database data

**Pattern to Follow:**
```typescript
import { createTestClient } from '../utils/test-supabase-client';

describe('Student API Tests', () => {
  let supabase: SupabaseClient;
  
  beforeAll(() => {
    supabase = createTestClient();
  });
  
  it('should retrieve elective preferences', async () => {
    const { data, error } = await supabase
      .from('elective_preferences')
      .select('*')
      .limit(1);
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
```

### Task 2: Run Tests (RED Phase) 🔴
**Command:**
```bash
npm test tests/integration/student-api.test.ts
```

**Expected Result:** Tests should FAIL because API endpoints don't exist yet.

This is the RED phase of TDD - tests fail before implementation.

### Task 3: Implement API Endpoints (GREEN Phase) 🟢

Based on the failing tests, implement these API endpoints:

#### 3a. Elective Preferences API
**Endpoints to Create:**

1. **GET /api/student/electives**
   - File: `src/app/api/student/electives/route.ts`
   - Purpose: List available elective courses
   - Response: Array of elective courses from `course` table where `type = 'ELECTIVE'`

2. **POST /api/student/electives/draft**
   - File: `src/app/api/student/electives/draft/route.ts`
   - Purpose: Save draft preferences (not submitted)
   - Body: Array of preferences with `course_code` and `preference_order`
   - Response: Success message

3. **POST /api/student/electives/submit**
   - File: `src/app/api/student/electives/submit/route.ts`
   - Purpose: Submit final preferences
   - Body: Array of preferences (3-10 courses)
   - Validation: Use `preference-validator.ts` from Phase 1
   - Response: Success message

4. **GET /api/student/preferences**
   - File: `src/app/api/student/preferences/route.ts`
   - Purpose: Get submitted preferences
   - Response: Array of student's preferences from `elective_preferences` table

5. **PUT /api/student/preferences/:id**
   - File: `src/app/api/student/preferences/[id]/route.ts`
   - Purpose: Update preference order
   - Body: New `preference_order`
   - Response: Updated preference

6. **DELETE /api/student/preferences/:id**
   - File: `src/app/api/student/preferences/[id]/route.ts`
   - Purpose: Delete a preference
   - Response: Success message

#### 3b. Student Schedule API
**Endpoint to Create:**

1. **GET /api/student/schedule**
   - File: `src/app/api/student/schedule/route.ts` (may already exist - enhance it)
   - Purpose: Get published schedule (read-only)
   - Query: `?term_code=FALL2024` (optional)
   - Response: Student's schedule from `schedules` table where `is_published = true`
   - Security: RLS ensures students only see their own schedule

#### 3c. Feedback API
**Endpoint to Create:**

1. **POST /api/student/feedback**
   - File: `src/app/api/student/feedback/route.ts`
   - Purpose: Submit schedule feedback
   - Body: `{ schedule_id, rating, feedback_text, feedback_category, severity }`
   - Response: Success message

### Task 4: Run Tests Again (GREEN Phase) ✅
**Command:**
```bash
npm test tests/integration/student-api.test.ts
```

**Expected Result:** All 18 tests should PASS.

This is the GREEN phase - tests pass after implementation.

### Task 5: Refactor if Needed ♻️
- Check for code duplication
- Ensure consistent error handling
- Verify input validation
- Add JSDoc comments

---

## 🛠️ API Implementation Template

Use this template for all API routes:

```typescript
// src/app/api/student/preferences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 2. Query data (RLS automatically filters to current user)
    const { data, error } = await supabase
      .from('elective_preferences')
      .select('*')
      .eq('student_id', user.id)
      .order('preference_order', { ascending: true });
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      );
    }
    
    // 3. Return data
    return NextResponse.json({ data });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 2. Parse and validate body
    const body = await request.json();
    
    // 3. Insert data
    const { data, error } = await supabase
      .from('elective_preferences')
      .insert({
        student_id: user.id,
        ...body,
      })
      .select();
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create preference' },
        { status: 500 }
      );
    }
    
    // 4. Return result
    return NextResponse.json({ data }, { status: 201 });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## ✅ Success Criteria

### Tests
- [ ] All 18 student API integration tests passing
- [ ] Total: ~192 tests passing (174 + 18)
- [ ] 100% pass rate maintained
- [ ] No TypeScript errors
- [ ] No ESLint errors

### API Endpoints
- [ ] `GET /api/student/electives` implemented
- [ ] `POST /api/student/electives/draft` implemented
- [ ] `POST /api/student/electives/submit` implemented
- [ ] `GET /api/student/preferences` implemented
- [ ] `PUT /api/student/preferences/[id]` implemented
- [ ] `DELETE /api/student/preferences/[id]` implemented
- [ ] `GET /api/student/schedule` implemented
- [ ] `POST /api/student/feedback` implemented

### Quality
- [ ] All endpoints use proper authentication
- [ ] All endpoints have error handling
- [ ] All endpoints validate input
- [ ] RLS policies protecting data
- [ ] Consistent API response format

---

## 🔄 TDD Workflow

```
1. Adapt tests (if needed) → Run tests → They FAIL (RED) ❌
2. Implement API endpoint → Minimum code to pass
3. Run tests → They PASS (GREEN) ✅
4. Refactor if needed → Keep tests passing
5. Move to next endpoint
```

---

## 📚 Reference Files

### Test Infrastructure
- **Test Client:** `tests/utils/test-supabase-client.ts`
- **Test Helpers:** `tests/utils/test-helpers.ts`
- **Example Pattern:** `tests/integration/student-api-simple.test.ts`

### Existing Tests
- **Integration Tests:** `tests/integration/student-api.test.ts` (18 tests)
- **API Tests:** `tests/api/student/schedule.test.ts` (3 tests)

### Validators (Use These!)
- **Preference Validator:** `src/lib/validations/preference-validator.ts`
- **Schedule Validator:** `src/lib/validations/schedule-validator.ts`

### Documentation
- **System Guide:** `docs/TIMETABLING-SYSTEM-GUIDE.md`
- **Student Schema:** `docs/schema/STUDENT-SCHEMA-SUMMARY.md`
- **Phase 3.1 Complete:** `PHASE-3-1-COMPLETE.md`
- **Current Plan:** `PLAN.md`

---

## 🚀 Commands

### Run Tests
```bash
# Run the integration tests we're working on
npm test tests/integration/student-api.test.ts

# Run in watch mode for TDD
npm test tests/integration/student-api.test.ts -- --watch

# Run all completed tests
npm test tests/unit/validators/ tests/unit/generators/ tests/integration/

# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint
```

### Development
```bash
# Start dev server (if needed to test endpoints)
npm run dev

# Run Supabase locally (if needed)
supabase start
```

---

## 📋 Step-by-Step Guide

### Step 1: Understand Current Tests
```bash
# Read the existing integration tests
cat tests/integration/student-api.test.ts
```

Identify:
- What endpoints the tests expect
- What data format they expect
- What validations they check

### Step 2: Adapt Tests (if needed)
- Replace `createServerClient()` with `createTestClient()`
- Remove fixture loading that causes errors
- Use inline test data

### Step 3: Run Tests (RED)
```bash
npm test tests/integration/student-api.test.ts
```

Tests should fail with errors like:
- `404 Not Found` - endpoint doesn't exist
- `Connection refused` - need to implement route

### Step 4: Implement First Endpoint
Start with the simplest one: `GET /api/student/preferences`

1. Create file: `src/app/api/student/preferences/route.ts`
2. Implement GET handler
3. Use template above
4. Test manually if needed: `curl http://localhost:3000/api/student/preferences`

### Step 5: Run Tests (should have fewer failures)
```bash
npm test tests/integration/student-api.test.ts
```

### Step 6: Repeat for Each Endpoint
Continue implementing endpoints one by one until all tests pass.

### Step 7: Final Verification
```bash
# Run all tests
npm test

# Should see: 192 tests passing
```

---

## 💡 Tips

### Authentication
- Use `supabase.auth.getUser()` to get current user
- RLS policies automatically filter data by user
- Always check if user exists before proceeding

### Error Handling
- Wrap all code in try-catch
- Return appropriate status codes (401, 404, 500)
- Log errors with context

### Validation
- Use existing validators from Phase 1
- Validate before database operations
- Return clear error messages

### Testing
- Run tests frequently (after each endpoint)
- Use watch mode for instant feedback
- Check both success and error cases

---

## 🎯 Expected Outcome

After Phase 3.2 completion:

```
✅ Total Tests: 192 passing
  - Validators: 97 tests ✅
  - Generators: 63 tests ✅
  - Integration: 14 tests ✅
  - Student API: 18 tests ✅ (NEW)

✅ API Endpoints: 8 implemented
✅ Pass Rate: 100%
✅ Code Quality: No errors
✅ Ready for Phase 3.3: Faculty API
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Tests timeout
**Solution:** Increase timeout in test file:
```typescript
describe('API Tests', () => {
  it('should work', async () => {
    // ... test code
  }, 30000); // 30 second timeout
});
```

### Issue 2: RLS blocks insert
**Solution:** This is expected! RLS is working. Make sure you're authenticated as the correct user in tests.

### Issue 3: 404 Not Found
**Solution:** Check file naming:
- `route.ts` not `routes.ts`
- Correct directory structure
- Export GET/POST functions

### Issue 4: CORS errors
**Solution:** Not needed for same-origin API calls. If needed, add headers in route handler.

---

## ✅ Ready to Start!

**Next Command to Run:**
```bash
# First, check current test status
npm test tests/integration/student-api.test.ts

# Then start implementing based on failures
```

**Good luck! Follow TDD strictly: RED → GREEN → REFACTOR** 🚀

