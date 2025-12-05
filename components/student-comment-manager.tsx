/**
 * Student Comment Manager Component
 *
 * Purpose: Dual-layer comment system for schedule feedback
 *
 * Comment Types:
 * 1. General Feedback: Overall schedule concerns (section_id = null)
 * 2. Section-Specific: Feedback on particular classes (section_id set)
 *
 * Features:
 * - Tabbed interface (General / Section Comments)
 * - Create, edit, delete comments (before resolution)
 * - View resolved comments with resolver info
 * - Real-time feedback status
 *
 * Permissions:
 * - Students can edit/delete own unresolved comments
 * - Once resolved by staff, comments become read-only
 */

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MessageSquare,
  Send,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getAuthHeader } from "@/lib/utils/client-auth";
import { cachedFetch, CacheTTL, apiCache } from "@/lib/utils/api-cache";
import { useIsClient } from "@/hooks/use-mounted";

interface Comment {
  id: string;
  student_id: string;
  section_id: string | null;
  comment_text: string;
  is_resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  section: {
    course_code: string;
    section_no: string;
    course_title: string;
  } | null;
  resolver: {
    name: string;
  } | null;
}

export function StudentCommentManager() {
  const [comments, setComments] = useState<Comment[]>([]);
  const isClient = useIsClient();
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, []);

  /**
   * Fetch all comments for the student
   * Uses caching to avoid duplicate requests
   */
  async function fetchComments() {
    setLoading(true);
    try {
      const authHeader = await getAuthHeader();
      // Cache comments for 5 minutes
      const data = await cachedFetch<{ comments: Comment[] }>(
        "/api/student/comments",
        {
          headers: authHeader ? { Authorization: authHeader } : {},
        },
        undefined,
        CacheTTL.MEDIUM
      );

      setComments(data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Create a new general comment
   */
  async function handleCreateComment() {
    if (!newCommentText.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    if (newCommentText.length > 2000) {
      toast.error("Comment is too long (max 2000 characters)");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/student/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment_text: newCommentText,
          section_id: null, // General comment
        }),
      });

      if (res.ok) {
        toast.success("Comment submitted");
        setNewCommentText("");
        // Invalidate cache after creating comment
        apiCache.invalidatePattern("/api/student/comments");
        fetchComments(); // Refresh list
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit comment");
      }
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error("Failed to submit comment");
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Update an existing comment
   */
  async function handleUpdateComment(commentId: string) {
    if (!editText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/student/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment_id: commentId,
          comment_text: editText,
        }),
      });

      if (res.ok) {
        toast.success("Comment updated");
        setEditingId(null);
        setEditText("");
        // Invalidate cache after updating comment
        apiCache.invalidatePattern("/api/student/comments");
        fetchComments();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update comment");
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Delete a comment
   */
  async function handleDeleteComment(commentId: string) {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/student/comments?id=${commentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Comment deleted");
        // Invalidate cache after deleting comment
        apiCache.invalidatePattern("/api/student/comments");
        fetchComments();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Start editing a comment
   */
  function startEdit(comment: Comment) {
    setEditingId(comment.id);
    setEditText(comment.comment_text);
  }

  /**
   * Cancel editing
   */
  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  /**
   * Format date for display - only format on client to avoid hydration mismatch
   */
  function formatDate(dateStr: string): string {
    if (!isClient) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }

  // Separate general and section-specific comments
  const generalComments = comments.filter((c) => c.section_id === null);
  const sectionComments = comments.filter((c) => c.section_id !== null);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading comments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Schedule Feedback & Comments
          </CardTitle>
          <CardDescription>
            Share feedback about your schedule. Resolved comments are read-only.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tabs for General vs Section Comments */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            General Feedback ({generalComments.length})
          </TabsTrigger>
          <TabsTrigger value="section">
            Section Comments ({sectionComments.length})
          </TabsTrigger>
        </TabsList>

        {/* General Feedback Tab */}
        <TabsContent value="general" className="space-y-4">
          {/* New Comment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Post General Feedback</CardTitle>
              <CardDescription>
                Share overall thoughts about your schedule (course load, time
                distribution, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your feedback here..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                rows={4}
                maxLength={2000}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {newCommentText.length} / 2000 characters
                </span>
                <Button
                  onClick={handleCreateComment}
                  disabled={submitting || !newCommentText.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* General Comments List */}
          <div className="space-y-3">
            {generalComments.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No general feedback yet</p>
                </CardContent>
              </Card>
            ) : (
              generalComments.map((comment) => (
                <Card
                  key={comment.id}
                  className={comment.is_resolved ? "bg-gray-50" : ""}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            comment.is_resolved ? "default" : "secondary"
                          }
                        >
                          {comment.is_resolved ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" /> Resolved
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 mr-1" /> Pending
                            </>
                          )}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>

                      {!comment.is_resolved && editingId !== comment.id && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(comment)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {editingId === comment.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateComment(comment.id)}
                            disabled={submitting}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm whitespace-pre-wrap">
                          {comment.comment_text}
                        </p>

                        {comment.is_resolved && comment.resolver && (
                          <Alert className="mt-3">
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              Resolved by {comment.resolver.name} on{" "}
                              {formatDate(comment.resolved_at!)}
                            </AlertDescription>
                          </Alert>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Section Comments Tab */}
        <TabsContent value="section" className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Section-specific comments allow you to provide feedback on
              individual classes. This feature will be fully functional once
              you&apos;re enrolled in sections.
            </AlertDescription>
          </Alert>

          {sectionComments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No section-specific comments yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sectionComments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">
                            {comment.section?.course_code}{" "}
                            {comment.section?.section_no}
                          </span>
                          <Badge
                            variant={
                              comment.is_resolved ? "default" : "secondary"
                            }
                          >
                            {comment.is_resolved ? "Resolved" : "Pending"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {comment.section?.course_title}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm mt-2">{comment.comment_text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
