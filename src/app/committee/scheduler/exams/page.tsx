/**
 * Exam Management Page
 * 
 * Main page for managing exam schedules with:
 * - Schedule midterm and final exams
 * - View exam calendar
 * - Check exam conflicts
 * - Assign exam rooms
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  AlertCircle,
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { ExamTable, type ExamRecord } from "@/components/committee/scheduler/ExamTable";
import { ExamCalendar } from "@/components/committee/scheduler/ExamCalendar";
import { ExamConflictChecker } from "@/components/committee/scheduler/ExamConflictChecker";
import type { ScheduleConflict } from "@/types/scheduler";

export default function ExamManagementPage() {
  const router = useRouter();
  
  // State
  const [selectedTerm, setSelectedTerm] = useState<string>("2024-1");
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [sectionsLookup, setSectionsLookup] = useState<Array<{ sectionId: string; courseCode: string }>>([]);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("table");

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    midterm: 0,
    midterm2: 0,
    final: 0,
    conflictsCount: 0,
  });

  /**
   * Fetch exams from API
   */
  const fetchExams = useCallback(async () => {
    if (!selectedTerm) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/committee/scheduler/exams?term_code=${selectedTerm}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch exams");
      }

      const data = await response.json();
      
      // Transform API data to ExamRecord format
      const transformedExams: ExamRecord[] = (data.data?.exams || []).map((exam: any) => ({
        id: exam.id,
        courseCode: exam.course_code,
        courseName: exam.course?.name || exam.course_code,
        type: exam.exam_type.toLowerCase() as "midterm" | "midterm2" | "final",
        date: exam.exam_date,
        time: exam.start_time,
        duration: exam.duration,
        room: exam.room_number || undefined,
        sectionIds: [], // Will be populated from sections data if available
      }));

      setExams(transformedExams);

      // Update statistics
      setStats({
        total: transformedExams.length,
        midterm: transformedExams.filter(e => e.type === "midterm").length,
        midterm2: transformedExams.filter(e => e.type === "midterm2").length,
        final: transformedExams.filter(e => e.type === "final").length,
        conflictsCount: conflicts.length,
      });

    } catch (error) {
      console.error("Error fetching exams:", error);
      setError(error instanceof Error ? error.message : "Failed to load exams");
    } finally {
      setIsLoading(false);
    }
  }, [selectedTerm, conflicts.length]);

  /**
   * Fetch sections for lookup
   */
  const fetchSections = useCallback(async () => {
    if (!selectedTerm) return;

    try {
      // Fetch courses to get sections
      const response = await fetch(`/api/committee/scheduler/courses?term_code=${selectedTerm}`);
      
      if (response.ok) {
        const data = await response.json();
        const courses = data.data || [];
        
        // Build sections lookup
        const lookup: Array<{ sectionId: string; courseCode: string }> = [];
        courses.forEach((course: any) => {
          if (course.sections) {
            course.sections.forEach((section: any) => {
              lookup.push({
                sectionId: section.id,
                courseCode: course.code,
              });
            });
          }
        });
        
        setSectionsLookup(lookup);
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  }, [selectedTerm]);

  /**
   * Check for exam conflicts
   */
  const checkConflicts = useCallback(async () => {
    if (!selectedTerm || exams.length === 0) {
      setConflicts([]);
      return;
    }

    try {
      const response = await fetch(`/api/committee/scheduler/conflicts?term_code=${selectedTerm}&type=exam`);
      
      if (response.ok) {
        const data = await response.json();
        setConflicts(data.data?.conflicts || []);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          conflictsCount: data.data?.conflicts?.length || 0,
        }));
      }
    } catch (error) {
      console.error("Error checking conflicts:", error);
    }
  }, [selectedTerm, exams.length]);

  // Load data on mount and when term changes
  useEffect(() => {
    fetchExams();
    fetchSections();
  }, [fetchExams, fetchSections]);

  // Check conflicts when exams change
  useEffect(() => {
    if (exams.length > 0) {
      checkConflicts();
    }
  }, [exams.length, checkConflicts]);

  /**
   * Handle exam creation
   */
  const handleCreateExam = async (exam: Omit<ExamRecord, "id">) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/committee/scheduler/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_code: exam.courseCode,
          term_code: selectedTerm,
          exam_type: exam.type.toUpperCase(),
          exam_date: exam.date,
          start_time: exam.time,
          duration: exam.duration,
          room_number: exam.room || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create exam");
      }

      setSuccessMessage("Exam created successfully");
      await fetchExams(); // Refresh exams list
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error creating exam:", error);
      setError(error instanceof Error ? error.message : "Failed to create exam");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle exam update
   */
  const handleUpdateExam = async (id: string, exam: Omit<ExamRecord, "id">) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/committee/scheduler/exams", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exam_id: id,
          exam_date: exam.date,
          start_time: exam.time,
          duration: exam.duration,
          room_number: exam.room || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update exam");
      }

      setSuccessMessage("Exam updated successfully");
      await fetchExams(); // Refresh exams list
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error updating exam:", error);
      setError(error instanceof Error ? error.message : "Failed to update exam");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle exam deletion
   */
  const handleDeleteExam = async (id: string) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/committee/scheduler/exams?exam_id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete exam");
      }

      setSuccessMessage("Exam deleted successfully");
      await fetchExams(); // Refresh exams list
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error deleting exam:", error);
      setError(error instanceof Error ? error.message : "Failed to delete exam");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle conflict resolution
   */
  const handleResolveConflict = async (conflictId: string) => {
    console.log("Resolving conflict:", conflictId);
    // TODO: Implement conflict resolution
    await checkConflicts(); // Re-check conflicts
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/committee/scheduler")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Scheduler
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Exam Management</h1>
            <p className="text-muted-foreground mt-2">
              Schedule and manage midterm and final examinations
            </p>
          </div>
        </div>
      </div>

      {/* Term Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Academic Term</CardTitle>
          <CardDescription>Select the term to manage exams for</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-1">Fall 2024</SelectItem>
                <SelectItem value="2024-2">Spring 2024</SelectItem>
                <SelectItem value="2025-1">Fall 2025</SelectItem>
              </SelectContent>
            </Select>

            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading exams...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Exams</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.midterm}</div>
            <p className="text-xs text-muted-foreground">Midterm</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{stats.midterm2}</div>
            <p className="text-xs text-muted-foreground">Midterm 2</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{stats.final}</div>
            <p className="text-xs text-muted-foreground">Final</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-bold ${stats.conflictsCount > 0 ? "text-red-600" : "text-green-600"}`}>
                {stats.conflictsCount}
              </div>
              {stats.conflictsCount === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">Conflicts</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-6 border-green-600 bg-green-50 text-green-900 dark:bg-green-900/10 dark:text-green-500">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="table">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Exam Schedule
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="conflicts">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Conflicts
            {conflicts.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-600 text-white rounded-full">
                {conflicts.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Table View */}
        <TabsContent value="table" className="space-y-6">
          <ExamTable
            exams={exams}
            sectionsLookup={sectionsLookup}
            onCreate={handleCreateExam}
            onUpdate={handleUpdateExam}
            onDelete={handleDeleteExam}
          />
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-6">
          <ExamCalendar
            exams={exams}
            termCode={selectedTerm}
            onExamClick={(exam) => {
              // Switch to table view and potentially highlight the exam
              setActiveTab("table");
            }}
          />
        </TabsContent>

        {/* Conflicts View */}
        <TabsContent value="conflicts" className="space-y-6">
          <ExamConflictChecker
            exams={exams}
            conflicts={conflicts}
            termCode={selectedTerm}
            onResolveConflict={handleResolveConflict}
            onRefresh={checkConflicts}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

