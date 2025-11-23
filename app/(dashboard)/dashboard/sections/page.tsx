import { SectionsTable } from "@/components/sections-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getMockSections } from "@/lib/demo-data";
import { Plus, AlertCircle, Settings } from "lucide-react";
import Link from "next/link";

export default async function SectionsPage() {
  // DEMO MODE: Use mock data
  const sections = await getMockSections();
  const error = null;
  
  // Mock current semester for demo
  const currentSemester = {
    name: "Fall 2024",
    code: "2024-FALL",
  };

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
              Current Semester: <span className="font-medium">{currentSemester.name}</span> ({currentSemester.code}) (Demo Mode)
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

