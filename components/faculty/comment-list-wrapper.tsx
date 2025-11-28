'use client'

import { useRouter } from 'next/navigation'
import { ScheduleCommentList, Comment } from '@/components/schedule-comment-list'



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

