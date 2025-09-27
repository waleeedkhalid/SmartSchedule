"use client";

import * as React from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type DataTableColumn<T> = {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  accessor?: (row: T) => string | number;
  render?: (row: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  widthClass?: string;
};

export type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  rowId: (row: T) => string;
  searchKeys?: Array<keyof T | ((row: T) => string)>;
  pageSize?: number;
  rowActions?: Array<{ id: string; label: string }>;
  onRowAction?: (actionId: string, row: T) => void;
  bulkActions?: Array<{ id: string; label: string; icon?: React.ReactNode }>;
  onBulkAction?: (actionId: string, rowIds: string[]) => void;
  emptyMessage?: string;
  className?: string;
  testId?: string;
};

type SortState = { key: string; direction: "asc" | "desc" } | null;

export function DataTable<T>({
  data,
  columns,
  rowId,
  searchKeys = [],
  pageSize = 6,
  rowActions = [],
  onRowAction,
  bulkActions = [],
  onBulkAction,
  emptyMessage = "No records yet",
  className,
  testId,
}: DataTableProps<T>) {
  const [search, setSearch] = React.useState("");
  const [sortState, setSortState] = React.useState<SortState>(null);
  const [page, setPage] = React.useState(0);
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());

  const filtered = React.useMemo(() => {
    if (!search.trim()) return data;
    return data.filter((row) => {
      if (searchKeys.length === 0) return true;
      const haystack = searchKeys
        .map((key) => {
          if (typeof key === "function") return key(row as T);
          const value = (row as Record<string, unknown>)[key as string];
          return typeof value === "string" || typeof value === "number" ? String(value) : "";
        })
        .join(" ")
        .toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [data, search, searchKeys]);

  const sorted = React.useMemo(() => {
    if (!sortState) return filtered;
    const { key, direction } = sortState;
    const column = columns.find((col) => col.key === key);
    if (!column) return filtered;
    const accessor = column.accessor
      ? column.accessor
      : (row: T) => {
          const value = (row as Record<string, unknown>)[key];
          return typeof value === "number" || typeof value === "string" ? value : "";
        };
    return [...filtered].sort((a, b) => {
      const aValue = accessor(a);
      const bValue = accessor(b);
      if (aValue === bValue) return 0;
      if (aValue == null) return direction === "asc" ? -1 : 1;
      if (bValue == null) return direction === "asc" ? 1 : -1;
      return direction === "asc"
        ? String(aValue).localeCompare(String(bValue), undefined, { numeric: true })
        : String(bValue).localeCompare(String(aValue), undefined, { numeric: true });
    });
  }, [columns, filtered, sortState]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);

  const paginated = React.useMemo(() => {
    const start = currentPage * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  React.useEffect(() => {
    setPage(0);
  }, [search, sortState]);

  const toggleRow = React.useCallback(
    (id: string) => {
      setSelectedRows((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [],
  );

  const toggleAll = React.useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedRows(new Set(paginated.map((row) => rowId(row))));
      } else {
        setSelectedRows(new Set());
      }
    },
    [paginated, rowId],
  );

  const allSelected = paginated.length > 0 && paginated.every((row) => selectedRows.has(rowId(row)));
  const partiallySelected = paginated.some((row) => selectedRows.has(rowId(row))) && !allSelected;

  const handleSort = React.useCallback(
    (key: string) => {
      setSortState((prev) => {
        if (prev?.key === key) {
          if (prev.direction === "asc") return { key, direction: "desc" };
          if (prev.direction === "desc") return null;
        }
        return { key, direction: "asc" };
      });
    },
    [],
  );

  const handleBulkAction = React.useCallback(
    (actionId: string) => {
      if (!onBulkAction) return;
      onBulkAction(actionId, Array.from(selectedRows));
      setSelectedRows(new Set());
    },
    [onBulkAction, selectedRows],
  );

  const startLabel = Math.min(sorted.length, currentPage * pageSize + 1);
  const endLabel = Math.min(sorted.length, (currentPage + 1) * pageSize);

  return (
    <div className={cn("space-y-4", className)} data-test={testId}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {selectedRows.size > 0 ? (
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {selectedRows.size} selected
            </Badge>
          ) : null}
          {bulkActions.map((action) => (
            <Button
              key={action.id}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction(action.id)}
              disabled={selectedRows.size === 0}
            >
              {action.icon ?? <Trash2 className="mr-2 size-4" aria-hidden="true" />} {action.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  indeterminate={partiallySelected}
                  onChange={(event) => toggleAll(Boolean(event.target.checked))}
                  aria-label="Select all rows"
                />
              </TableHead>
              {columns.map((column) => (
                <TableHead key={String(column.key)} className={cn(column.widthClass)}>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm font-medium text-foreground"
                    onClick={() => column.sortable && handleSort(String(column.key))}
                  >
                    {column.header}
                    {column.sortable ? <ArrowUpDown className="size-3" aria-hidden="true" /> : null}
                  </button>
                </TableHead>
              ))}
              {rowActions.length > 0 ? <TableHead className="w-28 text-center">Actions</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((row) => {
              const id = rowId(row);
              return (
                <TableRow key={id} data-test="datatable-row">
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(id)}
                      onChange={() => toggleRow(id)}
                      aria-label={`Select row ${id}`}
                    />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={`${id}-${String(column.key)}`} className={cn(column.align === "right" && "text-right", column.align === "center" && "text-center")}
                    >
                      {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key as string] ?? "")}
                    </TableCell>
                  ))}
                  {rowActions.length > 0 ? (
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {rowActions.map((action) => (
                          <Button
                            key={action.id}
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => onRowAction?.(action.id, row)}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            })}
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (rowActions.length > 0 ? 2 : 1)} className="py-12 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col items-start justify-between gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center">
        <span>
          Showing {startLabel}-{endLabel} of {sorted.length}
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="size-4" aria-hidden="true" /> Prev
          </Button>
          <Badge variant="outline" className="bg-muted/60">
            Page {currentPage + 1} / {totalPages}
          </Badge>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
            disabled={currentPage >= totalPages - 1}
          >
            Next <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
