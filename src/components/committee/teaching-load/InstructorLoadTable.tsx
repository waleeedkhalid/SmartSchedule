"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export interface InstructorLoad {
  instructorId: string;
  instructorName: string;
  assignedHours: number;
  maxHours: number; // per DEC-4: hard-coded constants for Phase 3
  sections: Array<{
    sectionId: string;
    courseCode: string;
    hours: number;
  }>;
}

interface InstructorLoadTableProps {
  instructorLoads: InstructorLoad[];
}

export const InstructorLoadTable: React.FC<InstructorLoadTableProps> = ({
  instructorLoads,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Instructor Teaching Loads</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Instructor</TableHead>
                <TableHead>Assigned Hours</TableHead>
                <TableHead>Max Hours</TableHead>
                <TableHead>Load Status</TableHead>
                <TableHead>Sections</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instructorLoads.map((load) => {
                const isOverloaded = load.assignedHours > load.maxHours;
                const utilizationPct = Math.round(
                  (load.assignedHours / load.maxHours) * 100
                );

                return (
                  <TableRow key={load.instructorId}>
                    <TableCell className="font-medium">
                      {load.instructorName}
                    </TableCell>
                    <TableCell>{load.assignedHours}</TableCell>
                    <TableCell>{load.maxHours}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          isOverloaded
                            ? "outline"
                            : utilizationPct > 90
                            ? "secondary"
                            : "default"
                        }
                        className={`text-xs ${
                          isOverloaded ? "border-red-500 text-red-700" : ""
                        }`}
                      >
                        {utilizationPct}% {isOverloaded ? "OVERLOAD" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {load.sections.map((section) => (
                          <Badge
                            key={section.sectionId}
                            variant="outline"
                            className="text-[10px]"
                          >
                            {section.courseCode} ({section.hours}h)
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {instructorLoads.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-sm text-muted-foreground"
                  >
                    No instructor loads calculated.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstructorLoadTable;
