'use client'

import { TimelineTopBar } from '@/components/timeline-top-bar'
import { NotificationBell } from '@/components/notification-bell'
import { useAuth } from '@/lib/auth-context'

export function DashboardTopBar() {
	const { userRole, loading } = useAuth()

	const role = userRole?.role || null

	if (loading || !role) {
		return (
			<div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4">
				<div className="flex-1" />
				<div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
			</div>
		)
	}

	return (
		<div className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
			<div className="flex items-center h-16">
				{/* Timeline Bar */}
				<div className="flex-1 min-w-0">
					<TimelineTopBar userRole={role} />
				</div>

				{/* Notification Bell */}
				<div className="flex-shrink-0 px-4 border-l border-slate-200 dark:border-slate-800">
					<NotificationBell />
				</div>
			</div>
		</div>
	)
}

