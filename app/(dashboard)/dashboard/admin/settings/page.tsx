import { redirect } from "next/navigation";

/**
 * Legacy admin settings route - redirects to new scheduling settings page
 * This route is deprecated. Settings are now at /dashboard/scheduling/settings
 */
export default async function AdminSettingsPage() {
	// Redirect to new location
	redirect('/dashboard/scheduling/settings');
}

