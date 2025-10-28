"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, FileJson } from "lucide-react";
import { toast } from "sonner";

export function ImportExportUI() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedEntities, setSelectedEntities] = useState<string[]>(["all"]);

  const entities = [
    { id: "courses", label: "Courses" },
    { id: "rooms", label: "Rooms" },
    { id: "instructors", label: "Instructors" },
    { id: "student_groups", label: "Student Groups" },
    { id: "sections", label: "Sections" },
    { id: "exams", label: "Exams" },
    { id: "rules", label: "Rules" },
    { id: "config", label: "Time Grid Config" },
  ];

  async function handleExport() {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (!selectedEntities.includes("all")) {
        params.set("entities", selectedEntities.join(","));
      }

      const response = await fetch(`/api/data/export?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `smartschedule-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Data exported successfully");
    } catch (error) {
      toast.error("Failed to export data");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await fetch("/api/data/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Import failed");
      }

      const result = await response.json();
      
      let successCount = 0;
      Object.values(result.results || {}).forEach((r: any) => {
        if (r.success) successCount += r.count;
      });

      toast.success(`Successfully imported ${successCount} records`);
      
      // Reset file input
      event.target.value = "";
    } catch (error) {
      toast.error(`Failed to import data: ${(error as Error).message}`);
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  }

  function toggleEntity(entityId: string) {
    if (entityId === "all") {
      setSelectedEntities(["all"]);
    } else {
      const newSelection = selectedEntities.filter((e) => e !== "all");
      if (newSelection.includes(entityId)) {
        setSelectedEntities(newSelection.filter((e) => e !== entityId));
      } else {
        setSelectedEntities([...newSelection, entityId]);
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Download your scheduling data as a JSON file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-3">Select data to export:</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedEntities.includes("all")}
                  onChange={() => toggleEntity("all")}
                  className="rounded"
                />
                <span className="text-sm font-medium">All Data</span>
              </label>
              {entities.map((entity) => (
                <label key={entity.id} className="flex items-center gap-2 cursor-pointer ml-6">
                  <input
                    type="checkbox"
                    checked={selectedEntities.includes("all") || selectedEntities.includes(entity.id)}
                    onChange={() => toggleEntity(entity.id)}
                    disabled={selectedEntities.includes("all")}
                    className="rounded"
                  />
                  <span className="text-sm">{entity.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              "Exporting..."
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Upload a JSON file to import data (existing records will be updated)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Warning:</strong> Importing data will update existing records with matching IDs/codes.
              Make sure to backup your data before importing.
            </p>
          </div>

          <div>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
              className="hidden"
              id="import-file"
            />
            <label htmlFor="import-file">
              <Button asChild disabled={isImporting}>
                <span className="cursor-pointer">
                  {isImporting ? (
                    "Importing..."
                  ) : (
                    <>
                      <FileJson className="mr-2 h-4 w-4" />
                      Choose JSON File
                    </>
                  )}
                </span>
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>JSON Format Example</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-xs">
{`{
  "version": "1.0",
  "exported_at": "2025-10-27T12:00:00Z",
  "data": {
    "courses": [
      {
        "code": "CS101",
        "title": "Introduction to Programming",
        "level": 1,
        "credits": 3,
        "weekly_hours": 3,
        "is_elective": false
      }
    ],
    "rooms": [
      {
        "code": "A101",
        "type": "Lecture"
      }
    ],
    "instructors": [...],
    "student_groups": [...],
    "sections": [...],
    "exams": [...]
  }
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

