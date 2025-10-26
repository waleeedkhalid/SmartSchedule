"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Download, Eye, Mail } from "lucide-react";
import { MockStudent } from "@/types/scheduler-mock";

interface StudentListTableProps {
  students: MockStudent[];
  onViewDetails?: (studentId: string) => void;
  onSendNotification?: (studentId: string) => void;
}

export function StudentListTable({
  students,
  onViewDetails,
  onSendNotification,
}: StudentListTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter and search logic
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.student_number.includes(searchQuery) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());

      // Level filter
      const matchesLevel =
        levelFilter === "all" || student.level === parseInt(levelFilter);

      // Status filter
      const matchesStatus =
        statusFilter === "all" || student.status === statusFilter;

      return matchesSearch && matchesLevel && matchesStatus;
    });
  }, [students, searchQuery, levelFilter, statusFilter]);

  const handleExportCSV = () => {
    // Placeholder for CSV export functionality
    console.log("Exporting students to CSV...");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Student List</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {filteredStudents.length} / {students.length} students
            </Badge>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, student number, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Level Filter */}
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="1">Level 1</SelectItem>
              <SelectItem value="2">Level 2</SelectItem>
              <SelectItem value="3">Level 3</SelectItem>
              <SelectItem value="4">Level 4</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="irregular">Irregular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrolled Courses</TableHead>
                <TableHead>Total Credits</TableHead>
                <TableHead>GPA</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No students found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.student_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {student.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Level {student.level}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          student.status === "regular" ? "default" : "destructive"
                        }
                      >
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{student.enrolled_courses}</span>
                        <span className="text-sm text-muted-foreground">courses</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{student.total_credits}</span>
                    </TableCell>
                    <TableCell>
                      {student.gpa ? (
                        <Badge
                          variant="outline"
                          className={
                            student.gpa >= 3.5
                              ? "bg-green-50 text-green-700 border-green-200"
                              : student.gpa >= 2.5
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-orange-50 text-orange-700 border-orange-200"
                          }
                        >
                          {student.gpa.toFixed(2)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails?.(student.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSendNotification?.(student.id)}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Results Summary */}
        {filteredStudents.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        )}
      </CardContent>
    </Card>
  );
}

