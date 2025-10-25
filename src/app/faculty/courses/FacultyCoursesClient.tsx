"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Users,
  Clock,
  ArrowLeft,
  Calendar,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseSection {
  id: string;
  course_code: string;
  room_id: number | null;
  capacity: number;
  enrolledCount: number;
  course: {
    code: string;
    name: string;
    credits: number;
    department: string;
    description: string | null;
    type: string;
    level: number;
  };
  times: Array<{
    id: string;
    day: string;
    start_time: string;
    end_time: string;
  }>;
}

export default function FacultyCoursesClient() {
  const [courses, setCourses] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/faculty/courses");
        const data = await response.json();

        if (data.success) {
          setCourses(data.data.sections || []);
        } else {
          setError(data.error || "Failed to fetch courses");
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground">
          {courses.length} {courses.length === 1 ? "course" : "courses"} assigned this term
        </p>
      </div>

      {/* Courses List */}
      {courses.length === 0 ? (
        <Card className="border-2">
          <CardContent className="py-12">
            <div className="text-center">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Courses Assigned</h3>
              <p className="text-sm text-muted-foreground">
                You don&apos;t have any courses assigned for this term yet.
                <br />
                Course assignments will appear here once the schedule is finalized.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="border-2 bg-white dark:bg-gray-950 shadow-sm transition-all hover:shadow-lg"
            >
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">
                          {course.course.name}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {course.course_code} • Section {course.id}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-sm">
                      {course.course.credits} Credits
                    </Badge>
                    <Badge variant="secondary" className="text-sm capitalize">
                      {course.course.type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Course Description */}
                {course.course.description && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                      Description
                    </h4>
                    <p className="text-sm">{course.course.description}</p>
                  </div>
                )}

                {/* Course Details Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Enrollment */}
                  <div className="rounded-lg border bg-muted/20 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Enrollment</h4>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">
                        {course.enrolledCount} / {course.capacity}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((course.enrolledCount / course.capacity) * 100)}% capacity
                      </p>
                    </div>
                  </div>

                  {/* Department & Level */}
                  <div className="rounded-lg border bg-muted/20 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Course Info</h4>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-semibold">Department:</span>{" "}
                        {course.course.department}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Level:</span> {course.course.level}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Schedule Times */}
                {course.times.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                      Class Schedule
                    </h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      {course.times.map((time) => (
                        <div
                          key={time.id}
                          className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3"
                        >
                          <Calendar className="h-5 w-5 text-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{time.day}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                {time.start_time} - {time.end_time}
                              </span>
                            </div>
                          </div>
                          {course.room_id && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>Room {course.room_id}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

