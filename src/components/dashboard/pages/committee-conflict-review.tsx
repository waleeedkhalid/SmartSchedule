"use client";

import * as React from "react";
import { FilterX, ShieldAlert, ShieldCheck } from "lucide-react";

import { committeeConflicts } from "@/data/mock";
import { ConfirmDialog } from "@/components/shared/dialog-presets";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const severityTone: Record<string, string> = {
  Critical: "bg-red-500/15 text-red-700",
  High: "bg-amber-500/15 text-amber-700",
  Medium: "bg-blue-500/15 text-blue-700",
  Low: "bg-muted",
};

const statusTone: Record<string, string> = {
  Open: "bg-muted text-muted-foreground",
  Investigating: "bg-sky-500/15 text-sky-700",
  Resolved: "bg-emerald-500/15 text-emerald-700",
};

type ConflictState = typeof committeeConflicts[number];

export function CommitteeConflictReview() {
  const [conflicts, setConflicts] = React.useState<ConflictState[]>(committeeConflicts);
  const [selectedId, setSelectedId] = React.useState<string>(committeeConflicts[0]?.id ?? "");
  const [severityFilter, setSeverityFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("open");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingResolveId, setPendingResolveId] = React.useState<string | null>(null);

  const filteredConflicts = React.useMemo(() => {
    return conflicts.filter((conflict) => {
      const matchesSeverity = severityFilter === "all" || conflict.severity === severityFilter;
      const matchesStatus =
        statusFilter === "open"
          ? conflict.status !== "Resolved"
          : statusFilter === "resolved"
          ? conflict.status === "Resolved"
          : true;
      return matchesSeverity && matchesStatus;
    });
  }, [conflicts, severityFilter, statusFilter]);

  const selectedConflict = conflicts.find((conflict) => conflict.id === selectedId) ?? filteredConflicts[0];

  React.useEffect(() => {
    if (!selectedConflict && filteredConflicts.length > 0) {
      setSelectedId(filteredConflicts[0].id);
    }
  }, [filteredConflicts, selectedConflict]);

  React.useEffect(() => {
    if (!confirmOpen) {
      setPendingResolveId(null);
    }
  }, [confirmOpen]);

  const resolveConflict = React.useCallback((id: string) => {
    setConflicts((prev) => prev.map((conflict) => (conflict.id === id ? { ...conflict, status: "Resolved" } : conflict)));
  }, []);

  const resetFilters = React.useCallback(() => {
    setSeverityFilter("all");
    setStatusFilter("open");
  }, []);

  return (
    <Card data-test="committee-conflict-card">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShieldAlert className="size-5 text-primary" aria-hidden="true" />
              Conflict review
            </CardTitle>
            <CardDescription>Filter, inspect, and resolve escalated conflicts from scheduling runs.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="all">All statuses</SelectItem>
              </SelectContent>
            </Select>
            <Button type="button" variant="ghost" size="sm" onClick={resetFilters} data-test="conflict-reset">
              <FilterX className="mr-1.5 size-4" aria-hidden="true" /> Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="space-y-2 overflow-auto pr-1" data-test="conflict-list">
          {filteredConflicts.map((conflict) => (
            <button
              key={conflict.id}
              type="button"
              onClick={() => setSelectedId(conflict.id)}
              className={`w-full rounded-lg border p-3 text-left transition ${
                conflict.id === selectedId ? "border-primary bg-primary/10" : "bg-background hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{conflict.name}</span>
                <Badge variant="outline" className={severityTone[conflict.severity] || "bg-muted"}>
                  {conflict.severity}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{conflict.category} • {conflict.owner}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Flagged {new Date(conflict.flaggedOn).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </p>
            </button>
          ))}
          {filteredConflicts.length === 0 ? (
            <Alert variant="info" className="p-4 text-sm">
              <AlertTitle>No conflicts match</AlertTitle>
              <AlertDescription>Adjust filters to view archived items.</AlertDescription>
            </Alert>
          ) : null}
        </div>

        <div className="flex flex-col gap-3" data-test="conflict-detail">
          {selectedConflict ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={severityTone[selectedConflict.severity] || "bg-muted"}>
                  {selectedConflict.severity}
                </Badge>
                <Badge variant="outline" className={statusTone[selectedConflict.status] || "bg-muted"}>
                  {selectedConflict.status}
                </Badge>
                <span className="text-xs text-muted-foreground">{selectedConflict.category}</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">{selectedConflict.name}</h3>
              <p className="text-sm text-muted-foreground">Owner: {selectedConflict.owner}</p>
              <Alert variant="warning">
                <AlertTitle>Conflict detail</AlertTitle>
                <AlertDescription>{selectedConflict.detail}</AlertDescription>
              </Alert>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setPendingResolveId(selectedConflict.id);
                    setConfirmOpen(true);
                  }}
                  disabled={selectedConflict.status === "Resolved"}
                  data-test="conflict-resolve"
                >
                  <ShieldCheck className="mr-2 size-4" aria-hidden="true" /> Mark resolved
                </Button>
                <Button type="button" variant="outline" size="sm">
                  Request follow-up
                </Button>
              </div>
            </>
          ) : (
            <Alert variant="info">
              <AlertTitle>Select a conflict to see details</AlertTitle>
              <AlertDescription>Choose from the list on the left to review mitigation steps.</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        {conflicts.filter((conflict) => conflict.status !== "Resolved").length} open items • {conflicts.length} total tracked
      </CardFooter>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Resolve conflict?"
        description="This marks the conflict as resolved and hides it from active review lists."
        confirmLabel="Resolve"
        onConfirm={() => {
          if (pendingResolveId) {
            resolveConflict(pendingResolveId);
          }
          setPendingResolveId(null);
        }}
        cancelLabel="Dismiss"
      />
    </Card>
  );
}
