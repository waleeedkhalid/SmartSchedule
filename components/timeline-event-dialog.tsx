'use client'

import { format } from 'date-fns'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, AlertCircle, CheckCircle2, Info, Tag, Users, Flag } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface TimelineEvent {
	id: string
	title: string
	description: string | null
	event_type: string
	category: string
	start_date: string
	end_date: string
	priority: string
	status: string
	requires_action: boolean
	target_roles: string[] | null
	is_deadline: boolean
	term_code?: string
}

interface TimelineEventDialogProps {
	event: TimelineEvent | null
	open: boolean
	onOpenChange: (open: boolean) => void
	userRole?: string | null
}

const priorityColors = {
	low: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
	medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
	high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
	critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const statusColors = {
	upcoming: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
	in_progress: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
	completed: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 border-green-200 dark:border-green-800',
	overdue: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800',
	cancelled: 'bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300 border-gray-200 dark:border-gray-800',
}

function getStatusIcon(status: string) {
	switch (status) {
		case 'completed':
			return <CheckCircle2 className="h-4 w-4" />
		case 'overdue':
			return <AlertCircle className="h-4 w-4" />
		case 'in_progress':
			return <Clock className="h-4 w-4" />
		default:
			return <Calendar className="h-4 w-4" />
	}
}

function formatDate(dateString: string): string {
	try {
		if (!dateString) return 'Not set'
		const date = new Date(dateString)
		if (isNaN(date.getTime())) return 'Invalid date'
		return format(date, 'EEEE, MMMM d, yyyy h:mm a')
	} catch {
		return 'Invalid date'
	}
}

export function TimelineEventDialog({ event, open, onOpenChange, userRole }: TimelineEventDialogProps) {
	if (!event) return null

	const priority = (event.priority || 'medium') as keyof typeof priorityColors
	const status = (event.status || 'upcoming') as keyof typeof statusColors
	const targetRoles = event.target_roles || []
	
	// Only scheduling and registrar roles can access the timeline management page
	const canAccessTimeline = userRole && ['scheduling', 'registrar'].includes(userRole)

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1">
							<DialogTitle className="text-xl mb-2">{event.title || 'Untitled Event'}</DialogTitle>
							<DialogDescription className="text-base">
								{event.description || 'No description available'}
							</DialogDescription>
						</div>
						<div className="flex items-center gap-2 flex-shrink-0">
							<Badge
								variant="outline"
								className={cn('border', statusColors[status] || statusColors.upcoming)}
							>
								{getStatusIcon(status)}
								<span className="ml-1 capitalize">{status.replace('_', ' ')}</span>
							</Badge>
							<Badge
								variant="outline"
								className={cn('border', priorityColors[priority] || priorityColors.medium)}
							>
								{priority}
							</Badge>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Dates */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
								<Calendar className="h-4 w-4" />
								Start Date
							</div>
							<p className="text-sm">{formatDate(event.start_date)}</p>
						</div>
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
								<Clock className="h-4 w-4" />
								{event.is_deadline ? 'Deadline' : 'End Date'}
							</div>
							<p className="text-sm">{formatDate(event.end_date)}</p>
						</div>
					</div>

					<Separator />

					{/* Event Details */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
								<Tag className="h-4 w-4" />
								Event Type
							</div>
							<p className="text-sm capitalize">{event.event_type?.replace('_', ' ') || 'General'}</p>
						</div>
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
								<Info className="h-4 w-4" />
								Category
							</div>
							<p className="text-sm capitalize">{event.category || 'General'}</p>
						</div>
					</div>

					{/* Semester Code */}
					{event.term_code && (
						<>
							<Separator />
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
									<Calendar className="h-4 w-4" />
									Semester
								</div>
								<p className="text-sm font-medium">{event.term_code}</p>
							</div>
						</>
					)}

					{/* Target Roles */}
					{targetRoles.length > 0 && (
						<>
							<Separator />
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
									<Users className="h-4 w-4" />
									Target Roles
								</div>
								<div className="flex flex-wrap gap-2">
									{targetRoles.map((role) => (
										<Badge key={role} variant="secondary" className="capitalize">
											{role.replace('_', ' ')}
										</Badge>
									))}
								</div>
							</div>
						</>
					)}

					{/* Action Required */}
					{event.requires_action && (
						<>
							<Separator />
							<div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
								<Flag className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
								<div>
									<p className="text-sm font-medium text-amber-900 dark:text-amber-100">
										Action Required
									</p>
									<p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
										This event requires your attention. Please take the necessary action before the deadline.
									</p>
								</div>
							</div>
						</>
					)}

					{/* Deadline Warning */}
					{event.is_deadline && (
						<div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
							<AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
							<div>
								<p className="text-sm font-medium text-red-900 dark:text-red-100">
									Hard Deadline
								</p>
								<p className="text-xs text-red-800 dark:text-red-200 mt-1">
									This is a hard deadline that must be met. Late submissions may not be accepted.
								</p>
							</div>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
					{canAccessTimeline && (
						<Button asChild>
							<Link href="/dashboard/timeline" onClick={() => onOpenChange(false)}>
								View Full Timeline
							</Link>
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

