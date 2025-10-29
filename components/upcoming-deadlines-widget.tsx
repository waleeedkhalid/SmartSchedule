'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface UpcomingDeadline {
	id: string
	title: string
	description: string | null
	event_type: string
	start_date: string
	end_date: string
	days_until_start: number
	days_until_end: number
	priority: string
	status: string
	requires_action: boolean
}

interface UpcomingDeadlinesWidgetProps {
	userRole: string
	compact?: boolean
	showAll?: boolean
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
}: UpcomingDeadlinesWidgetProps) {
	const [deadlines, setDeadlines] = useState<UpcomingDeadline[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		loadDeadlines()
	}, [userRole])

	async function loadDeadlines() {
		setIsLoading(true)
		try {
			const response = await fetch(
				`/api/timeline?role=${userRole}&daysAhead=${showAll ? 90 : 30}`
			)
			if (response.ok) {
				const data = await response.json()
				setDeadlines(data)
			}
		} finally {
			setIsLoading(false)
		}
	}

	function getDaysText(deadline: UpcomingDeadline) {
		if (deadline.status === 'completed') return 'Completed'

		if (deadline.days_until_start > 0) {
			const days = deadline.days_until_start
			return `${days} day${days !== 1 ? 's' : ''} away`
		}

		if (deadline.days_until_end >= 0) {
			return 'In progress'
		}

		const days = Math.abs(deadline.days_until_end)
		return `${days} day${days !== 1 ? 's' : ''} overdue`
	}

	function getUrgencyColor(deadline: UpcomingDeadline) {
		if (deadline.days_until_end < 0) return 'text-red-600'
		if (deadline.days_until_start <= 3) return 'text-orange-600'
		if (deadline.days_until_start <= 7) return 'text-yellow-600'
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

