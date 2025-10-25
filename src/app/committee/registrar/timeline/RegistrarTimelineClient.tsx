/**
 * Registrar Timeline Client Component
 * Client-side timeline management and event handling
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, RefreshCw, AlertCircle, Download } from "lucide-react";
import { toast } from "sonner";
import AcademicTimeline from "@/components/committee/AcademicTimeline";
import EventManager from "@/components/committee/EventManager";
import type { TimelineData, EnrichedEvent } from "@/types/timeline";

interface RegistrarTimelineClientProps {
  displayName: string;
  defaultTermCode: string;
  defaultTermName: string;
}

export default function RegistrarTimelineClient({
  displayName,
  defaultTermCode,
  defaultTermName,
}: RegistrarTimelineClientProps) {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTermCode, setSelectedTermCode] = useState(defaultTermCode);
  const [availableTerms, setAvailableTerms] = useState<
    Array<{ code: string; name: string }>
  >([]);

  // Fetch available terms
  const fetchTerms = async () => {
    try {
      const response = await fetch("/api/academic/terms");
      const result = await response.json();

      if (result.success && result.data) {
        setAvailableTerms(result.data);
      }
    } catch (error) {
      console.error("Error fetching terms:", error);
    }
  };

  // Fetch timeline data
  const fetchTimelineData = async (termCode: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/academic/timeline/${termCode}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch timeline data");
      }

      setTimelineData(result.data);
    } catch (error) {
      console.error("Error fetching timeline:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load timeline data"
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTerms();
    fetchTimelineData(selectedTermCode);
  }, [selectedTermCode]);

  // Handle event created
  const handleEventCreated = (event: EnrichedEvent) => {
    toast.success("Event created successfully");
    fetchTimelineData(selectedTermCode);
  };

  // Handle event updated
  const handleEventUpdated = (event: EnrichedEvent) => {
    toast.success("Event updated successfully");
    fetchTimelineData(selectedTermCode);
  };

  // Handle event deleted
  const handleEventDeleted = (eventId: string) => {
    toast.success("Event deleted successfully");
    fetchTimelineData(selectedTermCode);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchTimelineData(selectedTermCode);
    toast.success("Timeline refreshed");
  };

  // Export timeline data
  const handleExport = () => {
    if (!timelineData) return;

    const dataStr = JSON.stringify(timelineData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `timeline-${selectedTermCode}-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Timeline data exported");
  };

  if (loading && !timelineData) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchTimelineData(selectedTermCode)}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Academic Timeline Management
        </h1>
        <p className="text-muted-foreground">
          Manage academic events, milestones, and important dates for the term
        </p>
        <p className="text-sm text-muted-foreground">
          Signed in as {displayName}
        </p>
      </header>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline Controls
              </CardTitle>
              <CardDescription>
                Select term and manage events
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={!timelineData}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Term Selector */}
            <div className="flex-1 w-full sm:w-auto">
              <label className="text-sm font-medium mb-2 block">
                Select Term
              </label>
              <Select
                value={selectedTermCode}
                onValueChange={setSelectedTermCode}
              >
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableTerms.length > 0 ? (
                    availableTerms.map((term) => (
                      <SelectItem key={term.code} value={term.code}>
                        {term.name} ({term.code})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value={defaultTermCode}>
                      {defaultTermName} ({defaultTermCode})
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Create Event Button */}
            <div className="sm:ml-auto">
              <label className="text-sm font-medium mb-2 block opacity-0 pointer-events-none">
                Actions
              </label>
              <EventManager
                termCode={selectedTermCode}
                onEventCreated={handleEventCreated}
                onEventUpdated={handleEventUpdated}
                onEventDeleted={handleEventDeleted}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Display */}
      {timelineData && (
        <AcademicTimeline
          data={timelineData}
          showFilters={true}
          onEventClick={(event) => {
            // Could implement event details modal here
            console.log("Event clicked:", event);
          }}
        />
      )}

      {/* Quick Stats */}
      {timelineData && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">Quick Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">
                  {timelineData.statistics.total_events}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Active Now</p>
                <p className="text-2xl font-bold text-green-600">
                  {timelineData.statistics.active_events}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600">
                  {timelineData.statistics.upcoming_events}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-gray-500">
                  {timelineData.statistics.completed_events}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Card */}
      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Timeline Management Tips
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                <li>
                  Create events for important deadlines and milestones
                </li>
                <li>Mark events with "Requires Action" to alert students</li>
                <li>
                  Use appropriate categories to organize events effectively
                </li>
                <li>
                  Export timeline data for record-keeping and sharing
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

