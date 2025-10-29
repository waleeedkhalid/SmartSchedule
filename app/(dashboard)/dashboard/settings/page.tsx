import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { ProfileEditForm } from "@/components/profile-edit-form";

export default async function SettingsPage() {
	const supabase = await createClient();
	
	// Get current user
	const { data: { user }, error: authError } = await supabase.auth.getUser();
	
	if (authError || !user) {
		redirect('/login');
	}

	// Get user profile data
	const { data: userRole, error: roleError } = await supabase
		.from('user_roles')
		.select('name, email')
		.eq('user_id', user.id)
		.maybeSingle();

	if (roleError || !userRole) {
		console.error('Error fetching user profile:', roleError);
		redirect('/dashboard');
	}

	return (
		<div className="p-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
					Profile Settings
				</h1>
				<p className="text-gray-600 dark:text-gray-400 mb-8">
					Manage your account information and preferences
				</p>

				<ProfileEditForm 
					initialName={userRole.name}
					initialEmail={userRole.email}
				/>
			</div>
		</div>
	);
}

