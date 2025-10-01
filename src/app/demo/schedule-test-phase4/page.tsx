"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { testPhase4ScheduleGeneration } from "@/lib/schedule/test-phase4-data";

export default function Phase4TestPage() {
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Run test on component mount
    console.log("\n\n");
    runTest();
  }, []);

  const runTest = async () => {
    setIsRunning(true);
    try {
      await testPhase4ScheduleGeneration();
    } catch (error) {
      console.error("Test failed:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunTest = async () => {
    console.clear();
    await runTest();
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>
            Schedule Generation - Phase 4 Core Generation Test
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Verify that ScheduleGenerator creates complete, conflict-aware
            schedules
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">What This Tests:</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Single Level Generation: Creates schedule for one level</li>
              <li>
                Multiple Levels Generation: Creates schedules for 3 levels
              </li>
              <li>
                Complete Generation: All 5 levels (4-8) with full curriculum
              </li>
              <li>
                Section Assignment: Students assigned to sections with capacity
                limits
              </li>
              <li>
                Faculty Assignment: Instructors assigned based on preferences
              </li>
              <li>Room Allocation: Rooms assigned to sections</li>
              <li>Exam Scheduling: Midterm and final exams scheduled</li>
              <li>Elective Sections: Generated based on student demand</li>
              <li>Conflict Detection: Integrated conflict checking</li>
              <li>Metadata Calculation: Utilization statistics</li>
            </ul>
          </div>

          <Button
            onClick={handleRunTest}
            className="w-full"
            disabled={isRunning}
          >
            {isRunning
              ? "Generating Schedule..."
              : "Run Phase 4 Generation Test (Check Console)"}
          </Button>

          <div className="bg-muted p-4 rounded-md">
            <p className="text-xs text-muted-foreground">
              <strong>Instructions:</strong>
              <br />
              1. Click the button above
              <br />
              2. Check the browser console for detailed test results
              <br />
              3. Verify all tests complete successfully:
              <br />
              &nbsp;&nbsp;• Schedule generated for all requested levels
              <br />
              &nbsp;&nbsp;• Sections created with appropriate capacity
              <br />
              &nbsp;&nbsp;• Faculty assigned to teach sections
              <br />
              &nbsp;&nbsp;• Rooms allocated to sections
              <br />
              &nbsp;&nbsp;• Exams scheduled for all courses
              <br />
              &nbsp;&nbsp;• Electives offered based on student demand
              <br />
              &nbsp;&nbsp;• Metadata shows resource utilization
              <br />
              &nbsp;&nbsp;• Conflicts detected and reported
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Expected Console Output:</h4>
            <div className="bg-muted p-3 rounded text-xs font-mono max-h-96 overflow-y-auto">
              <div>SCHEDULE GENERATION - PHASE 4 CORE GENERATION</div>
              <br />
              <div>✅ TEST 1: SINGLE LEVEL GENERATION</div>
              <div>🚀 Starting schedule generation...</div>
              <div>Semester: Fall 2025</div>
              <div>Levels: 4</div>
              <br />
              <div>📊 Step 1: Collecting data...</div>
              <div>- Students: 75</div>
              <div>- Faculty: 15</div>
              <div>- Electives: 32</div>
              <br />
              <div>📅 Step 2: Generating schedules by level...</div>
              <div>Processing Level 4...</div>
              <div>&nbsp;&nbsp;Students: 75</div>
              <div>&nbsp;&nbsp;Required SWE courses: 2</div>
              <div>&nbsp;&nbsp;Elective slots: 0</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;SWE211: 3 section(s)</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;SWE226: 3 section(s)</div>
              <br />
              <div>🔍 Step 3: Detecting conflicts...</div>
              <div>Found [X] conflicts</div>
              <br />
              <div>📈 Step 4: Calculating metadata...</div>
              <br />
              <div>✅ Schedule generation complete!</div>
              <div>Total sections: 6</div>
              <div>Total exams: 4</div>
              <div>Faculty utilization: [X]%</div>
              <div>Room utilization: [X]%</div>
              <br />
              <div>Generated Schedule ID: schedule-[timestamp]</div>
              <div>Semester: Fall 2025</div>
              <div>Levels processed: 1</div>
              <div>Total sections: 6</div>
              <div>Total exams: 4</div>
              <div>Conflicts found: [X]</div>
              <br />
              <div>✅ TEST 2: MULTIPLE LEVELS GENERATION</div>
              <div>[Similar detailed output for levels 4, 5, 6]</div>
              <br />
              <div>✅ TEST 3: ALL LEVELS GENERATION</div>
              <div>[Comprehensive output for all 5 levels]</div>
              <br />
              <div>Level Summary:</div>
              <div>&nbsp;&nbsp;Level 4: 75 students, 2 courses, 6 sections</div>
              <div>&nbsp;&nbsp;Level 5: 65 students, 3 courses, 6 sections</div>
              <div>
                &nbsp;&nbsp;Level 6: 55 students, 3 courses, [X] sections (+
                electives)
              </div>
              <div>
                &nbsp;&nbsp;Level 7: 45 students, 2 courses, [X] sections (+
                electives)
              </div>
              <div>
                &nbsp;&nbsp;Level 8: 35 students, 1 course, [X] sections (+
                electives)
              </div>
              <br />
              <div>Final Metadata:</div>
              <div>&nbsp;&nbsp;Total sections: [X]</div>
              <div>&nbsp;&nbsp;Total exams: [X]</div>
              <div>&nbsp;&nbsp;Faculty utilization: [X]%</div>
              <div>&nbsp;&nbsp;Room utilization: [X]%</div>
              <br />
              <div>✅ TEST 4: SECTION DETAILS</div>
              <div>
                [Detailed section information with times, rooms, instructors]
              </div>
              <br />
              <div>✅ TEST 5: ELECTIVES GENERATION</div>
              <div>[Electives offered for levels 6, 7, 8 based on demand]</div>
              <br />
              <div>✅ PHASE 4 TESTING COMPLETE</div>
              <div>Summary:</div>
              <div>&nbsp;&nbsp;✓ Single level generation works</div>
              <div>&nbsp;&nbsp;✓ Multiple levels generation works</div>
              <div>
                &nbsp;&nbsp;✓ Complete schedule (all 5 levels) generated
              </div>
              <div>&nbsp;&nbsp;✓ Section details properly structured</div>
              <div>&nbsp;&nbsp;✓ Electives generated based on demand</div>
              <div>&nbsp;&nbsp;✓ Metadata calculated correctly</div>
              <div>&nbsp;&nbsp;✓ Conflicts detected and reported</div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>📊 What Gets Generated:</strong>
              <br />
              <br />• <strong>275 students</strong> across 5 levels
              <br />• <strong>11 required SWE courses</strong> with multiple
              sections
              <br />• <strong>Top 5 demanded electives</strong> per level (6-8)
              <br />• <strong>~40-50 total sections</strong> depending on demand
              <br />• <strong>Faculty assignments</strong> based on preferences
              <br />• <strong>Room allocations</strong> from available pool
              <br />• <strong>Exam schedules</strong> for all courses
              <br />• <strong>Conflict detection</strong> across all resources
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
