import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'
import type { FacultySection } from '@/lib/db/faculty-data'
import { formatMeetingDays, formatTimeWithDuration } from '@/lib/types/scheduling'

interface SectionCardProps {
	section: FacultySection
}

export function SectionCard({ section }: SectionCardProps) {
	const meetingPattern = section.meeting_pattern
	const days = meetingPattern?.days || []
	const startTime = meetingPattern?.start || 'TBD'
	const duration = meetingPattern?.duration || 0

	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="text-lg">
							{section.course_code} - {section.course_title}
						</CardTitle>
						<p className="text-sm text-muted-foreground">
							Section {section.section_no}
						</p>
					</div>
					<Badge 
						variant={section.state === 'released' ? 'default' : 'secondary'}
						className={section.state === 'released' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : ''}
					>
						{section.state}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-2 text-sm">
				<div className="flex items-center gap-1.5">
					<Calendar className="h-4 w-4 text-blue-500" />
					<span>{formatMeetingDays(days)}</span>
				</div>
				<div className="flex items-center gap-1.5">
					<Clock className="h-4 w-4 text-purple-500" />
					<span>{formatTimeWithDuration(startTime, duration)}</span>
				</div>
				<div className="flex items-center gap-1.5">
					<MapPin className="h-4 w-4 text-orange-500" />
					<span>{section.room_code || 'Room TBD'}</span>
				</div>
				<div className="flex items-center gap-1.5">
					<Users className="h-4 w-4 text-green-500" />
					<span>
						{section.current_enrollment !== undefined 
							? `${section.current_enrollment}/${section.capacity} students`
							: `${section.capacity} capacity`
						}
					</span>
				</div>
				<div className="text-gray-600 dark:text-gray-400 pt-2 border-t flex flex-wrap gap-2">
					<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800">
						Level {section.group_level}
					</span>
					{section.credits && (
						<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
							{section.credits} credits
						</span>
					)}
					{section.activity && (
						<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
							{section.activity}
						</span>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

