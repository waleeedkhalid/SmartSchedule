/**
 * Elective Registration Manager Component
 * 
 * Purpose: Allow students to register for elective sections with constraint validation
 * 
 * Features:
 * - Display available elective sections with full details
 * - Show current enrollments with drop capability
 * - Real-time credit tracking (current/max 20)
 * - Seat availability indicators
 * - Inline validation feedback
 * 
 * Data Flow:
 * 1. Fetch student's current enrollments
 * 2. Fetch available elective sections
 * 3. Display both with register/drop actions
 * 4. Validate constraints before enrollment (credit limit, capacity)
 * 5. Update UI optimistically with server confirmation
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Clock, 
  MapPin, 
  BookOpen, 
  AlertCircle, 
  CheckCircle,
  XCircle,
  Calendar
} from "lucide-react";
import { toast } from "sonner";

interface EnrollmentInfo {
  id: string;
  section_id: string;
  course: {
    code: string;
    title: string;
    credits: number;
  };
  section: {
    section_no: string;
    meeting_pattern: {
      days: string[];
      start: string;
      duration: number;
    };
  };
  instructor: {
    name: string;
  } | null;
}

interface AvailableSection {
  section_id: string;
  course_code: string;
  course_title: string;
  course_credits: number;
  section_no: string;
  instructor_name: string | null;
  room_code: string | null;
  capacity: number;
  enrolled_count: number;
  available_seats: number;
  is_full: boolean;
  meeting_pattern: {
    days: string[];
    start: string;
    duration: number;
  };
}

interface CreditStats {
  enrolled_sections: number;
  required_credits: number;
  elective_credits: number;
  total: number;
  available_credits: number;
}

export function ElectiveRegistrationManager() {
  const [enrollments, setEnrollments] = useState<EnrollmentInfo[]>([]);
  const [availableSections, setAvailableSections] = useState<AvailableSection[]>([]);
  const [creditStats, setCreditStats] = useState<CreditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch enrollments and available sections on mount
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Fetch all data: enrollments, available sections, and credit stats
   * This provides a complete view of student's registration status
   */
  async function fetchData() {
    setLoading(true);
    try {
      // Parallel fetch for efficiency
      const [enrollmentsRes, sectionsRes, statsRes] = await Promise.all([
        fetch('/api/student/enrollments'),
        fetch('/api/student/available-sections?available_only=false'),
        fetch('/api/student/enrollments?stats=true'),
      ]);

      if (enrollmentsRes.ok) {
        const enrollmentsData = await enrollmentsRes.json();
        setEnrollments(enrollmentsData);
      }

      if (sectionsRes.ok) {
        const sectionsData = await sectionsRes.json();
        setAvailableSections(sectionsData.sections || []);
      }

      if (statsRes.ok) {
        const stats = await statsRes.json();
        setCreditStats(stats);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load registration data');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Enroll in an elective section
   * Validates constraints and provides user feedback
   * 
   * @param sectionId - UUID of the section to enroll in
   */
  async function handleEnroll(section: AvailableSection) {
    // Pre-check: Credit limit (client-side for immediate feedback)
    if (creditStats && creditStats.total + section.course_credits > 20) {
      toast.error(
        `Cannot enroll: Would exceed 20-credit limit (current: ${creditStats.total}, new: ${creditStats.total + section.course_credits})`
      );
      return;
    }

    // Pre-check: Seat availability
    if (section.is_full) {
      toast.error('Section is full');
      return;
    }

    setActionLoading(section.section_id);
    try {
      const res = await fetch('/api/student/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_id: section.section_id }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Server-side validation failed - show specific error
        toast.error(data.error || 'Failed to enroll');
        return;
      }

      // Success!
      toast.success(`Enrolled in ${section.course_code} ${section.section_no}`);
      
      // Refresh data to show updated enrollments and credits
      fetchData();
    } catch (error) {
      console.error('Error enrolling:', error);
      toast.error('Failed to enroll');
    } finally {
      setActionLoading(null);
    }
  }

  /**
   * Drop an enrollment
   * Updates status to 'dropped' (maintains audit trail)
   * 
   * @param enrollmentId - UUID of the enrollment to drop
   */
  async function handleDrop(enrollmentId: string, courseName: string) {
    setActionLoading(enrollmentId);
    try {
      const res = await fetch(`/api/student/enrollments/${enrollmentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        toast.error('Failed to drop course');
        return;
      }

      toast.success(`Dropped ${courseName}`);
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error dropping enrollment:', error);
      toast.error('Failed to drop course');
    } finally {
      setActionLoading(null);
    }
  }

  // Calculate credit usage percentage for progress bar
  const creditPercentage = creditStats ? (creditStats.total / 20) * 100 : 0;
  const creditColor = creditPercentage >= 100 ? 'text-red-600' : creditPercentage >= 90 ? 'text-yellow-600' : 'text-green-600';

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading registration data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Credit Tracker Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Credit Usage</span>
            <span className={`text-2xl font-bold ${creditColor}`}>
              {creditStats?.total || 0} / 20
            </span>
          </CardTitle>
          <CardDescription>
            Required: {creditStats?.required_credits || 0} credits | 
            Electives: {creditStats?.elective_credits || 0} credits | 
            Available: {creditStats?.available_credits || 0} credits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={creditPercentage} className="h-3" />
          {creditPercentage >= 100 && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                You've reached the 20-credit limit. Drop a course to register for another.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Current Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            My Elective Enrollments ({enrollments.length})
          </CardTitle>
          <CardDescription>
            Courses you've registered for this semester
          </CardDescription>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No elective enrollments yet</p>
              <p className="text-sm mt-1">Register for electives below</p>
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-lg">
                        {enrollment.course.code}
                      </span>
                      <Badge variant="secondary">
                        {enrollment.section.section_no}
                      </Badge>
                      <Badge variant="outline">
                        {enrollment.course.credits} cr
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {enrollment.course.title}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {enrollment.section.meeting_pattern.days.join(', ')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {enrollment.section.meeting_pattern.start} 
                        ({enrollment.section.meeting_pattern.duration}min)
                      </span>
                      {enrollment.instructor && (
                        <span>{enrollment.instructor.name}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDrop(enrollment.id, enrollment.course.code)}
                    disabled={actionLoading === enrollment.id}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Drop
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Available Elective Sections ({availableSections.length})
          </CardTitle>
          <CardDescription>
            Select sections to register for elective courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableSections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No elective sections available</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {availableSections.map((section) => {
                const isEnrolled = enrollments.some(e => e.section_id === section.section_id);
                
                return (
                  <div
                    key={section.section_id}
                    className={`p-4 border rounded-lg ${isEnrolled ? 'bg-green-50 border-green-200' : 'hover:shadow-md'} transition-all`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-lg">
                            {section.course_code}
                          </span>
                          <Badge variant="secondary">
                            {section.section_no}
                          </Badge>
                          <Badge variant="outline">
                            {section.course_credits} cr
                          </Badge>
                          {section.is_full && (
                            <Badge variant="destructive">Full</Badge>
                          )}
                          {isEnrolled && (
                            <Badge className="bg-green-600">Enrolled</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {section.course_title}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {section.meeting_pattern.days.join(', ')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {section.meeting_pattern.start} ({section.meeting_pattern.duration}min)
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {section.room_code || 'TBA'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {section.enrolled_count}/{section.capacity} enrolled
                          </span>
                        </div>
                        {section.instructor_name && (
                          <p className="text-xs mt-1 text-muted-foreground">
                            Instructor: {section.instructor_name}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <p className="text-xs font-medium">
                            {section.available_seats} seats left
                          </p>
                        </div>
                        {!isEnrolled && (
                          <Button
                            size="sm"
                            onClick={() => handleEnroll(section)}
                            disabled={
                              section.is_full || 
                              actionLoading === section.section_id ||
                              (creditStats && creditStats.total + section.course_credits > 20)
                            }
                          >
                            Register
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

