"use client";

import * as React from "react";
import { CalendarCheck, FilePlus, GitCompare } from "lucide-react";

import { schedulerDrafts } from "@/data/mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusBadge: Record<string, string> = {
  Draft: "bg-muted text-foreground",
  Review: "bg-amber-500/10 text-amber-700",
  Ready: "bg-emerald-500/10 text-emerald-700",
};

type DraftState = typeof schedulerDrafts[number];

type DraftForm = {
  name: string;
  owner: string;
};

export function SchedulerDrafts() {
  const [drafts, setDrafts] = React.useState<DraftState[]>(schedulerDrafts);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [compareOpen, setCompareOpen] = React.useState(false);
  const [selectedDrafts, setSelectedDrafts] = React.useState<{ left?: string; right?: string }>({});
  const [formDraft, setFormDraft] = React.useState<DraftForm>({ name: "", owner: "" });
  const [snapshotLoading, setSnapshotLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setSnapshotLoading(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  const handleCreateDraft = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!formDraft.name.trim()) return;
      const now = new Date().toISOString();
      setDrafts((prev) => [
        {
          id: `DR-${(Math.random() * 10000).toFixed(0)}`,
          name: formDraft.name,
          owner: formDraft.owner || "Layla Al-Harthi",
          progress: 0,
          conflicts: 0,
          lastUpdated: now,
          status: "Draft",
        },
        ...prev,
      ]);
      setFormDraft({ name: "", owner: "" });
      setCreateOpen(false);
    },
    [formDraft],
  );

  const draftOptions = React.useMemo(() => drafts.map((draft) => ({ value: draft.id, label: draft.name })), [drafts]);

  const leftDraft = drafts.find((draft) => draft.id === selectedDrafts.left);
  const rightDraft = drafts.find((draft) => draft.id === selectedDrafts.right);

  const formatDate = (iso: string) => new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <Card data-test="scheduler-drafts-card">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarCheck className="size-5 text-primary" aria-hidden="true" /> Draft schedules
            </CardTitle>
            <CardDescription>
              Track progress, conflicts, and compare iterations before promoting to versions.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setCompareOpen(true)} data-test="draft-compare">
              <GitCompare className="mr-2 size-4" aria-hidden="true" /> Compare drafts
            </Button>
            <Button type="button" onClick={() => setCreateOpen(true)} data-test="draft-create">
              <FilePlus className="mr-2 size-4" aria-hidden="true" /> New draft
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border bg-muted/30 p-4" data-test="draft-snapshot">
          {snapshotLoading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-foreground">Latest generator snapshot</p>
              <p className="text-xs text-muted-foreground">Last run completed at 09:20 with 98% course coverage.</p>
            </div>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="w-40">Progress</TableHead>
              <TableHead className="w-32 text-center">Conflicts</TableHead>
              <TableHead className="w-28 text-center">Status</TableHead>
              <TableHead className="w-40">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drafts.map((draft) => (
              <TableRow key={draft.id} data-test="draft-row">
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-foreground">{draft.name}</span>
                    <span className="text-xs text-muted-foreground">{draft.id}</span>
                  </div>
                </TableCell>
                <TableCell>{draft.owner}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Progress value={draft.progress} />
                    <span className="text-xs text-muted-foreground">{draft.progress}% complete</span>
                  </div>
                </TableCell>
                <TableCell className="text-center text-sm font-semibold">{draft.conflicts}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={statusBadge[draft.status] || "bg-muted"}>
                    {draft.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(draft.lastUpdated)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>{drafts.length} drafts managed in this workspace</span>
        <span>Conflicts auto-refresh after generator runs</span>
      </CardFooter>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create draft</DialogTitle>
            <DialogDescription>Start a new scenario to iterate without affecting active schedules.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateDraft} data-test="draft-form">
            <div className="space-y-2">
              <label htmlFor="draft-name" className="text-sm font-medium">
                Draft name
              </label>
              <Input
                id="draft-name"
                value={formDraft.name}
                onChange={(event) => setFormDraft((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="STEM Evening Scenario"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="draft-owner" className="text-sm font-medium">
                Owner
              </label>
              <Input
                id="draft-owner"
                value={formDraft.owner}
                onChange={(event) => setFormDraft((prev) => ({ ...prev, owner: event.target.value }))}
                placeholder="Layla Al-Harthi"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compare drafts</DialogTitle>
            <DialogDescription>Select two drafts to view differences in coverage and conflicts.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2" data-test="draft-compare-panel">
            <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
              <h3 className="text-sm font-semibold">Left draft</h3>
              <Select
                value={selectedDrafts.left}
                onValueChange={(value) => setSelectedDrafts((prev) => ({ ...prev, left: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose draft" />
                </SelectTrigger>
                <SelectContent>
                  {draftOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {leftDraft ? (
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>Conflicts: {leftDraft.conflicts}</li>
                  <li>Progress: {leftDraft.progress}%</li>
                  <li>Status: {leftDraft.status}</li>
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">Select a draft to inspect.</p>
              )}
            </div>
            <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
              <h3 className="text-sm font-semibold">Right draft</h3>
              <Select
                value={selectedDrafts.right}
                onValueChange={(value) => setSelectedDrafts((prev) => ({ ...prev, right: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose draft" />
                </SelectTrigger>
                <SelectContent>
                  {draftOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {rightDraft ? (
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>Conflicts: {rightDraft.conflicts}</li>
                  <li>Progress: {rightDraft.progress}%</li>
                  <li>Status: {rightDraft.status}</li>
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">Select a draft to inspect.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCompareOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
