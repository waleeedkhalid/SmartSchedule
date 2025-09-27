# Product Requirements Document (PRD)

**Project:** SmartSchedule Prototype

---

## 1. Overview

SmartSchedule is a prototype web platform to automate and streamline the academic scheduling process for a university department. It supports data entry, schedule generation, optimization, review cycles, and feedback collection. The system is deployed but strictly uses **synthetic datasets**.

---

## 2. Objectives

1. Automate schedule generation with rules and optimization algorithms.
2. Collect and incorporate feedback from students, faculty, and committees.
3. Provide clear workflows for schedule drafts, reviews, and approvals.
4. Deliver dashboards and visualization for decision-making.
5. Enable collaborative editing and version control.

---

## 3. Assumptions

- Only listed roles are supported: Students, Scheduling Committee, Teaching Load Committee, Faculty, Registrar, External Departments, Deanship.
- Prototype scope excludes AI or predictive features.
- Manual entry and CSV upload are the only data input modes.
- Authentication uses email/username and password (no SSO).
- Notifications limited to in-app.

---

## 4. User Roles

1. **Scheduling Committee** – primary owner of scheduling process.
2. **Teaching Load Committee** – reviews instructor assignments and workload.
3. **Faculty** – provides availability, preferences, and assignment feedback.
4. **Students** – submit elective preferences, review draft schedules, provide feedback.
5. **Registrar** – enters irregular student data and responds to requests.
6. **External Departments** – supply fixed slots and elective section counts.
7. **Deanship** – receives finalized schedules.

---

## 5. Functional Requirements

### Scheduling Committee

1. Enter course student counts.
2. Adjust default section size (default = 25).
3. Record scheduling rules and constraints.
4. Import external course slots and electives (manual/CSV).
5. Generate initial draft schedule using solver and rules.
6. Share draft with Teaching Load Committee.
7. Revise draft based on load committee feedback.
8. Share revised version with students for feedback.
9. Review student feedback (structured + free text).
10. Apply edits and resolve conflicts.
11. Approve or further revise before finalizing.
12. Submit finalized schedule to Deanship.
13. Manage exam scheduling and rules.
14. Use real-time collaborative editing with load committee.
15. View dashboards (level and course overview).
16. Maintain version history of schedules.
17. Trigger in-app notifications on updates.
18. Auto-save schedule changes.

### Teaching Load Committee

19. Review draft schedules.
20. Submit structured + free-text feedback on instructor load.
21. Collaborate in real-time with scheduling committee.

### Faculty

22. Record availability and preferences.
23. Review preliminary schedules.
24. Submit structured (conflicts) + free-text feedback.

### Students

25. Submit elective preferences survey.
26. Review draft schedules and exam timetables.
27. Submit structured + free-text feedback.

### Registrar

28. Enter irregular student data (linked to courses).
29. Receive in-app notifications to provide missing data.

### External Departments

30. Provide elective offerings and section counts (manual/CSV).
31. Provide fixed course slots (manual/CSV).

### Deanship

32. Receive finalized schedule for approval.

---

## 6. Non-Functional Requirements

1. Prototype only with synthetic datasets.
2. Role-based authentication via email/username and password.
3. Sensitive data (irregular student info) encrypted at rest.
4. Responsive UI with Tailwind.
5. Cloud deployment (Heroku/GoDaddy/etc).
6. Dashboards use Chart.js.
7. Real-time editing via Yjs.
8. Version history via jsondiffpatch.
9. Backend APIs exposed for potential external clients (e.g., Android).
10. Architecture designed for scalability.

---

## 7. Dependencies

- **Frontend:** Next.js + Tailwind.
- **Backend:** Node.js/Next.js API routes.
- **Database:** PostgreSQL (via Supabase).
- **Collaboration:** Yjs.
- **Versioning:** jsondiffpatch.
- **Visualization:** Chart.js.
- **Hosting:** Heroku, GoDaddy, or equivalent.

---

## 8. Workflow Summary

- **Step 1:** Scheduling Committee enters course counts, rules, and external data.
- **Step 2:** Draft schedule generated (solver).
- **Step 3:** Teaching Load Committee reviews and submits feedback.
- **Step 4:** Committee revises, applies edits.
- **Step 5:** Students review draft, submit feedback.
- **Step 6:** Committee applies edits, resolves conflicts.
- **Step 7:** Committee approves → Final schedule submitted to Deanship.

---

## 9. Acceptance Criteria

1. Users can log in with role-based access.
2. Scheduling committee can create, edit, and save schedules with rules.
3. Solver produces valid draft schedule with no overlapping assignments.
4. Teaching Load Committee can review and annotate schedules.
5. Students can submit elective preferences and feedback.
6. Faculty can record availability and provide feedback.
7. Registrar can add irregular student data.
8. Dashboards show correct course, section, and load data.
9. System maintains at least 3 schedule versions with visible changes.
10. In-app notifications fire on updates and deadlines.
11. All sensitive data is encrypted at rest.
12. Deployment is accessible via a live URL.
