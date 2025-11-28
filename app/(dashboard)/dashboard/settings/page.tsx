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

	// Get user profile data with error handling
	let userRole;
	let roleError;
	
	try {
		const result = await supabase
			.from('user_roles')
			.select('name, email')
			.eq('user_id', user.id)
			.maybeSingle();
		
		userRole = result.data;
		roleError = result.error;
	} catch (error) {
		// Catch any unexpected errors (network issues, etc.)
		console.warn('Unexpected error fetching user profile in settings:', error);
		redirect('/dashboard');
	}

	// Handle errors gracefully
	if (roleError) {
		// Handle PGRST errors specifically - these are query/RLS issues
		if (roleError.code?.startsWith('PGRST')) {
			console.warn('user_roles query error (PGRST) in settings:', {
				code: roleError.code,
				message: roleError.message,
			});
		} else if (roleError.code !== 'PGRST116') {
			// PGRST116 is "not found" - expected, don't log
			console.error('Error fetching user profile:', roleError);
		}
		redirect('/dashboard');
	}

	if (!userRole) {
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

