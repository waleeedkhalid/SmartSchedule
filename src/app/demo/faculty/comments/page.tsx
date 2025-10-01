"use client";
import React, { useState } from "react";
import {
  PersonaNavigation,
  PageContainer,
  facultyNavItems,
} from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send } from "lucide-react";

interface Comment {
  id: string;
  topic: string;
  message: string;
  date: string;
  status: "draft" | "sent" | "acknowledged";
}

const mockComments: Comment[] = [
  {
    id: "cmt-1",
    topic: "Thursday Availability Conflict",
    message:
      "I have a research meeting every Thursday 14:00-16:00. Please avoid scheduling my classes during this time.",
    date: "2025-09-15",
    status: "sent",
  },
  {
    id: "cmt-2",
    topic: "Lab Room Preference",
    message:
      "For SWE312 lab sections, I prefer using Room 3-105 as it has better equipment for the practical exercises.",
    date: "2025-09-20",
    status: "acknowledged",
  },
];

export default function Page(): React.ReactElement {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>(mockComments);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `cmt-${Date.now()}`,
      topic: "General Feedback",
      message: newComment,
      date: new Date().toISOString().split("T")[0],
      status: "draft",
    };

    console.log("Submitting comment:", comment);
    setComments([comment, ...comments]);
    setNewComment("");
    // TODO: Send to API endpoint POST /api/faculty/comments
  };

  const getStatusColor = (status: Comment["status"]) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "acknowledged":
        return "bg-green-100 text-green-800";
    }
  };

  return (
    <>
      <PersonaNavigation
        personaName="Faculty Portal"
        navItems={facultyNavItems}
      />

      <PageContainer
        title="Comments & Feedback"
        description="Provide feedback and communicate with the scheduling committee"
      >
        <div className="space-y-6">
          {/* New Comment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Submit New Comment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Share your feedback, concerns, or suggestions with the scheduling committee..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Comment
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Previous Comments */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Previous Comments</h2>
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No previous comments. Submit your first comment above.
              </p>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">
                            {comment.topic}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(comment.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(comment.status)}>
                          {comment.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{comment.message}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </>
  );
}
