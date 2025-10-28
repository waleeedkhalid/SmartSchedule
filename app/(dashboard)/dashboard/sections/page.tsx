import { SectionsTable } from "@/components/sections-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSections } from "@/lib/db/sections";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function SectionsPage() {
  const sections = await getSections();

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
          <Button asChild>
            <Link href="/dashboard/sections/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Sections</CardTitle>
            <CardDescription>
              {sections.length} section{sections.length !== 1 ? 's' : ''} in the system
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

