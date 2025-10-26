"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Award,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { MockStudent, MockEnrollment } from "@/types/scheduler-mock";

interface StudentDetailsDialogProps {
  student: MockStudent | null;
  enrollments?: MockEnrollment[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendNotification?: (studentId: string) => void;
  onMarkIrregular?: (studentId: string) => void;
}

export function StudentDetailsDialog({
  student,
  enrollments = [],
  open,
  onOpenChange,
  onSendNotification,
  onMarkIrregular,
}: StudentDetailsDialogProps) {
  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Student Details</DialogTitle>
          <DialogDescription>
            Comprehensive information about {student.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold">{student.full_name}</h3>
              <p className="text-muted-foreground">{student.email}</p>
            </div>
            <Badge
              variant={student.status === "regular" ? "default" : "destructive"}
              className="text-sm"
            >
              {student.status === "regular" ? "Regular" : "Irregular"}
            </Badge>
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Student Number
                    </p>
                    <p className="text-lg font-semibold">
                      {student.student_number}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Level</p>
                    <p className="text-lg font-semibold">Level {student.level}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Enrolled Courses
                    </p>
                    <p className="text-lg font-semibold">
                      {student.enrolled_courses} courses
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Credits
                    </p>
                    <p className="text-lg font-semibold">
                      {student.total_credits} credits
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* GPA */}
          {student.gpa && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Award className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">GPA</p>
                      <p className="text-2xl font-bold">{student.gpa.toFixed(2)}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      student.gpa >= 3.5
                        ? "bg-green-50 text-green-700 border-green-200"
                        : student.gpa >= 2.5
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-orange-50 text-orange-700 border-orange-200"
                    }
                  >
                    {student.gpa >= 3.5
                      ? "Excellent"
                      : student.gpa >= 2.5
                      ? "Good"
                      : "Needs Attention"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Enrollments */}
          {enrollments.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Current Enrollments
              </h4>
              <div className="space-y-2">
                {enrollments.map((enrollment) => (
                  <Card key={enrollment.id}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {enrollment.course_code} - {enrollment.course_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {enrollment.credits} credits
                          </p>
                        </div>
                        <Badge
                          variant={
                            enrollment.status === "enrolled"
                              ? "default"
                              : enrollment.status === "waitlist"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {enrollment.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Status Alert */}
          {student.status === "irregular" && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-900">
                      Irregular Student Status
                    </p>
                    <p className="text-sm text-orange-700 mt-1">
                      This student requires special attention. Check the Irregular
                      Students tab for detailed information and action items.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4">
            <Button
              variant="default"
              onClick={() => onSendNotification?.(student.id)}
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
            {student.status === "regular" && (
              <Button
                variant="outline"
                onClick={() => onMarkIrregular?.(student.id)}
                className="flex-1"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Mark as Irregular
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

