"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { testPhase2DataServices } from "@/lib/schedule/test-phase2-data";

export default function Phase2TestPage() {
  useEffect(() => {
    // Run test on component mount
    console.log("\n\n");
    testPhase2DataServices();
  }, []);

  const handleRunTest = () => {
    console.clear();
    testPhase2DataServices();
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>
            Schedule Generation - Phase 2 Data Services Test
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Verify that ScheduleDataCollector and TimeSlotManager work correctly
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">What This Tests:</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>ScheduleDataCollector: Data collection and validation</li>
              <li>TimeSlotManager: Time slot overlap detection</li>
              <li>Faculty availability checking</li>
              <li>Time slot generation and optimization</li>
              <li>Hour calculations and utilization tracking</li>
              <li>Conflict detection and validation</li>
            </ul>
          </div>

          <Button onClick={handleRunTest} className="w-full">
            Run Phase 2 Data Services Test (Check Console)
          </Button>

          <div className="bg-muted p-4 rounded-md">
            <p className="text-xs text-muted-foreground">
              <strong>Instructions:</strong>
              <br />
              1. Click the button above
              <br />
              2. Check the browser console for test results
              <br />
              3. Verify all tests show expected values:
              <br />
              &nbsp;&nbsp;• Data validation should pass
              <br />
              &nbsp;&nbsp;• Time slot overlaps detected correctly
              <br />
              &nbsp;&nbsp;• Faculty availability calculations work
              <br />
              &nbsp;&nbsp;• No conflicts in valid slot collections
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Expected Console Output:</h4>
            <div className="bg-muted p-3 rounded text-xs font-mono">
              <div>
                SCHEDULE GENERATION - PHASE 2 DATA SERVICES VERIFICATION
              </div>
              <br />
              <div>✅ TEST 1: SCHEDULE DATA COLLECTOR</div>
              <div>Data validation: PASS</div>
              <div>Retrieved curriculum for 3 levels: 3 levels</div>
              <div>Retrieved students for levels 4-5: 150 students</div>
              <div>Available faculty: 15 instructors</div>
              <div>Available elective courses: 32 courses</div>
              <div>Comprehensive data collection:</div>
              <div>&nbsp;&nbsp;- Levels: 3</div>
              <div>&nbsp;&nbsp;- Students: 150</div>
              <div>&nbsp;&nbsp;- Faculty: 15</div>
              <div>&nbsp;&nbsp;- Electives: 32</div>
              <br />
              <div>✅ TEST 2: TIME SLOT MANAGER</div>
              <div>Slot overlap detection:</div>
              <div>&nbsp;&nbsp;Same day, overlapping: true</div>
              <div>&nbsp;&nbsp;Different days: false</div>
              <div>New slot conflicts with existing: false</div>
              <div>Generated 1-hour time slots: 250 slots</div>
              <div>Available slots (excluding conflicts): 249 slots</div>
              <div>Faculty [name] available at Monday 09:00: true/false</div>
              <div>Faculty available at Monday 09:00: [count] instructors</div>
              <div>Total hours for test slots: 3.5 hours</div>
              <div>Slot collection validation: 1 conflicts found</div>
              <div>Found 3 optimal morning slots</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
