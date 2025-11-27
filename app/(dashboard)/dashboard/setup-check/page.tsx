import { createClient } from "@/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default async function SetupCheckPage() {
  const supabase = await createClient();
  
  const checks = {
    connection: false,
    tables: [] as string[],
    missingTables: [] as string[],
    rls: false,
  };

  // Check connection
  try {
    const { error } = await supabase.from('course').select('*', { count: 'exact', head: true });
    if (!error) {
      checks.connection = true;
    }
  } catch (e) {
    checks.connection = false;
  }

  // Check all required tables
  const requiredTables = [
    'course', 'room', 'instructor', 'section',
    'exam', 'rule', 'schedule_doc', 'comment', 'notification',
    'user_roles', 'time_grid_config', 'elective_preference',
    'student_enrollment', 'schedule_comment', 'irregular_student'
  ];

  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (!error) {
        checks.tables.push(table);
      } else {
        checks.missingTables.push(table);
      }
    } catch (e) {
      checks.missingTables.push(table);
    }
  }

  const allTablesExist = checks.missingTables.length === 0;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Setup Check
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Verify your database configuration
        </p>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {checks.connection ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Supabase Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              {checks.connection ? (
                <p className="text-green-600 dark:text-green-400">
                  ✓ Successfully connected to Supabase
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-red-600 dark:text-red-400">
                    ✗ Cannot connect to Supabase
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Check your <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">.env.local</code> file:
                  </p>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {allTablesExist ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Database Tables ({checks.tables.length}/{requiredTables.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allTablesExist ? (
                <p className="text-green-600 dark:text-green-400">
                  ✓ All required tables exist
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-red-800 dark:text-red-200 font-medium mb-2">
                      Missing Tables: {checks.missingTables.join(', ')}
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      You need to run the database migrations!
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">How to Fix:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Go to your Supabase project dashboard</li>
                      <li>Click <strong>SQL Editor</strong> in the sidebar</li>
                      <li>Run these migration files <strong>in order</strong>:</li>
                    </ol>
                    
                    <div className="ml-6 space-y-2 text-sm">
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                        <p className="font-mono text-xs">
                          1. supabase/migrations/20241027000001_initial_schema.sql
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Creates all tables and schema
                        </p>
                      </div>
                      
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                        <p className="font-mono text-xs">
                          2. supabase/migrations/20241027000002_rls_policies.sql
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Sets up Row Level Security
                        </p>
                      </div>
                      
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                        <p className="font-mono text-xs">
                          3. supabase/migrations/20241027000003_helper_functions.sql
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Adds conflict detection functions
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mt-4">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        💡 <strong>Tip:</strong> Copy the entire content of each file and paste it into the SQL Editor, then click Run.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {checks.tables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Found Tables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {checks.tables.map((table) => (
                    <div
                      key={table}
                      className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {table}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Run the migrations as shown above</li>
                <li>Create your first user (via Supabase Auth dashboard)</li>
                <li>Add a role for that user in the <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">user_roles</code> table</li>
                <li>Refresh this page to verify setup</li>
                <li>Start using the dashboard!</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

