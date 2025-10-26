"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Feedback {
  id: string;
  student_id: string;
  term_code: string;
  rating: number;
  comments?: string | null;
  submitted_at: string;
}

export function FeedbackForm() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  async function fetchFeedback() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/student/feedback");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch feedback");
      }

      const data = await response.json();

      if (data.feedback) {
        setFeedback(data.feedback);
        setRating(data.feedback.rating);
        setComments(data.feedback.comments || "");
      }

      setIsFeedbackOpen(data.is_feedback_open);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      setError("Please select a rating");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch("/api/student/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comments: comments.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit feedback");
      }

      const data = await response.json();
      setFeedback(data.feedback);
      setSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Loading feedback...</span>
        </CardContent>
      </Card>
    );
  }

  if (!isFeedbackOpen) {
    return (
      <Alert>
        <AlertDescription>
          Feedback is currently not open for this term.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Feedback</CardTitle>
        <p className="text-sm text-muted-foreground">
          {feedback
            ? "You've already submitted feedback. You can update it below."
            : "How satisfied are you with your assigned schedule?"}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Stars */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-all hover:scale-110"
                  aria-label={`Rate ${value} out of 5 stars`}
                >
                  <Star
                    className={cn(
                      "h-8 w-8",
                      (hoverRating >= value || rating >= value)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-none text-gray-300"
                    )}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                {rating === 1 && "Very Dissatisfied"}
                {rating === 2 && "Dissatisfied"}
                {rating === 3 && "Neutral"}
                {rating === 4 && "Satisfied"}
                {rating === 5 && "Very Satisfied"}
              </p>
            )}
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <label htmlFor="comments" className="text-sm font-medium">
              Comments (Optional)
            </label>
            <Textarea
              id="comments"
              placeholder="Share your thoughts about the schedule (optional)"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comments.length}/500
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="border-green-500 bg-green-50 text-green-900">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                {feedback?.id
                  ? "Feedback updated successfully! Thank you for your input."
                  : "Feedback submitted successfully! Thank you for your input."}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={rating === 0 || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : feedback ? (
              "Update Feedback"
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

