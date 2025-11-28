/**
 * Student Schedule View Component
 * 
 * Purpose: Display weekly schedule grid for student's courses
 * 
 * Schedule Composition:
 * - Required courses: Blue badges (auto-enrolled)
 * - Elective courses: Green badges (manually registered)
 * 
 * Features:
 * - Weekly grid view (Sunday-Thursday)
 * - Time slots from 8:00-17:00
 * - Color-coded course types
 * - Course details on hover
 * - Print-friendly layout
 * 
 * Data Flow:
 * 1. Fetch complete schedule from API
 * 2. Parse meeting patterns into time slots
 * 3. Render grid with courses in correct positions
 * 4. Handle overlaps (shouldn't occur, but display if they do)
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getAuthHeader } from "@/lib/utils/client-auth";
import { cachedFetch, CacheTTL } from "@/lib/utils/api-cache";

interface ScheduleSection {
  id: string;
  course_code: string;
  course_title: string;
  section_no: string;
  credits: number;
  is_elective: boolean;
  is_enrolled: boolean;
  is_swe_scheduled?: boolean; // Indicates if scheduled by algorithm (SWE courses levels 4-8)
  instructor_name: string | null;
  room_code: string | null;
  meeting_pattern: {
    days: string[];
    start: string;
    duration: number;
    is_lab: boolean;
  };
  state: string;
}

interface ScheduleData {
  student_id: string;
  level: number;
  total_credits: number;
  required_credits: number;
  elective_credits: number;
  sections: ScheduleSection[];
  is_empty?: boolean;
  message?: string;
}

// Days of the week (Sunday-Thursday for academic schedule)
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

// Time slots (8:00 AM - 5:00 PM)
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

export function StudentScheduleView() {
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  /**
   * Fetch student schedule
   * Uses real API endpoint for schedule data
   */
  async function fetchSchedule() {
    setLoading(true);
    try {
      const authHeader = await getAuthHeader();
      // Cache schedule for 5 minutes - it doesn't change frequently
      interface ScheduleData {
        schedule?: unknown[];
      }
      const result = await cachedFetch<{ data: ScheduleData }>(
        '/api/v1/schedules/me',
        {
          headers: authHeader ? { Authorization: authHeader } : {},
        },
        undefined,
        CacheTTL.MEDIUM
      );
      const scheduleData = result.data;

      // Transform API response to component format
      if (scheduleData.is_empty || !scheduleData.schedule || scheduleData.schedule.length === 0) {
        setSchedule({
          student_id: scheduleData.student_id || '',
          level: scheduleData.level || 1,
          total_credits: 0,
          required_credits: 0,
          elective_credits: 0,
          sections: [],
          is_empty: true,
          message: scheduleData.message || 'No schedule available',
        });
        return;
      }

      // Transform schedule items to sections format
      const sections: ScheduleSection[] = [];
      
      interface CourseEntry {
        sections?: Array<{
          id?: string;
          section_no?: string;
          meeting_pattern?: {
            days?: string[];
            start?: string;
            duration?: number;
          };
          room?: {
            code?: string;
          };
          instructor?: {
            name?: string;
          };
          credits?: number;
          enrollment_type?: string;
        }>;
      }
      scheduleData.schedule.forEach((courseEntry: CourseEntry) => {
        if (courseEntry.sections && Array.isArray(courseEntry.sections)) {
          courseEntry.sections.forEach((section: CourseEntry['sections'][0]) => {
            sections.push({
              id: section.section_id || section.id,
              course_code: courseEntry.course_code || section.course_code,
              course_title: courseEntry.course_name || section.course?.title || '',
              section_no: section.section_no || '',
              credits: courseEntry.credits || section.course?.credits || 0,
              is_elective: courseEntry.is_elective || section.course?.is_elective || false,
              is_enrolled: true,
              is_swe_scheduled: section.is_swe_scheduled || false,
              instructor_name: section.instructor?.name || null,
              room_code: section.room?.code || section.room_code || null,
              meeting_pattern: section.meeting_pattern || {
                days: [],
                start: '',
                duration: 0,
                is_lab: false,
              },
              state: section.state || 'released',
            });
          });
        }
      });

      // Calculate credit totals
      let totalCredits = 0;
      let requiredCredits = 0;
      let electiveCredits = 0;

      sections.forEach((section) => {
        totalCredits += section.credits;
        if (section.is_elective) {
          electiveCredits += section.credits;
        } else {
          requiredCredits += section.credits;
        }
      });

      setSchedule({
        student_id: scheduleData.student_id || '',
        level: scheduleData.level || 1,
        total_credits: totalCredits,
        required_credits: requiredCredits,
        elective_credits: electiveCredits,
        sections,
        is_empty: sections.length === 0,
      });
    } catch (error: unknown) {
      console.error('Error fetching schedule:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load schedule';
      toast.error(errorMessage);
      setSchedule({
        student_id: '',
        level: 1,
        total_credits: 0,
        required_credits: 0,
        elective_credits: 0,
        sections: [],
        is_empty: true,
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }

  /**
   * Check if a course occupies a specific time slot on a specific day
   * 
   * @param section - The section to check
   * @param day - Day of the week
   * @param timeSlot - Time slot (HH:MM format)
   * @returns True if section meets at this day/time
   */
  function sectionOccupiesSlot(section: ScheduleSection, day: string, timeSlot: string): boolean {
    const { days, start, duration } = section.meeting_pattern;
    
    // Check if section meets on this day
    if (!days.includes(day)) return false;
    
    // Parse times
    const slotTime = parseTime(timeSlot);
    const startTime = parseTime(start);
    const endTime = startTime + duration;
    const slotEnd = slotTime + 60; // Each slot is 1 hour
    
    // Check if times overlap
    return slotTime < endTime && startTime < slotEnd;
  }

  /**
   * Parse time string (HH:MM) to minutes since midnight
   */
  function parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Print schedule
   */
  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (!schedule || schedule.is_empty || schedule.sections.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-xl font-semibold mb-2">No Schedule Available</p>
          <p className="text-sm text-muted-foreground mb-4">
            {schedule?.message || 'Your schedule will appear once sections are published by your department.'}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-sm text-left">
            <p className="font-medium text-blue-900 mb-2">What to do next:</p>
            <ul className="space-y-1 text-blue-800">
              <li>• Contact your department administrator</li>
              <li>• Check back later for updates</li>
              <li>• Ensure your student information is up to date</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Schedule Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                My Weekly Schedule
              </CardTitle>
              <CardDescription>
                Level {schedule.level} | {schedule.total_credits} Credits 
                ({schedule.required_credits} required + {schedule.elective_credits} elective)
              </CardDescription>
            </div>
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm flex-wrap">
        <span className="flex items-center gap-2">
          <Badge className="bg-blue-600">SWE Scheduled</Badge>
          <span className="text-muted-foreground">SWE courses (algorithm)</span>
        </span>
        <span className="flex items-center gap-2">
          <Badge className="bg-purple-600">External Dept</Badge>
          <span className="text-muted-foreground">Pre-scheduled courses</span>
        </span>
        <span className="flex items-center gap-2">
          <Badge className="bg-green-600">Elective</Badge>
          <span className="text-muted-foreground">Registered electives</span>
        </span>
      </div>

      {/* Weekly Schedule Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border p-2 text-left w-20 text-sm font-medium">
                    Time
                  </th>
                  {DAYS.map(day => (
                    <th key={day} className="border p-2 text-center text-sm font-medium">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map(timeSlot => (
                  <tr key={timeSlot} className="hover:bg-gray-50">
                    <td className="border p-2 text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {timeSlot}
                    </td>
                    {DAYS.map(day => {
                      // Find sections that occupy this slot
                      // Ensure schedule.sections is an array
                      const sections = (schedule?.sections && Array.isArray(schedule.sections)) 
                        ? schedule.sections 
                        : [];
                      const sectionsInSlot = sections.filter(
                        section => sectionOccupiesSlot(section, day, timeSlot)
                      );

                      return (
                        <td key={`${day}-${timeSlot}`} className="border p-1">
                          {sectionsInSlot.map(section => (
                            <div
                              key={`${section.id}-${day}-${timeSlot}`}
                              className={`p-2 rounded text-xs ${
                                section.is_swe_scheduled
                                  ? 'bg-blue-100 border border-blue-300'
                                  : section.is_elective
                                  ? 'bg-green-100 border border-green-300'
                                  : 'bg-purple-100 border border-purple-300'
                              } mb-1 last:mb-0`}
                            >
                              <div className="font-semibold">
                                {section.course_code}
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {section.section_no}
                              </div>
                              {section.room_code && (
                                <div className="flex items-center gap-1 mt-0.5 text-[10px]">
                                  <MapPin className="h-2.5 w-2.5" />
                                  {section.room_code}
                                </div>
                              )}
                              {section.activity === 'lab' && (
                                <Badge variant="outline" className="text-[9px] mt-1 h-4">
                                  Lab
                                </Badge>
                              )}
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Course List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {schedule && schedule.sections && Array.isArray(schedule.sections) 
              ? schedule.sections.map(section => (
                  <div
                    key={section.id}
                    className="flex items-start justify-between p-3 border rounded-lg"
                  >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{section.course_code}</span>
                    <Badge variant="secondary">{section.section_no}</Badge>
                    <Badge className={
                      section.is_swe_scheduled
                        ? 'bg-blue-600'
                        : section.is_elective
                        ? 'bg-green-600'
                        : 'bg-purple-600'
                    }>
                      {section.is_swe_scheduled ? 'SWE Scheduled' : section.is_elective ? 'Elective' : 'External Dept'}
                    </Badge>
                    <Badge variant="outline">{section.credits} cr</Badge>
                    {section.enrollment_type && (
                      <Badge variant={section.enrollment_type === 'required' ? 'default' : 'secondary'}>
                        {section.enrollment_type === 'required' ? 'Required' : 'Elective'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {section.course_title}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {section.instructor_name && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {section.instructor_name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {section.meeting_pattern.days.join(', ')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {section.meeting_pattern.start} ({section.meeting_pattern.duration}min)
                    </span>
                    {section.room_code && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {section.room_code}
                      </span>
                    )}
                  </div>
                </div>
              </div>
                ))
              : (
                <div className="text-center py-8 text-muted-foreground">
                  No sections found in schedule
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

