import { UserRole } from './common';

/**
 * Base user type with common fields
 */
export interface UserBase {
  id: string;
  name: string;
  role: UserRole;
}

/**
 * Student user type
 */
export interface Student extends UserBase {
  role: UserRole.Student;
  level: number; // academic level
  irregular?: boolean; // for registrar
  electivePreferences?: string[]; // course codes
}

/**
 * Faculty user type
 */
export interface Faculty extends UserBase {
  role: UserRole.Faculty;
  department: string;
  email: string;
  availability?: string[]; // time slots they can teach
  preferences?: string[]; // course codes they prefer to teach
}

/**
 * Registrar user type
 */
export interface Registrar extends UserBase {
  role: UserRole.Registrar;
  irregularStudents: Student[]; // list of special cases they manage
}

/**
 * Committee member user type
 */
export interface CommitteeMember extends UserBase {
  role: UserRole.Scheduler | UserRole.LoadCommittee;
  permissions: string[]; // e.g. ["edit-schedule", "assign-load"]
}

/**
 * Union type of all user types
 */
export type User = Student | Faculty | Registrar | CommitteeMember;

/**
 * Type guard to check if a user is a Student
 */
export const isStudent = (user: User): user is Student => user.role === UserRole.Student;

/**
 * Type guard to check if a user is a Faculty
 */
export const isFaculty = (user: User): user is Faculty => user.role === UserRole.Faculty;

/**
 * Type guard to check if a user is a Registrar
 */
export const isRegistrar = (user: User): user is Registrar => user.role === UserRole.Registrar;

/**
 * Type guard to check if a user is a CommitteeMember
 */
export const isCommitteeMember = (user: User): user is CommitteeMember => 
  user.role === UserRole.Scheduler || user.role === UserRole.LoadCommittee;
