/**
 * Authentication Server Actions
 * Replaces API routes with Server Actions for built-in CSRF protection
 * ✅ Next.js 15 Best Practice: Use Server Actions for mutations
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { checkRateLimit, resetRateLimit } from "@/lib/auth/rate-limit";
import { 
  validateEmailConfirmed, 
  updateUserRole 
} from "@/lib/auth/session";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";
import { USER_ROLES, ensureValidRole } from "@/lib/auth/constants";

// Validation schemas
const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(USER_ROLES as [UserRole, ...UserRole[]]).optional(),
});

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters").max(120),
  role: z.enum(USER_ROLES as [UserRole, ...UserRole[]]),
});

// Helper to get client IP
async function getClientIdentifier(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get("x-forwarded-for")?.split(",")[0] ||
    headersList.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Sign in action
 */
export async function signInAction(formData: FormData) {
  try {
    // Parse and validate input
    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role") || undefined,
    };

    const parsed = signInSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Invalid input",
      };
    }

    const { email, password, role: requestedRole } = parsed.data;

    // Rate limiting check
    const clientId = await getClientIdentifier();
    const rateLimitKey = `login:${clientId}:${email}`;
    const rateLimit = await checkRateLimit(rateLimitKey);

    if (!rateLimit.success) {
      return {
        success: false,
        error: rateLimit.error || "Too many attempts",
      };
    }

    // Attempt sign in
    const supabase = await createServerClient();
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return {
        success: false,
        error: signInError.message === "Invalid login credentials" 
          ? "Invalid email or password" 
          : signInError.message,
      };
    }

    const { user } = authData;
    if (!user) {
      return {
        success: false,
        error: "Authentication failed",
      };
    }

    // Validate email is confirmed
    const emailValidation = validateEmailConfirmed(user);
    if (!emailValidation.valid) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: emailValidation.error || "Email not verified",
      };
    }

    // Reset rate limit on successful login
    resetRateLimit(rateLimitKey);

    // Get or create user profile
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    // Determine final role (database takes precedence)
    const derivedRole = ensureValidRole(
      profile?.role ?? requestedRole ?? (user.user_metadata?.role as string)
    );

    // Upsert user profile
    const upsertPayload = {
      id: user.id,
      email: user.email ?? email,
      full_name:
        (user.user_metadata?.full_name as string | undefined) ??
        user.email ??
        email,
      role: derivedRole,
    };

    const { error: upsertError } = await supabase
      .from("users")
      .upsert(upsertPayload, { onConflict: "id" });

    if (upsertError) {
      console.error("Profile upsert error:", upsertError);
      // Don't fail login if profile update fails, but log it
    }

    // Store role in user metadata for faster middleware access
    await updateUserRole(derivedRole);

    // Revalidate paths
    revalidatePath("/", "layout");

    const redirectPath = redirectByRole(derivedRole);
    
    return {
      success: true,
      redirect: redirectPath,
      role: derivedRole,
    };
  } catch (error) {
    console.error("Sign in error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred during sign in",
    };
  }
}

/**
 * Sign up action
 */
export async function signUpAction(formData: FormData) {
  try {
    // Parse and validate input
    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
      fullName: formData.get("fullName"),
      role: formData.get("role"),
    };

    const parsed = signUpSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Invalid input",
      };
    }

    const { email, password, fullName, role } = parsed.data;

    // Rate limiting check
    const clientId = await getClientIdentifier();
    const rateLimitKey = `signup:${clientId}:${email}`;
    const rateLimit = await checkRateLimit(rateLimitKey);

    if (!rateLimit.success) {
      return {
        success: false,
        error: rateLimit.error || "Too many attempts",
      };
    }

    // Get origin for email redirect
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const origin = `${protocol}://${host}`;

    const supabase = await createServerClient();

    const metadata = {
      full_name: fullName.trim(),
      role,
    };

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${origin}/login`,
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Reset rate limit on successful signup
    resetRateLimit(rateLimitKey);

    return {
      success: true,
      message: "Account created! Please check your email to verify your account before signing in.",
    };
  } catch (error) {
    console.error("Sign up error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred during sign up",
    };
  }
}

/**
 * Sign out action
 */
export async function signOutAction() {
  try {
    const supabase = await createServerClient();
    
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate all paths
    revalidatePath("/", "layout");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Sign out error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred during sign out",
    };
  }
}

