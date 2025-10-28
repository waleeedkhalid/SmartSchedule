import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCourses } from "@/lib/db/courses";
import { Plus } from "lucide-react";
import Link from "next/link";
import { CoursesTable } from "@/components/courses-table";

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Courses
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your course catalog
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/courses/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Courses</CardTitle>
            <CardDescription>
              {courses.length} course{courses.length !== 1 ? 's' : ''} in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CoursesTable courses={courses} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

