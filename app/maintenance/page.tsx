import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Clock, Wrench, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function MaintenancePage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
			<div className="max-w-2xl w-full">
				<Card className="border-2 shadow-xl">
					<CardHeader className="text-center space-y-4 pb-8">
						<div className="flex justify-center">
							<div className="relative">
								<div className="absolute inset-0 bg-yellow-400 blur-xl opacity-50 animate-pulse"></div>
								<div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-6">
									<Wrench className="h-16 w-16 text-white" />
								</div>
							</div>
						</div>
						<CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
							System Under Maintenance
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
							<div className="flex items-start gap-3">
								<AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
								<div className="space-y-1">
									<p className="font-medium text-yellow-900 dark:text-yellow-100">
										Database Schema Migration in Progress
									</p>
									<p className="text-sm text-yellow-800 dark:text-yellow-200">
										We're currently updating our database structure to improve performance and add new features.
									</p>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<h3 className="font-semibold text-lg flex items-center gap-2">
								<Clock className="h-5 w-5 text-blue-500" />
								What's Being Updated
							</h3>
							<ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 ml-7">
								<li className="flex items-start gap-2">
									<span className="text-blue-500 mt-1">•</span>
									<span>Schedule comment system (multi-user support)</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-blue-500 mt-1">•</span>
									<span>Faculty dashboard and feedback features</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-blue-500 mt-1">•</span>
									<span>Student comment management interface</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-blue-500 mt-1">•</span>
									<span>Database query optimizations</span>
								</li>
							</ul>
						</div>

						<div className="space-y-4">
							<h3 className="font-semibold text-lg flex items-center gap-2">
								<Wrench className="h-5 w-5 text-purple-500" />
								Technical Details
							</h3>
							<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2 text-sm font-mono">
								<p className="text-gray-600 dark:text-gray-300">
									<span className="text-purple-600 dark:text-purple-400">Migration:</span> schedule_comment.student_id → author_id
								</p>
								<p className="text-gray-600 dark:text-gray-300">
									<span className="text-purple-600 dark:text-purple-400">Status:</span> Updating foreign key references
								</p>
								<p className="text-gray-600 dark:text-gray-300">
									<span className="text-purple-600 dark:text-purple-400">ETA:</span> ~30 minutes
								</p>
							</div>
						</div>

						<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
							<p className="text-sm text-blue-900 dark:text-blue-100">
								<span className="font-semibold">Good news!</span> Other parts of the system are still accessible. 
								You can return to the main dashboard and use other features.
							</p>
						</div>

						<div className="pt-4 flex flex-col sm:flex-row gap-3">
							<Button asChild className="flex-1" size="lg">
								<Link href="/dashboard">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Return to Dashboard
								</Link>
							</Button>
							<Button 
								asChild 
								variant="outline" 
								className="flex-1"
								size="lg"
							>
								<a 
									href="https://github.com/yourusername/SSv2/issues" 
									target="_blank" 
									rel="noopener noreferrer"
								>
									Report Issue
								</a>
							</Button>
						</div>

						<div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-4 border-t">
							Last updated: {new Date().toLocaleString()} • Contact: support@smartschedule.xyz
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

