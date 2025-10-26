"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  MapPin,
  Clock,
  User,
  Copy,
} from "lucide-react";
import { MockSection } from "@/types/scheduler-mock";

interface SectionManagementTableProps {
  sections: MockSection[];
  courseCode: string;
  courseName: string;
  onAddSection?: () => void;
  onEditSection?: (sectionId: string) => void;
  onDuplicateSection?: (sectionId: string) => void;
  onDeleteSection?: (sectionId: string) => void;
}

export function SectionManagementTable({
  sections,
  courseCode,
  courseName,
  onAddSection,
  onEditSection,
  onDuplicateSection,
  onDeleteSection,
}: SectionManagementTableProps) {
  const totalCapacity = sections.reduce((sum, s) => sum + s.capacity, 0);
  const totalEnrolled = sections.reduce((sum, s) => sum + s.enrolled_count, 0);
  const utilizationRate = totalCapacity > 0 ? (totalEnrolled / totalCapacity) * 100 : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Published
          </Badge>
        );
      case "DRAFT":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Draft
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSectionTypeBadge = (type: string) => {
    switch (type) {
      case "LECTURE":
        return <Badge variant="default">Lecture</Badge>;
      case "LAB":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Lab</Badge>;
      case "TUTORIAL":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Tutorial</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{courseCode} - Sections</h2>
          <p className="text-muted-foreground">{courseName}</p>
        </div>
        <Button onClick={onAddSection}>
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sections</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sections.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {sections.filter((s) => s.status === "PUBLISHED").length} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalEnrolled} enrolled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{utilizationRate.toFixed(0)}%</div>
            <Progress value={utilizationRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Sections Table */}
      <Card>
        <CardContent className="pt-6">
          {sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sections yet</h3>
              <p className="text-muted-foreground mb-4">
                Create the first section for this course
              </p>
              <Button onClick={onAddSection}>
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Enrollment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((section) => {
                    const utilization =
                      (section.enrolled_count / section.capacity) * 100;
                    return (
                      <TableRow key={section.section_id}>
                        <TableCell className="font-medium">
                          {section.section_id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          {getSectionTypeBadge(section.section_type)}
                        </TableCell>
                        <TableCell>{getStatusBadge(section.status)}</TableCell>
                        <TableCell>
                          {section.instructor_name ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {section.instructor_name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Unassigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {section.room?.room_number ? (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{section.room.room_number}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              No room
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {section.time_slots && section.time_slots.length > 0 ? (
                            <div className="space-y-1">
                              {section.time_slots.map((slot) => (
                                <div
                                  key={slot.id}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span>
                                    {slot.day.substring(0, 3)} {slot.start_time}-
                                    {slot.end_time}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              No schedule
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {section.enrolled_count}
                              </span>
                              <span className="text-muted-foreground">
                                / {section.capacity}
                              </span>
                            </div>
                            <Progress value={utilization} className="h-1" />
                            <span className="text-xs text-muted-foreground">
                              {utilization.toFixed(0)}% full
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditSection?.(section.section_id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                onDuplicateSection?.(section.section_id)
                              }
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                onDeleteSection?.(section.section_id)
                              }
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

