/**
 * Student List View Component
 * Displays paginated list of students with enrollment details
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { StudentEnrollmentDetail } from "@/types/scheduler";

interface StudentListViewProps {
  termCode: string;
  termName: string;
}

export function StudentListView({ termCode, termName }: StudentListViewProps) {
  const [students, setStudents] = useState<StudentEnrollmentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  // Fetch students
  const fetchStudents = useCallback(async () => {
    if (!termCode) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        term_code: termCode,
        page: page.toString(),
        limit: limit.toString(),
      });

      if (levelFilter !== "all") {
        params.append("level", levelFilter);
      }
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (search) {
        params.append("search", search);
      }

      const response = await fetch(
        `/api/committee/scheduler/students?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const result = await response.json();
      setStudents(result.data?.students || []);
      setTotal(result.data?.total || 0);
      setTotalPages(result.data?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError(err instanceof Error ? err.message : "Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [termCode, page, levelFilter, statusFilter, search]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setPage(1);
  };

  const getStatusIcon = (completionPercentage: number, isIrregular: boolean) => {
    if (isIrregular) {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
    if (completionPercentage >= 100) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    if (completionPercentage >= 50) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  if (loading && students.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading students...</span>
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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or student number..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    handleFilterChange();
                  }}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select
              value={levelFilter}
              onValueChange={(value) => {
                setLevelFilter(value);
                handleFilterChange();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="1">Level 1</SelectItem>
                <SelectItem value="2">Level 2</SelectItem>
                <SelectItem value="3">Level 3</SelectItem>
                <SelectItem value="4">Level 4</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                handleFilterChange();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Students" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="irregular">Irregular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Students ({total} total)
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No students found matching the filters.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Student Number</TableHead>
                      <TableHead className="text-center">Level</TableHead>
                      <TableHead className="text-center">Enrolled</TableHead>
                      <TableHead className="text-center">Required</TableHead>
                      <TableHead className="text-center">Progress</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          {getStatusIcon(
                            student.completion_percentage,
                            student.is_irregular
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {student.full_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {student.student_number}
                        </TableCell>
                        <TableCell className="text-center">
                          {student.level}
                        </TableCell>
                        <TableCell className="text-center">
                          {student.enrolled_courses}
                        </TableCell>
                        <TableCell className="text-center">
                          {student.required_courses}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-medium ${
                              student.completion_percentage >= 100
                                ? "text-green-600"
                                : student.completion_percentage >= 50
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {student.completion_percentage}%
                          </span>
                        </TableCell>
                        <TableCell>
                          {student.is_irregular ? (
                            <Badge variant="destructive">Irregular</Badge>
                          ) : (
                            <Badge variant="default">Regular</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, total)} of {total} students
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

