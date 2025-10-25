/**
 * Student Counts Table Component
 * Display detailed enrollment data by course with capacity management
 */

"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Search,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import type { StudentEnrollmentData } from "@/types/scheduler";

interface StudentCountsTableProps {
  data: StudentEnrollmentData[];
  termCode: string;
  termName: string;
  onDataUpdated: () => void;
}

export function StudentCountsTable({
  data,
  termCode,
  termName,
  onDataUpdated,
}: StudentCountsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [capacityFilter, setCapacityFilter] = useState<string>("all");

  // Get unique levels
  const uniqueLevels = useMemo(() => {
    const levels = new Set(
      data.map((item) => item.level).filter((l): l is number => l !== null)
    );
    return Array.from(levels).sort();
  }, [data]);

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.course_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel =
        levelFilter === "all" || item.level?.toString() === levelFilter;

      const matchesType =
        typeFilter === "all" || item.course_type === typeFilter;

      // Capacity filter logic
      let matchesCapacity = true;
      if (capacityFilter === "under") {
        matchesCapacity = item.enrolled_students < item.total_students * 0.7;
      } else if (capacityFilter === "over") {
        matchesCapacity = item.enrolled_students > item.total_students * 0.9;
      } else if (capacityFilter === "critical") {
        matchesCapacity = item.enrolled_students > item.total_students;
      }

      return matchesSearch && matchesLevel && matchesType && matchesCapacity;
    });
  }, [data, searchTerm, levelFilter, typeFilter, capacityFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalStudents = filteredData.reduce(
      (sum, item) => sum + item.total_students,
      0
    );
    const totalEnrolled = filteredData.reduce(
      (sum, item) => sum + item.enrolled_students,
      0
    );
    const totalSectionsNeeded = filteredData.reduce(
      (sum, item) => sum + item.sections_needed,
      0
    );
    const avgUtilization =
      totalEnrolled > 0 ? (totalEnrolled / totalStudents) * 100 : 0;

    return {
      totalStudents,
      totalEnrolled,
      totalSectionsNeeded,
      avgUtilization,
    };
  }, [filteredData]);

  const getCapacityStatus = (item: StudentEnrollmentData) => {
    const utilization = item.enrolled_students / item.total_students;
    if (utilization > 1.0) {
      return { status: "over", icon: AlertTriangle, color: "destructive" };
    } else if (utilization > 0.9) {
      return { status: "high", icon: TrendingUp, color: "warning" };
    } else if (utilization < 0.5) {
      return { status: "low", icon: TrendingDown, color: "secondary" };
    } else {
      return { status: "ok", icon: CheckCircle2, color: "default" };
    }
  };

  const handleExport = () => {
    // Create CSV content
    const headers = [
      "Course Code",
      "Course Name",
      "Type",
      "Level",
      "Total Students",
      "Enrolled",
      "Sections Needed",
      "Utilization %",
    ];
    
    const rows = filteredData.map((item) => [
      item.course_code,
      item.course_name,
      item.course_type,
      item.level || "N/A",
      item.total_students,
      item.enrolled_students,
      item.sections_needed,
      ((item.enrolled_students / item.total_students) * 100).toFixed(1),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student-counts-${termCode}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Enrollment by Course</CardTitle>
            <CardDescription>
              Student enrollment counts and section capacity planning for {termName}
            </CardDescription>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Total Student Slots</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.totalEnrolled}</div>
              <p className="text-xs text-muted-foreground">Students Enrolled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.totalSectionsNeeded}</div>
              <p className="text-xs text-muted-foreground">Sections Needed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {stats.avgUtilization.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Avg Utilization</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {uniqueLevels.map((level) => (
                <SelectItem key={level} value={level.toString()}>
                  Level {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="REQUIRED">Required</SelectItem>
              <SelectItem value="ELECTIVE">Elective</SelectItem>
            </SelectContent>
          </Select>
          <Select value={capacityFilter} onValueChange={setCapacityFilter}>
            <SelectTrigger className="w-full sm:w-[170px]">
              <SelectValue placeholder="All Capacities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Capacities</SelectItem>
              <SelectItem value="under">Under-utilized</SelectItem>
              <SelectItem value="over">Near Capacity</SelectItem>
              <SelectItem value="critical">Over Capacity</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing {filteredData.length} of {data.length} courses
          </p>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead className="text-center">Level</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="text-center">Total Students</TableHead>
                <TableHead className="text-center">Enrolled</TableHead>
                <TableHead className="text-center">Sections</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Utilization</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-muted-foreground">No courses found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => {
                  const capacityStatus = getCapacityStatus(item);
                  const StatusIcon = capacityStatus.icon;
                  const utilization =
                    (item.enrolled_students / item.total_students) * 100;

                  return (
                    <TableRow key={item.course_code} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.course_code}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.course_name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.level || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            item.course_type === "REQUIRED"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {item.course_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {item.total_students}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.enrolled_students}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{item.sections_needed}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <StatusIcon
                            className={`h-4 w-4 ${
                              capacityStatus.status === "over"
                                ? "text-destructive"
                                : capacityStatus.status === "high"
                                  ? "text-yellow-600"
                                  : capacityStatus.status === "low"
                                    ? "text-muted-foreground"
                                    : "text-green-600"
                            }`}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-sm font-medium">
                            {utilization.toFixed(0)}%
                          </span>
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                utilization > 100
                                  ? "bg-destructive"
                                  : utilization > 90
                                    ? "bg-yellow-500"
                                    : "bg-primary"
                              }`}
                              style={{
                                width: `${Math.min(utilization, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Elective Preferences Summary */}
        {filteredData.some(
          (item) =>
            item.course_type === "ELECTIVE" &&
            item.preference_counts &&
            item.preference_counts.length > 0
        ) && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Elective Preferences</h3>
            <div className="space-y-3">
              {filteredData
                .filter(
                  (item) =>
                    item.course_type === "ELECTIVE" &&
                    item.preference_counts &&
                    item.preference_counts.length > 0
                )
                .map((item) => (
                  <Card key={item.course_code}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{item.course_code}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.course_name}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {item.preference_counts
                            ?.sort((a, b) => a.preference_rank - b.preference_rank)
                            .slice(0, 5)
                            .map((pref) => (
                              <div
                                key={pref.preference_rank}
                                className="text-center"
                              >
                                <div className="text-xs text-muted-foreground">
                                  #{pref.preference_rank}
                                </div>
                                <Badge variant="outline">
                                  {pref.student_count}
                                </Badge>
                              </div>
                            ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
