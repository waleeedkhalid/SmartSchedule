/**
 * Audit Log Helper Functions
 * Functions to interact with the version_control audit logging system
 */

import { createServerClient } from '@/lib/supabase/server';
import type {
  AuditLog,
  AuditLogView,
  AuditSummary,
  UserRecentChange,
  RollbackResult,
  AuditFilters,
  AuditOperation,
} from '@/types/audit';

/**
 * Get audit history for a specific record
 */
export async function getRecordAuditHistory(
  tableName: string,
  recordId: string,
  limit: number = 100
): Promise<AuditLog[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc('get_record_audit_history', {
    p_table_name: tableName,
    p_record_id: recordId,
    p_limit: limit,
  });

  if (error) {
    console.error('Error fetching audit history:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get audit summary by table for a date range
 */
export async function getAuditSummaryByTable(
  startDate?: Date,
  endDate?: Date
): Promise<AuditSummary[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc('get_audit_summary_by_table', {
    p_start_date: startDate?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    p_end_date: endDate?.toISOString() || new Date().toISOString(),
  });

  if (error) {
    console.error('Error fetching audit summary:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get recent changes made by a specific user
 */
export async function getUserRecentChanges(
  userId: string,
  limit: number = 50
): Promise<UserRecentChange[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc('get_user_recent_changes', {
    p_user_id: userId,
    p_limit: limit,
  });

  if (error) {
    console.error('Error fetching user changes:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get filtered audit logs
 */
export async function getAuditLogs(filters: AuditFilters = {}): Promise<AuditLogView[]> {
  const supabase = await createServerClient();

  let query = supabase
    .from('audit_log_view')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.table_name) {
    query = query.eq('table_name', filters.table_name);
  }

  if (filters.record_id) {
    query = query.eq('record_id', filters.record_id);
  }

  if (filters.operation) {
    query = query.eq('operation', filters.operation);
  }

  if (filters.start_date) {
    query = query.gte('created_at', filters.start_date);
  }

  if (filters.end_date) {
    query = query.lte('created_at', filters.end_date);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }

  return data || [];
}

/**
 * Rollback a specific change
 */
export async function rollbackChange(auditId: string): Promise<RollbackResult> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc('rollback_change', {
    p_audit_id: auditId,
  });

  if (error) {
    console.error('Error rolling back change:', error);
    throw error;
  }

  return data as RollbackResult;
}

/**
 * Get all audit logs for the current user
 */
export async function getMyAuditLogs(limit: number = 100): Promise<AuditLogView[]> {
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('audit_log_view')
    .select('*')
    .eq('user_email', user.email)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching user audit logs:', error);
    throw error;
  }

  return data || [];
}

/**
 * Create a manual audit log entry (for actions not captured by triggers)
 */
export async function createManualAuditLog(
  tableName: string,
  recordId: string,
  operation: AuditOperation,
  description: string,
  newData?: Record<string, unknown>,
  oldData?: Record<string, unknown>,
  tags?: string[]
): Promise<void> {
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: userRecord } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('id', user.id)
    .single();

  const { error } = await supabase.from('version_control').insert({
    user_id: userRecord?.id,
    user_email: userRecord?.email,
    user_role: userRecord?.role,
    table_name: tableName,
    record_id: recordId,
    operation,
    old_data: oldData || null,
    new_data: newData || null,
    description,
    tags: tags || null,
  });

  if (error) {
    console.error('Error creating manual audit log:', error);
    throw error;
  }
}

/**
 * Get audit statistics for a specific table
 */
export async function getTableAuditStats(
  tableName: string,
  days: number = 30
): Promise<{
  total: number;
  inserts: number;
  updates: number;
  deletes: number;
  uniqueUsers: number;
}> {
  const supabase = await createServerClient();

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('version_control')
    .select('operation, user_id')
    .eq('table_name', tableName)
    .gte('created_at', startDate);

  if (error) {
    console.error('Error fetching table audit stats:', error);
    throw error;
  }

  type AuditRecord = { operation: string; user_id: string | null };

  const stats = {
    total: data?.length || 0,
    inserts: data?.filter((d: AuditRecord) => d.operation === 'INSERT').length || 0,
    updates: data?.filter((d: AuditRecord) => d.operation === 'UPDATE').length || 0,
    deletes: data?.filter((d: AuditRecord) => d.operation === 'DELETE').length || 0,
    uniqueUsers: new Set(data?.map((d: AuditRecord) => d.user_id).filter(Boolean)).size,
  };

  return stats;
}
