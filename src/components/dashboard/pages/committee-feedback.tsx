"use client";

import * as React from "react";
import { MessageSquareWarning, UserCheck } from "lucide-react";

import { committeeFeedbackQueue } from "@/data/mock";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";

const severityTone: Record<string, string> = {
  High: "bg-red-500/15 text-red-700",
  Medium: "bg-amber-500/15 text-amber-700",
  Low: "bg-emerald-500/15 text-emerald-700",
};

const statusTone: Record<string, string> = {
  Unassigned: "bg-muted",
  "In Review": "bg-sky-500/15 text-sky-700",
  Resolved: "bg-emerald-500/15 text-emerald-700",
};

type FeedbackState = typeof committeeFeedbackQueue[number];

export function CommitteeFeedback() {
  const [items, setItems] = React.useState<FeedbackState[]>(committeeFeedbackQueue);
  const [severityFilter, setSeverityFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      const matchesSeverity = severityFilter === "all" || item.severity === severityFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSeverity && matchesStatus;
    });
  }, [items, severityFilter, statusFilter]);

  const assignItem = React.useCallback((id: string) => {
    setItems((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              status: "In Review",
              assignee: entry.assignee === "Pending" ? "Abeer AlQahtani" : entry.assignee,
            }
          : entry,
      ),
    );
  }, []);

  const columns = React.useMemo<DataTableColumn<FeedbackState>[]>(
    () => [
      {
        key: "title",
        header: "Item",
        sortable: true,
        accessor: (row) => row.title,
        render: (row) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-foreground">{row.title}</span>
            <span className="text-xs text-muted-foreground">{row.id}</span>
          </div>
        ),
      },
      {
        key: "severity",
        header: "Severity",
        sortable: true,
        accessor: (row) => row.severity,
        render: (row) => (
          <Badge variant="outline" className={severityTone[row.severity] || "bg-muted"}>
            {row.severity}
          </Badge>
        ),
        widthClass: "w-28",
      },
      {
        key: "source",
        header: "Source",
        sortable: true,
        accessor: (row) => row.source,
        render: (row) => <span className="text-sm text-muted-foreground">{row.source}</span>,
        widthClass: "w-32",
      },
      {
        key: "assignee",
        header: "Assignee",
        sortable: true,
        accessor: (row) => row.assignee,
        render: (row) => <span className="text-sm text-muted-foreground">{row.assignee}</span>,
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        accessor: (row) => row.status,
        render: (row) => (
          <Badge variant="outline" className={statusTone[row.status] || "bg-muted"}>
            {row.status}
          </Badge>
        ),
        widthClass: "w-32",
      },
      {
        key: "receivedAt",
        header: "Received",
        sortable: true,
        accessor: (row) => row.receivedAt,
        render: (row) => (
          <span className="text-sm text-muted-foreground">
            {new Date(row.receivedAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
        ),
        widthClass: "w-40",
      },
    ],
    [],
  );

  const handleRowAction = React.useCallback(
    (actionId: string, row: FeedbackState) => {
      if (actionId === "assign" && row.status === "Unassigned") {
        assignItem(row.id);
      }
    },
    [assignItem],
  );

  const handleBulkAction = React.useCallback(
    (actionId: string, rowIds: string[]) => {
      if (actionId === "assign") {
        rowIds.forEach((id) => {
          const row = items.find((item) => item.id === id);
          if (row?.status === "Unassigned") {
            assignItem(id);
          }
        });
      }
    },
    [assignItem, items],
  );

  return (
    <Card data-test="committee-feedback-card">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageSquareWarning className="size-5 text-primary" aria-hidden="true" />
              Feedback queue
            </CardTitle>
            <CardDescription>Route high-severity items quickly and track ownership progress.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2" data-test="feedback-filters">
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
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
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Unassigned">Unassigned</SelectItem>
                <SelectItem value="In Review">In review</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="warning">
          <AlertTitle>Escalate critical safety feedback within 24 hours</AlertTitle>
          <AlertDescription>Items marked High severity remain visible until assigned and acknowledged.</AlertDescription>
        </Alert>
        <DataTable
          data={filteredItems}
          columns={columns}
          rowId={(row) => row.id}
          searchKeys={["title", "id", "assignee"]}
          rowActions={[{ id: "assign", label: "Assign" }]}
          onRowAction={handleRowAction}
          bulkActions={[{ id: "assign", label: "Assign selected", icon: <UserCheck className="mr-2 size-4" aria-hidden="true" /> }]}
          onBulkAction={handleBulkAction}
          emptyMessage="No feedback items match the current filters."
          testId="feedback-datatable"
        />
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        {filteredItems.length} items shown • {items.filter((item) => item.status === "Unassigned").length} unassigned overall
      </CardFooter>
    </Card>
  );
}
