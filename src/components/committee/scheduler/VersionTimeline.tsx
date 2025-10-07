"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// UI-only: schedule version timeline entry (not persisted)
export interface VersionEntry {
  id: string;
  version: number;
  createdAt: string; // ISO
  author?: string;
  description?: string;
  isActive?: boolean;
  diffSummary?: { added: number; removed: number; changed: number };
}

interface VersionTimelineProps {
  versions: VersionEntry[];
  onSelect?: (id: string) => void;
}

export const VersionTimeline: React.FC<VersionTimelineProps> = ({
  versions,
  onSelect,
}) => {
  const sorted = [...versions].sort((a, b) => b.version - a.version);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Versions</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative border-l ml-2 border-muted-foreground/20">
          {sorted.map((v) => (
            <li key={v.id} className="mb-6 ml-4">
              <div className="absolute -left-[6px] w-3 h-3 rounded-full bg-primary" />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelect?.(v.id)}
                  className="text-sm font-semibold hover:underline text-left"
                >
                  Version {v.version}
                </button>
                {v.isActive && (
                  <Badge className="text-[10px]" variant="default">
                    Active
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {new Date(v.createdAt).toLocaleString()}{" "}
                {v.author && `• ${v.author}`}
              </div>
              {v.description && (
                <div className="text-xs mt-1">{v.description}</div>
              )}
              {v.diffSummary && (
                <div className="flex gap-2 mt-1 text-[10px] text-muted-foreground">
                  <span>+{v.diffSummary.added}</span>
                  <span>-{v.diffSummary.removed}</span>
                  <span>~{v.diffSummary.changed}</span>
                </div>
              )}
            </li>
          ))}
          {sorted.length === 0 && (
            <div className="text-sm text-muted-foreground ml-2">
              No versions committed.
            </div>
          )}
        </ol>
      </CardContent>
    </Card>
  );
};

export default VersionTimeline;
