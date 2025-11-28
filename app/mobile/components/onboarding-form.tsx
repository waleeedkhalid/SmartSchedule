/**
 * Mobile Onboarding Form Component
 * 
 * Simplified mobile version of the onboarding form.
 * Collects required information for first-time users.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/lib/types/database";

type StudentProfileInsert = Database["public"]["Tables"]["student_profile"]["Insert"];

interface OnboardingFormProps {
  userId: string;
  userName: string;
  userRole: "student" | "faculty" | "scheduling" | "teaching_load" | "registrar";
}

export function OnboardingForm({ userId, userName, userRole }: OnboardingFormProps) {
  const router = useRouter();

  // Calculate current Hijri year
  function getCurrentHijriYear(): number {
    const currentDate = new Date();
    const hijriFormatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      year: "numeric",
    });
    const parts = hijriFormatter.formatToParts(currentDate);
    const yearPart = parts.find((part) => part.type === "year");

    if (yearPart) {
      const yearValue = parseInt(yearPart.value, 10);
      if (!isNaN(yearValue) && yearValue >= 1400 && yearValue <= 1500) {
        return yearValue;
      }
    }

    return new Date().getFullYear() - 621;
  }

  const currentHijriYear = getCurrentHijriYear();
  const validHijriYear =
    isNaN(currentHijriYear) || currentHijriYear <= 0
      ? new Date().getFullYear() - 621
      : currentHijriYear;

  // Form state
  const [academicLevel, setAcademicLevel] = useState<string>("4");
  const [enrollmentYear, setEnrollmentYear] = useState<string>(validHijriYear.toString());
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Academic level options (4-8)
  const levelOptions = [4, 5, 6, 7, 8];

  // Generate enrollment year options (current year - 10 to current year)
  const enrollmentYearOptions = Array.from({ length: 11 }, (_, i) => validHijriYear - 10 + i)
    .filter((year) => !isNaN(year) && year > 0 && Number.isInteger(year))
    .reverse();

  function validateForm(): boolean {
    const newErrors: { [key: string]: string } = {};

    if (userRole === "student") {
      if (!academicLevel || academicLevel.trim() === "") {
        newErrors.academicLevel = "Please select your academic level";
      }

      if (!enrollmentYear || enrollmentYear.trim() === "") {
        newErrors.enrollmentYear = "Please select your enrollment year";
      } else {
        const year = parseInt(enrollmentYear, 10);
        if (isNaN(year) || year < 1400 || year > 1500) {
          newErrors.enrollmentYear = "Please enter a valid Hijri year (1400-1500)";
        }
      }
    }

    if (!confirmed) {
      newErrors.confirmed = "Please confirm that your information is accurate";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e?: React.MouseEvent<HTMLButtonElement>) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isSubmitting) {
      return;
    }

    // Validate form
    const hasValidLevel = userRole !== "student" || (academicLevel && academicLevel.trim() !== "");
    const hasValidEnrollmentYear =
      userRole !== "student" || (enrollmentYear && enrollmentYear.trim() !== "");
    const hasConfirmed = confirmed === true;

    if (!hasValidLevel || !hasValidEnrollmentYear || !hasConfirmed) {
      validateForm();
      if (!hasConfirmed) {
        toast.error("Please confirm that your information is accurate");
      }
      if (!hasValidLevel) {
        toast.error("Please select your academic level");
      }
      if (!hasValidEnrollmentYear) {
        toast.error("Please select your enrollment year");
      }
      return;
    }

    validateForm();
    setIsSubmitting(true);

    const timeoutId = setTimeout(() => {
      setIsSubmitting(false);
      toast.error("Submission is taking longer than expected. Please try again.");
    }, 30000);

    let supabase;
    try {
      supabase = createClient();
    } catch {
      clearTimeout(timeoutId);
      toast.error("Failed to initialize database connection. Please refresh the page and try again.");
      setIsSubmitting(false);
      return;
    }

    try {
      let profileCreated = false;

      if (userRole === "student") {
        const enrollmentYearInt = parseInt(enrollmentYear, 10);
        const profileData: StudentProfileInsert = {
          user_id: userId,
          level: parseInt(academicLevel),
          department: "Software Engineering",
          enrollment_year: enrollmentYearInt,
        };

        const { error: profileError } = await supabase
          .from("student_profile")
          .insert(profileData)
          .select()
          .single();

        if (profileError) {
          if (profileError.code === "23505") {
            toast.error("Student profile already exists. Please contact support if you need assistance.");
          } else {
            toast.error(`Failed to create student profile: ${profileError.message || "Unknown error"}`);
          }
          setIsSubmitting(false);
          return;
        }

        profileCreated = true;
      } else if (userRole === "faculty") {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser?.email) {
          toast.error("Failed to get user information. Please try again.");
          setIsSubmitting(false);
          return;
        }

        const { data: existingProfile } = await supabase
          .from("faculty_profile")
          .select("user_id")
          .eq("user_id", userId)
          .maybeSingle();

        if (existingProfile) {
          const { error: updateError } = await supabase
            .from("faculty_profile")
            .update({
              name: userName,
              email: authUser.email,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

          if (updateError) {
            toast.error(`Failed to update faculty profile: ${updateError.message || "Unknown error"}`);
            setIsSubmitting(false);
            return;
          }
        } else {
          const { error: profileError } = await supabase
            .from("faculty_profile")
            .insert({
              user_id: userId,
              department: "Software Engineering",
              name: userName,
              email: authUser.email,
              max_load_per_week: 12,
              preferred_times: [],
              unavailable_times: [],
            })
            .select()
            .single();

          if (profileError) {
            if (profileError.code === "23505") {
              // Race condition - profile was created, try update
              const { error: updateError } = await supabase
                .from("faculty_profile")
                .update({
                  name: userName,
                  email: authUser.email,
                  updated_at: new Date().toISOString(),
                })
                .eq("user_id", userId);

              if (updateError) {
                toast.error(`Failed to update faculty profile: ${updateError.message || "Unknown error"}`);
                setIsSubmitting(false);
                return;
              }
            } else {
              toast.error(`Failed to create faculty profile: ${profileError.message || "Unknown error"}`);
              setIsSubmitting(false);
              return;
            }
          }
        }

        profileCreated = true;
      } else if (["scheduling", "teaching_load", "registrar"].includes(userRole)) {
        const { data: existingProfile } = await supabase
          .from("committee_profile")
          .select("user_id")
          .eq("user_id", userId)
          .maybeSingle();

        if (existingProfile) {
          // Profile exists, just update
          profileCreated = true;
        } else {
          const { error: profileError } = await supabase
            .from("committee_profile")
            .insert({
              user_id: userId,
              role: userRole,
              department: "Software Engineering",
            })
            .select()
            .single();

          if (profileError) {
            if (profileError.code === "23505") {
              // Race condition - profile exists
              profileCreated = true;
            } else {
              toast.error(`Failed to create committee profile: ${profileError.message || "Unknown error"}`);
              setIsSubmitting(false);
              return;
            }
          } else {
            profileCreated = true;
          }
        }
      }

      if (profileCreated) {
        // Update onboarding_completed flag
        await supabase
          .from("user_roles")
          .update({
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        clearTimeout(timeoutId);
        toast.success("Welcome to SmartSchedule! Your profile is all set up.");

        setTimeout(() => {
          router.push("/mobile/schedule");
        }, 1000);
      } else {
        clearTimeout(timeoutId);
        toast.error("Failed to create profile. Please try again.");
        setIsSubmitting(false);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Error during onboarding:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/mobile/login")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <GraduationCap className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle>Welcome to SmartSchedule</CardTitle>
                <CardDescription>
                  Let&apos;s set up your profile to get started
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Onboarding Form */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Setup</CardTitle>
            <CardDescription>
              {userRole === "student"
                ? "Please provide your academic information"
                : "Complete your profile to continue"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Student-specific fields */}
            {userRole === "student" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="academicLevel">
                    Academic Level <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={academicLevel}
                    onValueChange={setAcademicLevel}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="academicLevel">
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
                    <p className="text-sm text-destructive">{errors.academicLevel}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enrollmentYear">
                    Enrollment Year (Hijri) <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={enrollmentYear}
                    onValueChange={setEnrollmentYear}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="enrollmentYear">
                      <SelectValue placeholder="Select enrollment year" />
                    </SelectTrigger>
                    <SelectContent>
                      {enrollmentYearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.enrollmentYear && (
                    <p className="text-sm text-destructive">{errors.enrollmentYear}</p>
                  )}
                </div>
              </>
            )}

            {/* Confirmation checkbox */}
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="confirmed"
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked === true)}
                disabled={isSubmitting}
              />
              <Label
                htmlFor="confirmed"
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I confirm that the information provided is accurate{" "}
                <span className="text-destructive">*</span>
              </Label>
            </div>
            {errors.confirmed && (
              <p className="text-sm text-destructive">{errors.confirmed}</p>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Setting up..." : "Complete Setup"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

