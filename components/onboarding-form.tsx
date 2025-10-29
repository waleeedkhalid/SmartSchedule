/**
 * User Onboarding Form Component
 * 
 * Purpose: First-time user profile setup for new SmartSchedule users
 * 
 * Trigger Conditions:
 * - User logs in for the first time
 * - onboarding_completed flag is FALSE in database
 * - Required profile fields are missing (level for students)
 * 
 * Flow Logic:
 * 1. Detect incomplete profile via middleware
 * 2. Redirect to /onboarding page
 * 3. Display simple form (this component)
 * 4. Collect: Academic Level (for students), Program (prefilled)
 * 5. Submit via Supabase client-side mutation
 * 6. Mark onboarding_completed = TRUE
 * 7. Redirect to appropriate dashboard
 * 
 * Validation:
 * - All required fields validated client-side
 * - Academic level: 1-8 (level determines which courses student takes)
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
 * - RLS policies enforce user can only update own profile
 * - Client-side and database-level validation
 */

"use client";

import { useState } from "react";
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
import { GraduationCap, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface OnboardingFormProps {
  userId: string;
  userName: string;
  userRole: 'student' | 'faculty' | 'scheduling' | 'teaching_load' | 'registrar';
}

export function OnboardingForm({ userId, userName, userRole }: OnboardingFormProps) {
  // Form state
  const [academicLevel, setAcademicLevel] = useState<string>("4");
  const [confirmed, setConfirmed] = useState(false);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const router = useRouter();
  const supabase = createClient();
  
  // Academic level options (1-8 for full system support)
  // Levels 1-3: Foundation/Prep courses
  // Levels 4-8: Major courses (4=Year 1, 5=Year 2, etc.)
  const levelOptions = [1, 2, 3, 4, 5, 6, 7, 8];
  
  /**
   * Validate form before submission
   * Returns true if validation passes, false otherwise
   */
  function validateForm(): boolean {
    const newErrors: { [key: string]: string } = {};
    
    if (userRole === 'student' && !academicLevel) {
      newErrors.academicLevel = "Please select your academic level";
    }
    
    if (!confirmed) {
      newErrors.confirmed = "Please confirm that your information is accurate";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
  async function handleSubmit() {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare update data based on role
      const updateData: any = {
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      };
      
      // Add student-specific fields (only level now!)
      if (userRole === 'student') {
        updateData.level = parseInt(academicLevel);
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
      
      // Auto-assign student to group (for students only)
      if (userRole === 'student') {
        const { error: groupError } = await supabase.rpc('auto_assign_student_to_group', {
          p_student_id: userId,
          p_level: parseInt(academicLevel)
        });
        
        if (groupError) {
          console.error('Error auto-assigning to group:', groupError);
          // Don't fail onboarding if group assignment fails - it can be done manually later
          toast.warning('Profile saved, but group assignment needs manual setup.');
        }
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
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">Welcome to SmartSchedule!</CardTitle>
              <CardDescription>Let's set up your profile, {userName.split(' ')[0]}</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Student Academic Level */}
          {userRole === 'student' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Academic Information</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Tell us your current academic level so we can show you the right courses and schedule.
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
                <p className="text-xs text-muted-foreground">
                  Level indicates your academic standing. Levels 1-3: Foundation, Levels 4-8: Major (4=Year 1 Sem 1, 5=Year 1 Sem 2, etc.)
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
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your level determines which required courses you'll be automatically enrolled in. 
                  You can register for elective courses separately.
                </p>
              </div>
            </div>
          )}
          
          {/* Summary Section */}
          <div className="space-y-4 pt-4 border-t">
            <div>
              <h3 className="text-lg font-semibold mb-2">Confirm Your Information</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please review before continuing.
              </p>
            </div>
            
            {/* Summary */}
            <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
              {userRole === 'student' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Academic Level:</span>
                    <span className="text-sm">Level {academicLevel || '(Not selected)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Program:</span>
                    <span className="text-sm">Software Engineering</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Role:</span>
                  <span className="text-sm capitalize">{userRole.replace('_', ' ')}</span>
                </div>
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
              <label htmlFor="confirm" className="text-sm leading-relaxed cursor-pointer">
                I confirm that the information provided above is accurate.
              </label>
            </div>
            {errors.confirmed && (
              <p className="text-sm text-red-500 ml-7">{errors.confirmed}</p>
            )}
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t">
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[160px]"
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

