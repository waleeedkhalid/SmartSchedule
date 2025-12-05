/**
 * Authentication Server Actions
 *
 * Server Actions for authentication following Next.js 16+ best practices.
 * Uses the new useActionState pattern with proper form validation.
 *
 * These actions:
 * 1. Validate form fields on the server using Zod
 * 2. Authenticate with Supabase Auth
 * 3. Create application sessions using our session management layer
 * 4. Redirect to the appropriate dashboard
 *
 * @see https://nextjs.org/docs/app/guides/authentication
 */

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createSession, deleteSession } from "@/lib/session";
import { getDashboardPathForRole } from "@/lib/dal";
import {
  LoginFormSchema,
  SignupFormSchema,
  type LoginFormState,
  type SignupFormState,
  type UserRole,
} from "@/lib/definitions";

// ============================================================================
// Login Action
// ============================================================================

/**
 * Server Action for user login
 *
 * Signature: (state, formData) => state for use with useActionState
 *
 * @param state - Previous form state (for validation errors)
 * @param formData - Form data from the login form
 * @returns Form state with errors, or redirects on success
 */
export async function login(
  state: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  // 1. Validate form fields
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // Return early if validation fails
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  // 2. Authenticate with Supabase
  const supabase = await createClient();

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError || !authData.user) {
    return {
      message: "Invalid email or password. Please try again.",
    };
  }

  // 3. Fetch user role
  let userRole: { role: string; name: string } | null = null;

  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role, name")
      .eq("user_id", authData.user.id)
      .single();

    if (error) {
      // PGRST116 is "not found"
      if (error.code === "PGRST116") {
        return {
          message: "Please complete onboarding to continue.",
        };
      }
      console.error("Error fetching user role:", error);
      return {
        message: "An error occurred. Please try again.",
      };
    }

    userRole = data;
  } catch (error) {
    console.error("Unexpected error fetching user role:", error);
    return {
      message: "An error occurred. Please try again.",
    };
  }

  if (!userRole) {
    return {
      message: "Please complete onboarding to continue.",
    };
  }

  // 4. Create application session
  await createSession(authData.user.id, userRole.role);

  // 5. Redirect to role-specific dashboard
  const dashboardPath = getDashboardPathForRole(userRole.role);
  redirect(dashboardPath);
}

// ============================================================================
// Signup Action
// ============================================================================

/**
 * Server Action for user signup
 *
 * Signature: (state, formData) => state for use with useActionState
 *
 * @param state - Previous form state (for validation errors)
 * @param formData - Form data from the signup form
 * @returns Form state with errors or success message
 */
export async function signup(
  state: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  // 1. Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  // Return early if validation fails
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password, role } = validatedFields.data;

  // 2. Sign up with Supabase Auth
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        role: role,
      },
    },
  });

  if (authError) {
    // Handle specific error cases
    if (authError.message.includes("already registered")) {
      return {
        errors: {
          email: ["This email is already registered. Please sign in instead."],
        },
      };
    }
    return {
      message:
        authError.message || "Failed to create account. Please try again.",
    };
  }

  if (!authData.user) {
    return {
      message: "Failed to create account. Please try again.",
    };
  }

  // 3. Ensure user_roles entry is created (trigger should handle this, but we verify)
  await ensureUserRoleEntry(authData.user.id, email, name, role);

  // 4. Return success - user needs to confirm email or complete onboarding
  // Note: We don't create a session here because email confirmation may be required
  return {
    message:
      "Account created successfully! Please check your email to confirm your account.",
  };
}

// ============================================================================
// Logout Action
// ============================================================================

/**
 * Server Action for user logout
 *
 * Clears both the application session and Supabase session.
 */
export async function logout(): Promise<void> {
  // 1. Delete application session
  await deleteSession();

  // 2. Sign out from Supabase
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (error) {
    // Even if Supabase signout fails, we've cleared our session
    console.error("Error signing out from Supabase:", error);
  }

  // 3. Redirect to login
  redirect("/login");
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Ensure a user_roles entry exists for the user
 *
 * The database trigger should create this automatically, but we verify
 * and create manually if needed (race condition handling).
 */
async function ensureUserRoleEntry(
  userId: string,
  email: string,
  name: string,
  role: UserRole
): Promise<void> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    // Without service role key, we rely on the trigger
    console.warn(
      "SUPABASE_SERVICE_ROLE_KEY not set. Relying on trigger to create user_roles entry."
    );
    return;
  }

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Wait for trigger with retry logic
  let existingRole = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, 200 * Math.pow(2, attempt - 1))
      );
    }

    try {
      const { data, error } = await serviceClient
        .from("user_roles")
        .select("user_id")
        .eq("user_id", userId)
        .single();

      if (!error && data) {
        existingRole = data;
        break;
      }

      // PGRST116 is "not found" - expected, continue retrying
      if (error?.code !== "PGRST116") {
        console.warn(
          `Error checking user_roles (attempt ${attempt + 1}):`,
          error
        );
      }
    } catch (error) {
      console.warn(
        `Unexpected error checking user_roles (attempt ${attempt + 1}):`,
        error
      );
    }
  }

  // If role doesn't exist, create it manually
  if (!existingRole) {
    try {
      const { error } = await serviceClient.from("user_roles").insert({
        user_id: userId,
        email,
        name,
        role,
      });

      if (error) {
        // Ignore duplicate key errors (trigger may have run)
        if (error.code !== "23505") {
          console.error("Failed to create user_roles entry:", error);
        }
      } else {
        console.log("Created user_roles entry manually");
      }
    } catch (error) {
      console.error("Unexpected error creating user_roles entry:", error);
    }
  }
}
