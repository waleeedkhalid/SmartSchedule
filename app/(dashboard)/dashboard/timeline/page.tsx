import { redirect } from 'next/navigation'
import { createClient } from '@/supabase/server'
import { TimelineManagement } from './timeline-management'
import { getServerUser } from '@/lib/server-auth'

export const metadata = {
	title: 'Timeline & Deadlines | SmartSchedule',
	description: 'Manage scheduling timeline and stakeholder deadlines',
}

export default async function TimelinePage() {
	// Get authenticated user (supports both demo and Supabase)
	const user = await getServerUser()

	// If not authenticated, redirect to login
	if (!user) {
		redirect('/login')
	}

	// Check authorization - only scheduling and registrar roles can access
	if (!['scheduling', 'registrar'].includes(user.role)) {
		redirect('/dashboard')
	}

	// Create Supabase client for database queries
	const supabase = await createClient()

	// Get active semester (current term with status 'draft' or 'released')
	// Note: Using academic_term table which exists in the database
	// The academic_semesters table from migrations hasn't been applied yet
	const { data: activeSemester, error: activeSemesterError } = await supabase
		.from('academic_term')
		.select('code, name, start_date, end_date, status')
		.in('status', ['draft', 'released'])
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle()

	// Get all semesters (academic terms)
	const { data: semesters, error: semestersError } = await supabase
		.from('academic_term')
		.select('code, name, start_date')
		.order('start_date', { ascending: false })

	// Handle errors gracefully
	if (activeSemesterError) {
		console.error('Error fetching active semester:', activeSemesterError);
	}

	if (semestersError) {
		console.error('Error fetching semesters:', semestersError);
	}

	// Map academic_term data to the format expected by TimelineManagement
	// TimelineManagement expects: { code: string, name: string, type: string }
	type AcademicTerm = {
		code: string
		name: string
		start_date: string | null
	}
	const mappedSemesters = (semesters || []).map((term: AcademicTerm) => ({
		code: term.code,
		name: term.name,
	}))

	return (
		<TimelineManagement
			activeSemesterCode={activeSemester?.code || null}
			semesters={mappedSemesters}
			userRole={user.role}
		/>
	)
}

