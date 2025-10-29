import { SectionsTable } from "@/components/sections-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getSections } from "@/lib/db/sections";
import { getCurrentSemester } from "@/lib/db/semesters";
import { Plus, AlertCircle, Settings } from "lucide-react";
import Link from "next/link";

export default async function SectionsPage() {
  // Check if current semester exists
  const currentSemester = await getCurrentSemester();
  
  if (!currentSemester) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Sections
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage course sections with meeting patterns
              </p>
            </div>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Semester Required</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-4">
                Sections require a current semester to be set. Please initialize a semester first.
              </p>
              <Button asChild size="sm">
                <Link href="/dashboard/setup">
                  <Settings className="mr-2 h-4 w-4" />
                  Go to Setup
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Fetch sections for current semester
  let sections = [];
  let error = null;
  
  try {
    sections = await getSections(currentSemester.id);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load sections';
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Sections
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage course sections with meeting patterns
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Current Semester: <span className="font-medium">{currentSemester.name}</span> ({currentSemester.code})
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/sections/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Link>
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Sections</CardTitle>
            <CardDescription>
              {sections.length} section{sections.length !== 1 ? 's' : ''} in {currentSemester.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SectionsTable sections={sections} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

