"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

type StudentCount = {
  code: string;
  name: string;
  level: number;
  total_students: number;

};


export function StudentCountsTable(
  { studentCounts }: { studentCounts: StudentCount[] }
) {

  // Intelligent section planner
  // - Ideal size: 25
  // - Allow up to 27 (overflow tolerance)
  // - Avoid small sections: minimum 18
  const IDEAL_SIZE = 25;
  const MAX_SIZE = 27;
  const MIN_SIZE = 18;

  const computeSectionPlan = (total: number) => {
    if (total <= 0) {
      return { count: 0, sizes: [] as number[] };
    }

    const minSections = Math.ceil(total / MAX_SIZE);
    const maxSections = Math.max(1, Math.floor(total / MIN_SIZE));

    let bestSections = Math.max(1, Math.round(total / IDEAL_SIZE));
    let bestDistance = Math.abs(total / bestSections - IDEAL_SIZE);

    for (let s = minSections; s <= Math.max(minSections, maxSections); s++) {
      const avg = total / s;
      if (avg >= MIN_SIZE && avg <= MAX_SIZE) {
        const distance = Math.abs(avg - IDEAL_SIZE);
        if (distance <= bestDistance) {
          bestDistance = distance;
          bestSections = s;
        }
      }
    }

    // Compute size distribution (balanced: some base, some base+1)
    const base = Math.floor(total / bestSections);
    let extra = total % bestSections; // number of sections that get +1
    const sizes: number[] = Array.from({ length: bestSections }, () => base);
    for (let i = 0; i < sizes.length && extra > 0; i++, extra--) {
      sizes[i] = sizes[i] + 1;
    }

    // If any size is below MIN_SIZE, reduce sections and recompute once
    if (sizes.length > 1 && sizes[sizes.length - 1] < MIN_SIZE) {
      const s = Math.max(1, bestSections - 1);
      const newBase = Math.floor(total / s);
      let newExtra = total % s;
      const newSizes: number[] = Array.from({ length: s }, () => newBase);
      for (let i = 0; i < newSizes.length && newExtra > 0; i++, newExtra--) {
        newSizes[i] = newSizes[i] + 1;
      }
      return { count: s, sizes: newSizes };
    }

    return { count: bestSections, sizes };
  };

  const summary = useMemo(() => {
    const rows = (studentCounts || []).map((course) => {
      const plan = computeSectionPlan(course.total_students);
      return {
        code: course.code,
        name: course.name,
        level: course.level,
        total: course.total_students,
        sections: plan.count,
        sizes: plan.sizes,
      };
    });

    const totals = rows.reduce(
      (acc, r) => {
        acc.students += r.total;
        acc.sections += r.sections;
        return acc;
      },
      { students: 0, sections: 0 }
    );

    return { rows, totals };
  }, [studentCounts]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Counts by Course</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Level</TableHead>
                <TableHead className="text-right">Students</TableHead>
                <TableHead className="text-right">Recommended Sections</TableHead>
                <TableHead className="text-right">Section Size Plan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.rows.map((course) => {
                const sizeGroups = course.sizes
                  .sort((a, b) => b - a)
                  .reduce<Record<number, number>>((acc, size) => {
                    acc[size] = (acc[size] || 0) + 1;
                    return acc;
                  }, {});
                const planLabel = Object.entries(sizeGroups)
                  .sort((a, b) => Number(b[0]) - Number(a[0]))
                  .map(([size, count]) => `${count}×${size}`)
                  .join(", ");

                return (
                  <TableRow key={course.code}>
                    <TableCell className="font-medium">{course.code}</TableCell>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>Level {course.level}</TableCell>
                    <TableCell className="text-right">{course.total}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium">{course.sections}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium">{planLabel || "-"}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-muted/50">
                <TableCell colSpan={3} className="font-medium">
                  Total
                </TableCell>
                <TableCell className="text-right font-medium">
                  {summary.totals.students}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {summary.totals.sections}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
