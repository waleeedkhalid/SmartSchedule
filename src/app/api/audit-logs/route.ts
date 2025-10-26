/**
 * Audit Log API Route
 * GET /api/audit-logs - Fetch audit logs with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs, getAuditSummaryByTable, getUserRecentChanges } from '@/lib/audit-log';
import { createServerClient } from '@/lib/supabase/server';
import type { AuditFilters } from '@/types/audit';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role
    const { data: userRecord } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only committee members can view all audit logs
    const isCommittee = ['scheduling_committee', 'teaching_load_committee', 'registrar'].includes(
      userRecord.role
    );

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'list';

    // Handle different actions
    if (action === 'summary') {
      const startDate = searchParams.get('start_date');
      const endDate = searchParams.get('end_date');

      if (!isCommittee) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const summary = await getAuditSummaryByTable(
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      return NextResponse.json({ summary });
    }

    if (action === 'user-changes') {
      const userId = searchParams.get('user_id') || user.id;
      const limit = parseInt(searchParams.get('limit') || '50');

      // Users can only see their own changes unless they're committee
      if (userId !== user.id && !isCommittee) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const changes = await getUserRecentChanges(userId, limit);
      return NextResponse.json({ changes });
    }

    // Default: List audit logs with filters
    const filters: AuditFilters = {
      table_name: searchParams.get('table_name') || undefined,
      record_id: searchParams.get('record_id') || undefined,
      operation: (searchParams.get('operation') as AuditFilters['operation']) || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      limit: parseInt(searchParams.get('limit') || '100'),
    };

    // If not committee, only show user's own changes
    if (!isCommittee) {
      filters.user_id = user.id;
    }

    const logs = await getAuditLogs(filters);

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
