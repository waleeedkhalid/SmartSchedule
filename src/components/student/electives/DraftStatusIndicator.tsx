"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, AlertCircle, Clock } from "lucide-react";
import { AutoSaveStatus } from "./use-draft-autosave";
import { cn } from "@/lib/utils";

interface DraftStatusIndicatorProps {
  saveStatus: AutoSaveStatus;
  className?: string;
}

export function DraftStatusIndicator({
  saveStatus,
  className,
}: DraftStatusIndicatorProps) {
  const getStatusContent = () => {
    switch (saveStatus.status) {
      case "saving":
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: "Saving draft...",
          variant: "secondary" as const,
          bgColor: "bg-info-bg border-info-border",
        };
      case "saved":
        return {
          icon: <CheckCircle2 className="h-3 w-3 text-success" />,
          text: saveStatus.lastSaved
            ? `Saved ${formatTimeAgo(saveStatus.lastSaved)}`
            : "Draft saved",
          variant: "outline" as const,
          bgColor: "bg-success-bg border-success-border",
        };
      case "error":
        return {
          icon: <AlertCircle className="h-3 w-3 text-destructive" />,
          text: "Failed to save",
          variant: "destructive" as const,
          bgColor: "bg-destructive/10 border-destructive/20",
        };
      case "idle":
      default:
        return {
          icon: <Clock className="h-3 w-3 text-muted-foreground" />,
          text: saveStatus.lastSaved
            ? `Last saved ${formatTimeAgo(saveStatus.lastSaved)}`
            : "Auto-save enabled",
          variant: "secondary" as const,
          bgColor: "bg-muted/50 border-muted",
        };
    }
  };

  const { icon, text, variant, bgColor } = getStatusContent();

  return (
    <Badge
      variant={variant}
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 transition-all duration-300",
        bgColor,
        className
      )}
    >
      {icon}
      <span>{text}</span>
    </Badge>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return date.toLocaleDateString();
}

