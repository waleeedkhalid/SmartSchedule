/**
 * UI Component Types
 * For React components and state management
 */

import type { UserRole } from './database';

// =====================================================
// AUTH CONTEXT TYPES
// =====================================================

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

// =====================================================
// NAVIGATION TYPES
// =====================================================

export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
}

export interface PersonaNavConfig {
  student: NavigationItem[];
  faculty: NavigationItem[];
  scheduling_committee: NavigationItem[];
  teaching_load_committee: NavigationItem[];
  registrar: NavigationItem[];
}

// =====================================================
// FORM TYPES
// =====================================================

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'time';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  validation?: Record<string, unknown>;
}

// =====================================================
// TABLE TYPES
// =====================================================

export interface TableColumn<T = unknown> {
  key: string;
  header: string;
  accessor?: (row: T) => unknown;
  sortable?: boolean;
  filterable?: boolean;
}

export interface TableProps<T = unknown> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

// =====================================================
// NOTIFICATION TYPES
// =====================================================

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// =====================================================
// THEME TYPES
// =====================================================

export type Theme = 'light' | 'dark' | 'system';

