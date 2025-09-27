"use client";

import * as React from "react";
import { ArrowDownWideNarrow, ArrowUp, ArrowUpDown, NotebookPen } from "lucide-react";

import { facultyPreferences } from "@/data/mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const deliveryModes = ["In-person", "Hybrid", "Online"] as const;

type PreferenceState = typeof facultyPreferences[number];

export function FacultyCoursePreferences() {
  const [preferences, setPreferences] = React.useState<PreferenceState[]>(facultyPreferences);
  const [notesDraft, setNotesDraft] = React.useState<Record<string, string>>(() =>
    facultyPreferences.reduce((acc, pref) => {
      acc[pref.id] = pref.notes;
      return acc;
    }, {} as Record<string, string>),
  );

  const updatePreference = React.useCallback(
    (id: string, updates: Partial<PreferenceState>) => {
      setPreferences((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    },
    [],
  );

  const handlePriorityChange = React.useCallback(
    (id: string, delta: number) => {
      setPreferences((prev) => {
        const ordered = [...prev];
        const index = ordered.findIndex((item) => item.id === id);
        if (index === -1) return prev;
        const newIndex = Math.max(0, Math.min(ordered.length - 1, index + delta));
        if (index === newIndex) return prev;
        const [removed] = ordered.splice(index, 1);
        ordered.splice(newIndex, 0, removed);
        return ordered.map((item, idx) => ({ ...item, priority: idx + 1 }));
      });
    },
    [],
  );

  const persistenceMessage = React.useMemo(() => {
    const highest = preferences[0]?.course ?? "";
    return `Highest priority: ${highest}. Rankings autosave.`;
  }, [preferences]);

  return (
    <Card data-test="faculty-preferences-card">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <NotebookPen className="size-5 text-primary" aria-hidden="true" /> Teaching preferences
            </CardTitle>
            <CardDescription>
              Re-rank expected assignments and capture delivery considerations for the scheduling committee.
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary" data-test="preferences-ownership">
            Updated Feb 2025
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-16 text-center">
                <ArrowDownWideNarrow className="mx-auto size-4" aria-hidden="true" />
              </TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Preferred delivery</TableHead>
              <TableHead>Notes for scheduler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preferences.map((preference) => (
              <TableRow key={preference.id} data-test="preference-row">
                <TableCell className="align-top">
                  <div className="flex flex-col items-center gap-2">
                    <Badge variant="secondary" className="w-12 justify-center" aria-label={`Priority ${preference.priority}`}>
                      #{preference.priority}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        onClick={() => handlePriorityChange(preference.id, -1)}
                        aria-label="Move up"
                      >
                        <ArrowUp className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        onClick={() => handlePriorityChange(preference.id, 1)}
                        aria-label="Move down"
                      >
                        <ArrowUpDown className="size-4 rotate-180" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{preference.title}</span>
                    <span className="text-xs text-muted-foreground">{preference.course}</span>
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <Select
                    value={preference.mode}
                    onValueChange={(value) => updatePreference(preference.id, { mode: value as PreferenceState["mode"] })}
                    data-test="preference-mode"
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryModes.map((mode) => (
                        <SelectItem key={mode} value={mode}>
                          {mode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="align-top">
                  <Textarea
                    value={notesDraft[preference.id]}
                    onChange={(event) =>
                      setNotesDraft((prev) => ({ ...prev, [preference.id]: event.target.value }))
                    }
                    onBlur={() => updatePreference(preference.id, { notes: notesDraft[preference.id] })}
                    className="min-h-24"
                    data-test="preference-notes"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">Autosaves on blur.</p>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>{persistenceMessage}</span>
        <span>{preferences.length} courses tracked</span>
      </CardFooter>
    </Card>
  );
}
