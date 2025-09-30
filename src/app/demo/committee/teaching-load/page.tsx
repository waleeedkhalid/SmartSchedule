"use client";
import React from "react";
import * as committee from "@/components/committee";

export default function Page(): React.ReactElement {
  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Teaching Load Demo</h1>
        <p className="text-sm text-muted-foreground">Preview of teaching load review components</p>
      </div>

      <committee.teachingLoad.LoadReviewTable />
    </div>
  );
}


