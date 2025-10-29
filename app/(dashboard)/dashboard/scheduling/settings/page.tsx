import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { TimeGridConfigForm } from "@/components/time-grid-config-form";
import { getTimeGridConfig } from "@/lib/db/config";

export default async function SchedulingSettingsPage() {
	const supabase = await createClient();
	
	// Check authentication
	const { data: { user }, error: authError } = await supabase.auth.getUser();
	
	if (authError || !user) {
		redirect('/login');
	}

	// Check user role - only scheduling role can access
	const { data: userRole, error: roleError } = await supabase
		.from('user_roles')
		.select('role')
		.eq('user_id', user.id)
		.maybeSingle();

	// Only allow scheduling role (admin privileges)
	if (roleError || !userRole || userRole.role !== 'scheduling') {
		redirect('/dashboard');
	}

	const config = await getTimeGridConfig();

	return (
		<div className="p-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
					Scheduling Settings
				</h1>
				<p className="text-gray-600 dark:text-gray-400 mb-8">
					Configure the time grid and scheduling parameters
				</p>

				<TimeGridConfigForm initialConfig={config} />
			</div>
		</div>
	);
}

