'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { Database } from '@/lib/types/database';

type AcademicTerm = Database['public']['Tables']['academic_term']['Row'];

interface SemesterInfo {
  needsInitialization: boolean;
  currentSemester?: AcademicTerm;
}

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [semesterInfo, setSemesterInfo] = useState<SemesterInfo | null>(null);

  const checkCurrentSemester = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/semesters/init');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check semester');
      }
      
      setSemesterInfo(data);
      
      if (data.needsInitialization) {
        setError('No current semester found. Click "Initialize Semester" to create one.');
      } else {
        setSuccess(`Current semester: ${data.currentSemester.name} (${data.currentSemester.code})`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const initializeSemester = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/semesters/init', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize semester');
      }
      
      setSemesterInfo(data);
      setSuccess(`Semester created successfully: ${data.semester.name} (${data.semester.code})`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">System Setup</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Initialize system requirements and check configuration
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Semester Configuration</CardTitle>
            <CardDescription>
              The system requires a current semester to be set for most operations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500 text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {semesterInfo?.currentSemester && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <h3 className="font-semibold mb-2">Current Semester</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {semesterInfo.currentSemester.name}</p>
                  <p><strong>Code:</strong> {semesterInfo.currentSemester.code}</p>
                  <p><strong>Status:</strong> {semesterInfo.currentSemester.status}</p>
                  <p><strong>Start Date:</strong> {semesterInfo.currentSemester.start_date ? new Date(semesterInfo.currentSemester.start_date).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>End Date:</strong> {semesterInfo.currentSemester.end_date ? new Date(semesterInfo.currentSemester.end_date).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={checkCurrentSemester}
                disabled={loading}
                variant="outline"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Check Current Semester'
                )}
              </Button>

              <Button 
                onClick={initializeSemester}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  'Initialize Semester'
                )}
              </Button>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="font-semibold mb-1">Note:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check Current Semester: Verifies if a current semester is set</li>
                <li>Initialize Semester: Creates a default semester based on the current date</li>
                <li>You can manage semesters from the Semesters page after initialization</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

