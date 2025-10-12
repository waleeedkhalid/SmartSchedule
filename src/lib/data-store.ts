// // In-memory data store for Phase 3
// // Simplified to use only mockData-compatible types

// import { v4 as uuidv4 } from "uuid";
// import {
//   StudentCount,
//   ElectivePackage,
//   IrregularStudent,
//   CourseOffering,
//   ElectivePreference,
//   Comment,
//   Notification,
//   Conflict,
// } from "./types";

// // ============================================================================
// // IN-MEMORY COLLECTIONS
// // ============================================================================

// export const dataStore = {
//   studentCounts: [] as StudentCount[],
//   electivePackages: [] as ElectivePackage[],
//   irregularStudents: [] as IrregularStudent[],
//   courseOfferings: [] as CourseOffering[],
//   electivePreferences: [] as ElectivePreference[],
//   comments: [] as Comment[],
//   notifications: [] as Notification[],
//   conflicts: [] as Conflict[],
//   config: {
//     maxElectivePreferences: 6,
//     breakTimeStart: "12:00",
//     breakTimeEnd: "13:00",
//     midtermDays: ["Monday", "Wednesday"],
//     midtermTimeStart: "12:00",
//     midtermTimeEnd: "14:00",
//   },
// };

// // ============================================================================
// // COURSE OFFERINGS SERVICE
// // ============================================================================

// export const courseOfferingService = {
//   findAll: () => dataStore.courseOfferings,
//   findByCode: (code: string) =>
//     dataStore.courseOfferings.find((c) => c.code === code),
//   findByType: (type: "REQUIRED" | "ELECTIVE") =>
//     dataStore.courseOfferings.filter((c) => c.type === type),
//   findByLevel: (level: number) =>
//     dataStore.courseOfferings.filter((c) => c.level === level),
//   findByDepartment: (dept: string) =>
//     dataStore.courseOfferings.filter((c) => c.department === dept),
//   create: (data: CourseOffering) => {
//     dataStore.courseOfferings.push(data);
//     return data;
//   },
//   update: (code: string, updates: Partial<CourseOffering>) => {
//     const index = dataStore.courseOfferings.findIndex((c) => c.code === code);
//     if (index === -1) return null;
//     dataStore.courseOfferings[index] = {
//       ...dataStore.courseOfferings[index],
//       ...updates,
//     };
//     return dataStore.courseOfferings[index];
//   },
//   delete: (code: string) => {
//     const index = dataStore.courseOfferings.findIndex((c) => c.code === code);
//     if (index === -1) return false;
//     dataStore.courseOfferings.splice(index, 1);
//     return true;
//   },
// };

// // ============================================================================
// // STUDENT COUNTS SERVICE
// // ============================================================================

// export const studentCountService = {
//   findAll: () => dataStore.studentCounts,
//   findByCode: (code: string) =>
//     dataStore.studentCounts.find((c) => c.code === code),
//   findByLevel: (level: number) =>
//     dataStore.studentCounts.filter((c) => c.level === level),
//   create: (data: StudentCount) => {
//     dataStore.studentCounts.push(data);
//     return data;
//   },
//   update: (code: string, total_students: number) => {
//     const item = dataStore.studentCounts.find((c) => c.code === code);
//     if (!item) return null;
//     item.total_students = total_students;
//     return item;
//   },
// };

// // ============================================================================
// // ELECTIVE PACKAGES SERVICE
// // ============================================================================

// export const electivePackageService = {
//   findAll: () => dataStore.electivePackages,
//   findById: (id: string) => dataStore.electivePackages.find((p) => p.id === id),
//   create: (data: ElectivePackage) => {
//     dataStore.electivePackages.push(data);
//     return data;
//   },
// };

// // ============================================================================
// // IRREGULAR STUDENTS SERVICE
// // ============================================================================

// export const irregularStudentService = {
//   findAll: () => dataStore.irregularStudents,
//   findById: (id: string) =>
//     dataStore.irregularStudents.find((s) => s.id === id),
//   create: (data: Omit<IrregularStudent, "id">) => {
//     const newStudent: IrregularStudent = {
//       ...data,
//       id: uuidv4(),
//     };
//     dataStore.irregularStudents.push(newStudent);
//     return newStudent;
//   },
//   update: (id: string, updates: Partial<IrregularStudent>) => {
//     const index = dataStore.irregularStudents.findIndex((s) => s.id === id);
//     if (index === -1) return null;
//     dataStore.irregularStudents[index] = {
//       ...dataStore.irregularStudents[index],
//       ...updates,
//     };
//     return dataStore.irregularStudents[index];
//   },
//   delete: (id: string) => {
//     const index = dataStore.irregularStudents.findIndex((s) => s.id === id);
//     if (index === -1) return false;
//     dataStore.irregularStudents.splice(index, 1);
//     return true;
//   },
// };

// // ============================================================================
// // ELECTIVE PREFERENCES SERVICE
// // ============================================================================

// export const preferenceService = {
//   findAll: () => dataStore.electivePreferences,
//   findById: (id: string) =>
//     dataStore.electivePreferences.find((p) => p.id === id),
//   findByStudent: (studentId: string) =>
//     dataStore.electivePreferences.filter((p) => p.studentId === studentId),
//   findByCourse: (courseCode: string) =>
//     dataStore.electivePreferences.filter((p) => p.courseCode === courseCode),
//   create: (data: Omit<ElectivePreference, "id">) => {
//     const newPref: ElectivePreference = {
//       ...data,
//       id: uuidv4(),
//     };
//     dataStore.electivePreferences.push(newPref);
//     return newPref;
//   },
//   deleteByStudent: (studentId: string) => {
//     dataStore.electivePreferences = dataStore.electivePreferences.filter(
//       (p) => p.studentId !== studentId
//     );
//   },
//   delete: (id: string) => {
//     const index = dataStore.electivePreferences.findIndex((p) => p.id === id);
//     if (index === -1) return false;
//     dataStore.electivePreferences.splice(index, 1);
//     return true;
//   },
// };

// // ============================================================================
// // COMMENTS SERVICE
// // ============================================================================

// export const commentService = {
//   findAll: () => dataStore.comments,
//   findById: (id: string) => dataStore.comments.find((c) => c.id === id),
//   findByTarget: (targetType: string, targetId: string) =>
//     dataStore.comments.filter(
//       (c) => c.targetType === targetType && c.targetId === targetId
//     ),
//   create: (data: Omit<Comment, "id" | "createdAt">) => {
//     const newComment: Comment = {
//       ...data,
//       id: uuidv4(),
//       createdAt: new Date().toISOString(),
//     };
//     dataStore.comments.push(newComment);
//     return newComment;
//   },
//   delete: (id: string) => {
//     const index = dataStore.comments.findIndex((c) => c.id === id);
//     if (index === -1) return false;
//     dataStore.comments.splice(index, 1);
//     return true;
//   },
// };

// // ============================================================================
// // NOTIFICATIONS SERVICE
// // ============================================================================

// export const notificationService = {
//   findAll: () => dataStore.notifications,
//   findById: (id: string) => dataStore.notifications.find((n) => n.id === id),
//   findByUser: (userId: string) =>
//     dataStore.notifications
//       .filter((n) => n.userId === userId)
//       .sort(
//         (a, b) =>
//           new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//       ),
//   findUnread: (userId: string) =>
//     dataStore.notifications.filter((n) => n.userId === userId && !n.readAt),
//   create: (data: Omit<Notification, "id" | "createdAt">) => {
//     const newNotification: Notification = {
//       ...data,
//       id: uuidv4(),
//       createdAt: new Date().toISOString(),
//     };
//     dataStore.notifications.push(newNotification);
//     return newNotification;
//   },
//   markAsRead: (id: string) => {
//     const notification = dataStore.notifications.find((n) => n.id === id);
//     if (!notification) return null;
//     notification.readAt = new Date().toISOString();
//     return notification;
//   },
//   markAllAsRead: (userId: string) => {
//     dataStore.notifications
//       .filter((n) => n.userId === userId && !n.readAt)
//       .forEach((n) => {
//         n.readAt = new Date().toISOString();
//       });
//   },
//   delete: (id: string) => {
//     const index = dataStore.notifications.findIndex((n) => n.id === id);
//     if (index === -1) return false;
//     dataStore.notifications.splice(index, 1);
//     return true;
//   },
// };

// // ============================================================================
// // CONFLICTS SERVICE
// // ============================================================================

// export const conflictService = {
//   findAll: () => dataStore.conflicts,
//   findById: (id: string) => dataStore.conflicts.find((c) => c.id === id),
//   findBySeverity: (severity: "ERROR" | "WARNING") =>
//     dataStore.conflicts.filter((c) => c.severity === severity),
//   create: (data: Omit<Conflict, "id" | "detectedAt">) => {
//     const newConflict: Conflict = {
//       ...data,
//       id: uuidv4(),
//       detectedAt: new Date().toISOString(),
//     };
//     dataStore.conflicts.push(newConflict);
//     return newConflict;
//   },
//   clear: () => {
//     dataStore.conflicts = [];
//   },
//   delete: (id: string) => {
//     const index = dataStore.conflicts.findIndex((c) => c.id === id);
//     if (index === -1) return false;
//     dataStore.conflicts.splice(index, 1);
//     return true;
//   },
// };

// // ============================================================================
// // CONFIG SERVICE
// // ============================================================================

// export const configService = {
//   get: () => dataStore.config,
//   update: (updates: Partial<typeof dataStore.config>) => {
//     dataStore.config = { ...dataStore.config, ...updates };
//     return dataStore.config;
//   },
// };
