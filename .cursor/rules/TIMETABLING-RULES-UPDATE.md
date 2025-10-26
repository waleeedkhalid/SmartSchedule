# Timetabling System Rules Update

> **Date:** October 25, 2025  
> **File Updated:** `.cursor/rules/index.mdc`  
> **Purpose:** Ensure AI always understands SmartSchedule is a timetabling system

---

## 🎯 What Was Added

Added a **comprehensive timetabling system understanding** section to the always-applied Cursor rules (`index.mdc`). This ensures every AI interaction (including this one!) understands the fundamental architecture of SmartSchedule.

---

## ✅ Changes Made

### 1. New Section: "CRITICAL: System Type Understanding"

**Location:** Top of `index.mdc` (after metadata, before Project Structure)

**Content:**
- Clear explanation: SmartSchedule is a TIMETABLING system, not enrollment
- What this means (preferences → generator → publish → view)
- What this is NOT (real-time enrollment, first-come-first-served)
- Key data tables with their purposes
- System timeline (pre-semester, semester, post-semester)
- Code examples showing correct vs incorrect patterns
- Links to detailed documentation

### 2. Updated "Key Tables" Section

**Before:**
- Generic table listing

**After:**
- Organized by purpose in timetabling workflow:
  - **User & Profile:** `users`, `students`, `faculty`
  - **Pre-Semester (Input):** `elective_preferences`, `faculty_availability`, etc.
  - **Generated (Output):** `schedules`
  - **Historical:** `enrollment`, `academic_term`
  - **Supporting:** `elective_package`, `student_package_progress`, etc.

### 3. Updated "User Roles" Section

**Before:**
```
1. student - Students viewing schedules and enrolling
```

**After:**
```
1. student - Submit preferences, VIEW generated schedules (read-only)
```

All roles now accurately reflect the timetabling workflow.

### 4. New Section: "Timetabling System Patterns"

Added before "Common Patterns" section with code examples:

```typescript
// ❌ WRONG: Building real-time enrollment
async function enrollStudent(studentId, courseCode) {
  // This is NOT an enrollment system!
}

// ✅ CORRECT: Collecting preferences
async function submitPreferences(studentId, preferences) {
  await supabase.from("elective_preferences").insert(preferences);
}
```

Includes 5 common mistake patterns with corrections.

### 5. Enhanced "Documentation" Section

**Before:**
- Basic doc links

**After:**
- **System Understanding (MUST READ)** section with ⭐
- Links to Timetabling System Guide
- Links to Student Schema Summary
- Organized by category (System, Schema, Performance)

### 6. Updated "When in doubt" Principles

**Before:**
- 7 code quality principles

**After:**
- **System Architecture principles (4 items)** - NEW
  - Remember: Timetabling system
  - Workflow: preferences → generate → view
  - Use `schedules` for current semester
  - Use `enrollment` for historical only
- **Code Quality principles (7 items)**
  - Existing principles preserved

---

## 📊 Impact

### Before This Update

AI might:
- ❌ Build real-time enrollment features
- ❌ Confuse `enrollment` with current semester courses
- ❌ Allow students to modify schedules during semester
- ❌ Treat `elective_preferences` as enrollments

### After This Update

AI will:
- ✅ Understand SmartSchedule is a timetabling system
- ✅ Use correct tables for correct purposes
- ✅ Follow the preference → generate → view workflow
- ✅ Prevent building enrollment-like features
- ✅ Reference detailed documentation when needed

---

## 🔍 How It Works

### Always Applied Rule

The `index.mdc` file has this metadata:
```yaml
---
alwaysApply: true
description: SmartSchedule project overview and quick reference
---
```

This means:
- ✅ **Every** Cursor AI conversation includes this context
- ✅ **Every** code generation considers timetabling architecture
- ✅ **Every** suggestion follows correct patterns
- ✅ **No exceptions** - always available

### Example Usage

**User asks:** "Add a feature to let students enroll in courses"

**AI (Before Update):** "Sure! Let me create an enrollment endpoint..."

**AI (After Update):** "⚠️ SmartSchedule is a timetabling system. Students don't enroll in real-time. Instead, they should submit preferences via `elective_preferences` table, which the scheduler uses to generate timetables. Would you like me to implement a preference submission feature?"

---

## 📚 Supporting Documentation

The rules reference these detailed guides:

1. **[docs/TIMETABLING-SYSTEM-GUIDE.md](../../../docs/TIMETABLING-SYSTEM-GUIDE.md)**
   - 400 lines of comprehensive explanation
   - System timeline and workflows
   - Real-world examples
   - Common misconceptions addressed

2. **[docs/schema/STUDENT-SCHEMA-SUMMARY.md](../../../docs/schema/STUDENT-SCHEMA-SUMMARY.md)**
   - 450 lines of schema documentation
   - All 9 student tables explained
   - Common queries for each table
   - Integration examples

3. **[docs/schema/overview.md](../../../docs/schema/overview.md)**
   - Complete database schema
   - Data flow diagrams
   - Table relationships
   - RLS policies

---

## ✨ Code Examples Included

The rules now include these practical examples:

### ✅ CORRECT Patterns

```typescript
// Collecting student preferences
async function submitPreferences(studentId, preferences) {
  await supabase.from("elective_preferences").insert(preferences);
}

// Showing generated schedule
async function getStudentSchedule(studentId, termCode) {
  const { data } = await supabase
    .from("schedules")
    .select("*")
    .eq("student_id", studentId)
    .eq("is_published", true)
    .single();
  return data;
}

// Getting current courses from generated schedule
async function getCurrentCourses(studentId, termCode) {
  const schedule = await supabase
    .from("schedules")
    .select("data")
    .eq("student_id", studentId)
    .eq("is_published", true)
    .single();
  return schedule?.data?.sections || [];
}
```

### ❌ WRONG Patterns (Now Avoided)

```typescript
// ❌ Building real-time enrollment
async function enrollStudent(studentId, courseCode) {
  // This is NOT an enrollment system!
}

// ❌ Letting student modify schedule
async function dropCourse(studentId, courseCode) {
  // Schedules are READ-ONLY during semester!
}

// ❌ Using enrollment for current semester
async function getCurrentCourses(studentId) {
  // enrollment is HISTORICAL (past grades)
  return await supabase.from("enrollment").select("*");
}
```

---

## 🎓 Developer Onboarding

New developers working with Cursor will:

1. **Automatically see** the timetabling system explanation
2. **Get corrected** if they try to build enrollment features
3. **Receive suggestions** that follow timetabling architecture
4. **Have access** to detailed documentation links

No training needed - the AI handles it!

---

## 🔄 Maintenance

### When to Update This Rule

Update `.cursor/rules/index.mdc` when:
- System architecture fundamentally changes
- New critical patterns emerge
- Common mistakes are discovered
- Table purposes change

### How to Update

1. Edit `.cursor/rules/index.mdc`
2. Add/modify sections as needed
3. Update `.cursor/rules/README.md` with changes
4. Document the update in this file

---

## 📋 Validation

To verify the rules are working:

1. **Ask Cursor AI:** "How do students enroll in courses?"
   - ✅ Should explain preferences system
   - ❌ Should NOT suggest real-time enrollment

2. **Ask Cursor AI:** "Show me the enrollment table for current semester"
   - ✅ Should explain enrollment is historical
   - ✅ Should suggest using schedules table

3. **Ask Cursor AI:** "Let students drop courses"
   - ✅ Should explain schedules are read-only
   - ✅ Should suggest preference changes for next cycle

---

## 🎯 Summary

| Aspect | Before | After |
|--------|--------|-------|
| **System Understanding** | Generic | Timetabling-specific |
| **Table Purposes** | Unclear | Clearly defined by phase |
| **Common Mistakes** | Not addressed | 5 examples with corrections |
| **Documentation Links** | Basic | Comprehensive with ⭐ |
| **Code Examples** | Generic | Timetabling-specific |
| **User Roles** | Vague | Workflow-accurate |

**Result:** Every AI interaction now starts with correct understanding of SmartSchedule's architecture.

---

## 🚀 Next Steps

1. ✅ Rules are now active (always applied)
2. ✅ Documentation is comprehensive
3. ✅ Code examples provided
4. ✅ Common mistakes addressed

**No further action needed** - the rules will automatically guide all future development!

---

*Last Updated: October 25, 2025*  
*Rule File: `.cursor/rules/index.mdc`*  
*Always Applied: ✅ Yes*

