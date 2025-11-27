"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageSquare, 
  Send, 
  Trash2, 
  Edit2, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  course_code: string;
  comment: string;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
  course?: {
    code: string;
    title: string;
  };
}

interface ElectiveCommentSectionProps {
  courseCode: string;
  courseTitle: string;
  initialComments: Comment[];
}

export function ElectiveCommentSection({
  courseCode,
  courseTitle,
  initialComments,
}: ElectiveCommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const handleSubmit = async () => {
    if (newComment.trim().length < 10) {
      toast.error("Comment must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const { getAuthHeader } = await import("@/lib/utils/client-auth");
      const authHeader = await getAuthHeader();

      const response = await fetch("/api/elective-preferences/comments", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": authHeader,
        },
        body: JSON.stringify({
          course_code: courseCode,
          comment: newComment,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit comment");
      }

      const result = await response.json();
      const comment = result.data || result;
      setComments([comment, ...comments]);
      setNewComment("");
      toast.success("Comment submitted successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit comment");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (editText.trim().length < 10) {
      toast.error("Comment must be at least 10 characters");
      return;
    }

    try {
      const { getAuthHeader } = await import("@/lib/utils/client-auth");
      const authHeader = await getAuthHeader();

      const response = await fetch(`/api/elective-preferences/comments/${commentId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": authHeader,
        },
        body: JSON.stringify({ comment: editText }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update comment");
      }

      const result = await response.json();
      const updatedComment = result.data || result;
      setComments(comments.map(c => c.id === commentId ? updatedComment : c));
      setEditingId(null);
      setEditText("");
      toast.success("Comment updated successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update comment");
      console.error(error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const { getAuthHeader } = await import("@/lib/utils/client-auth");
      const authHeader = await getAuthHeader();

      const response = await fetch(`/api/elective-preferences/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          "Authorization": authHeader,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete comment");
      }

      setComments(comments.filter(c => c.id !== commentId));
      toast.success("Comment deleted successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete comment");
      console.error(error);
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.comment);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  return (
    <div className="space-y-4">
      {/* Add New Comment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Add a Comment or Question
          </CardTitle>
          <CardDescription>
            Share your thoughts, questions, or concerns about {courseTitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Why are you interested in this course? Any questions about prerequisites, content, or scheduling?"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {newComment.length < 10 
                ? `${10 - newComment.length} more characters needed`
                : `${newComment.length} characters`}
            </span>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || newComment.trim().length < 10}
              size="sm"
            >
              <Send className="mr-2 h-3 w-3" />
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Comments */}
      {comments.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Your Previous Comments ({comments.length})
          </h4>
          {comments.map((comment) => (
            <Card key={comment.id} className={comment.is_resolved ? "bg-muted/50" : ""}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    {editingId === comment.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                          className="resize-none"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(comment.id)}
                            disabled={editText.trim().length < 10}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm">{comment.comment}</p>
                    )}
                  </div>
                  <Badge variant={comment.is_resolved ? "secondary" : "default"}>
                    {comment.is_resolved ? (
                      <><CheckCircle2 className="h-3 w-3 mr-1" /> Resolved</>
                    ) : (
                      <><AlertCircle className="h-3 w-3 mr-1" /> Pending</>
                    )}
                  </Badge>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    {comment.updated_at !== comment.created_at && " (edited)"}
                  </span>
                  
                  {!comment.is_resolved && editingId !== comment.id && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(comment)}
                        className="h-7 px-2"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(comment.id)}
                        className="h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {comment.is_resolved && (
                  <Alert className="mt-3">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      This comment has been reviewed and resolved by the scheduling committee.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

