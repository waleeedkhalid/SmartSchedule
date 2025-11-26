# API Bugs Fixed

## Summary

Fixed 6 bugs across multiple API endpoints related to incorrect field access patterns and missing field selections.

## Bugs Fixed

### Bug 1: Enrollments GET - course_code extraction ✅ FIXED
**File**: `app/api/v1/enrollments/route.ts` (line 136)
**Issue**: Code tried to access `enrollment.section?.course_code` but `course_code` doesn't exist on the section object. It should come from `section.course.code`.
**Fix**: Changed to `enrollment.section?.course?.code || null`

### Bug 2: Enrollments POST - course_code extraction ✅ FIXED
**File**: `app/api/v1/enrollments/route.ts` (line 312)
**Issue**: Same as Bug 1 - incorrect field access pattern.
**Fix**: Changed to `enrollment.section?.course?.code || null`

### Bug 3: Schedules/me - courseCode extraction ✅ FIXED
**File**: `app/api/v1/schedules/me/route.ts` (line 251)
**Issue**: Code tried `enrollment.course_code || enrollment.section?.course?.code`, but:
- `enrollment.course_code` doesn't exist (not selected in query)
- Should only use `enrollment.section?.course?.code`
**Additional Fix**: Line 268 - Changed `enrollment.section.type` to `enrollment.section.activity` since query selects `activity`, not `type`
**Fix**: 
- Changed to `enrollment.section?.course?.code` (removed non-existent `enrollment.course_code`)
- Changed `type: enrollment.section.type` to `type: enrollment.section.activity`

### Bug 4 & 5: Sections - activity field not selected ✅ FIXED
**Files**: 
- `app/api/v1/sections/route.ts` (line 114)
- `app/api/v1/sections/[id]/route.ts` (line 71, 199)

**Issue**: Code uses `section.activity` but the query only selects `*` which might not explicitly include `activity` in all cases. While `*` should include all fields, explicitly selecting `activity` ensures it's always available.

**Fix**: Added explicit `activity` field to all section queries:
- GET `/api/v1/sections` - Added `activity` to select clause
- GET `/api/v1/sections/:id` - Added `activity` to select clause  
- PUT `/api/v1/sections/:id` - Added `activity` to select clause

### Bug 6: Logout - Response format inconsistency ✅ FIXED
**File**: `app/api/v1/auth/logout/route.ts` (line 73)
**Issue**: Used `NextResponse.json(response)` instead of `createSuccessResponse()` for consistency with other endpoints.
**Fix**: Changed to use `createSuccessResponse(response, 200)` while maintaining cookie clearing functionality.

## Code Changes

### 1. `app/api/v1/enrollments/route.ts`
- **Line 136**: `course_code: enrollment.section?.course_code` → `course_code: enrollment.section?.course?.code || null`
- **Line 279**: Fixed type handling for `section.course` (handle array case)
- **Line 312**: `course_code: enrollment.section?.course_code` → `course_code: enrollment.section?.course?.code || null`

### 2. `app/api/v1/schedules/me/route.ts`
- **Line 251**: `enrollment.course_code || enrollment.section?.course?.code` → `enrollment.section?.course?.code`
- **Line 268**: `type: enrollment.section.type` → `type: enrollment.section.activity`

### 3. `app/api/v1/sections/route.ts`
- **Line 56**: Added `activity` to select clause

### 4. `app/api/v1/sections/[id]/route.ts`
- **Line 35**: Added `activity` to GET select clause
- **Line 171**: Added `activity` to PUT select clause

### 5. `app/api/v1/auth/logout/route.ts`
- **Line 73**: Changed from `NextResponse.json(response)` to `createSuccessResponse(response, 200)`

## Testing Checklist

- [ ] Test enrollments GET endpoint - verify `course_code` is returned correctly
- [ ] Test enrollments POST endpoint - verify `course_code` is returned correctly
- [ ] Test schedules/me endpoint - verify course grouping works correctly
- [ ] Test sections GET endpoint - verify `section_type` (activity) is returned
- [ ] Test sections GET by ID - verify `section_type` (activity) is returned
- [ ] Test sections PUT - verify `section_type` (activity) is returned
- [ ] Test logout endpoint - verify response format matches other endpoints

## Impact

These fixes ensure:
- ✅ `course_code` is correctly extracted from nested relationships
- ✅ `section_type` (activity) is always available in responses
- ✅ Consistent API response format across all endpoints
- ✅ No more `undefined` values breaking client-side logic

