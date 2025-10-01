"use client";
import React from "react";
import * as committee from "@/components/committee";
import {
  PersonaNavigation,
  PageContainer,
  committeeNavItems,
} from "@/components/shared";
import { checkAllConflicts } from "@/lib/rules-engine";

export default function Page(): React.ReactElement {
  const conflictResult = checkAllConflicts();

  const handleConflictResolve = (conflictId: string) => {
    console.log("Resolving conflict:", conflictId);
    // TODO: Send to API endpoint POST /api/conflicts/:id/resolve
  };

  return (
    <>
      <PersonaNavigation
        personaName="Scheduling Committee"
        navItems={committeeNavItems}
      />

      <PageContainer
        title="Rules & Conflicts"
        description="Configure scheduling rules and review detected conflicts"
      >
        <div className="space-y-8">
          {/* Rules Configuration */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Scheduling Rules</h2>
            <committee.scheduler.rules.RulesTable />
          </div>

          {/* Conflicts Display */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Detected Conflicts ({conflictResult.conflicts.length})
            </h2>
            {conflictResult.conflicts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No scheduling conflicts detected. All rules are satisfied.
              </p>
            ) : (
              <div className="space-y-2">
                {conflictResult.conflicts.map((conflict, idx) => (
                  <div
                    key={idx}
                    className="p-4 border rounded-lg bg-destructive/10 border-destructive/30"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-destructive">
                          {conflict.type}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {conflict.message}
                        </p>
                      </div>
                      <button
                        onClick={() => handleConflictResolve(conflict.id)}
                        className="text-xs px-3 py-1 bg-background border rounded hover:bg-accent"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </>
  );
}
