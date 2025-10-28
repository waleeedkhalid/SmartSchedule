'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, memo } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CoursesPaginationProps {
	currentPage: number
	totalPages: number
	totalCount: number
	pageSize: number
}

function CoursesPaginationComponent({
	currentPage,
	totalPages,
	totalCount,
	pageSize
}: CoursesPaginationProps) {
	const router = useRouter()
	const searchParams = useSearchParams()

	// Memoize navigation function to prevent recreating on every render
	const navigateToPage = useCallback((page: number) => {
		const params = new URLSearchParams(searchParams.toString())
		params.set('page', page.toString())
		router.push(`/dashboard/courses?${params.toString()}`)
	}, [router, searchParams])

	// Memoize computed values to prevent recalculation on every render
	const { startItem, endItem } = useMemo(() => ({
		startItem: totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1,
		endItem: Math.min(currentPage * pageSize, totalCount)
	}), [currentPage, pageSize, totalCount])

	// Memoize page numbers array generation
	const { pageNumbers, startPage, endPage } = useMemo(() => {
		const start = Math.max(1, currentPage - 2)
		const end = Math.min(totalPages, currentPage + 2)
		const numbers: number[] = []
		
		for (let i = start; i <= end; i++) {
			numbers.push(i)
		}
		
		return { pageNumbers: numbers, startPage: start, endPage: end }
	}, [currentPage, totalPages])

	if (totalCount === 0) {
		return (
			<div className="flex items-center justify-center py-4 text-sm text-gray-500">
				No courses found
			</div>
		)
	}

	return (
		<div className="flex items-center justify-between border-t px-4 py-4">
			<div className="text-sm text-gray-700 dark:text-gray-300">
				Showing <span className="font-medium">{startItem}</span> to{' '}
				<span className="font-medium">{endItem}</span> of{' '}
				<span className="font-medium">{totalCount}</span> course
				{totalCount !== 1 ? 's' : ''}
			</div>

			<div className="flex items-center gap-2">
				{/* Previous Button */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => navigateToPage(currentPage - 1)}
					disabled={currentPage === 1}
				>
					<ChevronLeft className="h-4 w-4" />
					<span className="sr-only">Previous page</span>
				</Button>

				{/* First page if not in range */}
				{startPage > 1 && (
					<>
						<Button
							variant={currentPage === 1 ? 'default' : 'outline'}
							size="sm"
							onClick={() => navigateToPage(1)}
						>
							1
						</Button>
						{startPage > 2 && (
							<span className="px-2 text-gray-500">...</span>
						)}
					</>
				)}

				{/* Page numbers */}
				{pageNumbers.map((page) => (
					<Button
						key={page}
						variant={currentPage === page ? 'default' : 'outline'}
						size="sm"
						onClick={() => navigateToPage(page)}
					>
						{page}
					</Button>
				))}

				{/* Last page if not in range */}
				{endPage < totalPages && (
					<>
						{endPage < totalPages - 1 && (
							<span className="px-2 text-gray-500">...</span>
						)}
						<Button
							variant={currentPage === totalPages ? 'default' : 'outline'}
							size="sm"
							onClick={() => navigateToPage(totalPages)}
						>
							{totalPages}
						</Button>
					</>
				)}

				{/* Next Button */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => navigateToPage(currentPage + 1)}
					disabled={currentPage === totalPages}
				>
					<ChevronRight className="h-4 w-4" />
					<span className="sr-only">Next page</span>
				</Button>
			</div>
		</div>
	)
}

// Memoize component to prevent unnecessary re-renders when parent re-renders
export const CoursesPagination = memo(CoursesPaginationComponent)

