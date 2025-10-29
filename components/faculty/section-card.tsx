import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, MapPin } from 'lucide-react'
import type { FacultySection } from '@/lib/db/faculty'
import { formatMeetingDays, formatTimeWithDuration } from '@/lib/types/scheduling'

interface SectionCardProps {
	section: FacultySection
}

export function SectionCard({ section }: SectionCardProps) {
	const meetingPattern = section.meeting_pattern
	const days = meetingPattern?.days || []
	const startTime = meetingPattern?.start || 'TBD'
	const duration = meetingPattern?.duration || 0
	const activity = section.activity || 'lecture'

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">
					{section.course_code} - {section.course_title}
				</CardTitle>
				<p className="text-sm text-muted-foreground">
					Section {section.section_no}{' '}
					{activity === 'lab' && <span className="text-blue-600">(Lab)</span>}
					{activity === 'tutorial' && <span className="text-green-600">(Tutorial)</span>}
				</p>
			</CardHeader>
			<CardContent className="space-y-2 text-sm">
				<div className="flex items-center gap-1.5">
					<Calendar className="h-4 w-4 text-gray-500" />
					<span>{formatMeetingDays(days)}</span>
				</div>
				<div className="flex items-center gap-1.5">
					<Clock className="h-4 w-4 text-gray-500" />
					<span>{formatTimeWithDuration(startTime, duration)}</span>
				</div>
				<div className="flex items-center gap-1.5">
					<MapPin className="h-4 w-4 text-gray-500" />
					<span>{section.room_code || 'Room TBD'}</span>
				</div>
				<div className="text-gray-600 dark:text-gray-400 pt-2 border-t">
					Capacity: {section.capacity} students
					{section.level && ` • Level ${section.level}`}
					{section.credits && ` • ${section.credits} credits`}
				</div>
			</CardContent>
		</Card>
	)
}

