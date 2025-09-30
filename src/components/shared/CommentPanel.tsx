"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export interface CommentItem {
  id: string;
  persona: string; // STUDENT | FACULTY | COMMITTEE | TEACHING_LOAD | REGISTRAR
  createdAt: string;
  author?: string;
  body: string;
  versionId?: string; // optional link to schedule version
}

interface CommentPanelProps {
  comments: CommentItem[];
  // persona reserved for future styling / filtering logic
  persona: string;
  onAdd?: (body: string) => void;
  filterVersionId?: string;
  compact?: boolean;
}

export const CommentPanel: React.FC<CommentPanelProps> = ({
  comments,
  onAdd,
  filterVersionId,
  compact,
}) => {
  const [text, setText] = useState("");
  const filtered = comments.filter(
    (c) => !filterVersionId || c.versionId === filterVersionId
  );

  function submit() {
    if (!text.trim()) return;
    onAdd?.(text.trim());
    setText("");
  }

  return (
    <Card className={compact ? "h-full flex flex-col" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 flex-1 flex flex-col">
        <div className="space-y-2 overflow-y-auto max-h-60 pr-1">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="rounded border p-2 text-xs bg-background"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] uppercase">
                    {c.persona}
                  </Badge>
                  {c.author && <span className="font-medium">{c.author}</span>}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(c.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="whitespace-pre-wrap leading-snug">{c.body}</div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-xs text-muted-foreground">
              No comments yet.
            </div>
          )}
        </div>
        <div className="pt-1 mt-auto">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment"
            className="mb-2 h-20 text-xs"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={submit} disabled={!text.trim()}>
              Post
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentPanel;
