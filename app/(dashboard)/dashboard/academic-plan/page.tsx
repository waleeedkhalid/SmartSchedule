/**
 * Academic Plan Page
 * 
 * Displays the student's academic plan showing:
 * - Current student level
 * - All courses organized by level in a grid layout
 * - Required vs Elective courses clearly marked
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, CheckCircle2 } from "lucide-react";
import { getServerUser } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { AcademicPlanView } from "@/components/academic-plan-view";

export default async function AcademicPlanPage() {
  const user = await getServerUser();

  if (!user || user.role !== 'student') {
    redirect('/dashboard');
  }

  // Get student profile to get level
  const supabase = await createClient();
  const { data: studentProfile } = await supabase
    .from("student_profile")
    .select("level")
    .eq("user_id", user.id)
    .single();

  const studentLevel = studentProfile?.level || user.level || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <GraduationCap className="h-8 w-8" />
          Academic Plan
        </h1>
        <p className="text-muted-foreground mt-2">
          Your complete course roadmap organized by academic level
        </p>
      </div>

      {/* Current Level Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            Current Academic Level
          </CardTitle>
          <CardDescription>
            Your current progress in the Software Engineering program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {studentLevel}
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold">Level {studentLevel}</p>
              <p className="text-sm text-muted-foreground">
                {studentLevel === 8 
                  ? "Final level - Capstone project" 
                  : `Progressing to Level ${studentLevel + 1}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Plan Grid */}
      <AcademicPlanView studentLevel={studentLevel} />
    </div>
  );
}

