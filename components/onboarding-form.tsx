/**
 * User Onboarding Form Component
 *
 * Purpose: First-time user profile setup for new SmartSchedule users
 *
 * Trigger Conditions:
 * - User logs in for the first time
 * - onboarding_completed flag is FALSE in user_roles table
 * - OR role-specific profile doesn't exist
 *
 * Flow Logic:
 * 1. Detect incomplete onboarding via server-auth.ts validateOnboardingAndProfile()
 * 2. Redirect to /onboarding page
 * 3. Display simple form (this component)
 * 4. Collect: Academic Level (for students), Program (prefilled)
 * 5. Submit via Supabase client-side mutation
 * 6. Create role-specific profile (student_profile, faculty_profile, or committee_profile)
 * 7. Set onboarding_completed = TRUE in user_roles table
 * 8. Redirect to appropriate dashboard
 *
 * Validation:
 * - All required fields validated client-side
 * - Academic level: 4-8 (level determines which courses student takes)
 * - Confirmation checkbox must be checked
 *
 * User Experience:
 * - Shows only once per user (onboarding_completed flag)
 * - Simple, clear interface
 * - Smooth transition after completion
 * - Inline error states (no alert popups)
 *
 * Security:
 * - Direct Supabase mutations (no server round trips)
 * - RLS policies enforce user can only create/update own profile
 * - Client-side and database-level validation
 */

"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GraduationCap, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/lib/types/database";

// Lazy load heavy Card and Select components
const Card = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.Card),
  { ssr: false }
);
const CardContent = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardContent),
  { ssr: false }
);
const CardDescription = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardDescription),
  { ssr: false }
);
const CardHeader = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardHeader),
  { ssr: false }
);
const CardTitle = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardTitle),
  { ssr: false }
);
const Select = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.Select),
  { ssr: false }
);
const SelectContent = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectContent),
  { ssr: false }
);
const SelectItem = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectItem),
  { ssr: false }
);
const SelectTrigger = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectTrigger),
  { ssr: false }
);
const SelectValue = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectValue),
  { ssr: false }
);

type StudentProfileInsert =
  Database["public"]["Tables"]["student_profile"]["Insert"];

interface OnboardingFormProps {
  userId: string;
  userName: string;
  userRole:
    | "student"
    | "faculty"
    | "scheduling"
    | "teaching_load"
    | "registrar";
}

export function OnboardingForm({
  userId,
  userName,
  userRole,
}: OnboardingFormProps) {
  // Hydration Fix: Use state for time-dependent data
  const [mounted, setMounted] = useState(false);
  const [currentHijriYear, setCurrentHijriYear] = useState<number>(1445); // Default safe value

  useEffect(() => {
    setMounted(true);
    // Calculate Hijri year only on client after mount
    const calculateHijriYear = (): number => {
      const currentDate = new Date();
      try {
        const hijriFormatter = new Intl.DateTimeFormat(
          "en-u-ca-islamic-umalqura",
          {
            year: "numeric",
          }
        );
        const parts = hijriFormatter.formatToParts(currentDate);
        const yearPart = parts.find((part) => part.type === "year");
        if (yearPart) {
          const yearValue = parseInt(yearPart.value, 10);
          if (!isNaN(yearValue) && yearValue >= 1400 && yearValue <= 1500) {
            return yearValue;
          }
        }
      } catch (e) {
        console.warn("Error calculating Hijri year:", e);
      }
      return new Date().getFullYear() - 621;
    };

    setCurrentHijriYear(calculateHijriYear());
  }, []);

  // Form state
  const [academicLevel, setAcademicLevel] = useState<string>("4");
  const [enrollmentYear, setEnrollmentYear] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Academic level options (1-8 for full system support)
  // DO NOT CHANGE THIS ARRAY. IT IS USED TO GENERATE THE LEVEL OPTIONS FOR THE SELECT DROP DOWN.
  // Our scope is only for levels 4-8.
  const levelOptions = [4, 5, 6, 7, 8];

  // Generate enrollment year options based on current Hijri year
  // Memoize this or just calculate it render-time since it depends on state now
  const enrollmentYearOptions = mounted
    ? Array.from({ length: 11 }, (_, i) => currentHijriYear - 10 + i)
        .filter((year) => !isNaN(year) && year > 0 && Number.isInteger(year))
        .reverse()
    : [];

  // Set default enrollment year once mounted
  useEffect(() => {
    if (mounted && currentHijriYear && !enrollmentYear) {
      setEnrollmentYear(currentHijriYear.toString());
    }
  }, [mounted, currentHijriYear, enrollmentYear]);

  /**
   * Validate form before submission
   * Returns true if validation passes, false otherwise
   */
  function validateForm(): boolean {
    const newErrors: { [key: string]: string } = {};

    // Check academic level for students
    if (userRole === "student") {
      if (!academicLevel || academicLevel.trim() === "") {
        newErrors.academicLevel = "Please select your academic level";
      }

      // Check enrollment year for students
      if (!enrollmentYear || enrollmentYear.trim() === "") {
        newErrors.enrollmentYear = "Please select your enrollment year";
      } else {
        const year = parseInt(enrollmentYear, 10);
        if (isNaN(year) || year < 1400 || year > 1500) {
          newErrors.enrollmentYear =
            "Please enter a valid Hijri year (1400-1500)";
        }
      }
    }

    // Check confirmation checkbox
    if (!confirmed) {
      newErrors.confirmed = "Please confirm that your information is accurate";
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;

    console.log("Validation check:", {
      userRole,
      academicLevel,
      enrollmentYear,
      confirmed,
      isValid,
      errors: newErrors,
    });

    return isValid;
  }

  /**
   * Submit onboarding data to Supabase
   *
   * Process:
   * 1. Validate all required fields
   * 2. Update user_roles table with profile data
   * 3. Set onboarding_completed = TRUE
   * 4. Trigger auto-sync of student groups (happens automatically via DB trigger)
   * 5. Redirect to appropriate dashboard based on role
   */
  async function handleSubmit(e?: React.MouseEvent<HTMLButtonElement>) {
    // Prevent default form submission if called from button click
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Early return if already submitting or redirecting
    if (isSubmitting || isRedirecting) {
      console.log(
        "Already submitting or redirecting, ignoring duplicate click"
      );
      return;
    }

    console.log("Onboarding form submit started", {
      userRole,
      userId,
      userName,
      confirmed,
      academicLevel,
    });
    setSubmitError(null);

    // Validate form BEFORE setting isSubmitting to prevent stuck loading state
    // Double-check values directly instead of relying on state
    const hasValidLevel =
      userRole !== "student" || (academicLevel && academicLevel.trim() !== "");
    const hasValidEnrollmentYear =
      userRole !== "student" ||
      (enrollmentYear && enrollmentYear.trim() !== "");
    const hasConfirmed = confirmed === true;

    console.log("Pre-validation check:", {
      userRole,
      academicLevel,
      enrollmentYear,
      confirmed,
      hasValidLevel,
      hasValidEnrollmentYear,
      hasConfirmed,
    });

    if (!hasValidLevel || !hasValidEnrollmentYear || !hasConfirmed) {
      // Run validation to set error messages
      validateForm();

      // Show error toast with specific messages
      if (!hasConfirmed) {
        toast.error("Please confirm that your information is accurate");
      }
      if (!hasValidLevel) {
        toast.error("Please select your academic level");
      }
      if (!hasValidEnrollmentYear) {
        toast.error("Please select your enrollment year");
      }
      // Don't set isSubmitting - validation failed, button should remain clickable
      return;
    }

    // Validation passed - now run validateForm to clear any previous errors
    validateForm();

    console.log("Form validated, starting submission...");
    setIsSubmitting(true);
    setSubmitError(null);

    // Add timeout safeguard - if submission takes more than 60 seconds, reset button
    // Increased from 30s to 60s to handle slow connections
    const timeoutId: NodeJS.Timeout = setTimeout(() => {
      console.warn(
        "Onboarding submission taking too long, resetting button state"
      );
      setIsSubmitting(false);
      setSubmitError(
        "Submission timed out. Please check your internet connection and try again."
      );
      toast.error(
        "Submission is taking longer than expected. Please try again."
      );
    }, 60000);

    // Create Supabase client for this operation
    let supabase;
    try {
      supabase = createClient();
      console.log("Supabase client created");
    } catch (clientError) {
      clearTimeout(timeoutId);
      console.error("Failed to create Supabase client:", clientError);
      const errMsg =
        "Failed to initialize database connection. Please refresh the page and try again.";
      setSubmitError(errMsg);
      toast.error(errMsg);
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Starting profile creation for role:", userRole);
      // CRITICAL FIX: Create profile FIRST, then set onboarding_completed flag
      // This prevents inconsistent state if profile creation fails

      // Create role-specific profile based on user role
      let profileCreated = false;

      if (userRole === "student") {
        // Create student_profile for students
        console.log("Creating student profile...");
        const enrollmentYearInt = parseInt(enrollmentYear, 10);
        const profileData: StudentProfileInsert = {
          user_id: userId,
          level: parseInt(academicLevel),
          department: "Software Engineering",
          enrollment_year: enrollmentYearInt,
        };

        // Use upsert to handle case where profile already exists
        // This updates the profile if it exists, or creates it if it doesn't
        const { data: studentData, error: profileError } = await (
          supabase
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .from("student_profile") as any
        )
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .upsert(profileData as any)
          .select()
          .single();

        console.log("Student profile upsert result:", {
          data: studentData,
          error: profileError,
        });

        if (profileError) {
          console.error("Error creating/updating student_profile:", {
            error: profileError,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
            code: profileError.code,
          });

          let errMsg = `Failed to create student profile: ${
            profileError.message || "Unknown error"
          }`;

          // Check for RLS violations
          // PostgrestError doesn't have status, but code indicates the error type
          if (
            profileError.code?.startsWith("PGRST") ||
            profileError.code === "42501"
          ) {
            // PGRST errors or permission denied (42501)
            errMsg = `Permission denied: Unable to create student profile. Please ensure you are logged in as a student.`;
          } else if (profileError.code === "23503") {
            // Foreign key violation
            errMsg = "Invalid user ID. Please log out and log back in.";
          } else if (profileError.code === "23514") {
            // Check constraint violation (e.g., level out of range)
            errMsg = `Invalid data: ${
              profileError.message || "Please check your input values."
            }`;
          }

          clearTimeout(timeoutId);
          setSubmitError(errMsg);
          toast.error(errMsg);
          setIsSubmitting(false);
          return;
        }
        console.log("Student profile created/updated successfully");
        profileCreated = true;
      } else if (userRole === "faculty") {
        // Create faculty_profile for faculty with all instructor data directly
        // Get user email from auth
        console.log("Getting user email for faculty profile creation...");

        try {
          const {
            data: { user: authUser },
            error: authError,
          } = await supabase.auth.getUser();

          if (authError) {
            console.error("Error getting auth user:", authError);
            const errMsg = `Failed to get user information: ${authError.message}. Please try again.`;
            clearTimeout(timeoutId);
            setSubmitError(errMsg);
            toast.error(errMsg);
            setIsSubmitting(false);
            return;
          }

          if (!authUser?.email) {
            console.error(
              "Error: Could not get user email for faculty profile creation"
            );
            const errMsg =
              "Failed to get user email. Please try again or contact support.";
            clearTimeout(timeoutId);
            setSubmitError(errMsg);
            toast.error(errMsg);
            setIsSubmitting(false);
            return;
          }

          console.log("Creating faculty profile with email:", authUser.email);

          // First, check if profile already exists
          console.log("Checking if faculty profile already exists...");
          const { data: existingProfile, error: checkError } = await (
            supabase
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .from("faculty_profile") as any
          )
            .select("user_id, name, email")
            .eq("user_id", userId)
            .maybeSingle();

          console.log("Profile check result:", {
            existing: existingProfile,
            error: checkError,
          });

          if (existingProfile) {
            // Profile already exists - update it
            console.log("Faculty profile already exists, updating instead...");
            const { data: updateData, error: updateError } = await (
              supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from("faculty_profile") as any
            )
              .update({
                name: userName,
                email: authUser.email,
                max_load_per_week: existingProfile.max_load_per_week || 12,
                updated_at: new Date().toISOString(),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any)
              .eq("user_id", userId)
              .select()
              .single();

            console.log("Update result:", {
              data: updateData,
              error: updateError,
            });

            if (updateError) {
              console.error("Error updating faculty profile:", updateError);
              const errMsg = `Failed to update faculty profile: ${
                updateError.message || "Unknown error"
              }`;
              clearTimeout(timeoutId);
              setSubmitError(errMsg);
              toast.error(errMsg);
              setIsSubmitting(false);
              return;
            }
            // Update succeeded
            console.log("Faculty profile updated successfully");
            profileCreated = true;
          } else {
            // Profile doesn't exist - create it
            console.log("Faculty profile does not exist, creating new one...");
            const { data: insertData, error: profileError } = await (
              supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from("faculty_profile") as any
            )
              .insert({
                user_id: userId,
                department: "Software Engineering",
                name: userName,
                email: authUser.email,
                max_load_per_week: 12, // Default value
                preferred_times: [], // Empty array for JSONB
                unavailable_times: [], // Empty array for JSONB
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any)
              .select()
              .single();

            console.log("Insert result:", {
              data: insertData,
              error: profileError,
            });

            if (profileError) {
              console.error("Error creating faculty_profile:", {
                error: profileError,
                message: profileError.message,
                details: profileError.details,
                hint: profileError.hint,
                code: profileError.code,
              });

              // Check if it's a duplicate key error (race condition - profile was created between check and insert)
              if (profileError.code === "23505") {
                // Profile was created by another request - try to update it
                console.log(
                  "Profile was created between check and insert, updating instead..."
                );
                const { error: updateError } = await (
                  supabase
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .from("faculty_profile") as any
                )
                  .update({
                    name: userName,
                    email: authUser.email,
                    updated_at: new Date().toISOString(),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  } as any)
                  .eq("user_id", userId)
                  .select()
                  .single();

                if (updateError) {
                  console.error(
                    "Error updating faculty profile after race condition:",
                    updateError
                  );
                  const errMsg = `Failed to update faculty profile: ${
                    updateError.message || "Unknown error"
                  }`;
                  clearTimeout(timeoutId);
                  setSubmitError(errMsg);
                  toast.error(errMsg);
                  setIsSubmitting(false);
                  return;
                }
                console.log(
                  "Faculty profile updated successfully after race condition"
                );
                profileCreated = true;
              } else {
                // Other error - show message
                const errorMsg = profileError.message || "Unknown error";
                console.error("Failed to create faculty profile:", errorMsg);
                clearTimeout(timeoutId);
                setSubmitError(`Failed to create faculty profile: ${errorMsg}`);
                toast.error(`Failed to create faculty profile: ${errorMsg}`);
                setIsSubmitting(false);
                return;
              }
            } else {
              // Insert succeeded
              console.log("Faculty profile created successfully:", insertData);
              profileCreated = true;
            }
          }
        } catch (authErr) {
          // Catch any unexpected errors from auth.getUser()
          console.error("Unexpected error getting auth user:", authErr);
          const errMsg = `Unexpected error: ${
            authErr instanceof Error ? authErr.message : "Unknown error"
          }`;
          clearTimeout(timeoutId);
          setSubmitError(errMsg);
          toast.error(errMsg);
          setIsSubmitting(false);
          return;
        }
      } else if (
        ["scheduling", "teaching_load", "registrar"].includes(userRole)
      ) {
        // Create committee_profile for committee roles
        console.log("Creating committee profile for role:", userRole);

        // First check if profile already exists (race condition protection)
        const { data: existingProfile } = await (
          supabase
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .from("committee_profile") as any
        )
          .select("user_id")
          .eq("user_id", userId)
          .maybeSingle();

        if (existingProfile) {
          console.log("Committee profile already exists, skipping insert");
          profileCreated = true;
        } else {
          const { data: committeeData, error: profileError } = await (
            supabase
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .from("committee_profile") as any
          )
            .insert({
              user_id: userId,
              committee_role: userRole,
              department: "Software Engineering",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any)
            .select()
            .single();

          console.log("Committee profile insert result:", {
            data: committeeData,
            error: profileError,
          });

          if (profileError) {
            // Check for unique constraint violation (profile created by another request)
            if (profileError.code === "23505") {
              // Profile was created by another request - try to read it
              console.log(
                "Profile was created between check and insert, verifying..."
              );
              const { error: verifyError } = await supabase
                .from("committee_profile")
                .select("user_id")
                .eq("user_id", userId)
                .single();

              if (verifyError) {
                console.error(
                  "Error verifying committee profile after race condition:",
                  verifyError
                );
                const errMsg = `Failed to create committee profile: ${
                  profileError.message || "Unknown error"
                }`;
                clearTimeout(timeoutId);
                setSubmitError(errMsg);
                toast.error(errMsg);
                setIsSubmitting(false);
                return;
              }
              console.log("Committee profile verified after race condition");
              profileCreated = true;
            } else {
              // Other error - show message
              const errorMsg = profileError.message || "Unknown error";
              console.error("Error creating committee_profile:", {
                error: profileError,
                message: errorMsg,
                details: profileError.details,
                hint: profileError.hint,
                code: profileError.code,
              });

              let errMsg = `Failed to create committee profile: ${errorMsg}`;

              // Check for RLS violations
              if (
                profileError.code?.startsWith("PGRST") ||
                profileError.code === "42501"
              ) {
                errMsg = `Permission denied: Unable to create committee profile. Please ensure you are logged in correctly.`;
              } else if (profileError.code === "23503") {
                errMsg = "Invalid user ID. Please log out and log back in.";
              }

              clearTimeout(timeoutId);
              setSubmitError(errMsg);
              toast.error(errMsg);
              setIsSubmitting(false);
              return;
            }
          } else {
            // Insert succeeded
            console.log(
              "Committee profile created successfully:",
              committeeData
            );
            profileCreated = true;
          }
        }
      }

      // Only proceed if profile is successfully created
      if (profileCreated) {
        console.log(
          "Profile created successfully, updating onboarding_completed flag..."
        );

        // 1. Update onboarding_completed flag in user_roles table
        const { error: updateError } = await (
          supabase
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .from("user_roles") as any
        )
          .update({
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any)
          .eq("user_id", userId);

        if (updateError) {
          console.warn(
            "Failed to update onboarding_completed flag in DB:",
            updateError
          );
        } else {
          console.log("onboarding_completed flag updated in DB successfully");
        }

        // 2. Update auth user metadata to avoid redirects
        // This is critical for the middleware/layout checks to pass
        const { error: authUpdateError } = await supabase.auth.updateUser({
          data: { onboarding_completed: true },
        });

        if (authUpdateError) {
          console.warn("Failed to update auth metadata:", authUpdateError);
        } else {
          console.log("Auth metadata updated successfully");
        }

        // Clear timeout on success
        if (timeoutId) clearTimeout(timeoutId);

        // Success! Show success message
        toast.success("Welcome to SmartSchedule! Your profile is all set up.");

        // Set redirecting state to keep UI locked/loading
        setIsRedirecting(true);

        // Small delay to show success message, then redirect
        setTimeout(() => {
          // Redirect based on role to appropriate dashboard
          const dashboardRoute =
            userRole === "student"
              ? "/dashboard/student"
              : userRole === "faculty"
              ? "/dashboard/faculty"
              : userRole === "scheduling"
              ? "/dashboard/scheduling"
              : userRole === "teaching_load"
              ? "/dashboard/teaching-load"
              : userRole === "registrar"
              ? "/dashboard/registrar"
              : "/dashboard";

          console.log("Redirecting to:", dashboardRoute);

          // Use hard navigation to bypass Next.js Router Cache
          // This ensures middleware re-checks onboarding status with fresh data
          window.location.href = dashboardRoute;
        }, 1000);
      } else {
        console.error("Profile was not created, cannot complete onboarding");
        const errMsg = "Failed to create profile. Please try again.";
        clearTimeout(timeoutId);
        setSubmitError(errMsg);
        toast.error(errMsg);
        setIsSubmitting(false);
        return;
      }
    } catch (error) {
      // Clear timeout on error
      if (timeoutId) clearTimeout(timeoutId);

      console.error("Unexpected error during onboarding:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Full error details:", {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        error: error,
      });

      const displayMsg = `An unexpected error occurred: ${errorMessage}. Please try again.`;
      setSubmitError(displayMsg);
      toast.error(displayMsg);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                Welcome to SmartSchedule!
              </CardTitle>
              <CardDescription>
                Let&apos;s set up your profile, {userName.split(" ")[0]}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Student Academic Level */}
          {userRole === "student" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Academic Information
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Tell us your current academic level so we can show you the
                  right courses and schedule.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">
                  Current Academic Level <span className="text-red-500">*</span>
                </Label>
                <Select value={academicLevel} onValueChange={setAcademicLevel}>
                  <SelectTrigger
                    id="level"
                    className={errors.academicLevel ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levelOptions.map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        Level {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.academicLevel && (
                  <p className="text-sm text-red-500">{errors.academicLevel}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Level indicates your academic standing. Levels 1-3:
                  Foundation, Levels 4-8: Major (4=Year 1 Sem 1, 5=Year 1 Sem 2,
                  etc.)
                </p>
              </div>

              {/* Enrollment Year */}
              <div className="space-y-2">
                <Label htmlFor="enrollmentYear">
                  Enrollment Year (Hijri){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={enrollmentYear}
                  onValueChange={setEnrollmentYear}
                >
                  <SelectTrigger
                    id="enrollmentYear"
                    className={errors.enrollmentYear ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select enrollment year" />
                  </SelectTrigger>
                  <SelectContent>
                    {enrollmentYearOptions.map((year, index) => (
                      <SelectItem
                        key={`year-${index}-${year}`}
                        value={year.toString()}
                      >
                        {year}H
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.enrollmentYear && (
                  <p className="text-sm text-red-500">
                    {errors.enrollmentYear}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  The Hijri year when you first enrolled. This is used to
                  generate your student number.
                </p>
              </div>

              {/* Program (Prefilled) */}
              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Select value="software-engineering" disabled>
                  <SelectTrigger id="program">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="software-engineering">
                      Software Engineering
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  SmartSchedule currently supports Software Engineering students
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your level determines which required
                  courses you&apos;ll be automatically enrolled in. You can
                  register for elective courses separately.
                </p>
              </div>
            </div>
          )}

          {/* Summary Section */}
          <div className="space-y-4 pt-4 border-t">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Confirm Your Information
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {userRole === "student"
                  ? "Please review before continuing."
                  : "Please confirm your role information to complete setup."}
              </p>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
              {userRole === "student" ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Academic Level:</span>
                    <span className="text-sm">
                      Level {academicLevel || "(Not selected)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      Enrollment Year:
                    </span>
                    <span className="text-sm">
                      {enrollmentYear ? `${enrollmentYear}H` : "(Not selected)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Program:</span>
                    <span className="text-sm">Software Engineering</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Role:</span>
                    <span className="text-sm capitalize">
                      {userRole.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Department:</span>
                    <span className="text-sm">Software Engineering</span>
                  </div>
                  {userRole === "teaching_load" && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground">
                        As a Teaching Load Committee member, you&apos;ll be able
                        to review and balance instructor teaching loads.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Confirmation Checkbox */}
            <div className="flex items-start space-x-3 pt-2">
              <input
                type="checkbox"
                id="confirm"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="confirm"
                className="text-sm leading-relaxed cursor-pointer"
              >
                I confirm that the information provided above is accurate.
              </label>
            </div>
            {errors.confirmed && (
              <p className="text-sm text-red-500 ml-7">{errors.confirmed}</p>
            )}

            {/* Submit Error Message */}
            {submitError && (
              <div
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{submitError}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t">
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                // Prevent double-clicks
                if (isSubmitting) {
                  console.log("Button already submitting, ignoring click");
                  return;
                }

                // Call handleSubmit directly - it handles its own errors
                handleSubmit(e);
              }}
              disabled={isSubmitting}
              className="min-w-[160px]"
              type="button"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Setup
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
