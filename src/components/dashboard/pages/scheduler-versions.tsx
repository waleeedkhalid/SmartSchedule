"use client";

import * as React from "react";
import { ArchiveRestore, History, Rocket, Shield } from "lucide-react";

import { schedulerVersions } from "@/data/mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusTone: Record<string, { label: string; className: string }> = {
  Published: { label: "Published", className: "bg-emerald-500/15 text-emerald-700" },
  Archived: { label: "Archived", className: "bg-muted text-muted-foreground" },
  Draft: { label: "Draft", className: "bg-amber-500/15 text-amber-700" },
};

type VersionState = typeof schedulerVersions[number];

export function SchedulerVersions() {
  const [versions, setVersions] = React.useState<VersionState[]>(schedulerVersions);
  const [selectedId, setSelectedId] = React.useState<string>(versions[0]?.id ?? "");

  const selectedVersion = versions.find((version) => version.id === selectedId) ?? versions[0];

  const handlePublish = React.useCallback((id: string) => {
    setVersions((prev) =>
      prev.map((version) =>
        version.id === id
          ? { ...version, status: "Published", publishedOn: new Date().toISOString() }
          : version.status === "Published"
          ? { ...version, status: "Archived" }
          : version,
      ),
    );
    setSelectedId(id);
  }, []);

  const handleRevert = React.useCallback((id: string) => {
    console.info(`Reverting to version ${id}`);
  }, []);

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <Card data-test="scheduler-versions-card">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <History className="size-5 text-primary" aria-hidden="true" />
              Version history
            </CardTitle>
            <CardDescription>
              Review published snapshots, analyze differences, and coordinate publish windows with stakeholders.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={!selectedVersion}
            onClick={() => selectedVersion && handlePublish(selectedVersion.id)}
            data-test="version-publish"
          >
            <Rocket className="mr-2 size-4" aria-hidden="true" /> Publish selected
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Label</TableHead>
              <TableHead>Draft source</TableHead>
              <TableHead>Publisher</TableHead>
              <TableHead>Published on</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-28 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versions.map((version) => {
              const tone = statusTone[version.status];
              const isSelected = version.id === selectedId;
              return (
                <TableRow
                  key={version.id}
                  onClick={() => setSelectedId(version.id)}
                  className={isSelected ? "bg-primary/5" : "cursor-pointer"}
                  data-test="version-row"
                >
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-foreground">{version.label}</span>
                      <span className="text-xs text-muted-foreground">{version.id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{version.draftSource}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{version.publishedBy}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDateTime(version.publishedOn)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={tone?.className}>{tone?.label ?? version.status}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRevert(version.id);
                        }}
                        aria-label="Revert to this version"
                      >
                        <ArchiveRestore className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={(event) => {
                          event.stopPropagation();
                          handlePublish(version.id);
                        }}
                        aria-label="Publish this version"
                      >
                        <Shield className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <Tabs defaultValue="highlights" className="space-y-4" data-test="version-detail">
          <TabsList>
            <TabsTrigger value="highlights">Highlights</TabsTrigger>
            <TabsTrigger value="diff">Diff notes</TabsTrigger>
          </TabsList>
          <TabsContent value="highlights">
            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
              <h3 className="font-semibold text-foreground">{selectedVersion?.label}</h3>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {selectedVersion?.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-primary" aria-hidden="true" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="diff">
            <div className="rounded-lg border border-dashed bg-background p-4 text-sm text-muted-foreground">
              Diff view placeholder — connect to comparison service once backend endpoints land.
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">{versions.length} versions retained for audit</CardFooter>
    </Card>
  );
}
