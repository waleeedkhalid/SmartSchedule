"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { submitOnboarding } from "@/app/actions/onboarding";

interface OnboardingFormProps {
  userId: string;
  userName: string;
  userRole: "student" | "faculty" | "scheduling" | "teaching_load" | "registrar";
  currentHijriYear: number;
}

export function OnboardingForm({ userId, userName, userRole, currentHijriYear }: OnboardingFormProps) {
  // Form state
  const [academicLevel, setAcademicLevel] = useState<string>("4");
  const [enrollmentYear, setEnrollmentYear] = useState<string>(currentHijriYear.toString());
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Academic level options (4-8)
  const levelOptions = [4, 5, 6, 7, 8];

  // Generate enrollment year options (current year - 10 to current year)
  const enrollmentYearOptions = Array.from({ length: 11 }, (_, i) => currentHijriYear - 10 + i)
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

    if (isSubmitting) return;

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("userRole", userRole);
      formData.append("userName", userName);

      if (userRole === "student") {
        formData.append("academicLevel", academicLevel);
        formData.append("enrollmentYear", enrollmentYear);
      }

      // Call Server Action
      const result = await submitOnboarding({}, formData);

      if (result.error) {
        toast.error(result.error);
        setIsSubmitting(false);
      } else {
        toast.success("Profile set up successfully!");
        // Redirect is handled by the server action
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An unexpected error occurred.");
      setIsSubmitting(false);
    }
  }

  return (
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
  );
}

