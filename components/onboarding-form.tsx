/**
 * User Onboarding Form Component
 * 
 * Purpose: First-time user profile setup for new SmartSchedule users
 * 
 * Trigger Conditions:
 * - User logs in for the first time
 * - onboarding_completed flag is FALSE in database
 * - Required profile fields are missing (level, enrollment_year for students)
 * 
 * Flow Logic:
 * 1. Detect incomplete profile via middleware
 * 2. Redirect to /onboarding page
 * 3. Display multi-step form (this component)
 * 4. Collect: Academic Level, Program (prefilled), Graduation Year (optional)
 * 5. Submit via Supabase client-side mutation
 * 6. Mark onboarding_completed = TRUE
 * 7. Redirect to appropriate dashboard
 * 
 * Validation:
 * - All required fields validated client-side
 * - Academic level: 4-8 (undergraduate programs typically years 1-5, but we support 1-8)
 * - Enrollment year: current year - 10 to current year
 * - Expected graduation: current year to current year + 10
 * - Confirmation checkbox must be checked
 * 
 * User Experience:
 * - Shows only once per user (onboarding_completed flag)
 * - Progress indicator for multi-step feel
 * - Friendly microcopy and instructions
 * - Smooth transition after completion
 * - Inline error states (no alert popups)
 * 
 * Security:
 * - Direct Supabase mutations (no server round trips)
 * - RLS policies enforce user can only update own profile
 * - Client-side and database-level validation
 */

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
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
import { Progress } from "@/components/ui/progress";
import { GraduationCap, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface OnboardingFormProps {
  userId: string;
  userName: string;
  userRole: 'student' | 'faculty' | 'scheduling' | 'teaching_load' | 'registrar';
}

export function OnboardingForm({ userId, userName, userRole }: OnboardingFormProps) {
  // Form state
  const [academicLevel, setAcademicLevel] = useState<string>("");
  const [enrollmentYear, setEnrollmentYear] = useState<string>("");
  const [graduationYear, setGraduationYear] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);
  
  // UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const router = useRouter();
  const supabase = createClient();
  
  // Calculate current year for year dropdowns (client-side only to avoid hydration mismatch)
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);
  
  // Generate year options (6-year ranges)
  const enrollmentYearOptions = currentYear ? Array.from(
    { length: 6 }, // Last 6 years
    (_, i) => currentYear - 5 + i
  ).reverse() : []; // Most recent first
  
  const graduationYearOptions = currentYear ? Array.from(
    { length: 6 }, // Next 6 years
    (_, i) => currentYear + i
  ) : [];
  
  // Academic level options
  const levelOptions = [4, 5, 6, 7, 8];
  
  // Total steps (for progress bar)
  const totalSteps = userRole === 'student' ? 3 : 2;
  
  /**
   * Validate current step before proceeding
   * Returns true if validation passes, false otherwise
   */
  function validateStep(): boolean {
    const newErrors: { [key: string]: string } = {};
    
    if (currentStep === 1 && userRole === 'student') {
      if (!academicLevel) {
        newErrors.academicLevel = "Please select your academic level";
      }
    }
    
    if (currentStep === 2 && userRole === 'student') {
      if (!enrollmentYear) {
        newErrors.enrollmentYear = "Please select your enrollment year";
      }
    }
    
    if (currentStep === totalSteps) {
      if (!confirmed) {
        newErrors.confirmed = "Please confirm that your information is accurate";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }
  
  /**
   * Handle next step button
   * Validates current step before advancing
   */
  function handleNext() {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
      setErrors({}); // Clear errors when moving to next step
    }
  }
  
  /**
   * Handle previous step button
   */
  function handleBack() {
    setCurrentStep(currentStep - 1);
    setErrors({}); // Clear errors when going back
  }
  
  /**
   * Submit onboarding data to Supabase
   * 
   * Process:
   * 1. Validate all required fields
   * 2. Update user_roles table with profile data
   * 3. Set onboarding_completed = TRUE
   * 4. Refresh session to update cached profile
   * 5. Redirect to appropriate dashboard based on role
   */
  async function handleSubmit() {
    if (!validateStep()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare update data based on role
      const updateData: any = {
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      };
      
      // Add student-specific fields
      if (userRole === 'student') {
        updateData.level = parseInt(academicLevel);
        updateData.enrollment_year = parseInt(enrollmentYear);
        
        // Optional graduation year
        if (graduationYear) {
          updateData.expected_graduation_year = parseInt(graduationYear);
        }
      }
      
      // Update user profile in database
      const { error: updateError } = await supabase
        .from('user_roles')
        .update(updateData)
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
        toast.error('Failed to save your profile. Please try again.');
        return;
      }
      
      // Success! Show success message
      toast.success('Welcome to SmartSchedule! Your profile is all set up.');
      
      // Small delay to show success message, then redirect
      setTimeout(() => {
        // Redirect based on role
        const dashboardRoute = userRole === 'student' 
          ? '/dashboard/student'
          : '/dashboard';
        
        router.push(dashboardRoute);
        router.refresh(); // Refresh to update server-side profile cache
      }, 1000);
      
    } catch (error) {
      console.error('Unexpected error during onboarding:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Calculate progress percentage
  const progressPercentage = (currentStep / totalSteps) * 100;
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Welcome to SmartSchedule!</CardTitle>
                <CardDescription>Let's set up your profile, {userName.split(' ')[0]}</CardDescription>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Academic Level (Students Only) */}
          {currentStep === 1 && userRole === 'student' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <h3 className="text-lg font-semibold mb-2">Academic Level</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  What year are you currently in? This helps us show you the right courses and schedule.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="level">
                  Current Academic Level <span className="text-red-500">*</span>
                </Label>
                <Select value={academicLevel} onValueChange={setAcademicLevel}>
                  <SelectTrigger id="level" className={errors.academicLevel ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levelOptions.map(level => (
                      <SelectItem key={level} value={level.toString()}>
                        Level {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.academicLevel && (
                  <p className="text-sm text-red-500">{errors.academicLevel}</p>
                )}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your academic level determines which courses appear in your schedule. 
                  You'll be automatically enrolled in required courses for your level.
                </p>
              </div>
            </div>
          )}
          
          {/* Step 2: Enrollment Details (Students) */}
          {currentStep === 2 && userRole === 'student' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <h3 className="text-lg font-semibold mb-2">Enrollment Information</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Help us understand your academic timeline.
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
                    <SelectItem value="software-engineering">Software Engineering</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  SmartSchedule currently supports Software Engineering students
                </p>
              </div>
              
              {/* Enrollment Year (Required) */}
              <div className="space-y-2">
                <Label htmlFor="enrollment">
                  Enrollment Year <span className="text-red-500">*</span>
                </Label>
                <Select value={enrollmentYear} onValueChange={setEnrollmentYear} disabled={!currentYear}>
                  <SelectTrigger id="enrollment" className={errors.enrollmentYear ? 'border-red-500' : ''}>
                    <SelectValue placeholder={currentYear ? "When did you start?" : "Loading..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {enrollmentYearOptions.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.enrollmentYear && (
                  <p className="text-sm text-red-500">{errors.enrollmentYear}</p>
                )}
              </div>
              
              {/* Expected Graduation Year (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="graduation">Expected Graduation Year (Optional)</Label>
                <Select value={graduationYear} onValueChange={setGraduationYear} disabled={!currentYear}>
                  <SelectTrigger id="graduation">
                    <SelectValue placeholder={currentYear ? "Select year (optional)" : "Loading..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {graduationYearOptions.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This helps us plan your academic journey (leave blank if not sure)
                </p>
              </div>
            </div>
          )}
          
          {/* Final Step: Confirmation (All Users) */}
          {currentStep === totalSteps && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <h3 className="text-lg font-semibold mb-2">Review & Confirm</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Please review your information before continuing.
                </p>
              </div>
              
              {/* Summary */}
              <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
                {userRole === 'student' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Academic Level:</span>
                      <span className="text-sm">Level {academicLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Program:</span>
                      <span className="text-sm">Software Engineering</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Enrollment Year:</span>
                      <span className="text-sm">{enrollmentYear}</span>
                    </div>
                    {graduationYear && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Expected Graduation:</span>
                        <span className="text-sm">{graduationYear}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Confirmation Checkbox */}
              <div className="flex items-start space-x-3 pt-4">
                <input
                  type="checkbox"
                  id="confirm"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="confirm" className="text-sm leading-relaxed cursor-pointer">
                  I confirm that the information provided above is accurate and complete. 
                  I understand that this information will be used to personalize my SmartSchedule experience.
                </label>
              </div>
              {errors.confirmed && (
                <p className="text-sm text-red-500 ml-7">{errors.confirmed}</p>
              )}
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
            >
              Back
            </Button>
            
            {currentStep < totalSteps ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="min-w-[120px]"
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
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

