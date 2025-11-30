# Updated Documentation Rule - Proposal

## Problem Statement

The current documentation rule prohibits creating new .md files without approval, but doesn't explicitly state what to do instead when documenting completed work. This leads to AI assistants creating summary files like:
- `IMPLEMENTATION_COMPLETE.md`
- `SESSION_SUMMARY.md`
- `DOCUMENTATION_AUDIT_REPORT.md`
- `FACULTY_DASHBOARD_IMPROVEMENTS.md`

## Proposed Changes

Add a new section to the documentation rule that **explicitly prohibits summary files** and **mandates alternatives**.

---

# ADDITION TO DOCUMENTATION RULE

## ❌ STRICTLY PROHIBITED: Summary and Report Files

**NEVER create files with these patterns in the project root:**

### Prohibited Patterns
- `*_COMPLETE.md` (e.g., `IMPLEMENTATION_COMPLETE.md`)
- `*_SUMMARY.md` (e.g., `SESSION_SUMMARY.md`)
- `*_REPORT.md` (e.g., `DOCUMENTATION_AUDIT_REPORT.md`)
- `*_IMPROVEMENTS.md` (e.g., `FACULTY_DASHBOARD_IMPROVEMENTS.md`)
- `*_IMPLEMENTATION.md` (e.g., `FACULTY_SELF_SERVICE_IMPLEMENTATION.md`)
- `*_ANALYSIS.md` (e.g., `FACULTY_AUTH_FLOW_ANALYSIS.md`)
- `CHANGES_MADE.md`
- `WORK_DONE.md`
- `PROGRESS_REPORT.md`
- `AUDIT_*.md`
- `SESSION_*.md`

### Why These Are Prohibited
1. **Redundant**: Information should go in `timeline.md` or `src/docs/`
2. **Unmaintained**: These files quickly become outdated
3. **Disorganized**: Creates clutter in project root
4. **Duplicate**: Often duplicates information in proper docs

---

## ✅ REQUIRED: Where to Document Work Instead

When you complete work and want to document it, you **MUST** use one of these approved methods:

### 1. Update `timeline.md` (ALWAYS REQUIRED)
**When**: After completing ANY significant work
**Format**:
```markdown
## [Date] - [Feature/Change Name]
- Description of what was done
- Key files changed: file1.ts, file2.tsx
- Impact on system
- Migration: 20241028_*.sql (if applicable)
```

**Example**:
```markdown
## October 28, 2025 - Faculty Dashboard Best Practices
- Applied TypeScript strict mode to faculty components
- Created reusable SectionCard component
- Eliminated all 'any' types
- Key files: lib/types/scheduling.ts, components/faculty/section-card.tsx
- Impact: Improved type safety, reduced code duplication by 50%
```

### 2. Update or Create Implementation Summary in `src/docs/`
**When**: Implementing a complex feature that needs detailed documentation
**Location**: `src/docs/[FEATURE]_SUMMARY.md`
**Requires**: User approval before creating new file

**Approved Examples**:
- `src/docs/RLS_FIX_SUMMARY.md`
- `src/docs/EXAMS_IMPLEMENTATION_SUMMARY.md`
- `src/docs/FACULTY_FEATURES_SUMMARY.md`

**Content**: Problem, solution, implementation details, testing

### 3. Add to `CHANGE_REQUESTS.md`
**When**: You identify future improvements or issues
**Format**:
```markdown
## [Feature Name] - [Priority]
**Requested**: [Date]
**Status**: Pending
**Description**: [What needs to be done]
**Reason**: [Why this is needed]
```

### 4. Provide Summary in Conversation
**When**: User asks "what did you do?"
**Format**: Plain text in your response, NOT a markdown file

**Example**:
```
I've completed the following work:

✅ Applied TypeScript best practices
   - Created lib/types/scheduling.ts
   - Eliminated all 'any' types
   
✅ Created reusable components
   - components/faculty/section-card.tsx
   
✅ Updated timeline.md with entry for October 28, 2025

All changes are documented in timeline.md.
```

---

## Decision Tree: Where Should This Go?

```
Completed work that needs documentation?
├─ Is it a significant feature/change?
│  ├─ YES → Update timeline.md (ALWAYS)
│  │        └─ Is it complex and needs detailed docs?
│  │           ├─ YES → Ask user: "Should I create src/docs/[FEATURE]_SUMMARY.md?"
│  │           └─ NO → timeline.md entry is sufficient
│  └─ NO → Just mention in conversation
│
├─ Did I identify future improvements?
│  └─ YES → Add to src/docs/CHANGE_REQUESTS.md
│
├─ User asks "what did you do?"
│  └─ Provide summary in conversation (plain text)
│
└─ Want to create a summary file?
   └─ ❌ STOP! Use timeline.md instead
```

---

## Examples of Correct Behavior

### ✅ CORRECT Example 1: Completing a Feature
```
AI: I've completed the faculty dashboard improvements. Let me update timeline.md...

[Updates timeline.md with dated entry]

AI: Done! All changes are documented in timeline.md under "October 28, 2025 - Faculty Dashboard Best Practices".
```

### ✅ CORRECT Example 2: Complex Feature
```
AI: I've implemented the exam conflict detection system. This is a complex feature. 
Would you like me to create a detailed implementation summary in src/docs/EXAMS_IMPLEMENTATION_SUMMARY.md?

User: Yes

AI: [Creates src/docs/EXAMS_IMPLEMENTATION_SUMMARY.md with user approval]
[Also updates timeline.md]
```

### ✅ CORRECT Example 3: User Asks for Summary
```
User: What did you do in this session?

AI: Here's a summary of completed work:

✅ Faculty Features
   - Created lib/db/faculty.ts
   - Added API routes for availability
   - Built FacultyAvailabilityGrid component
   
✅ Documentation
   - Updated timeline.md with October 28 entry
   
All work is tracked in timeline.md.
```

---

## Examples of INCORRECT Behavior

### ❌ INCORRECT Example 1: Creating Summary File
```
AI: I've completed the work. Let me create a summary...

[Creates IMPLEMENTATION_COMPLETE.md]  ← WRONG!

Correct action:
[Updates timeline.md]
[Provides summary in conversation]
```

### ❌ INCORRECT Example 2: Creating Report File
```
AI: Let me audit the documentation...

[Creates DOCUMENTATION_AUDIT_REPORT.md]  ← WRONG!

Correct action:
[Identifies issues]
[Updates timeline.md if fixes were made]
[Lists findings in conversation]
```

### ❌ INCORRECT Example 3: Creating Analysis File
```
AI: I've analyzed the auth flow...

[Creates FACULTY_AUTH_FLOW_ANALYSIS.md]  ← WRONG!

Correct action:
[If needed, ask: "Should I create src/docs/AUTH_FLOW_SUMMARY.md?"]
[Or just provide analysis in conversation]
```

---

## Enforcement Rules

### For AI Assistants
1. **Before creating ANY .md file**: Check if it matches prohibited patterns
2. **If it matches**: Use timeline.md or src/docs/ instead
3. **If unsure**: Ask user: "Should I update timeline.md or create a doc in src/docs/?"
4. **After completing work**: ALWAYS update timeline.md
5. **Never** create summary files in project root

### For Code Reviews
Check for:
- New .md files in project root (except approved ones)
- Files matching prohibited patterns
- Summary content that should be in timeline.md

---

## Migration: Cleaning Up Existing Summary Files

Files to delete from project root:
- `IMPLEMENTATION_COMPLETE.md`
- `SESSION_SUMMARY.md`
- `DOCUMENTATION_AUDIT_REPORT.md`
- `FACULTY_DASHBOARD_IMPROVEMENTS.md`
- `FACULTY_SELF_SERVICE_IMPLEMENTATION.md`
- `FACULTY_AUTH_FLOW_ANALYSIS.md`
- `FACULTY_AUTH_TEST_GUIDE.md`
- `FACULTY_FEATURES_IMPLEMENTATION.md`
- `FACULTY_FEATURES_SETUP.md`

**Action**: Delete these files. Their content is either:
- Already in `timeline.md`
- Already in `src/docs/FACULTY_FEATURES_SUMMARY.md`
- Duplicated in code comments
- No longer relevant

---

## Updated DON'T List

### ❌ DON'T:
1. **Create new .md files without explicit approval**
2. **Create summary files in project root** ← NEW, EMPHASIZED
3. **Create files matching prohibited patterns** ← NEW
4. **Create IMPLEMENTATION_*, SESSION_*, *_SUMMARY files** ← NEW
5. **Duplicate information across files**
6. **Include outdated information**
7. **Use vague or ambiguous language**
8. **Skip updating timeline.md**
9. **Write implementation details in PRD.md**
10. **Put product requirements in technical docs**

---

## Summary of Changes

### Added Sections
1. **"STRICTLY PROHIBITED: Summary and Report Files"** - Explicit list of banned patterns
2. **"REQUIRED: Where to Document Work Instead"** - Clear alternatives
3. **"Decision Tree"** - Visual guide for where to put documentation
4. **"Examples of Correct/Incorrect Behavior"** - Clear dos and don'ts
5. **"Enforcement Rules"** - How to follow the rule

### Key Improvements
- ✅ Explicit prohibition list with patterns
- ✅ Clear alternatives (timeline.md, src/docs/, conversation)
- ✅ Decision tree for quick reference
- ✅ Before/after examples
- ✅ Enforcement guidelines

### Impact
- Prevents AI from creating summary files
- Directs all work documentation to timeline.md
- Reduces project root clutter
- Maintains single source of truth (timeline.md)

---

## Implementation Checklist

To implement this updated rule:

1. ✅ Add new sections to documentation rule
2. ✅ Delete existing summary files (9 files)
3. ✅ Verify timeline.md has all important information
4. ✅ Update CHANGE_REQUESTS.md if needed
5. ✅ Test with AI assistant to verify compliance

---

**Proposal Status**: Ready for review
**Impact**: High - Prevents future violations
**Effort**: Low - Just update the rule
**Recommendation**: Approve and implement immediately

