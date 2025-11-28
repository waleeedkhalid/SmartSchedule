'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, memo } from 'react'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ArrowUp, ArrowDown } from 'lucide-react'

function CoursesSortComponent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	
	const currentSortBy = searchParams.get('sortBy') || 'code'
	const currentSortOrder = searchParams.get('sortOrder') || 'asc'

	// Memoize sort change handler
	const handleSortByChange = useCallback((value: string) => {
		const params = new URLSearchParams(searchParams.toString())
		params.set('sortBy', value)
		params.set('page', '1') // Reset to page 1 when sorting changes
		router.push(`/dashboard/courses?${params.toString()}`)
	}, [router, searchParams])

	// Memoize sort order toggle handler
	const handleSortOrderToggle = useCallback(() => {
		const params = new URLSearchParams(searchParams.toString())
		const newOrder = currentSortOrder === 'asc' ? 'desc' : 'asc'
		params.set('sortOrder', newOrder)
		params.set('page', '1') // Reset to page 1 when sorting changes
		router.push(`/dashboard/courses?${params.toString()}`)
	}, [router, searchParams, currentSortOrder])

	return (
		<div className="flex items-center gap-2">
			<span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
			<Select value={currentSortBy} onValueChange={handleSortByChange}>
				<SelectTrigger className="w-[160px]">
					<SelectValue placeholder="Sort by..." />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="code">Course Code</SelectItem>
					<SelectItem value="title">Title</SelectItem>
					<SelectItem value="level">Level</SelectItem>
					<SelectItem value="credits">Credits</SelectItem>
					<SelectItem value="weekly_hours">Weekly Hours</SelectItem>
				</SelectContent>
			</Select>
			<Button
				variant="outline"
				size="sm"
				onClick={handleSortOrderToggle}
				className="h-10 w-10 p-0"
				title={currentSortOrder === 'asc' ? 'Ascending' : 'Descending'}
			>
				{currentSortOrder === 'asc' ? (
					<ArrowUp className="h-4 w-4" />
				) : (
					<ArrowDown className="h-4 w-4" />
				)}
				<span className="sr-only">
					{currentSortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
				</span>
			</Button>
		</div>
	)
}

// Memoize component to prevent unnecessary re-renders
export const CoursesSort = memo(CoursesSortComponent)

