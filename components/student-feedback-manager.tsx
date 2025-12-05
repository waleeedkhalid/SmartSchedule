"use client";

/**
 * Student Feedback Manager Component
 *
 * A complete feedback management interface for students to:
 * - Submit feedback on their schedule or specific sections
 * - View their submitted feedback
 * - Delete pending (unresolved) feedback
 *
 * Uses the brand identity colors (primary blue, teal accent).
 */

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  MessageSquare,
  Send,
  Star,
  Trash2,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getStudentFeedback,
  getEnrolledSections,
  submitFeedback,
  deleteFeedback,
  type StudentFeedback,
  type EnrolledSection,
} from "@/app/actions/feedback";
import { useIsClient } from "@/hooks/use-mounted";

interface StudentFeedbackManagerProps {
  userId: string;
}

export function StudentFeedbackManager({
  userId: _userId,
}: StudentFeedbackManagerProps) {
  const isClient = useIsClient();

  // Note: userId passed from parent but auth handled by server actions
  void _userId;

  // Form state
  const [selectedSection, setSelectedSection] = useState<string>("general");
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  // Data state
  const [feedbackList, setFeedbackList] = useState<StudentFeedback[]>([]);
  const [enrolledSections, setEnrolledSections] = useState<EnrolledSection[]>(
    []
  );

  // Loading states
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(true);
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Error state
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch initial data
  const fetchFeedback = useCallback(async () => {
    setIsLoadingFeedback(true);
    const result = await getStudentFeedback();
    if (result.success && result.data) {
      setFeedbackList(result.data);
    } else {
      setError(result.error || "Failed to load feedback");
    }
    setIsLoadingFeedback(false);
  }, []);

  const fetchSections = useCallback(async () => {
    setIsLoadingSections(true);
    const result = await getEnrolledSections();
    if (result.success && result.data) {
      setEnrolledSections(result.data);
    }
    setIsLoadingSections(false);
  }, []);

  useEffect(() => {
    fetchFeedback();
    fetchSections();
  }, [fetchFeedback, fetchSections]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (commentText.trim().length < 10) {
      setSubmitError("Feedback must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);

    const result = await submitFeedback({
      section_id: selectedSection === "general" ? null : selectedSection,
      comment_text: commentText,
      rating,
    });

    if (result.success && result.data) {
      setFeedbackList((prev) => [result.data!, ...prev]);
      setCommentText("");
      setRating(null);
      setSelectedSection("general");
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } else {
      setSubmitError(result.error || "Failed to submit feedback");
    }

    setIsSubmitting(false);
  };

  // Handle feedback deletion
  const handleDelete = async (feedbackId: string) => {
    setDeletingId(feedbackId);

    const result = await deleteFeedback(feedbackId);
    if (result.success) {
      setFeedbackList((prev) => prev.filter((f) => f.id !== feedbackId));
    } else {
      setError(result.error || "Failed to delete feedback");
    }

    setDeletingId(null);
  };

  // Format date for display - only format on client to avoid hydration mismatch
  const formatDate = (dateString: string) => {
    if (!isClient) return "";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Form */}
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            Submit Feedback
          </CardTitle>
          <CardDescription>
            Share your thoughts about your schedule or specific course sections.
            Your feedback helps improve future schedules.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Section Selection */}
            <div className="space-y-2">
              <Label htmlFor="section">Feedback About</Label>
              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
                disabled={isLoadingSections}
              >
                <SelectTrigger id="section" className="w-full">
                  <SelectValue placeholder="Select a section or general feedback" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>General Schedule Feedback</span>
                    </div>
                  </SelectItem>
                  {enrolledSections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {section.course_code}
                        </span>
                        <span className="text-muted-foreground">-</span>
                        <span className="text-muted-foreground truncate max-w-[200px]">
                          {section.course_title}
                        </span>
                        {section.activity && (
                          <Badge variant="outline" className="ml-1 text-xs">
                            {section.activity}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label>Rating (Optional)</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(rating === star ? null : star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(null)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  >
                    <Star
                      className={cn(
                        "h-6 w-6 transition-colors",
                        (
                          hoveredRating !== null
                            ? star <= hoveredRating
                            : star <= (rating || 0)
                        )
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/40"
                      )}
                    />
                  </button>
                ))}
                {rating && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    {rating} star{rating !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>

            {/* Comment Text */}
            <div className="space-y-2">
              <Label htmlFor="comment">Your Feedback</Label>
              <Textarea
                id="comment"
                placeholder="Share your thoughts, suggestions, or concerns about your schedule..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={4}
                className="resize-none"
                maxLength={2000}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Minimum 10 characters</span>
                <span>{commentText.length}/2000</span>
              </div>
            </div>

            {/* Submit Error */}
            {submitError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {submitError}
              </div>
            )}

            {/* Submit Success */}
            {submitSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 p-3 rounded-lg">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                Feedback submitted successfully!
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || commentText.trim().length < 10}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                <Clock className="h-4 w-4 text-accent" />
              </div>
              Your Feedback History
            </span>
            <Badge variant="secondary" className="font-normal">
              {feedbackList.length}{" "}
              {feedbackList.length === 1 ? "item" : "items"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingFeedback ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-4 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          ) : feedbackList.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No feedback submitted yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Use the form above to share your thoughts
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbackList.map((feedback, index) => (
                <div key={feedback.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {feedback.section ? (
                            <Badge variant="outline" className="font-medium">
                              {feedback.section.course_code}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">General Feedback</Badge>
                          )}
                          {feedback.is_resolved ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Resolved
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                        {feedback.section && (
                          <p className="text-sm text-muted-foreground">
                            {feedback.section.course_title}
                            {feedback.section.activity && (
                              <span className="ml-1">
                                ({feedback.section.activity})
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      {/* Delete Button (only for unresolved) */}
                      {!feedback.is_resolved && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive"
                              disabled={deletingId === feedback.id}
                            >
                              {deletingId === feedback.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Feedback?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. Your feedback will
                                be permanently removed.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(feedback.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>

                    {/* Rating */}
                    {feedback.rating && (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "h-4 w-4",
                              star <= feedback.rating!
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                            )}
                          />
                        ))}
                      </div>
                    )}

                    {/* Comment */}
                    <p className="text-sm leading-relaxed">
                      {feedback.comment_text}
                    </p>

                    {/* Timestamp */}
                    <p className="text-xs text-muted-foreground">
                      Submitted {formatDate(feedback.created_at)}
                      {feedback.is_resolved && feedback.resolved_at && (
                        <span>
                          {" "}
                          · Resolved {formatDate(feedback.resolved_at)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
