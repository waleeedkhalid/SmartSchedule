import { redirect } from 'next/navigation'
import { createClient } from '@/supabase/server'
import { TimelineManagement } from './timeline-management'

export const metadata = {
	title: 'Timeline & Deadlines | SmartSchedule',
	description: 'Manage scheduling timeline and stakeholder deadlines',
}

export default async function TimelinePage() {
	const supabase = await createClient()

	// Check authentication
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/login')
	}

	// Check authorization
	const { data: userRole } = await supabase
		.from('user_roles')
		.select('role')
		.eq('user_id', user.id)
		.maybeSingle()

	if (!userRole || !['scheduling', 'registrar'].includes(userRole.role)) {
		redirect('/dashboard')
	}

	// Get active semester
	const { data: activeSemester } = await supabase
		.from('academic_semesters')
		.select('*')
		.eq('is_active', true)
		.single()

	// Get all semesters
	const { data: semesters } = await supabase
		.from('academic_semesters')
		.select('code, name, type')
		.order('start_date', { ascending: false })

	return (
		<TimelineManagement
			activeSemesterCode={activeSemester?.code || null}
			semesters={semesters || []}
			userRole={userRole.role}
		/>
	)
}

