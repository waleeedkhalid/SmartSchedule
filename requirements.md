# Requirements

# Functional Requirements

1. The system shall enter courses student counts.
2. The system shall use a default section size of 25 students and allow schedulers to change this default.
3. The system shall allow the department registrar to enter irregular student data.
4. The system shall allow schedulers to notify the registrar to provide irregular student data.
5. The system shall let schedulers record courses sections received from other departments before schedule generation.
6. The system shall provide a student survey to collect elective preferences, using elective offerings and section counts supplied by other departments.
7. The system shall generate an initial schedule and share it with the teaching load committee for review.
8. The system shall enable the teaching load committee to submit feedback on the initial schedule.
9. The system shall generate a second schedule version and share it with students for feedback.
10. The system shall collect comments and feedback on preliminary schedules and exam timetables.
11. The system shall support modifying schedules and exam assignments based on feedback and enable finalization of the schedule for submission.
12. The system shall provide a scheduling committee interface to manage exams, manage schedules, and enter scheduling rules.
13. The system shall provide a student interface to submit elective preferences, view exams and schedules, and submit comments or reviews.
14. The system shall provide a teaching load committee interface to give feedback to the scheduling committee about schedule changes.
15. The system shall provide a faculty interface to give feedback on preliminary schedules and assignments, and record availability and preferences.
16. The system shall automatically recommend schedules based on predefined rules and captured preferences.
17. The system shall provide dashboards including a level overview showing section counts, assigned instructors, and students per section.
18. The system shall provide dashboards including a course overview showing classroom assignments, students per section, and instructor assignments.
19. The system shall enable real-time collaborative editing and commenting for scheduling and teaching load committee members.
20. The system shall maintain a history of schedule versions to track and review changes over time.
21. The system shall send notifications to relevant members when updates or comments occur.
22. The system shall send timeline-driven notifications to stakeholders to meet university scheduling deadlines.
23. The system shall allow authorized committee members to add, modify, or delete scheduling and assignment rules.
24. The system shall enforce a daily break from 12:00–1:00 PM and reserve midterm slots on Monday and Wednesday from 12:00–2:00 PM.
25. The system shall support scheduling electives across multiple student levels.
26. The system shall support an optional rule to co-schedule prerequisite-linked courses in the same slot when beneficial.
27. The system shall check that elective offerings and day-off distribution are balanced across student groups.
28. The system shall support a rule to prefer scheduling electives early morning or late afternoon.
29. The system shall enforce contiguous blocks for sessions that require them, including 2-hour labs.
30. The system shall auto-save schedule updates in real time.

## By Persona

### Student

The system shall provide a student survey to collect elective preferences, using elective offerings and section counts supplied by other departments.

The system shall generate a second schedule version and share it with students for feedback.

The system shall collect comments and feedback on preliminary schedules and exam timetables.

The system shall provide a student interface to submit elective preferences, view exams and schedules, and submit comments or reviews.

The system shall provide dashboards including a level overview showing groups, section counts, assigned instructors, and students per section.

The system shall provide dashboards including a course overview showing classroom assignments, students per section, and instructor assignments.

Faculty

The system shall provide a faculty interface to give feedback on preliminary schedules and assignments, and record availability and preferences.

Registrar

The system shall allow the department registrar to enter irregular student data.

The system shall allow schedulers to notify the registrar to provide missing irregular student data.

### Scheduling Committee

The system shall enter courses student counts.

The system shall use a default section size of 25 students and allow schedulers to change this default.

The system shall let schedulers record fixed course slots received from other departments before schedule generation.

The system shall generate an initial schedule and share it with the teaching load committee for review.

The system shall support modifying schedules and exam assignments based on feedback and enable finalization of the schedule for submission.

The system shall provide a scheduling committee interface to manage exams, manage schedules, and enter scheduling rules.

The system shall automatically recommend schedules based on predefined rules and captured preferences.

The system shall enable real-time collaborative editing and commenting for scheduling and teaching load committee members.

The system shall maintain a history of schedule versions to track and review changes over time.

The system shall send notifications to relevant members when updates or comments occur.

The system shall send timeline-driven notifications to stakeholders to meet university scheduling deadlines.

The system shall allow authorized committee members to add, modify, or delete scheduling and assignment rules.

The system shall enforce a daily break from 12:00–1:00 PM and reserve midterm slots on Monday and Wednesday from 12:00–2:00 PM.

The system shall support scheduling electives across multiple student levels.

The system shall support an optional rule to co-schedule prerequisite-linked courses in the same slot when beneficial.

The system shall check that elective offerings and day-off distribution are balanced across student groups.

The system shall support a rule to prefer scheduling electives early morning or late afternoon.

The system shall enforce contiguous blocks for sessions that require them, including 2-hour labs.

The system shall auto-save schedule updates in real time.

### Teaching Load Committee

The system shall enable the teaching load committee to submit feedback on the initial schedule.

The system shall provide a teaching load committee interface to give feedback to the scheduling committee about schedule changes.

The system shall enable real-time collaborative editing and commenting for scheduling and teaching load committee members.

# Non-Functional Requirements

1. The system must be delivered as a prototype and use only synthetic datasets.
2. The system must not store or process any real student or faculty data.
3. The system must implement role-based authentication.
4. The system must implement data validation and privacy safeguards for all data.
5. The system must protect the confidentiality of irregular-student information.
6. The system must provide a responsive and accessible user interface using Bootstrap or Tailwind.
7. The system must be deployed on a cloud hosting provider such as GoDaddy, Heroku, or similar.
8. The system must use Charts.js for data visualization in dashboards.
9. The system must use Yjs for real-time editing and synchronization.
10. The system must use jsondiffpatch for version history and change tracking.
11. The system must expose backend APIs to support external clients such as an Android frontend.
12. The system must employ a scalable architecture to support growing institutional needs.

# Users/Actors

- Scheduling Committee
- Students
- Teaching Load Committee
- Faculty
- Department Registrar
- External Departments (course providers)
- Deanship (final recipient of schedule)

# Use Cases

## Scheduling Committee

- add expected courses student counts.
- Adjust default section size.
- Record scheduling rules and constraints.
- Generate draft schedules.
- Share schedule versions with committees and students.
- Revise schedules based on feedback.
- Finalize schedule for submission.
- Manage notifications to stakeholders.
- View dashboards of schedules and assignments.

## Students

- Submit elective preferences via survey.
- View draft schedules and exam timetables.
- Provide feedback or comments on schedules.

## Teaching Load Committee

- Review draft schedules.
- Submit feedback on schedules.
- Collaborate with scheduling committee in real time.

## Faculty

- Submit availability and preferences.
- Review preliminary schedules.
- Provide feedback on teaching assignments.

## Department Registrar

- Enter irregular-student data.
- Receive notifications to provide missing irregular-student data.

## External Departments

- Provide fixed course slots to scheduling committee.
- Provide elective course offerings and section counts.

## Deanship

- Receive finalized schedules for approval.

# User Stories

## Scheduling Committee

1. As a scheduling committee member, I want to enter courses student counts so that section sizes are pre-filled.
2. As a scheduling committee member, I want to adjust default section sizes so that actual capacity is reflected.
3. As a scheduling committee member, I want to enter rules and constraints so that schedules respect institutional policies.
4. As a scheduling committee member, I want to generate draft schedules so that committees and students can review them.
5. As a scheduling committee member, I want to share schedule versions so that stakeholders can provide feedback.
6. As a scheduling committee member, I want to revise schedules based on comments so that conflicts are resolved.
7. As a scheduling committee member, I want to finalize schedules so that they can be submitted to the deanship.
8. As a scheduling committee member, I want to notify stakeholders of updates so that they meet deadlines.
9. As a scheduling committee member, I want to view dashboards so that I can see section counts and assignments at a glance.

## Students

10. As a student, I want to submit elective preferences so that my choices are considered in scheduling.
11. As a student, I want to view draft schedules and exam timetables so that I know my planned timetable.
12. As a student, I want to provide feedback on schedules so that conflicts or issues can be addressed.

## Teaching Load Committee

13. As a teaching load committee member, I want to review draft schedules so that I can assess instructor workload.
14. As a teaching load committee member, I want to provide feedback on schedules so that revisions improve fairness.
15. As a teaching load committee member, I want to collaborate in real time so that schedule changes are visible instantly.

## Faculty

16. As a faculty member, I want to record my availability so that teaching assignments fit my schedule.
17. As a faculty member, I want to review preliminary schedules so that I can confirm my teaching load.
18. As a faculty member, I want to provide feedback on assignments so that adjustments can be made if necessary.

## Department Registrar

19. As a registrar, I want to enter irregular-student data so that scheduling accounts for their special cases.
20. As a registrar, I want to be notified when irregular-student data is missing so that I can provide it on time.

## External Departments

21. As an external department, I want to provide fixed course slots so that my classes are scheduled correctly.
22. As an external department, I want to provide elective offerings and section counts so that the survey is accurate.

## Deanship

23. As a deanship member, I want to receive finalized schedules so that they can be approved and published.
