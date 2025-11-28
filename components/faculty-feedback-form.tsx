"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Send, Star } from "lucide-react";
import type { FacultySection } from "@/lib/db/faculty-data";

interface FacultyFeedbackFormProps {
  sections: FacultySection[];
}

export function FacultyFeedbackForm({ sections }: FacultyFeedbackFormProps) {
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSection) {
      toast.error("Please select a section");
      return;
    }
    
    if (!comment.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/v1/faculty/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section_id: selectedSection,
          comment_text: comment.trim(),
          rating: rating > 0 ? rating : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit feedback");
      }

      toast.success("Feedback submitted successfully");
      setComment("");
      setSelectedSection("");
      setRating(0);
      
      // Refresh the page to show the new comment
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (starValue: number) => {
    setRating(starValue === rating ? 0 : starValue);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Submit New Feedback</CardTitle>
        <CardDescription>
          Share your feedback on schedule assignments, timing, or any concerns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section Selection */}
          <div className="space-y-2">
            <Label htmlFor="section">Select Section</Label>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger id="section">
                <SelectValue placeholder="Choose a section to comment on" />
              </SelectTrigger>
              <SelectContent>
                {sections.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No sections assigned
                  </SelectItem>
                ) : (
                  sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.course_code} - {section.course_title} (Section {section.section_no})
                    </SelectItem>
                  ))
                )}
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
                  onClick={() => handleStarClick(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating}/5
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Feedback</Label>
            <Textarea
              id="comment"
              placeholder="Describe your feedback, concerns, or suggestions..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {comment.length}/2000 characters
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || sections.length === 0}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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
  );
}

