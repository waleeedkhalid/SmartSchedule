"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MessageSquare, Send, Loader2 } from "lucide-react";

// Lazy load heavy Card and Select components
const Card = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.Card),
  { ssr: false }
);
const CardContent = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardContent),
  { ssr: false }
);
const CardDescription = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardDescription),
  { ssr: false }
);
const CardHeader = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardHeader),
  { ssr: false }
);
const CardTitle = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardTitle),
  { ssr: false }
);
const Select = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.Select),
  { ssr: false }
);
const SelectContent = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectContent),
  { ssr: false }
);
const SelectItem = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectItem),
  { ssr: false }
);
const SelectTrigger = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectTrigger),
  { ssr: false }
);
const SelectValue = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectValue),
  { ssr: false }
);

interface Section {
  id: string;
  course_code: string;
  course_title: string;
  section_no: string;
}

interface ScheduleCommentFormProps {
  sections: Section[];
  onCommentCreated?: () => void;
}

export function ScheduleCommentForm({
  sections,
  onCommentCreated,
}: ScheduleCommentFormProps) {
  const [commentText, setCommentText] = useState("");
  const [commentType, setCommentType] = useState<"general" | "section">(
    "general"
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const characterCount = commentText.length;
  const maxCharacters = 2000;
  const isValid =
    commentText.trim().length > 0 && commentText.length <= maxCharacters;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      toast.error("Please enter a valid comment");
      return;
    }

    if (commentType === "section" && !selectedSectionId) {
      toast.error("Please select a section");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/schedule-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment_text: commentText.trim(),
          section_id: commentType === "section" ? selectedSectionId : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit comment");
      }

      toast.success("Comment submitted successfully");

      // Reset form
      setCommentText("");
      setCommentType("general");
      setSelectedSectionId("");

      // Callback to refresh comments list
      if (onCommentCreated) {
        onCommentCreated();
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit comment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          Submit Feedback
        </CardTitle>
        <CardDescription>
          Share your thoughts on the schedule or specific sections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Comment Type Selection */}
          <div className="space-y-2">
            <Label>Feedback Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={commentType === "general" ? "default" : "outline"}
                onClick={() => {
                  setCommentType("general");
                  setSelectedSectionId("");
                }}
                className="flex-1"
              >
                General Feedback
              </Button>
              <Button
                type="button"
                variant={commentType === "section" ? "default" : "outline"}
                onClick={() => setCommentType("section")}
                className="flex-1"
                disabled={sections.length === 0}
              >
                Section-Specific
              </Button>
            </div>
          </div>

          {/* Section Selection (only for section-specific) */}
          {commentType === "section" && (
            <div className="space-y-2">
              <Label htmlFor="section">Select Section</Label>
              {sections.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No sections available. You must be assigned to sections to
                  leave section-specific feedback.
                </p>
              ) : (
                <Select
                  value={selectedSectionId}
                  onValueChange={setSelectedSectionId}
                >
                  <SelectTrigger id="section">
                    <SelectValue placeholder="Choose a section..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.course_code} - {section.course_title} (Section{" "}
                        {section.section_no})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Comment Text */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Comment</Label>
            <Textarea
              id="comment"
              placeholder={
                commentType === "general"
                  ? "Share your general thoughts about the schedule..."
                  : "Share feedback about this specific section..."
              }
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={6}
              maxLength={maxCharacters}
              className="resize-none"
            />
            <div className="flex justify-between text-sm">
              <span
                className={characterCount === 0 ? "text-muted-foreground" : ""}
              >
                {characterCount > 0
                  ? `${characterCount} / ${maxCharacters} characters`
                  : ""}
              </span>
              {characterCount > maxCharacters * 0.9 && (
                <span
                  className={
                    characterCount >= maxCharacters
                      ? "text-destructive font-medium"
                      : "text-amber-600"
                  }
                >
                  {maxCharacters - characterCount} remaining
                </span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={
              !isValid ||
              isSubmitting ||
              (commentType === "section" && !selectedSectionId)
            }
            className="w-full flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
