# Changelog Documentation

**Last Updated:** 2025-10-02  
**Maintainer:** [Name/Role]

---

## Overview

Tracks versioned releases, major features, and removals.

---

## Contents

- v1.0.0 Initial Release
- v1.1.0 Enrollment System Added
- v2.0.0 KSU Royal Theme & Data Refactor
- v2.1.0 Type Alignment & Helper Consolidation
- ...

---

## v2.0.0 - KSU Royal Theme & Data Refactor

- Added KSU Royal theme and balanced contrast update
- Refactored backend to use flat types and centralized mock data
- Removed legacy entities (Meeting, ExternalSlot)
- Major documentation consolidation

---

## v2.1.0 - Type Alignment & Helper Consolidation

Refactor focused on unifying domain model and removing drift between helper and central type definitions.

### Highlights

- Removed duplicate `CourseOffering` definition (single canonical source in `types.ts`).
- Harmonized schedule generator types (`CandidateSchedule`, `GeneratedScheduleResult`).
- Resolved naming collision for `Notification` (UI-only renamed to `UINotificationItem`).
- Consolidated internal schedule time representations into `_ScheduledTimeSlot`.
- Moved `ExamUpdate` to central types; standardized exam update semantics.
- Renamed `SectionConflict` → `SectionConflictDetail` for clarity versus global `Conflict`.
- Renamed `ExamRecord` → `FlattenedExamRecord` (explicit derived structure).
- Replaced `IrregularStudentRecord` with canonical `IrregularStudent`.
- Added explicit UI-only annotations to presentation layer interfaces.

### Outcomes

- Eliminated duplicate / shadowed interfaces.
- Clear separation of domain vs UI-only types.
- Easier future Supabase schema alignment.

### Follow-Up (Deferred)

- Evaluate consolidation of `CourseStructure` vs generation shapes in future optimization pass.

---

## Revision History

| Date       | Author    | Change Summary                  |
| ---------- | --------- | ------------------------------- |
| 2025-10-02 | Architect | v2.0.0 release                  |
| 2025-10-06 | Architect | v2.1.0 release (Type Alignment) |
