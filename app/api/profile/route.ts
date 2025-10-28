import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'

export async function PATCH(request: NextRequest) {
	try {
		const supabase = await createClient()
		
		// Check authentication
		const { data: { user }, error: authError } = await supabase.auth.getUser()
		
		if (authError || !user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await request.json()
		const { name, email, currentPassword, newPassword } = body

		// Validate required fields
		if (!name || !email) {
			return NextResponse.json(
				{ error: 'Name and email are required' },
				{ status: 400 }
			)
		}

		// Update name in user_roles table
		const { error: nameUpdateError } = await supabase
			.from('user_roles')
			.update({ 
				name,
				updated_at: new Date().toISOString()
			})
			.eq('user_id', user.id)

		if (nameUpdateError) {
			console.error('Error updating name:', nameUpdateError)
			return NextResponse.json(
				{ error: 'Failed to update name' },
				{ status: 500 }
			)
		}

		// Update email if changed
		if (email !== user.email) {
			const { error: emailUpdateError } = await supabase.auth.updateUser({
				email: email
			})

			if (emailUpdateError) {
				console.error('Error updating email:', emailUpdateError)
				return NextResponse.json(
					{ error: 'Failed to update email. Please check if the email is already in use.' },
					{ status: 400 }
				)
			}

			// Also update email in user_roles table
			await supabase
				.from('user_roles')
				.update({ 
					email,
					updated_at: new Date().toISOString()
				})
				.eq('user_id', user.id)
		}

		// Update password if provided
		if (currentPassword && newPassword) {
			// Verify current password by attempting to sign in
			const { error: signInError } = await supabase.auth.signInWithPassword({
				email: user.email!,
				password: currentPassword,
			})

			if (signInError) {
				return NextResponse.json(
					{ error: 'Current password is incorrect' },
					{ status: 400 }
				)
			}

			// Update to new password
			const { error: passwordUpdateError } = await supabase.auth.updateUser({
				password: newPassword
			})

			if (passwordUpdateError) {
				console.error('Error updating password:', passwordUpdateError)
				return NextResponse.json(
					{ error: 'Failed to update password' },
					{ status: 500 }
				)
			}
		}

		return NextResponse.json({ 
			success: true,
			message: 'Profile updated successfully'
		})
	} catch (error) {
		console.error('Unexpected error in profile update:', error)
		return NextResponse.json(
			{ error: 'An unexpected error occurred' },
			{ status: 500 }
		)
	}
}

