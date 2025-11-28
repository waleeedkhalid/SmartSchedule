# SmartSchedule: Simplified MVP - Product Requirements
**Version:** 3.0 (Simplified)  
**Date:** October 27, 2025  
**Type:** Minimum Viable Product  
**Timeline:** 3 weeks

---

## 🎯 The One-Sentence Product

**SmartSchedule helps scheduling committees generate conflict-free schedules in 2 hours instead of 20 by semi-automating student-to-section assignments based on preferences and capacity.**

---

## 📋 Problem Statement

### Current Pain
University scheduling committees spend 20+ hours per semester:
- Manually assigning 200 students to course sections
- Trying to satisfy elective preferences (via Excel/paper)
- Detecting and fixing time conflicts
- Balancing section enrollments
- Handling irregular students (failed courses)

### Result
- Exhausted committee members
- Students get random electives (not preferences)
- 15-20% of students report conflicts
- Last-minute schedule changes

---

## 💡 Solution (Simplified)

### What We're Building
A web-based tool that:
1. **Collects** student elective preferences (ranked 1-10)
2. **Generates** draft schedules using simple best-effort matching
3. **Detects** time conflicts and capacity issues
4. **Allows** committee to review and manually adjust
5. **Publishes** final schedules to students

### What We're NOT Building (v1.0)
- ❌ AI-powered optimization (no OR-Tools, no Python backend)
- ❌ Real-time collaboration (committee works in turns)
- ❌ Advanced analytics dashboards
- ❌ Automatic email notifications (manual for now)
- ❌ Version control UI (database tracks changes only)
- ❌ Mobile app

---

## 🎯 Target Users

### Primary User: Scheduling Committee Member (Sarah)
- **Role:** Associate Professor, Committee Chair
- **Goal:** Complete scheduling in <5 hours
- **Tech Level:** Medium (comfortable with web apps)

### Secondary Users
- **Students:** View schedules, submit preferences
- **Faculty:** View teaching assignments
- **Registrar:** Manage terms, enter special cases

---

## ✅ MVP Features (Must Have)

### Feature 1: Student Preference Collection ✅ DONE
**Already Implemented**
- Students can rank elective choices (1-10)
- Drag-and-drop interface
- Preferences saved to database
- Can edit until deadline

**No Changes Needed**

---

### Feature 2: Simple Schedule Generator ⚠️ NEEDS REBUILD
**Current State:** Placeholder that ignores preferences

**New Implementation:**
```typescript
Algorithm: Best-Effort Preference Matching
1. For each student (sorted by level, irregular first):
   a. Assign required courses (by level)
   b. For each elective preference (order 1 → 10):
      - Find sections with capacity
      - Check for time conflicts
      - If valid, assign and move to next student
   c. If can't satisfy any preference → flag for manual review
   
2. Balance sections (move students between sections if uneven)
3. Generate conflict report
4. Save to database

Performance Target: <30 seconds for 200 students
Success Rate: 70%+ get top-3 choice
```

**Acceptance Criteria:**
- [x] Assigns required courses correctly (by level)
- [x] Attempts to match student preferences
- [x] Checks time conflicts before assignment
- [x] Respects section capacity limits
- [x] Handles irregular students (custom course lists)
- [x] Generates readable conflict report
- [x] Saves schedules to database (JSONB format)

**API Endpoint:**
```typescript
POST /api/committee/generate-schedule
Body: { term_code: string }
Response: {
  success: boolean;
  stats: {
    students_processed: number;
    preferences_satisfied: number; // top-3 rate
    conflicts_detected: number;
    elapsed_time: number; // milliseconds
  };
  conflicts: Array<{
    student_id: string;
    issue: string; // "no_capacity" | "time_conflict" | "no_preferences_met"
    suggestions: string[];
  }>;
}
```

---

### Feature 3: Committee Review Dashboard ⚠️ NEEDS ENHANCEMENT
**Current State:** Can view data but not adjust schedules

**New Capabilities:**
1. **Generation Status**
   - "Ready to Generate" / "Generating..." / "Review Required"
   - Stats: X students processed, Y conflicts
   - Button: "Generate Draft Schedule"

2. **Schedule Review Table**
   - Columns: Student, Level, Courses (5-7), Conflicts, Preference Score
   - Filters: By level, by conflict status
   - Actions: View details, Manual adjust

3. **Conflict Resolution**
   - List all conflicts with severity (High/Medium/Low)
   - For each conflict: Show student, issue, suggested fixes
   - Action: "Move student to Section B" (manual)

4. **Manual Adjustments**
   - Search student by ID/name
   - View current schedule
   - Dropdown to change section assignment
   - Real-time conflict checking
   - Save changes

**Acceptance Criteria:**
- [x] Committee can trigger generation with one click
- [x] See generation progress (spinner + status)
- [x] View all student schedules in table format
- [x] Filter by conflicts only
- [x] Manually move students between sections
- [x] See updated conflict status immediately
- [x] Export schedule to CSV

---

### Feature 4: Publication Workflow ⚠️ NEEDS IMPLEMENTATION
**Current State:** No publish functionality

**New Implementation:**
1. **States:** `draft` → `published` → `archived`
2. **Publish Action:**
   - Validation: Zero high-priority conflicts
   - Confirmation: "This will notify 200 students. Confirm?"
   - Database update: Set `is_published = true`
   - Status change: `draft` → `published`
3. **Unpublish:** Allow reverting if needed
4. **Archive:** Mark old terms as archived

**Acceptance Criteria:**
- [x] Committee can publish draft (after fixing conflicts)
- [x] Validation prevents publishing with critical errors
- [x] Published schedules become visible to students
- [x] Can unpublish if corrections needed
- [x] Cannot edit published schedules (must unpublish first)

---

### Feature 5: Student Schedule Viewer ✅ MOSTLY DONE
**Current State:** UI exists but shows mock data

**Enhancement Needed:**
- Connect to real `schedules` table
- Show only published schedules
- Display message if schedule not ready
- Indicate which preferences were met (green checkmarks)

**Acceptance Criteria:**
- [x] Students see schedules only after publication
- [x] Schedules show all courses (required + electives)
- [x] Visual indicator for preference matches
- [x] Message: "Schedule not yet published" if draft
- [x] Can export to PDF or iCal

---

## 🚫 Non-Functional Requirements (Simplified)

### Performance
- **Schedule Generation:** <1 minute for 200 students
- **Page Load:** <3 seconds on 4G
- **Concurrent Users:** Support 50 simultaneous users

### Usability
- **Mobile Responsive:** Works on tablets and phones
- **Accessibility:** Keyboard navigation, screen reader support
- **Error Messages:** Clear, actionable

### Reliability
- **Uptime:** 99% (short downtimes acceptable)
- **Data Backup:** Daily automatic backups (Supabase)
- **Error Handling:** Graceful degradation, no data loss

### Security
- **Authentication:** Supabase Auth (already implemented)
- **Authorization:** RLS policies (already implemented)
- **Input Validation:** Server-side validation on all inputs

---

## 📈 Success Metrics

### Primary Metrics
1. **Committee Time Savings**
   - Baseline: 20 hours per semester
   - Target: <5 hours per semester
   - Measurement: Survey after first use

2. **Student Satisfaction**
   - Metric: % of students who got top-3 elective choice
   - Target: 70%+
   - Measurement: Preference match stats

3. **Conflict Rate**
   - Metric: % of students with time conflicts in published schedule
   - Target: <2%
   - Measurement: Automatic conflict detection

### Secondary Metrics
- System adoption: 90%+ students submit preferences
- Faculty satisfaction: 80%+ happy with assignments
- Schedule publication: On-time (before semester starts)

---

## 🛤️ Implementation Roadmap

### Week 1: Core Generator
**Goal:** Working schedule generator that uses preferences

**Tasks:**
1. **Day 1-2:** Rewrite `schedule-generator.ts`
   - Implement preference matching logic
   - Add conflict detection
   - Add capacity checking
   - Unit tests

2. **Day 3:** Create API endpoint
   - `POST /api/committee/generate-schedule`
   - Connect to database
   - Return stats and conflicts

3. **Day 4:** Test with real data
   - Load test fixtures (200 students)
   - Verify preference matching works
   - Measure performance

4. **Day 5:** Bug fixes and optimization

**Deliverable:** Working generator that creates complete schedules

---

### Week 2: Committee Tools
**Goal:** Committee can review and publish schedules

**Tasks:**
1. **Day 1-2:** Review Dashboard
   - Schedule table with all students
   - Conflict highlighting
   - Filter controls

2. **Day 3:** Manual Adjustment UI
   - Student search
   - Section reassignment dropdown
   - Conflict validation

3. **Day 4:** Publication Workflow
   - Publish/unpublish buttons
   - State management
   - Validation logic

4. **Day 5:** Testing and polish

**Deliverable:** Committee can generate, review, adjust, and publish

---

### Week 3: Polish & Deploy
**Goal:** Production-ready system

**Tasks:**
1. **Day 1:** Student schedule viewer enhancement
   - Connect to real data
   - Preference match indicators
   - Export functionality

2. **Day 2:** Faculty schedule viewer
   - Show teaching assignments
   - Export to calendar

3. **Day 3:** End-to-end testing
   - Complete workflows
   - Edge cases
   - Performance testing

4. **Day 4:** Documentation
   - User guide for committee
   - Deployment checklist
   - Troubleshooting guide

5. **Day 5:** Deploy to production

**Deliverable:** Live system ready for use

---

## 🧪 Testing Strategy

### Unit Tests
- Preference matching logic
- Conflict detection
- Capacity validation
- Edge cases (irregular students)

### Integration Tests
- API endpoints
- Database operations
- Complete workflows

### User Acceptance Testing
- Committee walkthrough
- Student walkthrough
- Faculty walkthrough
- Fix issues found

---

## 🚀 Deployment Plan

### Pre-Deployment
1. ✅ Database migration (tables already exist)
2. ✅ Environment variables configured
3. ✅ Run all tests
4. ✅ Performance benchmarks

### Deployment
1. Deploy to staging
2. UAT with committee
3. Fix critical bugs
4. Deploy to production
5. Monitor for issues

### Post-Deployment
1. Committee training session
2. Student communication (how to use)
3. Monitor first generation
4. Gather feedback
5. Plan iteration

---

## 📚 Out of Scope (Future Versions)

### Version 2.0 (Future)
- Advanced preference optimization (AI/ML)
- Real-time collaboration
- Automated email notifications
- Analytics dashboards
- Version comparison UI

### Version 3.0 (Future)
- Mobile app (PWA)
- Multi-language support
- External system integrations
- Advanced reporting

---

## ✅ Definition of Done

**This MVP is complete when:**
1. Committee can generate schedules in one click
2. 70%+ of students get a top-3 elective choice
3. Zero time conflicts in published schedules
4. Committee spends <5 hours instead of 20 hours
5. All 5 core features working
6. Deployed to production
7. Committee successfully uses it for one semester

---

## 🎯 Key Differences from Original PRD

| Original PRD | Simplified MVP |
|-------------|---------------|
| AI-powered optimization (OR-Tools) | Simple best-effort matching |
| Python backend service | JavaScript in Next.js |
| <5 min for 500 students | <1 min for 200 students |
| Real-time collaboration (Yjs) | Sequential editing |
| Advanced analytics | Basic stats only |
| Email notifications | Manual for v1 |
| 10-week timeline | 3-week timeline |

---

## 💬 FAQs

**Q: Why no AI/OR-Tools?**  
A: Adds 4-6 weeks to timeline. Simple matching achieves 70%+ satisfaction, which is acceptable for v1.

**Q: What about version control?**  
A: Database tracks all changes automatically. UI for version comparison can come later.

**Q: How do we handle conflicts?**  
A: Generator detects them, committee manually resolves. Future version can auto-suggest solutions.

**Q: Can committee override the generator?**  
A: Yes, full manual adjustment capability. Generator is a starting point, not final word.

**Q: What if preferences can't be satisfied?**  
A: Student is flagged for manual review. Committee assigns based on availability.

---

**Owner:** Product Team  
**Approvers:** Scheduling Committee  
**Status:** Ready for Implementation  
**Timeline:** 3 weeks from approval


