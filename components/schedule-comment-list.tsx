"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { MessageSquare, CheckCircle, Clock, Edit2, Trash2, X, Save } from "lucide-react";
import { format } from "date-fns";

export interface Comment {
  id: string;
  comment_text: string;
  section_id: string | null;
  is_resolved: boolean;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  section?: {
    course_code: string;
    section_no: string;
    course_title: string;
  } | null;
  resolver?: {
    name: string;
    email: string;
  } | null;
}

interface ScheduleCommentListProps {
  comments: Comment[];
  onCommentUpdated?: () => void;
}

type FilterType = 'all' | 'resolved' | 'unresolved' | 'general' | 'section-specific';

export function ScheduleCommentList({ comments, onCommentUpdated }: ScheduleCommentListProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter comments
  const filteredComments = comments.filter(comment => {
    if (filter === 'all') return true;
    if (filter === 'resolved') return comment.is_resolved;
    if (filter === 'unresolved') return !comment.is_resolved;
    if (filter === 'general') return comment.section_id === null;
    if (filter === 'section-specific') return comment.section_id !== null;
    return true;
  });

  // Start editing
  const startEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.comment_text);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditText("");
  };

  // Save edit
  const saveEdit = async (commentId: string) => {
    if (!editText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsEditing(true);

    try {
      const response = await fetch(`/api/schedule-comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_text: editText.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update comment');
      }

      toast.success('Comment updated successfully');
      setEditingCommentId(null);
      setEditText("");

      if (onCommentUpdated) {
        onCommentUpdated();
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update comment');
    } finally {
      setIsEditing(false);
    }
  };

  // Delete comment
  const deleteComment = async (commentId: string) => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/schedule-comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete comment');
      }

      toast.success('Comment deleted successfully');
      setDeletingCommentId(null);

      if (onCommentUpdated) {
        onCommentUpdated();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete comment');
    } finally {
      setIsDeleting(false);
    }
  };

  if (comments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30 text-muted-foreground" />
          <p className="font-medium text-muted-foreground">No Comments Yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your feedback will appear here once submitted
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All ({comments.length})
            </Button>
            <Button
              size="sm"
              variant={filter === 'unresolved' ? 'default' : 'outline'}
              onClick={() => setFilter('unresolved')}
            >
              Unresolved ({comments.filter(c => !c.is_resolved).length})
            </Button>
            <Button
              size="sm"
              variant={filter === 'resolved' ? 'default' : 'outline'}
              onClick={() => setFilter('resolved')}
            >
              Resolved ({comments.filter(c => c.is_resolved).length})
            </Button>
            <Button
              size="sm"
              variant={filter === 'general' ? 'default' : 'outline'}
              onClick={() => setFilter('general')}
            >
              General ({comments.filter(c => c.section_id === null).length})
            </Button>
            <Button
              size="sm"
              variant={filter === 'section-specific' ? 'default' : 'outline'}
              onClick={() => setFilter('section-specific')}
            >
              Section-Specific ({comments.filter(c => c.section_id !== null).length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      {filteredComments.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>No comments match the selected filter</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <Card key={comment.id} className={comment.is_resolved ? "opacity-75" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    {comment.section ? (
                      <div>
                        <CardTitle className="text-lg">
                          {comment.section.course_code} - Section {comment.section.section_no}
                        </CardTitle>
                        <CardDescription>{comment.section.course_title}</CardDescription>
                      </div>
                    ) : (
                      <CardTitle className="text-lg">General Schedule Feedback</CardTitle>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Badge variant={comment.is_resolved ? "secondary" : "default"}>
                        {comment.is_resolved ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolved
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </>
                        )}
                      </Badge>
                      <Badge variant="outline">
                        {comment.section_id ? "Section-Specific" : "General"}
                      </Badge>
                    </div>
                  </div>

                  {!comment.is_resolved && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(comment)}
                        disabled={editingCommentId === comment.id}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingCommentId(comment.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingCommentId === comment.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={4}
                      maxLength={2000}
                      className="resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => saveEdit(comment.id)}
                        disabled={isEditing || !editText.trim()}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                        disabled={isEditing}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{comment.comment_text}</p>
                )}

                <div className="text-xs text-muted-foreground space-y-1">
                  <div>
                    Submitted {format(new Date(comment.created_at), 'PPp')}
                  </div>
                  {comment.updated_at !== comment.created_at && (
                    <div>
                      Updated {format(new Date(comment.updated_at), 'PPp')}
                    </div>
                  )}
                  {comment.is_resolved && comment.resolver && (
                    <div className="text-green-600 dark:text-green-400">
                      Resolved by {comment.resolver.name} on {format(new Date(comment.resolved_at!), 'PP')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingCommentId} onOpenChange={(open) => !open && setDeletingCommentId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Comment?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The comment will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingCommentId(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingCommentId && deleteComment(deletingCommentId)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

