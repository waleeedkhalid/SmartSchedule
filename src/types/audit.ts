/**
 * Audit Log Types
 * Type definitions for the version_control audit logging system
 */

export type AuditOperation = 'INSERT' | 'UPDATE' | 'DELETE' | 'ROLLBACK';

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  table_name: string;
  record_id: string;
  operation: AuditOperation;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  changed_fields: string[] | null;
  ip_address: string | null;
  user_agent: string | null;
  request_path: string | null;
  description: string | null;
  tags: string[] | null;
  created_at: string;
}

export interface AuditLogView {
  id: string;
  table_name: string;
  record_id: string;
  operation: AuditOperation;
  user_email: string | null;
  user_role: string | null;
  changed_fields: string[] | null;
  description: string | null;
  created_at: string;
  change_data: Record<string, unknown>;
}

export interface AuditSummary {
  table_name: string;
  total_changes: number;
  inserts: number;
  updates: number;
  deletes: number;
  unique_users: number;
}

export interface UserRecentChange {
  id: string;
  table_name: string;
  record_id: string;
  operation: AuditOperation;
  changed_fields: string[] | null;
  created_at: string;
}

export interface RollbackResult {
  success: boolean;
  message?: string;
  error?: string;
  old_data?: Record<string, unknown>;
}

export interface AuditFilters {
  table_name?: string;
  record_id?: string;
  user_id?: string;
  operation?: AuditOperation;
  start_date?: string;
  end_date?: string;
  limit?: number;
}
