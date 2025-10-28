'use client'

import { useRouter } from 'next/navigation'
import { ScheduleCommentList } from '@/components/schedule-comment-list'

interface Comment {
	id: string
	comment_text: string
	comment_type: 'general' | 'section'
	status: 'pending' | 'resolved'
	created_at: string
	section_id?: string | null
}

interface CommentListWrapperProps {
	comments: Comment[]
}

export function CommentListWrapper({ comments }: CommentListWrapperProps) {
	const router = useRouter()

	function handleCommentUpdated() {
		// Use Next.js router to refresh server component data
		router.refresh()
	}

	return (
		<ScheduleCommentList
			comments={comments}
			onCommentUpdated={handleCommentUpdated}
		/>
	)
}

