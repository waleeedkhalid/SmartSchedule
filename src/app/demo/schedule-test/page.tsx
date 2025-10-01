"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { testScheduleDataSetup } from "@/lib/schedule/test-phase1-data";

export default function Phase1TestPage() {
  useEffect(() => {
    // Run test on component mount
    console.log("\n\n");
    testScheduleDataSetup();
  }, []);

  const handleRunTest = () => {
    console.clear();
    testScheduleDataSetup();
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Schedule Generation - Phase 1 Data Test</CardTitle>
          <p className="text-sm text-muted-foreground">
            Verify that all foundational data is properly set up
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">What This Tests:</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>SWE Curriculum (5 levels with course mappings)</li>
              <li>SWE Students (275 students across 5 levels)</li>
              <li>SWE Faculty (15 instructors with availability)</li>
              <li>Elective demand by level</li>
              <li>Faculty preferences and capacity</li>
              <li>Section calculations</li>
            </ul>
          </div>

          <Button onClick={handleRunTest} className="w-full">
            Run Phase 1 Data Test (Check Console)
          </Button>

          <div className="bg-muted p-4 rounded-md">
            <p className="text-xs text-muted-foreground">
              <strong>Instructions:</strong>
              <br />
              1. Click the button above
              <br />
              2. Open browser console (F12)
              <br />
              3. Review the test output
              <br />
              4. Verify all data is loaded correctly
            </p>
          </div>

          <div className="border-t pt-4 space-y-2">
            <h3 className="font-medium text-sm">Expected Output:</h3>
            <div className="bg-slate-950 text-green-400 p-4 rounded-md font-mono text-xs overflow-auto max-h-96">
              <pre>{`============================================================
SCHEDULE GENERATION - PHASE 1 DATA VERIFICATION
============================================================

✅ TEST 1: SWE CURRICULUM
------------------------------------------------------------
Total Levels: 5
Level 4: 2 SWE courses, 4 external, 0 elective slots
Level 5: 3 SWE courses, 3 external, 0 elective slots
Level 6: 3 SWE courses, 1 external, 1 elective slots
Level 7: 2 SWE courses, 0 external, 2 elective slots
Level 8: 1 SWE courses, 0 external, 3 elective slots
Total SWE Courses: 11

✅ TEST 2: SWE STUDENTS
------------------------------------------------------------
Total Students: 275
Level 4: 75 students
Level 5: 65 students
Level 6: 55 students
Level 7: 45 students
Level 8: 35 students

✅ TEST 3: ELECTIVE DEMAND
------------------------------------------------------------
[Elective preferences by level]

✅ TEST 4: SWE FACULTY
------------------------------------------------------------
Total Faculty: 15
  Professors: 5
  Associates: 5
  Assistants: 5
Total Teaching Capacity: 186 hours/week

✅ TEST 5: FACULTY PREFERENCES (Sample)
------------------------------------------------------------
[Faculty course preferences]

✅ TEST 6: SECTIONS NEEDED PER LEVEL
------------------------------------------------------------
Level 4: 75 students → 3 sections (@ 30 students/section)
Level 5: 65 students → 3 sections (@ 30 students/section)
Level 6: 55 students → 2 sections (@ 30 students/section)
Level 7: 45 students → 2 sections (@ 30 students/section)
Level 8: 35 students → 2 sections (@ 30 students/section)

============================================================
✅ ALL TESTS PASSED - PHASE 1 DATA READY!
============================================================

📊 Summary:
  - 5 curriculum levels defined
  - 275 students across all levels
  - 15 faculty members
  - 11 SWE courses to schedule

🚀 Ready to proceed to Phase 2: Data Services`}</pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
