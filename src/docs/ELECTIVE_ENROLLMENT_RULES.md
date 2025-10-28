# Elective Enrollment Rules

**Date:** October 29, 2025  
**Status:** Active

## Core Principle

**Electives have NO level restrictions!** Students can register for any elective course regardless of their current level, as long as they satisfy the enrollment constraints.

## Why This Matters

The `level` field in the `course` table serves different purposes for different course types:

### For Required Courses
- **Level IS restrictive**: Students are auto-enrolled in required courses based on their level
- Example: A Level 4 student gets SWE 211, CSC 113, MATH 244, etc.

### For Elective Courses  
- **Level is NOT restrictive**: The `level` field is purely for organizational/categorization purposes
- Indicates where the elective typically fits in the curriculum (e.g., "advanced elective")
- **Students at ANY level can register** if they meet prerequisites and credit requirements

## Enrollment Constraints for Electives

Students can register for an elective if:

1. ✅ **Prerequisites Met**: Student has completed all prerequisite courses (if any)
2. ✅ **Credit Limit**: Total enrolled credits ≤ 20
3. ✅ **Section Capacity**: Section has available seats
4. ✅ **Elective Group Requirements**: Student meets any elective group constraints
5. ✅ **No Duplicate**: Not already enrolled in the same section

### NOT A Constraint:
- ❌ Student level (Level 1 students can take "Level 8" electives if prerequisites are met)

## Examples

### Scenario 1: Level 1 Student Taking Advanced Elective
```
Student: Level 1
Elective: CSC 361 (Artificial Intelligence) - listed as "Level 7"
Prerequisites: CSC 113, CSC 212, MATH 244

✅ CAN ENROLL if prerequisites are completed
❌ CANNOT ENROLL if missing prerequisites
```

### Scenario 2: Level 8 Student Taking Introductory Elective  
```
Student: Level 8
Elective: IS 230 (Introduction to Information Systems) - listed as "Level 6"
Prerequisites: None

✅ CAN ENROLL (no level restriction, no prerequisites)
```

## Implementation Details

### Database Query
```typescript
// CORRECT: No level filtering for electives
const query = supabase
  .from('section')
  .select('*')
  .eq('course.is_elective', true)
  // No .eq('level', studentLevel) - This is WRONG!

// WRONG: Do NOT filter electives by level!
const query = supabase
  .from('section')
  .select('*')
  .eq('course.is_elective', true)
  .gte('group_level', studentLevel)  // ❌ INCORRECT!
```

### Validation Logic
```typescript
// Enrollment validation for electives
async function canEnrollInElective(studentId, sectionId) {
  // ✅ Check prerequisites
  const hasPrereqs = await checkPrerequisites(studentId, courseCode);
  
  // ✅ Check credit limit
  const totalCredits = await getTotalCredits(studentId);
  const withinLimit = totalCredits + courseCredits <= 20;
  
  // ✅ Check capacity
  const hasSeats = await checkCapacity(sectionId);
  
  // ❌ Do NOT check student level!
  
  return hasPrereqs && withinLimit && hasSeats;
}
```

## Files Updated

The following files have been corrected to remove incorrect level filtering:

1. **`lib/db/student-enrollments.ts`**
   - Removed `level` parameter from `getAvailableElectiveSections()`
   - Added explicit `.eq('course.is_elective', true)` filter
   - Updated documentation

2. **`app/api/student/available-sections/route.ts`**
   - Removed level filtering logic
   - Updated documentation to clarify no level restrictions
   - Removed unused `level` query parameter

3. **`PRD.md`**
   - Added clarification about elective level field being organizational only

## Common Pitfalls to Avoid

### ❌ Don't Do This
```typescript
// BAD: Filtering electives by student level
if (course.is_elective && studentLevel < course.level) {
  return false; // WRONG!
}
```

### ✅ Do This Instead
```typescript
// GOOD: Only check actual enrollment constraints
if (course.is_elective) {
  return checkPrerequisites(studentId, courseCode) &&
         checkCreditLimit(studentId, courseCredits) &&
         checkCapacity(sectionId);
  // Level is NOT checked!
}
```

## Frontend Implications

### UI/UX Considerations
- Show ALL elective sections to students, not just those for their level
- Group/organize electives by elective group (Department, Math/Stats, etc.)
- Display prerequisites prominently so students know what's required
- Show "Level X" as informational only (e.g., "Typically taken in Level 7")
- Allow students to attempt enrollment - validation happens server-side

### Example UI Text
```
✅ Good: "CSC 361 - Artificial Intelligence (Typically Level 7)"
✅ Good: "Prerequisites: CSC 113, CSC 212, MATH 244"
❌ Bad: "Available from Level 7 onwards"
❌ Bad: "Not available for your level"
```

## Testing Checklist

When testing elective enrollment:

- [ ] Level 1 student can see ALL elective sections
- [ ] Level 8 student can see ALL elective sections
- [ ] Enrollment blocked by missing prerequisites (not by level)
- [ ] Enrollment blocked by credit limit (not by level)
- [ ] Enrollment blocked by section capacity (not by level)
- [ ] Level field shown as informational only in UI
- [ ] No "level required" error messages for electives

## References

- [PRD.md](../../PRD.md) - Product requirements
- [SWE_COURSES_MIGRATION_SUMMARY.md](./SWE_COURSES_MIGRATION_SUMMARY.md) - Course catalog structure
- [lib/db/student-enrollments.ts](../../lib/db/student-enrollments.ts) - Enrollment logic
- [app/api/student/available-sections/route.ts](../../app/api/student/available-sections/route.ts) - API endpoint

## Summary

**Remember:** Electives are NOT gated by level. The `level` field is metadata for organization purposes only. Students can take any elective at any time if they meet prerequisites and credit requirements.

