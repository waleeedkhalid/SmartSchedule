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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Lock, MessageSquare, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatDistance } from "date-fns";

const feedbackFormSchema = z.object({
  section_id: z.string().min(1, "Please select a section"),
  feedback_type: z.enum(['WORKLOAD', 'TIME_CONFLICT', 'COURSE_PREFERENCE', 'OTHER']),
  comment: z.string().min(10, "Comment must be at least 10 characters").max(1000),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

type FeedbackFormData = z.infer<typeof feedbackFormSchema>;

interface Section {
  section_id: string;
  course_code: string;
  capacity: number;
  room_number: string | null;
  course: {
    course_code: string;
    course_name: string;
    credits: number;
  };
}

interface ExistingFeedback {
  id: string;
  section_id: string;
  course_code: string;
  feedback_type: string;
  comment: string;
  severity: string;
  status: string;
  created_at: string;
}

interface FacultyScheduleFeedbackClientProps {
  locked: boolean;
  message?: string;
  sections: Section[];
  existingFeedback: ExistingFeedback[];
  termCode?: string;
}

export default function FacultyScheduleFeedbackClient({
  locked,
  message,
  sections,
  existingFeedback,
  termCode,
}: FacultyScheduleFeedbackClientProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [scheduleVersionId, setScheduleVersionId] = useState<string>('demo-version-01'); // TODO: Get from active term

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      severity: 'MEDIUM',
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/faculty/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          schedule_version_id: scheduleVersionId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit feedback');
      }

      toast({
        title: "Feedback Submitted",
        description: result.message,
      });

      reset();
      setShowForm(false);
      
      // Refresh page to show new feedback
      window.location.reload();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to submit feedback',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (locked) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Schedule Feedback</h1>
          <p className="text-muted-foreground">Provide feedback on your assigned teaching schedule</p>
        </div>

        <Alert className="border-2 border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950">
          <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-900 dark:text-amber-100 font-semibold">
            Feedback Not Available
          </AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-200 mt-2">
            {message || "Schedule feedback will be available after the schedule is published."}
          </AlertDescription>
        </Alert>

        <Card className="border-2">
          <CardContent className="py-12">
            <div className="text-center">
              <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Schedule Not Published</h3>
              <p className="text-sm text-muted-foreground">
                Check back after the teaching schedule is published
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return <Badge variant="destructive">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="default">Medium</Badge>;
      case 'LOW':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <Badge variant="outline">Submitted</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="secondary">Under Review</Badge>;
      case 'RESOLVED':
        return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="mr-1 h-3 w-3" />Resolved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getFeedbackTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'WORKLOAD': 'Workload Concern',
      'TIME_CONFLICT': 'Time Conflict',
      'COURSE_PREFERENCE': 'Course Preference',
      'OTHER': 'Other',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Schedule Feedback</h1>
        <p className="text-muted-foreground">
          Provide feedback on your assigned teaching schedule
        </p>
      </div>

      {/* Submit Feedback Button */}
      {!showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Submit New Feedback</CardTitle>
            <CardDescription>
              Have concerns about your teaching assignments? Let the scheduling committee know.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowForm(true)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Provide Feedback
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Feedback Form */}
      {showForm && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Submit Schedule Feedback</CardTitle>
            <CardDescription>
              Select a section and describe your concern or suggestion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Section Selection */}
              <div className="space-y-2">
                <Label htmlFor="section_id">Section</Label>
                <Select onValueChange={(value) => setValue('section_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.section_id} value={section.section_id}>
                        {section.course.course_code} - {section.course.course_name}
                        {section.room_number && ` (Room: ${section.room_number})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.section_id && (
                  <p className="text-sm text-destructive">{errors.section_id.message}</p>
                )}
              </div>

              {/* Feedback Type */}
              <div className="space-y-2">
                <Label htmlFor="feedback_type">Feedback Type</Label>
                <Select onValueChange={(value) => setValue('feedback_type', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WORKLOAD">Workload Concern</SelectItem>
                    <SelectItem value="TIME_CONFLICT">Time Conflict</SelectItem>
                    <SelectItem value="COURSE_PREFERENCE">Course Preference</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.feedback_type && (
                  <p className="text-sm text-destructive">{errors.feedback_type.message}</p>
                )}
              </div>

              {/* Severity */}
              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select onValueChange={(value) => setValue('severity', value as any)} defaultValue="MEDIUM">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low Priority</SelectItem>
                    <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                    <SelectItem value="HIGH">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <Label htmlFor="comment">Your Feedback</Label>
                <Textarea
                  id="comment"
                  {...register('comment')}
                  placeholder="Describe your concern or suggestion (10-1000 characters)"
                  rows={5}
                />
                {errors.comment && (
                  <p className="text-sm text-destructive">{errors.comment.message}</p>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Your Sections */}
      <Card>
        <CardHeader>
          <CardTitle>Your Teaching Assignments</CardTitle>
          <CardDescription>
            Sections assigned to you for {termCode || 'this term'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sections.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No sections assigned yet. Assignments will appear here after schedule generation.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Room</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map((section) => (
                  <TableRow key={section.section_id}>
                    <TableCell className="font-medium">{section.course.course_code}</TableCell>
                    <TableCell>{section.course.course_name}</TableCell>
                    <TableCell>{section.course.credits}</TableCell>
                    <TableCell>{section.capacity}</TableCell>
                    <TableCell>{section.room_number || 'TBA'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Previously Submitted Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Your Feedback History</CardTitle>
          <CardDescription>
            Previously submitted feedback on your schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          {existingFeedback.length === 0 ? (
            <Alert>
              <AlertDescription>
                No feedback submitted yet. Use the form above to provide feedback on your schedule.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {existingFeedback.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell className="font-medium">{feedback.course_code}</TableCell>
                    <TableCell>{getFeedbackTypeLabel(feedback.feedback_type)}</TableCell>
                    <TableCell>{getSeverityBadge(feedback.severity)}</TableCell>
                    <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistance(new Date(feedback.created_at), new Date(), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

