'use client'

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

function CoursesSearchComponent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
	const isFirstRender = useRef(true)

	// Sync local state with URL when navigating with browser buttons
	useEffect(() => {
		const urlSearch = searchParams.get('search') || ''
		// Only update if different to avoid unnecessary re-renders
		setSearchTerm(prevTerm => prevTerm === urlSearch ? prevTerm : urlSearch)
	}, [searchParams])

	// Debounced search effect - only triggers when searchTerm changes
	useEffect(() => {
		// Skip effect on first render to avoid unnecessary navigation
		if (isFirstRender.current) {
			isFirstRender.current = false
			return
		}

		const timer = setTimeout(() => {
			const currentSearch = searchParams.get('search') || ''
			
			// Only update URL if search term actually changed
			if (searchTerm.trim() !== currentSearch) {
				const params = new URLSearchParams(searchParams.toString())
				// Reset to page 1 when searching
				params.set('page', '1')
				
				if (searchTerm.trim()) {
					params.set('search', searchTerm.trim())
				} else {
					params.delete('search')
				}
				
				router.push(`/dashboard/courses?${params.toString()}`)
			}
		}, 500) // 500ms debounce

		return () => clearTimeout(timer)
	}, [searchTerm, router, searchParams])

	// Memoize event handlers to prevent unnecessary re-renders
	const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value)
	}, [])

	const handleClear = useCallback(() => {
		setSearchTerm('')
	}, [])

	return (
		<div className="relative max-w-sm">
			<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
			<Input
				type="text"
				placeholder="Search by course code or title..."
				value={searchTerm}
				onChange={handleChange}
				className="pl-10 pr-10"
			/>
			{searchTerm && (
				<Button
					variant="ghost"
					size="sm"
					onClick={handleClear}
					className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
				>
					<X className="h-4 w-4" />
					<span className="sr-only">Clear search</span>
				</Button>
			)}
		</div>
	)
}

// Memoize component to prevent unnecessary re-renders when parent re-renders
export const CoursesSearch = memo(CoursesSearchComponent)

