"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { testPhase3ConflictDetection } from "@/lib/schedule/test-phase3-data";

export default function Phase3TestPage() {
  useEffect(() => {
    // Run test on component mount
    console.log("\n\n");
    testPhase3ConflictDetection();
  }, []);

  const handleRunTest = () => {
    console.clear();
    testPhase3ConflictDetection();
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>
            Schedule Generation - Phase 3 Conflict Detection Test
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Verify that ConflictChecker detects all types of scheduling
            conflicts
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">What This Tests:</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Time Conflict Detection: Overlapping class times</li>
              <li>
                Exam Conflict Detection: Same exam times for different courses
              </li>
              <li>Faculty Conflict Detection: Instructor double-booked</li>
              <li>Room Conflict Detection: Same room booked twice</li>
              <li>
                Capacity Conflict Detection: Section enrollment exceeds capacity
              </li>
              <li>
                Student Schedule Conflicts: Student enrolled in overlapping
                classes
              </li>
              <li>Comprehensive Conflict Analysis: All conflicts aggregated</li>
            </ul>
          </div>

          <Button onClick={handleRunTest} className="w-full">
            Run Phase 3 Conflict Detection Test (Check Console)
          </Button>

          <div className="bg-muted p-4 rounded-md">
            <p className="text-xs text-muted-foreground">
              <strong>Instructions:</strong>
              <br />
              1. Click the button above
              <br />
              2. Check the browser console for test results
              <br />
              3. Verify all tests detect conflicts correctly:
              <br />
              &nbsp;&nbsp;• Time conflicts detected for overlapping sections
              <br />
              &nbsp;&nbsp;• Exam conflicts detected for same time slots
              <br />
              &nbsp;&nbsp;• Faculty conflicts detected for double-booking
              <br />
              &nbsp;&nbsp;• Room conflicts detected for same room overlaps
              <br />
              &nbsp;&nbsp;• Capacity conflicts detected when enrollment exceeds
              limit
              <br />
              &nbsp;&nbsp;• Student conflicts detected for overlapping courses
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Expected Console Output:</h4>
            <div className="bg-muted p-3 rounded text-xs font-mono">
              <div>SCHEDULE GENERATION - PHASE 3 CONFLICT DETECTION</div>
              <br />
              <div>✅ TEST 1: TIME CONFLICT DETECTION</div>
              <div>Time conflict between SWE211 and SWE312: FOUND</div>
              <div>
                &nbsp;&nbsp;Message: Time conflict: SWE211 and SWE312 meet at
                the same time
              </div>
              <div>Time conflict between SWE211 and SWE314: None</div>
              <br />
              <div>✅ TEST 2: EXAM CONFLICT DETECTION</div>
              <div>Exam conflicts found: 1</div>
              <div>
                &nbsp;&nbsp;1. Midterm exam conflict: SWE211 and SWE312
                scheduled at same time
              </div>
              <br />
              <div>✅ TEST 3: FACULTY CONFLICT DETECTION</div>
              <div>Faculty conflicts for Prof. Ahmed Al-Rashid: 1</div>
              <div>
                &nbsp;&nbsp;1. Faculty conflict: Prof. Ahmed Al-Rashid assigned
                to multiple sections at same time
              </div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Severity: ERROR</div>
              <br />
              <div>✅ TEST 4: ROOM CONFLICT DETECTION</div>
              <div>Room conflicts found: 1</div>
              <div>&nbsp;&nbsp;1. Room conflict: CCIS 1A101 double-booked</div>
              <br />
              <div>✅ TEST 5: CAPACITY CONFLICT DETECTION</div>
              <div>Capacity check (25/30): OK</div>
              <div>Capacity check (35/30): Exceeded</div>
              <div>&nbsp;&nbsp;Message: Capacity exceeded: SWE211 (35/30)</div>
              <br />
              <div>✅ TEST 6: STUDENT SCHEDULE CONFLICT DETECTION</div>
              <div>Student schedule conflicts: 1</div>
              <div>
                &nbsp;&nbsp;1. Student schedule conflict: Student A has
                overlapping classes
              </div>
              <br />
              <div>✅ TEST 7: COMPREHENSIVE CONFLICT CHECK</div>
              <div>Total conflicts detected: [number]</div>
              <div>Conflict Summary:</div>
              <div>&nbsp;&nbsp;Total: [number]</div>
              <div>
                &nbsp;&nbsp;By Type: {`{ TIME: x, ROOM: x, INSTRUCTOR: x }`}
              </div>
              <div>&nbsp;&nbsp;By Severity: {`{ ERROR: x, WARNING: x }`}</div>
              <div>&nbsp;&nbsp;Critical (ERROR): [number]</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
