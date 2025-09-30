# API Routes Fix Status

## ✅ FIXED & WORKING

- `/api/courses` - GET, POST
- `/api/sections` - GET, POST
- `/api/sections/[id]` - GET, PUT, DELETE
- `/api/exams` - GET, POST
- `/api/conflicts` - GET
- `/api/rules` - GET, POST
- `/api/preferences` - ✅ **Just fixed** (changed courseService → courseOfferingService)
- `/api/irregular` - Uses irregularStudentService (should work)
- `/api/irregular/[id]` - Uses irregularStudentService (should work)
- `/api/comments` - Uses commentService (should work)
- `/api/notifications` - Uses notificationService (should work)
- `/api/notifications/[id]` - Uses notificationService (should work)

## ❌ NEEDS DELETION (Entities don't exist)

These routes reference entities that no longer exist in Phase 3:

- `/api/meetings/route.ts` - Meeting entity removed
- `/api/meetings/[id]/route.ts` - Meeting entity removed
- `/api/external-slots/route.ts` - ExternalSlot entity doesn't exist
- `/api/external-slots/[id]/route.ts` - ExternalSlot entity doesn't exist
- `/api/rules/[id]/route.ts` - Rule entity doesn't exist (rules are metadata only)
- `/api/exams/[id]/route.ts` - Exam entity doesn't exist (exams nested in courses)

## ⚠️ NEEDS REFACTORING

- `/api/load/overview` - References instructorService, sectionService, etc. Need to extract from courseOfferings
- `/api/faculty/assignments` - Likely references old services

## 🔧 HOW TO FIX

### Option 1: Delete Obsolete Routes (Recommended for Phase 3)

```bash
rm -rf src/app/api/meetings
rm -rf src/app/api/external-slots
rm src/app/api/rules/\[id\]/route.ts
rm src/app/api/exams/\[id\]/route.ts
```

### Option 2: Refactor Load Overview

This is the only route that might be needed. Extract instructor loads from courseOfferings:

```typescript
// /api/load/overview
export async function GET() {
  const allCourses = courseOfferingService.findAll();

  // Build instructor map
  const instructorLoads = new Map<string, any>();

  for (const course of allCourses) {
    for (const section of course.sections || []) {
      if (!section.instructor) continue;

      if (!instructorLoads.has(section.instructor)) {
        instructorLoads.set(section.instructor, {
          name: section.instructor,
          sections: [],
          totalHours: 0,
        });
      }

      // Calculate contact hours from section.times
      let contactHours = 0;
      for (const time of section.times || []) {
        const duration = (parseTime(time.end) - parseTime(time.start)) / 60;
        contactHours += duration;
      }

      const load = instructorLoads.get(section.instructor)!;
      load.sections.push({
        courseCode: course.code,
        courseName: course.name,
        sectionId: section.id,
        contactHours,
      });
      load.totalHours += contactHours;
    }
  }

  return NextResponse.json(Array.from(instructorLoads.values()));
}
```

## 🚀 RESTART SERVER

After fixing preferences route, restart the dev server to clear Turbopack cache:

```bash
# Kill current server (Ctrl+C)
npm run dev
```

Then test again:

```bash
./test-refactored-apis.sh
```

## 📊 EXPECTED RESULTS

After restart, ALL these should work:

- ✅ GET /api/courses - Returns mockCourseOfferings
- ✅ GET /api/sections - Returns flattened sections
- ✅ GET /api/exams - Returns flattened exams
- ✅ GET /api/conflicts - Returns conflict check results
- ✅ GET /api/rules - Returns rule metadata
- ✅ GET /api/preferences - Returns empty array (no seed data for preferences)
- ✅ GET /api/irregular - Returns mockSWEIrregularStudents
- ✅ GET /api/comments - Returns empty array (no seed data)
- ✅ GET /api/notifications - Returns empty array (no seed data)

The data will be populated once seedData() runs successfully!
