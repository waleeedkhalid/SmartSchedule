'use server';

import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type OnboardingState = {
    message?: string;
    error?: string;
    success?: boolean;
};

export async function submitOnboarding(prevState: OnboardingState, formData: FormData): Promise<OnboardingState> {
    const supabase = await createClient();

    // 1. Authenticate User
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: "Unauthorized. Please log in again." };
    }

    const userId = user.id;
    const userRole = formData.get("userRole") as string;
    const userName = formData.get("userName") as string;
    const email = user.email;

    if (!userRole) {
        return { error: "User role is missing." };
    }

    try {
        let profileCreated = false;

        // 2. Create Profile based on Role
        if (userRole === "student") {
            const academicLevel = formData.get("academicLevel");
            const enrollmentYear = formData.get("enrollmentYear");

            if (!academicLevel || !enrollmentYear) {
                return { error: "Missing required fields." };
            }

            const { error: profileError } = await supabase
                .from("student_profile")
                .insert({
                    user_id: userId,
                    level: parseInt(academicLevel.toString()),
                    department: "Software Engineering",
                    enrollment_year: parseInt(enrollmentYear.toString()),
                })
                .select()
                .single();

            if (profileError) {
                if (profileError.code === "23505") {
                    // Already exists, treat as success
                    profileCreated = true;
                } else {
                    return { error: `Failed to create student profile: ${profileError.message}` };
                }
            } else {
                profileCreated = true;
            }

        } else if (userRole === "faculty") {
            // Upsert faculty profile
            const { error: profileError } = await supabase
                .from("faculty_profile")
                .upsert({
                    user_id: userId,
                    department: "Software Engineering",
                    name: userName,
                    email: email,
                    max_load_per_week: 12,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' })
                .select()
                .single();

            if (profileError) {
                return { error: `Failed to create faculty profile: ${profileError.message}` };
            }
            profileCreated = true;

        } else if (["scheduling", "teaching_load", "registrar"].includes(userRole)) {
            // Upsert committee profile
            const { error: profileError } = await supabase
                .from("committee_profile")
                .upsert({
                    user_id: userId,
                    role: userRole,
                    department: "Software Engineering",
                }, { onConflict: 'user_id' })
                .select()
                .single();

            if (profileError) {
                return { error: `Failed to create committee profile: ${profileError.message}` };
            }
            profileCreated = true;
        }

        // 3. Update User Roles & Metadata
        if (profileCreated) {
            // Update user_roles table
            const { error: roleError } = await supabase
                .from("user_roles")
                .update({
                    onboarding_completed: true,
                    updated_at: new Date().toISOString(),
                })
                .eq("user_id", userId);

            if (roleError) {
                return { error: `Failed to update user role status: ${roleError.message}` };
            }

            // CRITICAL: Update Auth Metadata for Middleware
            const { error: metadataError } = await supabase.auth.updateUser({
                data: { onboarding_completed: true }
            });

            if (metadataError) {
                console.error("Failed to update auth metadata:", metadataError);
                // Continue anyway as DB is updated
            }
        }

    } catch (error) {
        console.error("Onboarding error:", error);
        return { error: "An unexpected error occurred." };
    }

    // 4. Redirect
    // We use the redirect function which throws an error, so it must be outside try/catch
    // or re-thrown.
    revalidatePath('/mobile/schedule');
    revalidatePath('/dashboard');

    // Determine redirect path
    const redirectPath = formData.get("redirectPath") as string || "/mobile/schedule";
    redirect(redirectPath);
}
