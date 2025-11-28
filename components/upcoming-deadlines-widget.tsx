'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react'
import { format, differenceInDays, isPast, isFuture } from 'date-fns'
import Link from 'next/link'
import { getAuthHeader } from '@/lib/utils/client-auth'
import { calculateTimelineStatus } from '@/lib/utils/timeline-status'

interface UpcomingDeadline {
	id: string
	title: string
	description: string | null
	event_type: string
	start_date: string
	end_date: string
	days_until_start?: number | null
	days_until_end?: number | null
	priority: string
	status: string
	requires_action: boolean
}

interface UpcomingDeadlinesWidgetProps {
	userRole: string
	compact?: boolean
	showAll?: boolean
	initialData?: UpcomingDeadline[]
}

const priorityColors = {
	low: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
	medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
	high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
	critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export function UpcomingDeadlinesWidget({
	userRole,
	compact = false,
	showAll = false,
	initialData,
}: UpcomingDeadlinesWidgetProps) {
	const [deadlines, setDeadlines] = useState<UpcomingDeadline[]>(initialData || [])
	const [isLoading, setIsLoading] = useState(!initialData)

	async function loadDeadlines() {
		setIsLoading(true)
		try {
			const authHeader = await getAuthHeader()
			const response = await fetch(
				`/api/timeline?role=${userRole}&daysAhead=${showAll ? 90 : 30}`,
				{
					headers: {
						'Authorization': authHeader,
					},
				}
			)
			if (response.ok) {
				const result = await response.json()
				setDeadlines(result.data || [])
			}
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		// Only fetch if initial data was not provided
		if (!initialData) {
			loadDeadlines()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userRole, initialData])

	function calculateDaysUntilStart(startDate: string): number {
		try {
			const now = new Date()
			const start = startDate ? new Date(startDate) : null
			
			if (!start || isNaN(start.getTime())) {
				return 0
			}
			
			return differenceInDays(start, now)
		} catch {
			return 0
		}
	}

	function calculateDaysUntilEnd(endDate: string): number {
		try {
			const now = new Date()
			const end = endDate ? new Date(endDate) : null
			
			if (!end || isNaN(end.getTime())) {
				return 0
			}
			
			return differenceInDays(end, now)
		} catch {
			return 0
		}
	}

	function getDaysText(deadline: UpcomingDeadline) {
		// Calculate status dynamically
		const calculatedStatus = calculateTimelineStatus({
			status: deadline.status,
			start_date: deadline.start_date,
			end_date: deadline.end_date,
		})

		if (calculatedStatus === 'completed') return 'Completed'

		// Calculate days if not provided by API
		const daysUntilStart = deadline.days_until_start ?? calculateDaysUntilStart(deadline.start_date)
		const daysUntilEnd = deadline.days_until_end ?? calculateDaysUntilEnd(deadline.end_date)

		// Check if event hasn't started yet (upcoming)
		if (calculatedStatus === 'upcoming' && daysUntilStart > 0) {
			return `${daysUntilStart} day${daysUntilStart !== 1 ? 's' : ''} away`
		}

		// Check if event is in progress (started but not ended)
		if (calculatedStatus === 'in_progress') {
			if (daysUntilEnd >= 0) {
				return `${daysUntilEnd} day${daysUntilEnd !== 1 ? 's' : ''} left`
			}
			return 'In progress'
		}

		// Event is overdue/ended
		if (calculatedStatus === 'overdue') {
			const days = Math.abs(daysUntilEnd)
			if (isNaN(days) || days === 0) {
				return 'Ended'
			}
			return `${days} day${days !== 1 ? 's' : ''} overdue`
		}

		// Fallback
		return 'In progress'
	}

	function getUrgencyColor(deadline: UpcomingDeadline) {
		// Calculate status dynamically
		const calculatedStatus = calculateTimelineStatus({
			status: deadline.status,
			start_date: deadline.start_date,
			end_date: deadline.end_date,
		})

		// Calculate days if not provided by API
		const daysUntilStart = deadline.days_until_start ?? calculateDaysUntilStart(deadline.start_date)
		const daysUntilEnd = deadline.days_until_end ?? calculateDaysUntilEnd(deadline.end_date)

		// If event has ended, show red
		if (calculatedStatus === 'overdue') return 'text-red-600'
		
		// If event is in progress, show yellow/orange
		if (calculatedStatus === 'in_progress') {
			if (daysUntilEnd <= 3) return 'text-orange-600'
			return 'text-yellow-600'
		}

		// If upcoming, show based on days until start
		if (isNaN(daysUntilStart) || daysUntilStart <= 3) return 'text-orange-600'
		if (daysUntilStart <= 7) return 'text-yellow-600'
		return 'text-muted-foreground'
	}

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Clock className="h-5 w-5" />
						Upcoming Deadlines
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center py-8">
						<p className="text-sm text-muted-foreground">Loading...</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	const actionRequiredDeadlines = deadlines.filter((d) => d.requires_action)
	const displayDeadlines = compact ? deadlines.slice(0, 5) : deadlines

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Clock className="h-5 w-5" />
					Upcoming Deadlines
				</CardTitle>
				{!compact && (
					<CardDescription>
						{actionRequiredDeadlines.length > 0 ? (
							<span className="flex items-center gap-1 text-orange-600">
								<AlertCircle className="h-4 w-4" />
								{actionRequiredDeadlines.length} action
								{actionRequiredDeadlines.length !== 1 ? 's' : ''} required
							</span>
						) : (
							'Stay on track with important dates'
						)}
					</CardDescription>
				)}
			</CardHeader>
			<CardContent>
				{deadlines.length === 0 ? (
					<div className="text-center py-8">
						<CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-600" />
						<p className="text-sm font-medium">All caught up!</p>
						<p className="text-xs text-muted-foreground">
							No upcoming deadlines at the moment
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{displayDeadlines.map((deadline) => (
							<div
								key={deadline.id}
								className="border rounded-lg p-3 hover:bg-indigo-50 hover:border-indigo-300 dark:hover:bg-indigo-950 dark:hover:border-indigo-700 transition-colors"
							>
								<div className="flex items-start justify-between gap-2">
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<h4 className="font-medium text-sm truncate">{deadline.title}</h4>
											{deadline.requires_action && (
												<Badge variant="outline" className="text-xs bg-amber-50 border-amber-200">
													Action Required
												</Badge>
											)}
										</div>
										{!compact && deadline.description && (
											<p className="text-xs text-muted-foreground line-clamp-2 mb-2">
												{deadline.description}
											</p>
										)}
										<div className="flex items-center gap-4 text-xs">
											<span className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												{format(new Date(deadline.end_date), 'MMM dd, yyyy')}
											</span>
											<span className={`flex items-center gap-1 font-medium ${getUrgencyColor(deadline)}`}>
												<Clock className="h-3 w-3" />
												{getDaysText(deadline)}
											</span>
										</div>
									</div>
									<Badge
										variant="outline"
										className={priorityColors[deadline.priority as keyof typeof priorityColors]}
									>
										{deadline.priority}
									</Badge>
								</div>
							</div>
						))}

						{compact && deadlines.length > 5 && (
							<Button variant="ghost" className="w-full" asChild>
								<Link href="/dashboard/timeline">
									View all {deadlines.length} deadlines
									<ExternalLink className="h-3 w-3 ml-2" />
								</Link>
							</Button>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	)
}

