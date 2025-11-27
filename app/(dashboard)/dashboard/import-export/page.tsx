import { ImportExportUI } from "@/components/import-export-ui";
import { ClientOnly } from "@/components/client-only";
import { Card, CardContent } from "@/components/ui/card";

export default function ImportExportPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Import / Export Data
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Bulk import or export your scheduling data as JSON
        </p>

        {/* Wrapped in ClientOnly to prevent hydration errors from File objects and window APIs */}
        <ClientOnly
          fallback={
            <Card>
              <CardContent className="py-12">
                <div className="flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Loading import/export tools...</p>
                </div>
              </CardContent>
            </Card>
          }
        >
          <ImportExportUI />
        </ClientOnly>
      </div>
    </div>
  );
}

