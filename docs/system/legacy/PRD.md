# 🧩 **SmartSchedule — Product Requirements Document (PRD)**

_Departmental Academic Timetabling and Load Assignment System_
**Course:** SWE481 – Advanced Web Applications Engineering
**Institution:** King Saud University — Software Engineering Department

---

## **1. Product Overview**

**SmartSchedule** aims to streamline course scheduling, faculty load assignments, and student elective preferences exclusively for the **Software Engineering Department (SWE)** by providing a **role-based web platform** that automates conflict resolution and enhances academic planning efficiency.

It focuses on SWE-specific courses while treating **non-SWE courses as external dependencies**, ensuring no time or exam conflicts across departments.

The platform leverages **Next.js, TypeScript, Supabase, TailwindCSS, and Yjs** to offer a responsive and collaborative experience.

### **Scheduling Lifecycle**

1. **Scheduling Committee** imports external courses (non-SWE), generates the initial SWE schedule, and launches elective surveys.
2. **Teaching Load Committee** reviews and adjusts faculty assignments without harming irregular students’ course paths.
3. **Registrar** manages irregular students and registration overrides.
4. **Faculty** review schedules and provide feedback.
5. **Students** view schedules, choose electives, and self-register when capacity allows and no time conflict exists.
6. **System** regenerates and finalizes schedules based on feedback.

---

## **2. Goals and Non-Goals**

### **Goals**

- Automate **schedule and exam generation** for the SWE Department.
- Enable **conflict detection and resolution** (lectures, labs, exams, and faculty loads).
- Allow **real-time collaboration** and **version control** between committees.
- Conduct **student elective surveys** and integrate the results into scheduling decisions.
- Support **feedback workflows** for students, faculty, and committees.
- Provide **dashboards** summarizing schedules, course sections, and load statistics.
- Implement **role-based authentication** for secure, user-specific access.
- Deliver a **responsive, accessible prototype** hosted on the cloud.

### **Non-Goals**

- University-wide or multi-department scheduling.
- Handling actual student data (synthetic data only).
- Integration with Edugate or production-grade SIS systems.
- Full mobile app (only PWA or responsive web).
- Automated grading or attendance modules.

---

## **3. Personas and User Stories**

### **1. Scheduling Committee**

**Goals:** Build and manage department schedules and exam timetables.
**User Stories:**

- As a scheduler, I want to import external course slots to avoid cross-department conflicts.
- As a scheduler, I want to manage scheduling rules (breaks, labs, prerequisites).
- As a scheduler, I want to generate the initial schedule for SWE courses automatically.
- As a scheduler, I want to share the preliminary version with the load committee and faculty.

---

### **2. Teaching Load Committee**

**Goals:** Ensure fair faculty load and no conflicts.
**User Stories:**

- As a load committee member, I want to view and adjust instructor loads.
- As a load committee member, I want to provide feedback on schedule conflicts or overloads.
- As a load committee member, I want to lock schedules once approved.

---

### **3. Registrar**

**Goals:** Maintain irregular student data and handle special registrations.
**User Stories:**

- As a registrar, I want to record irregular students’ remaining courses.
- As a registrar, I want to override section capacity up to a 25% threshold.
- As a registrar, I want to get notified when the scheduler requests irregular student data updates.

---

### **4. Faculty Member**

**Goals:** View and validate assigned courses and times.
**User Stories:**

- As a faculty member, I want to view my assigned courses and timings.
- As a faculty member, I want to provide feedback on schedule feasibility.
- As a faculty member, I want to be notified when my schedule changes.

---

### **5. Student**

**Goals:** Choose electives, view schedules, and self-register.
**User Stories:**

- As a student, I want to fill out elective preference surveys.
- As a student, I want to view my class and exam schedules.
- As a student, I want to self-register for open sections if no time conflicts exist.
- As a student, I want to receive updates when new versions of the schedule are published.

---

## **4. Core Features**

| #   | Feature                       | Description                                                            |
| --- | ----------------------------- | ---------------------------------------------------------------------- |
| 1   | **Role-Based Authentication** | Users log in via Supabase Auth.                                        |
| 2   | **Course & Exam Scheduler**   | Generate course and exam timetables based on constraints and rules.    |
| 3   | **Rule Management Engine**    | Define, edit, and enforce rules (break times, lab durations, etc.).    |
| 4   | **Teaching Load Management**  | Balance faculty assignments and validate conflicts.                    |
| 5   | **Student Elective Survey**   | Collect and aggregate student preferences to decide offered electives. |
| 6   | **Feedback & Collaboration**  | Real-time feedback and live editing (via Yjs).                         |
| 7   | **Version Control**           | Maintain schedule history using jsondiffpatch.                         |
| 8   | **Dashboard & Visualization** | Charts for student counts, section distribution, and faculty load.     |
| 9   | **Notification System**       | Trigger updates for schedule changes or required data inputs.          |
| 10  | **Self-Registration System**  | Allow students to enroll if capacity and timing conditions are met.    |

---

## **5. System Architecture**

### **Overview**

SmartSchedule follows a **three-tier architecture**:

1. **Presentation Layer:**

   - Next.js 15 + shadcn/ui for responsive, component-based UIs.
   - Zustand for lightweight global state management.

2. **Application Layer:**

   - API routes for schedule, feedback, and rule management.
   - Logic for conflict resolution, load balancing, and data validation.

3. **Data Layer:**

   - Supabase (PostgreSQL) with tables for Users, Courses, Sections, Rules, Feedback, and Schedules.
   - In-memory JSON during prototype testing phase.

### **Real-Time & Versioning**

- **Yjs** enables live collaborative edits.
- **jsondiffpatch** maintains full history and supports rollback.

### **AI Component (Phase 3+)**

- Optional integration with **Google AI API** for generating recommended timetables based on constraints and feedback history.

---

## **6. Data Model (Simplified)**

| Entity             | Key Fields                                           | Description                                          |
| ------------------ | ---------------------------------------------------- | ---------------------------------------------------- |
| **User**           | id, name, role, email                                | Represents students, faculty, committees, registrar. |
| **Course**         | code, name, credits, type (required/elective), level | SWE or external courses.                             |
| **Section**        | id, courseCode, instructorId, capacity, scheduleTime | Represents course offering per semester.             |
| **Schedule**       | id, semester, version, createdBy, status             | Main timetable object.                               |
| **Rule**           | id, ruleType, description, active                    | Defines scheduling rules and constraints.            |
| **Feedback**       | id, userId, scheduleId, comment, rating              | Stores schedule reviews.                             |
| **SurveyResponse** | id, studentId, electiveChoices                       | Used for elective decision-making.                   |
| **Registration**   | studentId, sectionId, status                         | Records student enrollment.                          |

---

## **7. Scheduling Rules**

1. **Break Periods:** Reserve 12:00–1:00 PM daily.
2. **Midterm Blocks:** Reserve Monday/Wednesday 12:00–2:00 PM.
3. **Electives:** Must accommodate multiple levels.
4. **Prerequisite Alignment:** Related courses can share slots if beneficial.
5. **Lab Continuity:** Two-hour labs must be continuous sessions.
6. **Balanced Days:** Students should have even distribution and one day off where possible.
7. **External Dependencies:** SWE courses must not conflict with external required courses (e.g., CS111, CS113).

---

## **8. AI and Automation Logic**

| Type                             | Functionality                                                       | Example                                                            |
| -------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Conflict Detection**           | Validates overlaps for courses, labs, exams, and instructors.       | Detects when two SWE courses share a student cohort and time slot. |
| **Schedule Recommendation (AI)** | Suggests optimal time slots based on constraints.                   | Recommends alternative lab time when conflicts found.              |
| **Feedback Loop**                | Uses student/faculty feedback to adjust next version automatically. | Regenerates schedule version 2 with preferred electives.           |

---

## **9. Milestones and Deliverables**

| Phase                             | %   | Deliverable Summary                                   |
| --------------------------------- | --- | ----------------------------------------------------- |
| **1. Initiation**                 | 5%  | Team setup, GitHub repo, requirements extraction.     |
| **2. Infrastructure Setup**       | 13% | Database schema, ERD, and synthetic dataset.          |
| **3. Feature Implementation**     | 20% | Core features (authentication, scheduling, feedback). |
| **4. Security Enhancement**       | 20% | Role-based access control and deployment.             |
| **5. Optimization & Integration** | 20% | Dashboards, real-time collaboration, version control. |
| **6. Extendability Showcase**     | 15% | Android or PWA frontend linked via APIs.              |
| **7. Final Demo**                 | 7%  | Full working prototype presentation.                  |

---

## **10. Success Metrics**

- 100% reduction in manual scheduling spreadsheets.
- Conflict-free timetable for all SWE courses.
- Positive feedback from faculty and students during pilot.
- Schedule versioning and rollback functioning correctly.
- Successful demonstration of AI recommendation or rules validation.

---

✅ **End of PRD Document**
