import { redirect } from "next/navigation";
import { TimeGridConfigForm } from "@/components/time-grid-config-form";
import { getMockUserRole, getMockTimeGridConfig } from "@/lib/demo-data";

export default async function SchedulingSettingsPage() {
	// DEMO MODE: Use mock user data
	const userRole = await getMockUserRole();
	
	if (!userRole || userRole.role !== 'scheduling') {
		redirect('/dashboard');
	}

	const config = await getMockTimeGridConfig();

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

