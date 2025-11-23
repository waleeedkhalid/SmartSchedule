import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMockInstructors } from "@/lib/demo-data";
import { Plus } from "lucide-react";
import Link from "next/link";
import { InstructorsTable } from "@/components/instructors-table";

export default async function InstructorsPage() {
  const instructors = await getMockInstructors();

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Instructors
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage teaching staff and their preferences
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/instructors/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Instructor
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Instructors</CardTitle>
            <CardDescription>
              {instructors.length} instructor{instructors.length !== 1 ? 's' : ''} in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InstructorsTable instructors={instructors} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

