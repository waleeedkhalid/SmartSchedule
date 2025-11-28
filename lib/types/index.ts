export * from './database';
export * from './scheduling';

import { Database } from './database';
export type Course = Database['public']['Tables']['course']['Row'];
export type UserRole = Database['public']['Enums']['user_role'];
export type UserRoleRow = Database['public']['Tables']['user_roles']['Row'];
export type Instructor = Database['public']['Tables']['faculty_profile']['Row'];
export type Exam = Database['public']['Tables']['exam']['Row'];
export type Room = Database['public']['Tables']['room']['Row'];
