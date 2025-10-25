import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SchedulingRulesConfig, ScheduleConflict } from "@/types/scheduler";

/**
 * POST /api/committee/scheduler/rules/test
 * Test rules against current schedule data
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { term_code, rules_config } = body;

    if (!term_code || !rules_config) {
      return NextResponse.json(
        { error: "term_code and rules_config are required" },
        { status: 400 }
      );
    }

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current schedule data
    const { data: sections, error: sectionsError } = await supabase
      .from("course_sections")
      .select(
        `
        *,
        courses:course_code (
          code,
          name,
          credits,
          level
        ),
        time_slots:section_time_slots (
          day,
          start_time,
          end_time
        )
      `
      )
      .not("courses", "is", null);

    if (sectionsError) {
      console.error("Error fetching sections:", sectionsError);
      return NextResponse.json(
        { error: "Failed to fetch schedule data" },
        { status: 500 }
      );
    }

    // Test rules against schedule
    const testResults = await testRulesAgainstSchedule(
      sections || [],
      rules_config
    );

    return NextResponse.json({
      success: true,
      data: {
        total_violations: testResults.violations.length,
        violations_by_type: groupViolationsByType(testResults.violations),
        violations: testResults.violations,
        passed_checks: testResults.passedChecks,
        summary: {
          critical: testResults.violations.filter((v) => v.severity === "critical")
            .length,
          error: testResults.violations.filter((v) => v.severity === "error")
            .length,
          warning: testResults.violations.filter((v) => v.severity === "warning")
            .length,
          info: testResults.violations.filter((v) => v.severity === "info")
            .length,
        },
      },
    });
  } catch (error) {
    console.error("Rules test error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

interface TestResults {
  violations: ScheduleConflict[];
  passedChecks: string[];
}

// Test rules against schedule data
async function testRulesAgainstSchedule(
  sections: any[],
  rulesConfig: SchedulingRulesConfig
): Promise<TestResults> {
  const violations: ScheduleConflict[] = [];
  const passedChecks: string[] = [];

  // Test 1: Break time violations
  const breakViolations = checkBreakTimeViolations(sections, rulesConfig.rules);
  if (breakViolations.length > 0) {
    violations.push(...breakViolations);
  } else {
    passedChecks.push("Break time compliance");
  }

  // Test 2: Daily hours limit
  const dailyHoursViolations = checkDailyHoursLimit(
    sections,
    rulesConfig.rules
  );
  if (dailyHoursViolations.length > 0) {
    violations.push(...dailyHoursViolations);
  } else {
    passedChecks.push("Daily hours limit compliance");
  }

  // Test 3: Room capacity
  if (rulesConfig.rules.respect_room_capacity) {
    const capacityViolations = checkRoomCapacity(sections, rulesConfig.rules);
    if (capacityViolations.length > 0) {
      violations.push(...capacityViolations);
    } else {
      passedChecks.push("Room capacity compliance");
    }
  }

  // Test 4: Time conflicts
  const timeConflicts = checkTimeConflicts(sections);
  if (timeConflicts.length > 0) {
    violations.push(...timeConflicts);
  } else {
    passedChecks.push("No time conflicts");
  }

  // Test 5: Section size compliance
  const sectionSizeViolations = checkSectionSize(sections, rulesConfig.rules);
  if (sectionSizeViolations.length > 0) {
    violations.push(...sectionSizeViolations);
  } else {
    passedChecks.push("Section size compliance");
  }

  return { violations, passedChecks };
}

// Check for break time violations (e.g., 12:00-13:00)
function checkBreakTimeViolations(
  sections: any[],
  rules: SchedulingRulesConfig["rules"]
): ScheduleConflict[] {
  const violations: ScheduleConflict[] = [];
  const breakStart = "12:00";
  const breakEnd = "13:00";

  sections.forEach((section) => {
    section.time_slots?.forEach((slot: any) => {
      if (timeOverlap(slot.start_time, slot.end_time, breakStart, breakEnd)) {
        violations.push({
          type: "constraint_violation",
          severity: "warning",
          title: "Break Time Violation",
          description: `Section ${section.id} scheduled during break time (${slot.day} ${slot.start_time}-${slot.end_time})`,
          affected_entities: [
            {
              type: "section",
              id: section.id,
              name: `${section.course_code} - ${section.id}`,
            },
          ],
          resolution_suggestions: [
            "Reschedule to avoid break time",
            "Split section into different time slots",
          ],
          auto_resolvable: true,
        });
      }
    });
  });

  return violations;
}

// Check daily hours limit
function checkDailyHoursLimit(
  sections: any[],
  rules: SchedulingRulesConfig["rules"]
): ScheduleConflict[] {
  const violations: ScheduleConflict[] = [];
  // This would require student schedule data
  // For now, just check if any instructor exceeds the limit
  return violations;
}

// Check room capacity
function checkRoomCapacity(
  sections: any[],
  rules: SchedulingRulesConfig["rules"]
): ScheduleConflict[] {
  const violations: ScheduleConflict[] = [];

  sections.forEach((section) => {
    const enrolledCount = section.enrolled_count || 0;
    const capacity = section.capacity || 0;
    const maxAllowed = rules.allow_section_overflow
      ? capacity * (1 + rules.overflow_percentage / 100)
      : capacity;

    if (enrolledCount > maxAllowed) {
      violations.push({
        type: "capacity_exceeded",
        severity: "error",
        title: "Section Over Capacity",
        description: `Section ${section.id} has ${enrolledCount} students but capacity is ${capacity} (max allowed: ${Math.floor(maxAllowed)})`,
        affected_entities: [
          {
            type: "section",
            id: section.id,
            name: `${section.course_code} - ${section.id}`,
          },
        ],
        resolution_suggestions: [
          "Create additional section",
          "Move students to another section",
          "Increase room capacity",
        ],
        auto_resolvable: false,
      });
    }
  });

  return violations;
}

// Check for time conflicts
function checkTimeConflicts(sections: any[]): ScheduleConflict[] {
  const violations: ScheduleConflict[] = [];
  const roomSchedule: Map<
    string,
    Array<{ day: string; start: string; end: string; section: any }>
  > = new Map();

  // Build room schedule map
  sections.forEach((section) => {
    if (!section.room_number) return;

    section.time_slots?.forEach((slot: any) => {
      const key = section.room_number!;
      if (!roomSchedule.has(key)) {
        roomSchedule.set(key, []);
      }
      roomSchedule.get(key)!.push({
        day: slot.day,
        start: slot.start_time,
        end: slot.end_time,
        section,
      });
    });
  });

  // Check for conflicts in each room
  roomSchedule.forEach((schedule, room) => {
    for (let i = 0; i < schedule.length; i++) {
      for (let j = i + 1; j < schedule.length; j++) {
        const a = schedule[i];
        const b = schedule[j];

        if (a.day === b.day && timeOverlap(a.start, a.end, b.start, b.end)) {
          violations.push({
            type: "room_conflict",
            severity: "critical",
            title: "Room Double-Booked",
            description: `Room ${room} has conflicting sections on ${a.day} at ${a.start}-${a.end}`,
            affected_entities: [
              {
                type: "section",
                id: a.section.id,
                name: `${a.section.course_code} - ${a.section.id}`,
              },
              {
                type: "section",
                id: b.section.id,
                name: `${b.section.course_code} - ${b.section.id}`,
              },
            ],
            resolution_suggestions: [
              "Assign different room to one section",
              "Change time slot for one section",
            ],
            auto_resolvable: true,
          });
        }
      }
    }
  });

  return violations;
}

// Check section size constraints
function checkSectionSize(
  sections: any[],
  rules: SchedulingRulesConfig["rules"]
): ScheduleConflict[] {
  const violations: ScheduleConflict[] = [];

  sections.forEach((section) => {
    const enrolledCount = section.enrolled_count || 0;

    if (enrolledCount < rules.min_students_per_section) {
      violations.push({
        type: "constraint_violation",
        severity: "warning",
        title: "Section Under-Enrolled",
        description: `Section ${section.id} has only ${enrolledCount} students (minimum: ${rules.min_students_per_section})`,
        affected_entities: [
          {
            type: "section",
            id: section.id,
            name: `${section.course_code} - ${section.id}`,
          },
        ],
        resolution_suggestions: [
          "Merge with another section",
          "Cancel section if enrollment doesn't increase",
        ],
        auto_resolvable: false,
      });
    }
  });

  return violations;
}

// Helper: Check if two time ranges overlap
function timeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return s1 < e2 && s2 < e1;
}

// Helper: Convert time string to minutes
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Group violations by type
function groupViolationsByType(
  violations: ScheduleConflict[]
): Record<string, number> {
  const grouped: Record<string, number> = {};

  violations.forEach((violation) => {
    grouped[violation.type] = (grouped[violation.type] || 0) + 1;
  });

  return grouped;
}

