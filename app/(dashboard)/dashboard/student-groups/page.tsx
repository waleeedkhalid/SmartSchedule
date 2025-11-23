import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMockStudentGroups } from "@/lib/demo-data";
import { Plus } from "lucide-react";
import Link from "next/link";
import { StudentGroupsTable } from "@/components/student-groups-table";

export default async function StudentGroupsPage() {
  const groups = await getMockStudentGroups();

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Student Groups
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage student groups by level
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/student-groups/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Student Group
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Student Groups</CardTitle>
            <CardDescription>
              {groups.length} group{groups.length !== 1 ? 's' : ''} in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentGroupsTable groups={groups} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

