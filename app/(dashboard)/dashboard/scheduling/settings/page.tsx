import { redirect } from "next/navigation";
import { TimeGridConfigForm } from "@/components/time-grid-config-form";
import { getServerUser } from "@/lib/server-auth";
import { createClient } from "@/supabase/server";

export default async function SchedulingSettingsPage() {
	const user = await getServerUser();
	
	if (!user || user.role !== 'scheduling') {
		redirect('/dashboard');
	}

	// Fetch time grid config from database
	const supabase = await createClient();
	const { data: configData } = await supabase
		.from("time_grid_config")
		.select("*")
		.order("created_at", { ascending: false })
		.limit(1)
		.single();

	// Use defaults if no config exists
	const config = configData || {
		id: null,
		teaching_days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
		daily_start_time: '08:00:00',
		daily_end_time: '17:00:00',
		slot_duration_minutes: 60,
		break_start_time: '12:00:00',
		break_end_time: '13:00:00',
		exam_days: ['Saturday'],
		exam_start_time: '09:00:00',
		exam_end_time: '17:00:00',
		typical_lab_duration_minutes: 120,
	};

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

