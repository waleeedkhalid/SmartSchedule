import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CoursesLoading() {
	return (
		<div className="p-8">
			<div className="max-w-7xl mx-auto">
				{/* Header skeleton */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<Skeleton className="h-9 w-32 mb-2" />
						<Skeleton className="h-5 w-48" />
					</div>
					<Skeleton className="h-10 w-32" />
				</div>

				{/* Alert skeleton */}
				<div className="mb-6 rounded-lg border p-4">
					<Skeleton className="h-5 w-64 mb-2" />
					<Skeleton className="h-4 w-full mb-2" />
					<Skeleton className="h-4 w-3/4" />
				</div>

				{/* Card skeleton */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<Skeleton className="h-6 w-32 mb-2" />
								<Skeleton className="h-4 w-48" />
							</div>
							<Skeleton className="h-10 w-64" />
						</div>
					</CardHeader>
					<CardContent className="p-0">
						{/* Table skeleton */}
						<div className="border-t">
							<div className="p-4 space-y-3">
								{Array.from({ length: 20 }).map((_, i) => (
									<div key={i} className="flex items-center space-x-4">
										<Skeleton className="h-6 w-20" />
										<Skeleton className="h-6 w-64" />
										<Skeleton className="h-6 w-16" />
										<Skeleton className="h-6 w-16" />
										<Skeleton className="h-6 w-20" />
										<Skeleton className="h-6 w-20" />
										<Skeleton className="h-6 w-32" />
										<Skeleton className="h-6 w-20 ml-auto" />
									</div>
								))}
							</div>
						</div>
						{/* Pagination skeleton */}
						<div className="flex items-center justify-between border-t px-4 py-4">
							<Skeleton className="h-5 w-48" />
							<div className="flex items-center gap-2">
								<Skeleton className="h-9 w-9" />
								<Skeleton className="h-9 w-9" />
								<Skeleton className="h-9 w-9" />
								<Skeleton className="h-9 w-9" />
								<Skeleton className="h-9 w-9" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

