'use client'

import { useRouter } from 'next/navigation'
import { ScheduleCommentForm } from '@/components/schedule-comment-form'

interface Section {
	id: string
	course_code: string
	course_title: string
	section_no: string
}

interface CommentFormWrapperProps {
	sections: Section[]
}

export function CommentFormWrapper({ sections }: CommentFormWrapperProps) {
	const router = useRouter()

	function handleCommentCreated() {
		// Use Next.js router to refresh server component data
		router.refresh()
	}

	return (
		<ScheduleCommentForm
			sections={sections}
			onCommentCreated={handleCommentCreated}
		/>
	)
}

