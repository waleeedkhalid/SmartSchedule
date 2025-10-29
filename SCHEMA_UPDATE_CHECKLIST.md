# 🔧 Schema Update Checklist - Files Requiring Changes

**Last Updated:** October 29, 2025  
**Schema Version:** 1.0.0-production-ready

---

## 📋 **Summary**

After schema reconciliation, the following files need updates to align with the new schema:

### **Schema Changes:**
1. ❌ **Dropped:** `exam.section_id` column
2. ✅ **Added:** `section.activity` column (`lecture`/`tutorial`/`lab`)
3. ✅ **Updated:** Course levels now support 0-8 (was 1-5)
4. ✅ **Removed:** `meeting_pattern.is_lab` (use `section.activity` instead)

---

## 🔴 **HIGH PRIORITY - BREAKING CHANGES**

### **1. Database Layer (lib/db/)**

#### ❌ **lib/db/exams.ts** - CRITICAL
**Lines:** 27-96  
**Issue:** References `section_id` which was dropped

**Changes needed:**
```typescript
// REMOVE these from getExamsPaginated():
Line 39:   sectionId?: string  // DELETE THIS FILTER
Line 56:   section_id,          // DELETE FROM SELECT
Line 69-71:                      // DELETE THIS FILTER BLOCK
    if (filters?.sectionId) {
      query = query.eq('section_id', filters.sectionId)
    }
```

**Impact:** API will break if `sectionId` filter is used

---

#### ❌ **lib/db/student-schedule.ts** - CRITICAL  
**Lines:** 280, 340  
**Issue:** References `exam.section_id` foreign key

**Changes needed:**
```typescript
// Line 280: REMOVE section join from exam query
.select(`
  *,
  course:course!exam_course_code_fkey(code, title)
  // DELETE: section:section!exam_section_id_fkey(id, section_no)
`)

// Line 340: REMOVE section reference from exam mapping
// exams are now always course-level, no section info needed
```

**Impact:** Student exam timetable will break

---

#### ⚠️ **lib/db/sections.ts** - NEEDS UPDATE  
**Lines:** 147-159  
**Issue:** `createSection()` doesn't include `activity` column

**Changes needed:**
```typescript
export async function createSection(section: SectionInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // ADD: Extract activity from section data
  const { data, error } = await supabase
    .from('section')
    .insert({ 
      ...section, 
      created_by: user?.id,
      // Ensure activity is set (required column now)
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Section;
}
```

**Impact:** New sections may fail validation if `activity` not provided

---

#### ⚠️ **lib/db/course-stats.ts** - NEEDS UPDATE
**Lines:** 32-33  
**Issue:** Uses `meeting_pattern.is_lab` to count lab sections

**Changes needed:**
```typescript
// Line 32-33: REPLACE
const labSections = sections.filter((s: any) => s.meeting_pattern?.is_lab).length
// WITH:
const labSections = sections.filter((s: any) => s.activity === 'lab').length
```

**Impact:** Course statistics will incorrectly show 0 lab sections

---

### **2. Components**

#### ❌ **components/section-form.tsx** - CRITICAL
**Lines:** 414-436  
**Issue:** Form has `is_lab` checkbox (old pattern)

**Changes needed:**
```typescript
// REPLACE checkbox (lines 414-436) WITH dropdown:
<FormField
  control={form.control}
  name="activity"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Section Type</FormLabel>
      <Select onValueChange={field.onChange} value={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select section type" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="lecture">Lecture</SelectItem>
          <SelectItem value="tutorial">Tutorial</SelectItem>
          <SelectItem value="lab">Lab</SelectItem>
        </SelectContent>
      </Select>
      <FormDescription>
        Lab sections require 2-hour blocks, tutorials are 1 hour
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Impact:** Cannot create/edit sections properly

---

#### ❌ **components/sections-table.tsx** - NEEDS UPDATE
**Lines:** 167-171  
**Issue:** Uses `meeting_pattern.is_lab` to display lab badge

**Changes needed:**
```typescript
// Line 167-171: REPLACE
{section.meeting_pattern.is_lab && (
  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
    Lab
  </span>
)}
// WITH:
{section.activity && (
  <Badge variant={
    section.activity === 'lab' ? 'default' : 
    section.activity === 'tutorial' ? 'secondary' : 
    'outline'
  }>
    {section.activity.charAt(0).toUpperCase() + section.activity.slice(1)}
  </Badge>
)}
```

**Impact:** Section types won't display correctly

---

#### ⚠️ **components/student-schedule-view.tsx** - NEEDS UPDATE
**Lines:** 270-274  
**Issue:** Uses `meeting_pattern.is_lab`

**Changes needed:**
```typescript
// Line 270-274: REPLACE
{section.meeting_pattern.is_lab && (
  <Badge variant="outline" className="text-[9px] mt-1 h-4">
    Lab
  </Badge>
)}
// WITH:
{section.activity === 'lab' && (
  <Badge variant="outline" className="text-[9px] mt-1 h-4">
    Lab
  </Badge>
)}
```

**Impact:** Lab sections won't show lab indicator in student view

---

#### ⚠️ **components/faculty/section-card.tsx** - NEEDS UPDATE
**Lines:** 15, 25  
**Issue:** Uses `meeting_pattern.is_lab`

**Changes needed:**
```typescript
// Line 15: REPLACE
const isLab = meetingPattern?.is_lab || false
// WITH:
const isLab = section.activity === 'lab'

// Line 25: Keep as is (works with new isLab definition)
```

**Impact:** Faculty dashboard won't show lab indicators

---

#### ⚠️ **components/exam-form.tsx** - NEEDS UPDATE
**Check if it has section selection**

**Changes needed:**
- REMOVE any section_id fields
- Exams are always course-level now
- Only need: course_code, date, start_time, duration_minutes, room_codes[]

**Impact:** Cannot create exams if form expects section_id

---

### **3. API Routes**

#### ⚠️ **app/api/scheduling/generate/route.ts**
**Issue:** May reference `is_lab` in meeting patterns

**Action:** Search for `is_lab` and replace with `activity` checks

---

#### ⚠️ **app/api/sections/check-conflicts/route.ts**
**Issue:** May use `is_lab` for conflict detection

**Action:** Update to use `section.activity`

---

#### ⚠️ **app/api/data/import/route.ts**
**Issue:** Import logic may set `is_lab` in meeting_pattern

**Action:** Update to set `activity` column instead

---

### **4. Scheduling Algorithm**

#### ⚠️ **lib/scheduling/algorithm.ts**
**Lines:** Multiple references to `is_lab`

**Changes needed:**
- Replace all `section.meeting_pattern.is_lab` checks
- Use `section.activity === 'lab'` instead
- Update lab duration logic (2 hours for labs)

**Impact:** Scheduling algorithm won't handle labs correctly

---

## 🟡 **MEDIUM PRIORITY - TYPE SAFETY**

### **5. Type Definitions**

#### ✅ **lib/types/database.ts** - ALREADY UPDATED
Generated types now include:
- ✅ `section.activity`
- ✅ Removed `exam.section_id`
- ✅ Course level 0-8

---

#### ⚠️ **lib/types/scheduling.ts**
**Check for:**
- Any references to `is_lab` in meeting patterns
- Any section_id in exam types

**Action:** Update custom types to match database.ts

---

## 🟢 **LOW PRIORITY - DOCUMENTATION & UTILITIES**

### **6. Documentation Files (INFORMATIONAL ONLY)**
These files reference old schema but are docs only:

- ✅ `SCHEMA_RECONCILIATION_SUMMARY.md` - Already documents changes
- ✅ `EXTERNAL_DEPARTMENTS_FILES_TO_UPDATE.md` - Lists files to update
- ℹ️ `PRD.md` - Product docs (informational)
- ℹ️ `IMPLEMENTATION_COMPLETE.md` - Historical record
- ℹ️ `src/docs/*.md` - Documentation files

**Action:** Update when convenient, not blocking

---

### **7. Utility & Stats Files**

#### ⚠️ **lib/db/level-stats.ts**
**Action:** Review for `is_lab` usage in statistics

#### ⚠️ **lib/db/scheduling-stats.ts**
**Action:** Review for `is_lab` usage in stats

#### ⚠️ **lib/db/notification-triggers.ts**
**Action:** Check if section changes trigger notifications correctly

---

## 📊 **UPDATE PROGRESS TRACKER**

| File | Priority | Status | Notes |
|------|----------|--------|-------|
| ❌ `lib/db/exams.ts` | 🔴 CRITICAL | ⏳ TODO | Remove section_id references |
| ❌ `lib/db/student-schedule.ts` | 🔴 CRITICAL | ⏳ TODO | Remove exam.section join |
| ⚠️ `lib/db/sections.ts` | 🔴 HIGH | ⏳ TODO | Add activity to create |
| ⚠️ `lib/db/course-stats.ts` | 🟡 MEDIUM | ⏳ TODO | Replace is_lab with activity |
| ❌ `components/section-form.tsx` | 🔴 CRITICAL | ⏳ TODO | Replace checkbox with dropdown |
| ❌ `components/sections-table.tsx` | 🔴 HIGH | ⏳ TODO | Use activity for badge |
| ⚠️ `components/student-schedule-view.tsx` | 🟡 MEDIUM | ⏳ TODO | Use activity for lab badge |
| ⚠️ `components/faculty/section-card.tsx` | 🟡 MEDIUM | ⏳ TODO | Use activity for isLab |
| ⚠️ `components/exam-form.tsx` | 🔴 HIGH | ⏳ TODO | Remove section selection |
| ⚠️ `lib/scheduling/algorithm.ts` | 🔴 HIGH | ⏳ TODO | Replace is_lab checks |
| ⚠️ `app/api/scheduling/generate/route.ts` | 🟡 MEDIUM | ⏳ TODO | Check for is_lab usage |
| ⚠️ `app/api/sections/check-conflicts/route.ts` | 🟡 MEDIUM | ⏳ TODO | Update conflict logic |
| ⚠️ `app/api/data/import/route.ts` | 🟡 MEDIUM | ⏳ TODO | Set activity on import |

---

## 🔍 **VALIDATION CHECKLIST**

After making changes, verify:

### **Database Layer**
- [ ] All exam queries work without `section_id`
- [ ] Section creation includes `activity` field
- [ ] No queries reference `meeting_pattern.is_lab`
- [ ] Course stats show correct lab section counts

### **Components**
- [ ] Section form has activity dropdown
- [ ] Section table shows activity badges
- [ ] Student schedule shows lab indicators
- [ ] Faculty views show section types
- [ ] Exam form doesn't have section selection

### **API Routes**
- [ ] Exam creation works without section_id
- [ ] Section creation validates activity
- [ ] Scheduling algorithm handles activities
- [ ] Conflict detection uses activity

### **Types**
- [ ] No TypeScript errors
- [ ] Activity type is `'lecture' | 'tutorial' | 'lab'`
- [ ] Exam type doesn't have section_id

---

## 🚀 **DEPLOYMENT STRATEGY**

### **Phase 1: Database Layer (Day 1)**
1. Update `lib/db/exams.ts` ✅
2. Update `lib/db/student-schedule.ts` ✅
3. Update `lib/db/sections.ts` ✅
4. Update `lib/db/course-stats.ts` ✅

### **Phase 2: Forms & UI (Day 2)**
5. Update `components/section-form.tsx` ✅
6. Update `components/exam-form.tsx` ✅
7. Update `components/sections-table.tsx` ✅

### **Phase 3: Views & Display (Day 3)**
8. Update `components/student-schedule-view.tsx` ✅
9. Update `components/faculty/section-card.tsx` ✅
10. Update other view components ✅

### **Phase 4: Algorithm & API (Day 4)**
11. Update `lib/scheduling/algorithm.ts` ✅
12. Update API routes ✅
13. Update import/export logic ✅

### **Phase 5: Testing & Validation (Day 5)**
14. Test all CRUD operations ✅
15. Test scheduling algorithm ✅
16. Test student/faculty views ✅
17. Test exam creation ✅

---

## 📝 **NOTES**

### **Breaking Changes:**
- ❌ **exam.section_id** - Completely removed
- ❌ **meeting_pattern.is_lab** - Deprecated, use `activity` instead

### **Non-Breaking Additions:**
- ✅ **section.activity** - New required field
- ✅ **Course level 0-8** - Expanded range

### **Migration Safety:**
- All existing data backfilled with `activity` values
- Constraint fixes applied in correct order
- TypeScript types regenerated

---

## ❓ **QUESTIONS FOR DEVELOPER**

Before starting updates:

1. Should we add a data migration to populate `activity` for all existing sections?
   - ✅ Already done in migration (parsed from section_no suffix)

2. Should exam form show "Applies to all sections" message?
   - Recommended: Yes, add informational text

3. Should we keep `meeting_pattern` JSONB or migrate fully to columns?
   - Current decision: Keep JSONB for schedule data (days, start, duration)
   - Use `activity` column for type

---

## 🆘 **SUPPORT**

**Migration Files:**
- `20251029131605_schema_reconciliation_production_ready.sql`
- `20251029123807_import_external_departments_data.sql`

**Documentation:**
- `SCHEMA_RECONCILIATION_SUMMARY.md`
- This file (`SCHEMA_UPDATE_CHECKLIST.md`)

**To regenerate types:**
```bash
supabase gen types typescript --local > lib/types/database.ts
```

---

**Last reviewed:** October 29, 2025  
**Status:** 🟡 IN PROGRESS  
**Completion:** 0/14 files updated

