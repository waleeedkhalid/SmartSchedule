/**
 * Audit Log Client Functions
 * For use in Client Components
 */

'use client';

import { createBrowserClient } from '@/lib/supabase/client';
import type {
  AuditLogView,
  AuditFilters,
} from '@/types/audit';

/**
 * Get filtered audit logs (client-side)
 */
export async function getAuditLogs(filters: AuditFilters = {}): Promise<AuditLogView[]> {
  const supabase = createBrowserClient();

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
 * Get all audit logs for the current user (client-side)
 */
export async function getMyAuditLogs(limit: number = 100): Promise<AuditLogView[]> {
  const supabase = createBrowserClient();
  
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
