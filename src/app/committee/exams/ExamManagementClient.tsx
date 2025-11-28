"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Plus,
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Users,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const examFormSchema = z.object({
  course_code: z.string().min(1, "Course code is required"),
  exam_type: z.enum(['MIDTERM', 'FINAL', 'QUIZ', 'MAKEUP']),
  exam_date: z.string().min(1, "Exam date is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  room_number: z.string().optional(),
  capacity: z.number().int().min(1, "Capacity must be at least 1"),
  notes: z.string().max(500).optional(),
});

type ExamFormData = z.infer<typeof examFormSchema>;

interface Exam {
  id: string;
  term_code: string;
  course_code: string;
  exam_type: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  room_number: string | null;
  capacity: number;
  enrolled_count: number;
  notes: string | null;
  course: {
    course_code: string;
    course_name: string;
    credits: number;
  };
}

interface Conflict {
  id: string;
  conflict_type: string;
  severity: string;
  affected_students: number;
  resolved: boolean;
  exam_1: {
    course_code: string;
    exam_type: string;
    exam_date: string;
    start_time: string;
    end_time: string;
    room_number: string;
  };
  exam_2: {
    course_code: string;
    exam_type: string;
    exam_date: string;
    start_time: string;
    end_time: string;
    room_number: string;
  };
}

interface ExamManagementClientProps {
  exams: Exam[];
  conflicts: Conflict[];
  termCode: string | null;
  error: string | null;
}

export default function ExamManagementClient({
  exams: initialExams,
  conflicts: initialConflicts,
  termCode,
  error: initialError,
}: ExamManagementClientProps) {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exams, setExams] = useState(initialExams);
  const [conflicts, setConflicts] = useState(initialConflicts);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ExamFormData>({
    resolver: zodResolver(examFormSchema),
  });

  const onSubmit = async (data: ExamFormData) => {
    setIsSubmitting(true);

    try {
      // Format times to HH:MM:SS
      const startTime = data.start_time.includes(':') 
        ? `${data.start_time}:00` 
        : data.start_time;
      const endTime = data.end_time.includes(':')
        ? `${data.end_time}:00`
        : data.end_time;

      const response = await fetch('/api/committee/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          term_code: termCode,
          start_time: startTime,
          end_time: endTime,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast({
            title: "Conflict Detected",
            description: result.error,
            variant: "destructive",
          });
          return;
        }
        throw new Error(result.error || 'Failed to create exam schedule');
      }

      toast({
        title: "Exam Schedule Created",
        description: result.message,
      });

      reset();
      setShowCreateForm(false);
      
      // Refresh page to show new exam
      window.location.reload();
    } catch (error) {
      console.error('Error creating exam:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create exam schedule',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getExamTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'MIDTERM': 'bg-blue-600',
      'FINAL': 'bg-purple-600',
      'QUIZ': 'bg-green-600',
      'MAKEUP': 'bg-amber-600',
    };
    return <Badge className={colors[type] || ''}>{type}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <Badge variant="destructive">Critical</Badge>;
      case 'HIGH':
        return <Badge variant="destructive" className="bg-orange-600">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="default">Medium</Badge>;
      case 'LOW':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  if (initialError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Exam Management</h1>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{initialError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const unresolvedConflicts = conflicts.filter(c => !c.resolved);
  const criticalConflicts = unresolvedConflicts.filter(c => c.severity === 'CRITICAL');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Management</h1>
          <p className="text-muted-foreground">
            Manage exam schedules and detect conflicts for {termCode || 'current term'}
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Exam
        </Button>
      </div>

      {/* Conflict Alert */}
      {unresolvedConflicts.length > 0 && (
        <Alert variant={criticalConflicts.length > 0 ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {unresolvedConflicts.length} Unresolved Conflict{unresolvedConflicts.length !== 1 ? 's' : ''}
            {criticalConflicts.length > 0 && ` (${criticalConflicts.length} Critical)`}
          </AlertTitle>
          <AlertDescription>
            Review and resolve exam scheduling conflicts below to prevent student issues.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Exams</CardDescription>
            <CardTitle className="text-2xl">{exams.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Capacity</CardDescription>
            <CardTitle className="text-2xl">
              {exams.reduce((sum, e) => sum + e.capacity, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Enrolled</CardDescription>
            <CardTitle className="text-2xl">
              {exams.reduce((sum, e) => sum + e.enrolled_count, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Conflicts</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              {unresolvedConflicts.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Conflicts List */}
      {unresolvedConflicts.length > 0 && (
        <Card className="border-2 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Exam Conflicts
            </CardTitle>
            <CardDescription>
              Conflicts detected in exam scheduling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam 1</TableHead>
                  <TableHead>Exam 2</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unresolvedConflicts.map((conflict) => (
                  <TableRow key={conflict.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{conflict.exam_1.course_code}</p>
                        <p className="text-xs text-muted-foreground">
                          {conflict.exam_1.exam_type} • {conflict.exam_1.exam_date}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{conflict.exam_2.course_code}</p>
                        <p className="text-xs text-muted-foreground">
                          {conflict.exam_2.exam_type} • {conflict.exam_2.exam_date}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{conflict.conflict_type.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell>{getSeverityBadge(conflict.severity)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {conflict.conflict_type === 'ROOM_OVERLAP' && (
                        <p>Room: {conflict.exam_1.room_number}</p>
                      )}
                      {conflict.conflict_type === 'TIME_OVERLAP' && (
                        <p>
                          {conflict.exam_1.start_time} - {conflict.exam_1.end_time}
                        </p>
                      )}
                      {conflict.affected_students > 0 && (
                        <p>{conflict.affected_students} students affected</p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Exams List */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Exams</CardTitle>
          <CardDescription>
            All exam schedules for {termCode || 'current term'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <Alert>
              <AlertDescription>
                No exams scheduled yet. Click &quot;Schedule Exam&quot; to create one.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Enrolled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{exam.course.course_code}</p>
                        <p className="text-xs text-muted-foreground">{exam.course.course_name}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getExamTypeBadge(exam.exam_type)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(exam.exam_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {exam.start_time.substring(0, 5)} - {exam.end_time.substring(0, 5)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {exam.room_number || 'TBA'}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{exam.capacity}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-3 w-3" />
                        {exam.enrolled_count}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Exam Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule New Exam</DialogTitle>
            <DialogDescription>
              Create a new exam schedule for {termCode || 'current term'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Course Code */}
              <div className="space-y-2">
                <Label htmlFor="course_code">Course Code</Label>
                <Input
                  id="course_code"
                  {...register('course_code')}
                  placeholder="e.g., SWE301"
                />
                {errors.course_code && (
                  <p className="text-sm text-destructive">{errors.course_code.message}</p>
                )}
              </div>

              {/* Exam Type */}
              <div className="space-y-2">
                <Label htmlFor="exam_type">Exam Type</Label>
                <Select onValueChange={(value) => setValue('exam_type', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MIDTERM">Midterm</SelectItem>
                    <SelectItem value="FINAL">Final</SelectItem>
                    <SelectItem value="QUIZ">Quiz</SelectItem>
                    <SelectItem value="MAKEUP">Makeup</SelectItem>
                  </SelectContent>
                </Select>
                {errors.exam_type && (
                  <p className="text-sm text-destructive">{errors.exam_type.message}</p>
                )}
              </div>

              {/* Exam Date */}
              <div className="space-y-2">
                <Label htmlFor="exam_date">Exam Date</Label>
                <Input
                  id="exam_date"
                  type="date"
                  {...register('exam_date')}
                />
                {errors.exam_date && (
                  <p className="text-sm text-destructive">{errors.exam_date.message}</p>
                )}
              </div>

              {/* Start Time */}
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="time"
                  {...register('start_time')}
                />
                {errors.start_time && (
                  <p className="text-sm text-destructive">{errors.start_time.message}</p>
                )}
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  {...register('end_time')}
                />
                {errors.end_time && (
                  <p className="text-sm text-destructive">{errors.end_time.message}</p>
                )}
              </div>

              {/* Room Number */}
              <div className="space-y-2">
                <Label htmlFor="room_number">Room Number (Optional)</Label>
                <Input
                  id="room_number"
                  {...register('room_number')}
                  placeholder="e.g., EXAM-HALL-A"
                />
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  {...register('capacity', { valueAsNumber: true })}
                  placeholder="e.g., 100"
                />
                {errors.capacity && (
                  <p className="text-sm text-destructive">{errors.capacity.message}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Additional notes or special instructions"
                rows={3}
              />
              {errors.notes && (
                <p className="text-sm text-destructive">{errors.notes.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Exam Schedule'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

