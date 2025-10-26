/**
 * Irregular Students View Component
 * Displays and manages irregular student records with notification capabilities
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from '@/components/ui/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { notifyRegistrarAboutIrregular } from "@/lib/actions/student-management";
import type { IrregularStudentRecord } from "@/types/scheduler";

interface IrregularStudentsViewProps {
  termCode: string;
  termName: string;
}

export function IrregularStudentsView({
  termCode,
  termName,
}: IrregularStudentsViewProps) {
  const [students, setStudents] = useState<IrregularStudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set()
  );
  const [notifying, setNotifying] = useState(false);
  const { toast } = useToast();

  // Fetch irregular students
  const fetchIrregularStudents = useCallback(async () => {
    if (!termCode) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        term_code: termCode,
        status: "all",
      });

      const response = await fetch(
        `/api/committee/scheduler/irregular-students?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch irregular students");
      }

      const result = await response.json();
      setStudents(result.data?.irregular_students || []);
    } catch (err) {
      console.error("Error fetching irregular students:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load irregular students"
      );
    } finally {
      setLoading(false);
    }
  }, [termCode]);

  useEffect(() => {
    fetchIrregularStudents();
  }, [fetchIrregularStudents]);

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingIds = students
        .filter((s) => s.status === "pending")
        .map((s) => s.id);
      setSelectedStudents(new Set(pendingIds));
    } else {
      setSelectedStudents(new Set());
    }
  };

  // Handle individual selection
  const handleSelectStudent = (studentId: string, checked: boolean) => {
    const newSelected = new Set(selectedStudents);
    if (checked) {
      newSelected.add(studentId);
    } else {
      newSelected.delete(studentId);
    }
    setSelectedStudents(newSelected);
  };

  // Handle notification
  const handleNotify = async (studentIds: string[]) => {
    if (studentIds.length === 0) {
      toast({
        title: "No students selected",
        description: "Please select at least one student to notify the registrar.",
        variant: "destructive",
      });
      return;
    }

    setNotifying(true);

    try {
      const result = await notifyRegistrarAboutIrregular({
        irregularStudentIds: studentIds,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Registrar notified successfully",
        });

        // Refresh the list
        await fetchIrregularStudents();
        
        // Clear selection
        setSelectedStudents(new Set());
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send notification",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error notifying registrar:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setNotifying(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "notified":
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case "resolved":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50">Pending</Badge>;
      case "notified":
        return <Badge variant="outline" className="bg-blue-50">Notified</Badge>;
      case "resolved":
        return <Badge variant="default" className="bg-green-50">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading irregular students...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const pendingStudents = students.filter((s) => s.status === "pending");
  const notifiedStudents = students.filter((s) => s.status === "notified");
  const resolvedStudents = students.filter((s) => s.status === "resolved");

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingStudents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting notification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Notified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifiedStudents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registrar informed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedStudents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Issues addressed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {pendingStudents.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={
                    selectedStudents.size > 0 &&
                    selectedStudents.size === pendingStudents.length
                  }
                  onChange={(e) => handleSelectAll(e.target.checked as boolean)}
                />
                <span className="text-sm text-muted-foreground">
                  {selectedStudents.size} of {pendingStudents.length} selected
                </span>
              </div>

              <Button
                onClick={() => handleNotify(Array.from(selectedStudents))}
                disabled={selectedStudents.size === 0 || notifying}
              >
                {notifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Notifying...
                  </>
                ) : (
                  <>
                    <Bell className="mr-2 h-4 w-4" />
                    Notify Registrar ({selectedStudents.size})
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Irregular Students ({students.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No irregular students found for this term.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Student Number</TableHead>
                    <TableHead className="text-center">Level</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        {student.status === "pending" && (
                          <Checkbox
                            checked={selectedStudents.has(student.id)}
                            onChange={(e) =>
                              handleSelectStudent(student.id, e.target.checked as boolean)
                            }
                          />
                        )}
                      </TableCell>
                      <TableCell>{getStatusIcon(student.status)}</TableCell>
                      <TableCell className="font-medium">
                        {student.student_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.student_number}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.level}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={student.reason}>
                          {student.reason}
                        </div>
                        {student.courses_needed &&
                          student.courses_needed.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Needs: {student.courses_needed.join(", ")}
                            </div>
                          )}
                      </TableCell>
                      <TableCell>{getStatusBadge(student.status)}</TableCell>
                      <TableCell className="text-sm">
                        {student.reported_by_name || "Unknown"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(student.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

