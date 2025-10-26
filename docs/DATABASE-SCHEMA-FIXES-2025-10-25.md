# Database Schema Fixes - October 25, 2025

## Summary

This document outlines the fixes applied to align the codebase with the actual database schema defined in `src/types/database.ts`.

## Issues Identified

Based on the database schema, the following mismatches were found:

1. **Faculty Table**: Code used `faculty_number` but schema has `faculty_id`
2. **Room References**: Code used `room_number` (string) but schema uses `room_id` (UUID foreign key)
3. **Section References**: Code used `section_number` but schema doesn't have this field
4. **Student References**: Code correctly uses `student_number` ✓

## Fixes Applied

### 1. Faculty Table Fixes ✅

**Files Updated:**
- `src/app/faculty/setup/page.tsx`
- `src/app/faculty/dashboard/page.tsx`
- `src/app/faculty/layout.tsx`
- `src/app/faculty/setup/faculty-setup-form.tsx`
- `src/app/faculty/dashboard/FacultyDashboardClient.tsx`
- `src/app/api/faculty/status/route.ts`

**Changes:**
```typescript
// ❌ OLD
const { data: faculty } = await supabase
  .from("faculty")
  .select("faculty_number, title")

await supabase.from("faculty").upsert({
  id: userId,
  faculty_number: data.facultyId,
})

// ✅ NEW
const { data: faculty } = await supabase
  .from("faculty")
  .select("faculty_id, title")

await supabase.from("faculty").upsert({
  id: userId,
  faculty_id: data.facultyId,
})
```

### 2. Type Definitions Updated ✅

**Files Updated:**
- `src/types/scheduler.ts`
- `src/types/scheduler-mock.ts`

**Changes:**
```typescript
// ❌ OLD
export interface CourseSection {
  section_number: string;
  room_number?: string;
}

// ✅ NEW
export interface CourseSection {
  // Removed section_number (not in schema)
  room_id?: string;
  room?: {
    id: string;
    number: string;
  };
}
```

### 3. Validation Schemas Updated ✅

**Files Updated:**
- `src/lib/api/validation.ts`

**Changes:**
```typescript
// ❌ OLD
export const sectionCreateSchema = z.object({
  room_number: z.string().optional(),
});

// ✅ NEW
export const sectionCreateSchema = z.object({
  room_id: z.string().uuid().optional(),
});
```

### 4. Component Updates ✅

**Critical Files Updated:**
- `src/components/committee/scheduler/course-section-v2/SectionManagementTable.tsx`
- `src/components/committee/scheduler/student-management-v2/StudentDetailsDialog.tsx`

**Changes:**
```typescript
// ❌ OLD
<span>{section.section_number}</span>
<span>{section.room_number}</span>

// ✅ NEW
<span>{section.section_id.slice(0, 8)}</span>
<span>{section.room?.room_number}</span>
```

## Database Schema Reference

### Faculty Table (Correct Schema)
```typescript
faculty: {
  Row: {
    id: string                    // Primary key (user_id)
    faculty_id: string            // ✅ Faculty identifier (e.g., "F12345")
    title: string | null
    status: "active" | "inactive"
  }
}
```

### Section Table (Correct Schema)
```typescript
section: {
  Row: {
    id: string                    // ✅ Primary key (UUID)
    course_code: string
    term_code: string
    capacity: number | null
    room_id: string | null        // ✅ Foreign key to room table
    instructor_id: string | null
    section_type: string | null
    status: string | null
    // ❌ NO section_number field
  }
}
```

### Room Table (Correct Schema)
```typescript
room: {
  Row: {
    id: string                    // ✅ Primary key (UUID)
    number: string                // ✅ Room number (e.g., "B101")
  }
}
```

## Remaining Work

### Additional Files That May Need Updates

The following files were identified as potentially using the old schema but were not updated in this pass:

1. **Component Files with `room_number`:**
   - `src/components/committee/courses/SectionManager.tsx`
   - `src/components/committee/courses/CourseList.tsx`
   - `src/components/committee/scheduler/CourseList.tsx`
   - `src/components/committee/scheduler/ConflictResolutionDialog.tsx`
   - `src/components/committee/scheduler/SchedulePreviewer.tsx`
   - `src/components/committee/scheduler/SectionManager.tsx`

2. **Mock Data Files:**
   - `src/lib/mock-data/scheduler-data.ts` - May need updates to match new types

### Recommended Next Steps

1. **Update Remaining Components:**
   - Replace `section.room_number` with `section.room?.number`
   - Replace `section.section_number` with `section.id` or remove if not needed

2. **Database Queries:**
   - Ensure all queries that need room information use proper joins:
   ```typescript
   const { data } = await supabase
     .from("section")
     .select(`
       *,
       room:room_id (
         id,
         number
       )
     `);
   ```

3. **Update Mock Data:**
   - Align mock data structures with the updated types
   - Remove `section_number` from mock sections
   - Update room references to use proper structure

## Testing Checklist

- [ ] Faculty setup flow works correctly
- [ ] Faculty dashboard displays faculty_id properly
- [ ] Section creation with room assignment works
- [ ] Section display shows room numbers correctly (via room relation)
- [ ] No TypeScript errors in updated files
- [ ] All API endpoints handle new schema correctly

## References

- Database Schema: `src/types/database.ts`
- Migration Guide: `docs/DB-REFINEMENTS-GUIDE.md`
- Student Schema Summary: `docs/schema/STUDENT-SCHEMA-SUMMARY.md`

