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
import { BookOpen, Users, Clock, ArrowRight } from "lucide-react";

interface CourseSection {
  id: string;
  course_code: string;
  capacity: number;
  enrolledCount: number;
  course: {
    code: string;
    name: string;
    credits: number;
    department: string;
  };
  times: Array<{
    day: string;
    start_time: string;
    end_time: string;
  }>;
}

export default function MyCoursesCard() {
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
      <Card className="border-2 bg-white dark:bg-gray-950 shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            My Courses
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 bg-white dark:bg-gray-950 shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            My Courses
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 bg-white dark:bg-gray-950 shadow-sm">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">My Courses</CardTitle>
              <CardDescription>
                {courses.length} {courses.length === 1 ? "course" : "courses"} assigned this term
              </CardDescription>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/faculty/courses">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {courses.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No courses assigned yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Course assignments will appear here once the schedule is finalized
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.slice(0, 3).map((course) => (
              <div
                key={course.id}
                className="rounded-lg border bg-muted/30 p-4 transition-all hover:bg-muted/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-base">
                      {course.course.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {course.course_code} • Section {course.id}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {course.course.credits} credits
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {course.enrolledCount}/{course.capacity}
                    </span>
                  </div>
                  {course.times.length > 0 && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {course.times[0].day} {course.times[0].start_time}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {courses.length > 3 && (
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href="/faculty/courses">
                  View all {courses.length} courses <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

