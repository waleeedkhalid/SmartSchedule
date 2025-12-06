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

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Users,
  Clock,
  MapPin,
  BookOpen,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { getAuthHeader } from "@/lib/utils/client-auth";
import { cachedFetch, CacheTTL, apiCache } from "@/lib/utils/api-cache";
import { parseMeetingPattern } from "@/lib/types";

// Lazy load heavy UI components for better initial load performance
const Card = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.Card),
  { ssr: false }
);
const CardContent = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardContent),
  { ssr: false }
);
const CardHeader = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardHeader),
  { ssr: false }
);
const CardTitle = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardTitle),
  { ssr: false }
);
const CardDescription = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardDescription),
  { ssr: false }
);
const Badge = dynamic(
  () => import("@/components/ui/badge").then((mod) => mod.Badge),
  { ssr: false }
);
const Alert = dynamic(
  () => import("@/components/ui/alert").then((mod) => mod.Alert),
  { ssr: false }
);
const AlertDescription = dynamic(
  () => import("@/components/ui/alert").then((mod) => mod.AlertDescription),
  { ssr: false }
);
const Progress = dynamic(
  () => import("@/components/ui/progress").then((mod) => mod.Progress),
  { ssr: false }
);

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
  course_level: number;
  is_elective: boolean;
  section_no: string;
  activity: string;
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
  // Academic rule information
  is_locked: boolean;
  lock_reasons: string[];
  prerequisites: string[];
  missing_prerequisites: string[];
  is_enrolled: boolean;
  is_enrolled_in_course: boolean;
  can_register: boolean;
}

interface CreditStats {
  enrolled_sections: number;
  required_credits: number;
  elective_credits: number;
  total: number;
  available_credits: number;
}

interface ElectiveRegistrationManagerProps {
  userId?: string;
}

export function ElectiveRegistrationManager({
  userId,
}: ElectiveRegistrationManagerProps) {
  const [enrollments, setEnrollments] = useState<EnrollmentInfo[]>([]);
  const [availableSections, setAvailableSections] = useState<
    AvailableSection[]
  >([]);
  const [creditStats, setCreditStats] = useState<CreditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [registrationOpen, setRegistrationOpen] = useState<boolean | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch enrollments and available sections on mount or when userId changes
  useEffect(() => {
    fetchData();
  }, [userId]);

  /**
   * Fetch all data: enrollments, available sections, and credit stats
   * Uses real API endpoints for CRUD operations
   * Only fetches data if registration is open
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // Get authentication header for API requests
      const authHeader = await getAuthHeader();

      // Check registration status FIRST - this is mandatory (cache for 1 minute)
      const regData = await cachedFetch<{
        data: { is_open: boolean; message?: string };
      }>(
        "/api/v1/registration-status",
        {
          headers: authHeader ? { Authorization: authHeader } : {},
        },
        userId,
        CacheTTL.SHORT
      );
      const isOpen = regData.data?.is_open || false;
      setRegistrationOpen(isOpen);

      // If registration is NOT open, show only warning message and return early
      if (!isOpen) {
        setEnrollments([]);
        setAvailableSections([]);
        setCreditStats(null);
        setErrorMessage(
          regData.data?.message ||
          "Registration is currently closed. Please check the academic timeline for registration dates."
        );
        setLoading(false);
        return; // Exit early - don't fetch any data
      }

      // Registration is open - proceed with fetching data
      // Fetch enrollments from API (cache for 5 minutes)
      const enrollmentsData = await cachedFetch<{ data: EnrollmentResponse[] }>(
        "/api/v1/enrollments",
        {
          headers: authHeader ? { Authorization: authHeader } : {},
        },
        userId,
        CacheTTL.MEDIUM
      );
      const enrollmentsList = enrollmentsData.data || [];

      // Transform enrollments to match expected format
      interface EnrollmentResponse {
        id: string;
        section_id: string;
        enrollment_type: string;
        course_code?: string;
        course?: { code: string; title: string; credits: number };
        section?: {
          section_no: string;
          meeting_pattern: unknown;
          instructor?: { name: string };
        };
      }

      const formattedEnrollments = enrollmentsList.map(
        (e: EnrollmentResponse) => {
          const mp = e.section?.meeting_pattern
            ? parseMeetingPattern(e.section.meeting_pattern)
            : null;
          return {
            id: e.id,
            section_id: e.section_id,
            course: e.course || {
              code: e.course_code || "",
              title: "",
              credits: 0,
            },
            section: {
              section_no: e.section?.section_no || "",
              meeting_pattern: mp || { days: [], start: "TBA", duration: 0 },
            },
            instructor: e.section?.instructor || null,
          };
        }
      );

      // Fetch available sections from new endpoint with academic rules applied
      // Cache for 5 minutes - sections don't change frequently during registration
      interface AvailableSectionResponse {
        section_id: string;
        course_code: string;
        course_title: string;
        course_credits: number;
        course_level: number;
        is_elective: boolean;
        section_no: string;
        activity: string;
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
        is_locked: boolean;
        lock_reasons: string[];
        prerequisites: string[];
        missing_prerequisites: string[];
        is_enrolled: boolean;
        is_enrolled_in_course: boolean;
        can_register: boolean;
      }

      const sectionsData = await cachedFetch<{
        data: AvailableSectionResponse[];
      }>(
        "/api/v1/available-sections",
        {
          headers: authHeader ? { Authorization: authHeader } : {},
        },
        userId,
        CacheTTL.MEDIUM
      );
      const availableSectionsData = sectionsData.data || [];

      // Calculate credit stats from enrollments
      let totalCredits = 0;
      let requiredCredits = 0;
      let electiveCredits = 0;

      enrollmentsList.forEach((e: EnrollmentResponse) => {
        const credits = e.course?.credits || 0;
        totalCredits += credits;
        if (e.enrollment_type === "elective") {
          electiveCredits += credits;
        } else {
          requiredCredits += credits;
        }
      });

      const stats: CreditStats = {
        enrolled_sections: enrollmentsList.length,
        required_credits: requiredCredits,
        elective_credits: electiveCredits,
        total: totalCredits,
        available_credits: 20 - totalCredits,
      };

      setEnrollments(formattedEnrollments);
      setAvailableSections(availableSectionsData);
      setCreditStats(stats);
    } catch (error: unknown) {
      console.error("Error fetching data:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Failed to load registration data";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Enroll in an elective section
   * Uses real API endpoint for enrollment
   */
  async function handleEnroll(section: AvailableSection) {
    // Pre-check: Academic rules (client-side for immediate feedback)
    if (section.is_locked) {
      toast.error(`Cannot enroll: ${section.lock_reasons.join("; ")}`);
      return;
    }

    // Pre-check: Already enrolled in this course
    if (section.is_enrolled_in_course) {
      toast.error("Already enrolled in another section of this course");
      return;
    }

    // Pre-check: Credit limit (client-side for immediate feedback)
    if (creditStats && creditStats.total + section.course_credits > 20) {
      toast.error(
        `Cannot enroll: Would exceed 20-credit limit (current: ${creditStats.total
        }, new: ${creditStats.total + section.course_credits})`
      );
      return;
    }

    // Pre-check: Seat availability
    if (section.is_full) {
      toast.error("Section is full");
      return;
    }

    setActionLoading(section.section_id);
    try {
      const authHeader = await getAuthHeader();
      const response = await fetch("/api/v1/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify({
          section_id: section.section_id,
          enrollment_type: section.is_elective ? "elective" : "required",
        }),
      });

      // Invalidate cache after successful enrollment
      if (response.ok) {
        apiCache.invalidatePattern("/api/v1/enrollments");
        apiCache.invalidatePattern("/api/v1/available-sections");
        apiCache.invalidatePattern("/api/v1/schedules/me");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to enroll");
      }

      await response.json(); // Response data not needed, just verify success
      toast.success(
        `Successfully enrolled in ${section.course_code} ${section.section_no}`
      );

      // Refresh data to show updated enrollments and credits
      await fetchData();
    } catch (error: unknown) {
      console.error("Error enrolling:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Failed to enroll";
      toast.error(errorMsg);
    } finally {
      setActionLoading(null);
    }
  }

  /**
   * Drop an enrollment
   * Uses real API endpoint for dropping enrollment
   */
  async function handleDrop(enrollmentId: string, courseName: string) {
    setActionLoading(enrollmentId);
    try {
      const authHeader = await getAuthHeader();
      const response = await fetch(`/api/v1/enrollments/${enrollmentId}`, {
        method: "DELETE",
        headers: authHeader ? { Authorization: authHeader } : {},
      });

      // Invalidate cache after successful drop
      if (response.ok) {
        apiCache.invalidatePattern("/api/v1/enrollments");
        apiCache.invalidatePattern("/api/v1/available-sections");
        apiCache.invalidatePattern("/api/v1/schedules/me");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to drop enrollment");
      }

      toast.success(`Successfully dropped ${courseName}`);

      // Refresh data
      await fetchData();
    } catch (error: unknown) {
      console.error("Error dropping enrollment:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Failed to drop course";
      toast.error(errorMsg);
    } finally {
      setActionLoading(null);
    }
  }

  // Calculate credit usage percentage for progress bar
  const creditPercentage = creditStats ? (creditStats.total / 20) * 100 : 0;
  const creditColor =
    creditPercentage >= 100
      ? "text-red-600"
      : creditPercentage >= 90
        ? "text-yellow-600"
        : "text-green-600";

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Checking registration status...
          </p>
        </div>
      </div>
    );
  }

  // If registration is closed, show ONLY the warning message
  if (registrationOpen === false) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="max-w-2xl w-full">
          <Alert className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 border-2">
            <div className="flex flex-col items-center text-center space-y-4 p-6">
              <AlertCircle className="h-12 w-12 text-yellow-600 dark:text-yellow-500" />
              <AlertDescription className="text-yellow-900 dark:text-yellow-100 text-lg font-semibold">
                <strong className="text-2xl block mb-3">
                  Registration is Currently Closed
                </strong>
                <p className="text-base font-normal mt-2">
                  Please check the academic timeline for when registration
                  opens. Registration will be available during the designated
                  registration period.
                </p>
              </AlertDescription>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message Alert (only shown if registration is open but there's an error) */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

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
            Required: {creditStats?.required_credits || 0} credits | Electives:{" "}
            {creditStats?.elective_credits || 0} credits | Available:{" "}
            {creditStats?.available_credits || 0} credits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={creditPercentage} className="h-3" />
          {creditPercentage >= 100 && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                You&apos;ve reached the 20-credit limit. Drop a course to
                register for another.
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
            My Enrollments ({enrollments.length})
          </CardTitle>
          <CardDescription>
            Courses you&apos;ve registered for this semester
          </CardDescription>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No enrollments yet</p>
              <p className="text-sm mt-1">Register for courses below</p>
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
                        {enrollment.section.meeting_pattern.days.join(", ")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {enrollment.section.meeting_pattern.start}(
                        {enrollment.section.meeting_pattern.duration}min)
                      </span>
                      {enrollment.instructor && (
                        <span>{enrollment.instructor.name}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      handleDrop(enrollment.id, enrollment.course.code)
                    }
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
            Available Sections ({availableSections.length})
          </CardTitle>
          <CardDescription>
            Select sections to register for courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableSections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium mb-2">No sections available</p>
              <p className="text-sm">
                {errorMessage ||
                  "No sections have been released for registration yet. " +
                  "Please check back later or contact your department for more information."}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {availableSections.map((section) => {
                const isEnrolled =
                  section.is_enrolled ||
                  section.is_enrolled_in_course ||
                  enrollments.some((e) => e.section_id === section.section_id);

                return (
                  <div
                    key={section.section_id}
                    className={`p-4 border rounded-lg ${isEnrolled
                        ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                        : section.is_locked
                          ? "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700 opacity-75"
                          : "hover:shadow-md"
                      } transition-all`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-lg">
                            {section.course_code}
                          </span>
                          <Badge variant="secondary">
                            {section.section_no}
                          </Badge>
                          <Badge variant="outline">
                            {section.course_credits} cr
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Level {section.course_level}
                          </Badge>
                          {section.is_elective && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            >
                              Elective
                            </Badge>
                          )}
                          {section.is_full && (
                            <Badge variant="destructive">Full</Badge>
                          )}
                          {section.is_locked && (
                            <Badge
                              variant="destructive"
                              className="bg-orange-500"
                            >
                              Locked
                            </Badge>
                          )}
                          {isEnrolled && (
                            <Badge className="bg-green-600">Enrolled</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {section.course_title}
                        </p>

                        {/* Prerequisites Info */}
                        {section.prerequisites.length > 0 && (
                          <div className="mb-2 text-xs">
                            <span className="text-muted-foreground">
                              Prerequisites:{" "}
                            </span>
                            <span
                              className={
                                section.missing_prerequisites.length > 0
                                  ? "text-orange-600 dark:text-orange-400"
                                  : "text-green-600 dark:text-green-400"
                              }
                            >
                              {section.prerequisites.join(", ")}
                            </span>
                            {section.missing_prerequisites.length > 0 && (
                              <span className="text-orange-600 dark:text-orange-400 ml-1">
                                (Missing:{" "}
                                {section.missing_prerequisites.join(", ")})
                              </span>
                            )}
                          </div>
                        )}

                        {/* Lock Reasons */}
                        {section.is_locked &&
                          section.lock_reasons.length > 0 && (
                            <div className="mb-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-xs">
                              <div className="flex items-start gap-1">
                                <AlertCircle className="h-3 w-3 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                                <div className="text-orange-800 dark:text-orange-200">
                                  {section.lock_reasons.map((reason, idx) => (
                                    <div key={idx}>{reason}</div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {section.meeting_pattern.days.join(", ") || "TBA"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {section.meeting_pattern.start} (
                            {section.meeting_pattern.duration}min)
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {section.room_code || "TBA"}
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
                          <p
                            className={`text-xs font-medium ${section.available_seats <= 5
                                ? "text-orange-600"
                                : ""
                              }`}
                          >
                            {section.available_seats} seats left
                          </p>
                        </div>
                        {!isEnrolled && (
                          <Button
                            size="sm"
                            onClick={() => handleEnroll(section)}
                            disabled={
                              !section.can_register ||
                              actionLoading === section.section_id ||
                              !!(
                                creditStats &&
                                creditStats.total + section.course_credits > 20
                              )
                            }
                            variant={
                              section.is_locked ? "secondary" : "default"
                            }
                            title={
                              section.is_locked
                                ? section.lock_reasons.join("; ")
                                : section.is_full
                                  ? "Section is full"
                                  : actionLoading === section.section_id
                                    ? "Loading..."
                                    : creditStats &&
                                      creditStats.total + section.course_credits >
                                      20
                                      ? "Would exceed 20-credit limit"
                                      : section.is_enrolled_in_course
                                        ? "Already enrolled in another section of this course"
                                        : "Click to register"
                            }
                          >
                            {section.is_locked ? "Locked" : "Register"}
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
