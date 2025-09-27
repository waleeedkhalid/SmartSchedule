"use client";

import * as React from "react";
import { Shuffle, Sparkles } from "lucide-react";

import { initialElectiveRanking } from "@/data/mock";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function StudentElectivePreferences() {
  const [search, setSearch] = React.useState("");
  const [courses, setCourses] = React.useState(initialElectiveRanking);
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const filteredCourses = React.useMemo(() => {
    if (!search) return courses;
    return courses.filter((course) => {
      const haystack = `${course.title} ${course.code} ${course.faculty} ${course.category}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [courses, search]);

  const handleDragStart = React.useCallback((event: React.DragEvent<HTMLLIElement>) => {
    setDragId(event.currentTarget.dataset.id ?? null);
    event.dataTransfer.effectAllowed = "move";
  }, []);

  const reorderCourses = React.useCallback(
    (draggedId: string, targetId: string) => {
      const current = [...courses];
      const fromIndex = current.findIndex((course) => course.id === draggedId);
      const toIndex = current.findIndex((course) => course.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return;
      const [moved] = current.splice(fromIndex, 1);
      current.splice(toIndex, 0, moved);
      const reRanked = current.map((course, index) => ({ ...course, rank: index + 1 }));
      setCourses(reRanked);
    },
    [courses],
  );

  const handleDrop = React.useCallback(
    (event: React.DragEvent<HTMLLIElement>) => {
      event.preventDefault();
      const targetId = event.currentTarget.dataset.id;
      if (dragId && targetId && dragId !== targetId) {
        reorderCourses(dragId, targetId);
      }
      setDragId(null);
    },
    [dragId, reorderCourses],
  );

  const handleDragOver = React.useCallback((event: React.DragEvent<HTMLLIElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleSubmit = React.useCallback(() => {
    setDialogOpen(true);
  }, []);

  const handleShuffle = React.useCallback(() => {
    setCourses((prev) => {
      const shuffled = [...prev].sort(() => Math.random() - 0.5);
      return shuffled.map((course, index) => ({ ...course, rank: index + 1 }));
    });
  }, []);

  return (
    <Card data-test="student-elective-card">
      <CardHeader className="gap-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="size-5 text-primary" aria-hidden="true" />
            Prioritize electives for allocation
          </CardTitle>
          <CardDescription>
            Drag to re-order electives. Submit to lock in ranking before scheduler review.
          </CardDescription>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search electives, faculty, or tags"
            className="bg-background"
            data-test="elective-search"
          />
          <Button type="button" variant="outline" onClick={handleShuffle} data-test="elective-shuffle">
            <Shuffle className="mr-2 size-4" aria-hidden="true" /> Shuffle suggestion
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2" data-test="elective-list">
          {filteredCourses.map((course) => (
            <li
              key={course.id}
              data-id={course.id}
              data-rank={course.rank}
              draggable
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={cn(
                "flex cursor-grab items-center gap-4 rounded-lg border bg-background/70 p-4 shadow-sm transition focus-within:ring-2 focus-within:ring-ring",
                dragId === course.id && "border-dashed opacity-70",
              )}
            >
              <Badge variant="secondary" className="min-w-12 justify-center" aria-label={`Rank ${course.rank}`}>
                #{course.rank}
              </Badge>
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold">{course.title}</span>
                  <span className="text-xs font-medium text-muted-foreground">{course.code}</span>
                  <span className="text-xs rounded-full bg-primary/10 px-2 py-1 text-primary">
                    {course.category}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Led by {course.faculty} • {course.credits} credit{course.credits > 1 ? "s" : ""} • {course.seats} seats
                </p>
                <div className="flex flex-wrap gap-1">
                  {course.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[11px] uppercase tracking-wide">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </li>
          ))}
          {filteredCourses.length === 0 ? (
            <li className="rounded-md border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              No electives match your search just yet.
            </li>
          ) : null}
        </ul>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {courses.length} electives ranked • Last saved locally {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
        <Button type="button" onClick={handleSubmit} data-test="elective-submit">
          Submit preferences
        </Button>
      </CardFooter>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Preferences submitted</DialogTitle>
            <DialogDescription>
              Rankings are now queued for SmartSchedule. You can revisit before the committee freeze window closes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            {courses.slice(0, 3).map((course) => (
              <div key={`confirm-${course.id}`} className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                <span className="font-medium">
                  #{course.rank} {course.title}
                </span>
                <Badge variant="outline">{course.code}</Badge>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
