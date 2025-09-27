"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: number;
  min?: number;
  max?: number;
};

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value = 0, min = 0, max = 100, className, ...props }, ref) => {
    const clamped = Math.min(Math.max(value, min), max);
    const percent = ((clamped - min) / (max - min)) * 100;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={min}
        aria-valuemax={max}
        className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
        {...props}
      >
        <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>
    );
  },
);
Progress.displayName = "Progress";
