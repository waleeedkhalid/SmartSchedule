# Backend Refactoring Status - Phase 3 Simplified Types

## ✅ COMPLETED

### Core Infrastructure

- ✅ **data-store.ts** - Completely refactored to use only slim types
  - 9 collections: courseOfferings, studentCounts, electivePackages, irregularStudents, electivePreferences, comments, notifications, conflicts, config
  - Service functions for each collection (create, findAll, findById, update, delete)
  - No complex types (User, Instructor, Room, TimeSlot, Meeting, Exam)
- ✅ **rules-engine.ts** - Simplified version with 3 core rules
  - Break Time Rule (12:00-13:00)
  - Room Conflict Detection
  - Instructor Conflict Detection
  - Works directly with CourseOffering structure (sections nested inside)
- ✅ **seed-data.ts** - Loads data from mockData.ts
  - Populates studentCounts, electivePackages, irregularStudents, courseOfferings
  - Simple forEach loops, no complex transformations

### Type System

- ✅ **types.ts** - User manually edited to flat, JSON-friendly structure
  - StudentCount, ElectivePackage, IrregularStudent
  - CourseOffering (main entity with nested Section, ExamInfo, SectionTime)
  - ElectivePreference, Comment, Notification, Conflict
  - NO separate Room, TimeSlot, Meeting, Instructor, User entities

## ⚠️ NEEDS REFACTORING

### API Routes (30+ files)

All routes in `src/app/api/` reference old service functions that no longer exist:

#### High Priority (Core Functionality)

- ❌ `/api/courses/route.ts` - Uses old `courseService`
- ❌ `/api/sections/route.ts` - References non-existent `sectionService`, `meetingService`, `timeSlotService`
- ❌ `/api/sections/[id]/route.ts` - Same issues
- ❌ `/api/exams/route.ts` - References `examService`, `courseService`
- ❌ `/api/exams/[id]/route.ts` - Same issues
- ❌ `/api/conflicts/route.ts` - May work with new conflictService
- ❌ `/api/rules/route.ts` - References old `ruleService`

#### Medium Priority (Committee Features)

- ❌ `/api/meetings/route.ts` - Meeting entity no longer exists
- ❌ `/api/meetings/[id]/route.ts` - Same
- ❌ `/api/external-slots/route.ts` - ExternalSlot entity doesn't exist
- ❌ `/api/external-slots/[id]/route.ts` - Same
- ❌ `/api/load/overview/route.ts` - Needs refactoring to use courseOfferings

#### Lower Priority (Working or Simple)

- ✅ `/api/preferences/route.ts` - Uses preferenceService (exists)
- ✅ `/api/irregular/route.ts` - Uses irregularStudentService (exists)
- ✅ `/api/irregular/[id]/route.ts` - Same
- ✅ `/api/comments/route.ts` - Uses commentService (exists)
- ✅ `/api/notifications/route.ts` - Uses notificationService (exists)
- ✅ `/api/notifications/[id]/route.ts` - Same

### Documentation Files

- ❌ `docs/api-reference.md` - References old API structure
- ❌ `docs/BACKEND_IMPLEMENTATION.md` - Describes complex type system
- ❌ `docs/IMPLEMENTATION_SUMMARY.md` - Outdated
- ❌ `QUICK_START.md` - May reference old patterns

## 🎯 REFACTORING STRATEGY

### Phase 1: Fix Core Course/Section Routes (IMMEDIATE)

Since sections are now nested inside CourseOffering, these routes need complete redesign:

**Option A: Section Operations via Course Endpoints**

```typescript
// GET /api/courses/:code/sections - Get all sections for a course
// POST /api/courses/:code/sections - Add section to course
// PUT /api/courses/:code/sections/:sectionId - Update section
// DELETE /api/courses/:code/sections/:sectionId - Delete section
```

**Option B: Keep Flat Sections Endpoints (Simpler for Phase 3)**

```typescript
// GET /api/sections - Extract all sections from all courses
// GET /api/sections/:id - Find course, return section
// POST /api/sections - Add section to specified course
// PUT /api/sections/:id - Update section in its course
```

**RECOMMENDATION**: Option B for Phase 3 simplicity

### Phase 2: Handle Exams (IMMEDIATE)

Exams are nested in CourseOffering.exams object:

```typescript
CourseOffering {
  exams: {
    midterm?: ExamInfo;
    midterm2?: ExamInfo;
    final: ExamInfo;
  }
}
```

Routes should:

```typescript
// GET /api/exams - Extract all exams from all courses
// GET /api/exams?course=SWE211 - Get exams for specific course
// POST /api/exams - Update course offering with new exam
// PUT /api/exams/:courseCode/:examType - Update specific exam
```

### Phase 3: Eliminate Meeting Endpoints

Since Meeting entity doesn't exist (times are in Section.times[]), either:

1. Delete `/api/meetings/*` routes entirely
2. Create virtual "meeting" responses by flattening Section.times

**RECOMMENDATION**: Delete for Phase 3, not needed

### Phase 4: Clean Up Documentation

Update all docs to reflect simplified architecture

## 📊 CURRENT ARCHITECTURE

### Data Flow

```
mockData.ts (1559 lines)
    ↓ (seedData)
dataStore (in-memory collections)
    ↓ (service functions)
API Routes
    ↓ (JSON responses)
Frontend Components
```

### Main Entity: CourseOffering

```typescript
CourseOffering {
  code, name, credits, department, level, type
  exams: { midterm?, midterm2?, final }
  sections: [
    {
      id, courseCode, instructor, room
      times: [{ day, start, end }]
    }
  ]
}
```

### No Separate Entities For:

- ❌ Rooms (just string in section.room)
- ❌ Instructors (just string in section.instructor)
- ❌ TimeSlots (embedded in section.times[])
- ❌ Meetings (section.times[] are the "meetings")
- ❌ Users (Phase 3 has no auth)
- ❌ Rules (just metadata in RULES array)

## 🚀 NEXT STEPS

1. **Decide on Section API pattern** (nested vs flat endpoints)
2. **Refactor 5-10 core routes** (courses, sections, exams, conflicts, rules)
3. **Test with existing frontend components**
4. **Delete obsolete routes** (meetings, external-slots, etc.)
5. **Update documentation** to match new architecture
6. **Update plan.md** with completed tasks

## 💡 KEY INSIGHTS

- **CourseOffering is the atomic unit** - sections/exams live inside it
- **No relational joins needed** - everything is nested JSON
- **Phase 3 = Prototype** - Focus on functionality over perfect architecture
- **Phase 4+ will add database** - Can normalize then if needed
- **Keep it simple** - JSON files + CRUD wrappers, nothing fancy
