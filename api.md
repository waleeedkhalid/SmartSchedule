// Base: /api. JSON everywhere. Errors: { error: string, code: string } with 4xx/5xx.

// AUTH + USER
// Supabase handles sign-in. On first session, POST /api/users to upsert role/profile.
POST /api/users
Body: { authUid: string, email: string, name: string, role: "STUDENT"|"FACULTY"|... }
200: { user: User }
409: role conflict.

// REGISTRAR
// Irregular students
POST /api/registrar/irregular
Body: { studentId: string, remaining: object, requiredNext: object, notes?: string }
201: { irregular: IrregularStudent }
404: student not found.

PATCH /api/registrar/irregular/:id
Body: { remaining?: object, requiredNext?: object, notes?: string }
200: { irregular: IrregularStudent }
404: not found.

// Edugate import
POST /api/registrar/imports/edugate
Body: { term: string, fileId?: string, data?: object } // one of fileId|data
201: { batch: ImportBatch }
400: bad payload.

// External departments fixed slots
POST /api/registrar/external-depts
Body: { name: string, contact?: string }
201: { externalDepartment: ExternalDepartment }

POST /api/registrar/fixed-slots
Body: { externalDeptId: string, courseCode: string, dayOfWeek: number, startTime: string, endTime: string, notes?: string }
201: { fixedSlot: FixedSlot }

// SCHEDULING COMMITTEE
// Rules CRUD
GET /api/committee/rules
200: { rules: Rule[] }

POST /api/committee/rules
Body: { type: RuleType, payload: object, active?: boolean }
201: { rule: Rule }

PATCH /api/committee/rules/:id
Body: { payload?: object, active?: boolean }
200: { rule: Rule }
404: not found.

DELETE /api/committee/rules/:id
204

// Schedule lifecycle
POST /api/committee/schedules
Body: { name: string, term: string, baseSnapshot?: object }
201: { schedule: Schedule }

GET /api/committee/schedules?term=2025-Fall&status=DRAFT
200: { items: Schedule[] }

GET /api/committee/schedules/:id
200: { schedule: Schedule }

PATCH /api/committee/schedules/:id
Body: { status?: "DRAFT"|"REVIEW_LOAD"|"REVIEW_STUDENTS"|"FINALIZED", snapshot?: object, labelVersion?: string }
200: { schedule: Schedule, version?: ScheduleVersion }

// Versioning
GET /api/committee/schedules/:id/versions
200: { versions: ScheduleVersion[] }

POST /api/committee/schedules/:id/versions
Body: { diff: object, label?: string }
201: { version: ScheduleVersion }

// Comments
POST /api/committee/schedules/:id/comments
Body: { body: string, targetPath?: string }
201: { comment: Comment }

// Yjs collaboration token
POST /api/committee/schedules/:id/collab-token
Body: {}
200: { ydocId: string, token: string } // short-lived channel token

// Teaching assignments
POST /api/committee/assignments
Body: { sectionId: string, facultyId: string, role: string }
201: { assignment: TeachingAssignment }

// STUDENTS
// Elective preferences
GET /api/students/me/preferences?term=2025-Fall
200: { preferences: ElectivePreference[] }

POST /api/students/me/preferences
Body: { courseId: string, priority: number }
201: { preference: ElectivePreference }
PATCH /api/students/me/preferences/:id
Body: { priority?: number }
200: { preference: ElectivePreference }
DELETE /api/students/me/preferences/:id
204

// View schedules and exams
GET /api/students/schedules?term=2025-Fall&status=REVIEW_STUDENTS
200: { items: Schedule[] }

// Give feedback
POST /api/students/schedules/:id/comments
Body: { body: string, targetPath?: string }
201: { comment: Comment }

// FACULTY
GET /api/faculty/me/availability
200: { availability?: object, preferences?: object }
PUT /api/faculty/me/availability
Body: { availability: object, preferences?: object }
200: { availability: object, preferences?: object }

GET /api/faculty/me/assignments?term=2025-Fall
200: { assignments: TeachingAssignment[] }

// LOAD COMMITTEE
GET /api/load-committee/schedules?status=REVIEW_LOAD
200: { items: Schedule[] }

POST /api/load-committee/schedules/:id/comments
Body: { body: string, targetPath?: string }
201: { comment: Comment }

// NOTIFICATIONS (all personas)
GET /api/notifications
200: { items: Notification[] }
POST /api/notifications/ack
Body: { ids: string[] }
200: { updated: number }

// COURSES/SECTIONS/EXAMS (shared utilities)
GET /api/catalog/courses?search=swe
200: { items: Course[] }
POST /api/catalog/courses
Body: { code: string, name: string, credits: number, hasLab?: boolean, prerequisites?: string[] }
201: { course: Course }

POST /api/sections
Body: { courseId: string, code: string, capacity?: number, level: number, group?: string, isElective?: boolean }
201: { section: Section }

POST /api/sections/:id/meetings
Body: { dayOfWeek: number, startTime: string, endTime: string, roomId?: string, contiguous?: boolean }
201: { meeting: Meeting }

POST /api/exams
Body: { sectionId: string, type: string, date: string, startTime: string, endTime: string, roomId?: string }
201: { exam: Exam }
PATCH /api/exams/:id
Body: { date?: string, startTime?: string, endTime?: string, roomId?: string }
200: { exam: Exam }
