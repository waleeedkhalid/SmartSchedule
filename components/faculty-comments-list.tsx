"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { MessageSquare, Star, CheckCircle, Clock, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { FacultyComment } from "@/lib/db/faculty-data";

interface FacultyCommentsListProps {
  comments: FacultyComment[];
}

export function FacultyCommentsList({ comments }: FacultyCommentsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId);
    
    try {
      const response = await fetch(`/api/v1/faculty/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete comment");
      }

      toast.success("Comment deleted successfully");
      
      // Refresh the page to update the list
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete comment");
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  if (comments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Feedback History</CardTitle>
          <CardDescription>
            You haven&apos;t submitted any feedback yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No feedback submitted</p>
            <p className="text-sm mt-1">Submit your first feedback using the form above</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Your Feedback History</span>
          <Badge variant="secondary">{comments.length} comments</Badge>
        </CardTitle>
        <CardDescription>
          Track your submitted feedback and resolution status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 rounded-lg border ${
                comment.is_resolved
                  ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                  : "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Section Info */}
                  {comment.section && (
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {comment.section.course_code} - Section {comment.section.section_no}
                      </Badge>
                      {renderStars(comment.rating)}
                    </div>
                  )}
                  
                  {/* Comment Text */}
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.comment_text}
                  </p>
                  
                  {/* Metadata */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                    {comment.is_resolved && (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-3 w-3" />
                        Resolved
                        {comment.resolved_at && (
                          <span>
                            {formatDistanceToNow(new Date(comment.resolved_at), { addSuffix: true })}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex-shrink-0">
                  {!comment.is_resolved && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          disabled={deletingId === comment.id}
                        >
                          {deletingId === comment.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this comment? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(comment.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

