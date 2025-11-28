'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { calculateTimelineStatus } from '@/lib/utils/timeline-status'

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
}

interface TimelineEventsTableProps {
	events: TimelineEvent[]
	onEdit?: (event: TimelineEvent) => void
	onDelete?: (id: string) => void
	onMarkComplete?: (id: string) => void
	onCancel?: (id: string) => void
	canEdit?: boolean
}

const priorityColors = {
	low: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
	medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
	high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
	critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const statusColors = {
	upcoming: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
	in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
	completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
	overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
	cancelled: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
}

const categoryColors = {
	registration: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
	academic: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
	exam: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
	administrative: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
}

export function TimelineEventsTable({
	events,
	onEdit,
	onDelete,
	onMarkComplete,
	onCancel,
	canEdit = false,
}: TimelineEventsTableProps) {
	const [loadingId, setLoadingId] = useState<string | null>(null)

	async function handleAction(
		id: string,
		action: () => Promise<void> | void
	) {
		setLoadingId(id)
		try {
			await action()
		} finally {
			setLoadingId(null)
		}
	}

	function formatDate(dateString: string) {
		return format(new Date(dateString), 'MMM dd, yyyy')
	}

	function formatDateTime(dateString: string) {
		return format(new Date(dateString), 'MMM dd, yyyy h:mm a')
	}

	function getDaysUntil(dateString: string) {
		const date = new Date(dateString)
		const now = new Date()
		const diffTime = date.getTime() - now.getTime()
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
		return diffDays
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Event</TableHead>
						<TableHead>Category</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Priority</TableHead>
						<TableHead>Start Date</TableHead>
						<TableHead>End Date</TableHead>
						<TableHead>Days Until</TableHead>
						<TableHead>Roles</TableHead>
						{canEdit && <TableHead className="text-right">Actions</TableHead>}
					</TableRow>
				</TableHeader>
				<TableBody>
					{events.length === 0 ? (
						<TableRow>
							<TableCell colSpan={canEdit ? 9 : 8} className="text-center py-8 text-muted-foreground">
								No timeline events found
							</TableCell>
						</TableRow>
					) : (
						events.map((event) => {
							const daysUntilStart = getDaysUntil(event.start_date)
							const daysUntilEnd = getDaysUntil(event.end_date)
							
							// Calculate status dynamically based on dates
							const calculatedStatus = calculateTimelineStatus({
								status: event.status,
								start_date: event.start_date,
								end_date: event.end_date,
								is_deadline: event.is_deadline,
							})

							return (
								<TableRow key={event.id}>
									<TableCell>
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<span className="font-medium">{event.title}</span>
												{event.is_deadline && (
													<Badge variant="outline" className="text-xs">
														Deadline
													</Badge>
												)}
												{event.requires_action && (
													<Badge variant="outline" className="text-xs bg-amber-50 border-amber-200">
														Action Required
													</Badge>
												)}
											</div>
											{event.description && (
												<p className="text-sm text-muted-foreground line-clamp-2">
													{event.description}
												</p>
											)}
											<p className="text-xs text-muted-foreground">
												{event.event_type.replace(/_/g, ' ')}
											</p>
										</div>
									</TableCell>
									<TableCell>
										<Badge
											variant="outline"
											className={
												categoryColors[event.category as keyof typeof categoryColors] ||
												'bg-gray-100 text-gray-800'
											}
										>
											{event.category}
										</Badge>
									</TableCell>
									<TableCell>
										<Badge
											variant="outline"
											className={statusColors[calculatedStatus as keyof typeof statusColors]}
										>
											{calculatedStatus.replace(/_/g, ' ')}
										</Badge>
									</TableCell>
									<TableCell>
										<Badge
											variant="outline"
											className={priorityColors[event.priority as keyof typeof priorityColors]}
										>
											{event.priority}
										</Badge>
									</TableCell>
									<TableCell className="text-sm">
										{formatDate(event.start_date)}
									</TableCell>
									<TableCell className="text-sm">
										{formatDate(event.end_date)}
									</TableCell>
									<TableCell>
										{calculatedStatus === 'completed' || calculatedStatus === 'cancelled' ? (
											<span className="text-sm text-muted-foreground">-</span>
										) : (
											<div className="flex items-center gap-1 text-sm">
												<Clock className="h-3 w-3" />
												{calculatedStatus === 'upcoming' && daysUntilStart > 0 ? (
													<span>
														{daysUntilStart} day{daysUntilStart !== 1 ? 's' : ''}
													</span>
												) : calculatedStatus === 'in_progress' ? (
													<span className="text-yellow-600 font-medium">
														{daysUntilEnd >= 0 ? `${daysUntilEnd} day${daysUntilEnd !== 1 ? 's' : ''} left` : 'In Progress'}
													</span>
												) : calculatedStatus === 'overdue' ? (
													<span className="text-red-600 font-medium">
														{Math.abs(daysUntilEnd)} day{Math.abs(daysUntilEnd) !== 1 ? 's' : ''} overdue
													</span>
												) : (
													<span className="text-muted-foreground">-</span>
												)}
											</div>
										)}
									</TableCell>
									<TableCell>
										<div className="flex flex-wrap gap-1">
											{event.target_roles && event.target_roles.length > 0 ? (
												event.target_roles.map((role) => (
													<Badge key={role} variant="secondary" className="text-xs">
														{role}
													</Badge>
												))
											) : (
												<span className="text-sm text-muted-foreground">All</span>
											)}
										</div>
									</TableCell>
									{canEdit && (
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="sm"
														disabled={loadingId === event.id}
													>
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													{onEdit && (
														<DropdownMenuItem onClick={() => onEdit(event)}>
															Edit
														</DropdownMenuItem>
													)}
													{onMarkComplete && event.status !== 'completed' && (
														<DropdownMenuItem
															onClick={() =>
																handleAction(event.id, () => onMarkComplete(event.id))
															}
														>
															<CheckCircle2 className="h-4 w-4 mr-2" />
															Mark Complete
														</DropdownMenuItem>
													)}
													{onCancel && event.status !== 'cancelled' && (
														<DropdownMenuItem
															onClick={() =>
																handleAction(event.id, () => onCancel(event.id))
															}
														>
															<XCircle className="h-4 w-4 mr-2" />
															Cancel Event
														</DropdownMenuItem>
													)}
													{onDelete && (
														<DropdownMenuItem
															onClick={() =>
																handleAction(event.id, () => onDelete(event.id))
															}
															className="text-red-600"
														>
															Delete
														</DropdownMenuItem>
													)}
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									)}
								</TableRow>
							)
						})
					)}
				</TableBody>
			</Table>
		</div>
	)
}

