"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { getAuthHeader } from "@/lib/utils/client-auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Cache for API responses to avoid redundant fetches
const apiCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds cache

function getCachedData<T>(key: string): T | null {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  return null;
}

function setCachedData<T>(key: string, data: T): void {
  apiCache.set(key, { data, timestamp: Date.now() });
}

// Meeting pattern type
interface MeetingPattern {
  days?: string[];
  start_time?: string;
  duration_minutes?: number;
}

// Exam type
interface Exam {
  id: string;
  course_code: string;
  date: string;
  start_time: string;
  duration_minutes: number;
}

// Conflict information
interface ConflictInfo {
  type: "schedule" | "exam";
  conflictingCourseCode: string;
  conflictingSectionNo?: string;
  details: string;
}

interface Student {
  user_id: string;
  name: string;
  email: string;
  level: number | null;
  student_number: string | null;
}

interface Enrollment {
  id: string;
  student_id: string;
  section_id: string;
  status: string;
  enrolled_at: string;
  student?: {
    name: string;
    email: string;
  };
  section?: {
    course_code: string;
    section_no: string;
    meeting_pattern?: MeetingPattern;
    course?: {
      title: string;
      credits: number;
    };
  };
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface EnrollmentData {
  section_id?: string;
}

interface SectionData {
  id: string;
  capacity?: number;
  current_enrollment?: number;
  course_code: string;
  section_no: string;
  state: string;
  instructor_id: string | null;
  room_code: string | null;
  meeting_pattern?: MeetingPattern;
  course?: {
    code: string;
    title: string;
    level: number;
    credits: number;
    is_elective: boolean;
  };
  instructor?: {
    id: string;
    name: string;
  };
}

// Helper function to check if two time slots overlap
function doTimeSlotsOverlap(
  start1: string,
  duration1: number,
  start2: string,
  duration2: number
): boolean {
  const [h1, m1] = start1.split(":").map(Number);
  const [h2, m2] = start2.split(":").map(Number);

  const startMins1 = h1 * 60 + m1;
  const endMins1 = startMins1 + duration1;
  const startMins2 = h2 * 60 + m2;
  const endMins2 = startMins2 + duration2;

  return startMins1 < endMins2 && startMins2 < endMins1;
}

// Check for schedule conflicts between two sections
function checkScheduleConflict(
  section1: {
    meeting_pattern?: MeetingPattern;
    course_code: string;
    section_no: string;
  },
  section2: {
    meeting_pattern?: MeetingPattern;
    course_code: string;
    section_no: string;
  }
): ConflictInfo | null {
  const mp1 = section1.meeting_pattern;
  const mp2 = section2.meeting_pattern;

  if (
    !mp1?.days?.length ||
    !mp2?.days?.length ||
    !mp1.start_time ||
    !mp2.start_time
  ) {
    return null;
  }

  // Check if any days overlap
  const commonDays = mp1.days.filter((day) => mp2.days?.includes(day));
  if (commonDays.length === 0) {
    return null;
  }

  // Check if times overlap
  const duration1 = mp1.duration_minutes || 60;
  const duration2 = mp2.duration_minutes || 60;

  if (
    doTimeSlotsOverlap(mp1.start_time, duration1, mp2.start_time, duration2)
  ) {
    return {
      type: "schedule",
      conflictingCourseCode: section2.course_code,
      conflictingSectionNo: section2.section_no,
      details: `Time conflict on ${commonDays.join(", ")} at ${mp2.start_time}`,
    };
  }

  return null;
}

// Check for exam conflicts
function checkExamConflict(
  sectionCourseCode: string,
  enrolledCourseCodes: string[],
  exams: Exam[]
): ConflictInfo | null {
  const sectionExam = exams.find((e) => e.course_code === sectionCourseCode);
  if (!sectionExam) {
    return null;
  }

  for (const enrolledCode of enrolledCourseCodes) {
    const enrolledExam = exams.find((e) => e.course_code === enrolledCode);
    if (!enrolledExam) continue;

    // Check if same date
    if (sectionExam.date === enrolledExam.date) {
      // Check if times overlap
      if (
        doTimeSlotsOverlap(
          sectionExam.start_time,
          sectionExam.duration_minutes,
          enrolledExam.start_time,
          enrolledExam.duration_minutes
        )
      ) {
        return {
          type: "exam",
          conflictingCourseCode: enrolledCode,
          details: `Exam conflict on ${sectionExam.date} at ${enrolledExam.start_time}`,
        };
      }
    }
  }

  return null;
}

export function ManualStudentRegistration() {
  const [students, setStudents] = useState<Student[]>([]);
  const [allSections, setAllSections] = useState<SectionData[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [sectionSearch, setSectionSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [, setSectionsLoading] = useState(false);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [isDroppingEnrollment, setIsDroppingEnrollment] = useState<
    string | null
  >(null);

  // Refs for auth header caching
  const authHeaderRef = useRef<string | null>(null);
  const authHeaderPromiseRef = useRef<Promise<string | null> | null>(null);

  // Confirmation dialog state
  const [enrollmentToDelete, setEnrollmentToDelete] =
    useState<Enrollment | null>(null);

  // Get auth header with caching to avoid repeated async calls
  const getAuthHeaderCached = useCallback(async (): Promise<string | null> => {
    if (authHeaderRef.current) {
      return authHeaderRef.current;
    }
    if (!authHeaderPromiseRef.current) {
      authHeaderPromiseRef.current = getAuthHeader().then((header) => {
        authHeaderRef.current = header;
        return header;
      });
    }
    return authHeaderPromiseRef.current;
  }, []);

  const fetchStudents = useCallback(
    async (useCache = true) => {
      // Check cache first
      if (useCache) {
        const cached = getCachedData<Student[]>("students");
        if (cached) {
          setStudents(cached);
          return;
        }
      }

      try {
        const authHeader = await getAuthHeaderCached();
        const response = await fetch("/api/registrar/students", {
          headers: authHeader ? { Authorization: authHeader } : {},
        });
        if (!response.ok) {
          const error = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          console.error("Error fetching students:", error);
          toast.error(error.error || "Failed to load students");
          return;
        }

        const result: ApiResponse<Student[]> | Student[] =
          await response.json();
        const studentsData = "data" in result ? result.data : result;
        const data = studentsData || [];

        setStudents(data);
        setCachedData("students", data);

        if (data.length === 0) {
          console.warn("No students found in database");
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Failed to load students");
      }
    },
    [getAuthHeaderCached]
  );

  const fetchSections = useCallback(
    async (useCache = true) => {
      // Check cache first
      if (useCache) {
        const cachedSections = getCachedData<SectionData[]>("allSections");
        const cachedExams = getCachedData<Exam[]>("exams");
        if (cachedSections && cachedExams) {
          setAllSections(cachedSections);
          setExams(cachedExams);
          return;
        }
      }

      setSectionsLoading(true);
      try {
        const authHeader = await getAuthHeaderCached();
        // Fetch sections, enrollments, and exams in parallel
        const [sectionsRes, enrollmentsRes, examsRes] = await Promise.all([
          fetch("/api/v1/sections", {
            headers: authHeader ? { Authorization: authHeader } : {},
          }),
          fetch("/api/registrar/student-enrollments?status=registered", {
            headers: authHeader ? { Authorization: authHeader } : {},
          }),
          fetch("/api/v1/exams/schedule", {
            method: "GET",
            headers: authHeader ? { Authorization: authHeader } : {},
          }).catch(() => null), // Exams might not exist yet
        ]);

        if (!sectionsRes.ok) {
          console.error("Failed to fetch sections");
          return;
        }

        const sectionsResult = await sectionsRes.json();
        let sectionsData: SectionData[] =
          "data" in sectionsResult ? sectionsResult.data : sectionsResult;

        console.log(
          "[ManualRegistration] Fetched sections:",
          sectionsData?.length || 0
        );

        // Calculate enrollment counts per section
        const enrollmentCounts = new Map<string, number>();

        if (enrollmentsRes.ok) {
          const enrollmentsResult = await enrollmentsRes.json();
          const enrollmentsData: EnrollmentData[] =
            "data" in enrollmentsResult
              ? enrollmentsResult.data
              : enrollmentsResult;

          enrollmentsData.forEach((e) => {
            if (e.section_id) {
              enrollmentCounts.set(
                e.section_id,
                (enrollmentCounts.get(e.section_id) || 0) + 1
              );
            }
          });
        }

        // Add enrollment counts to sections
        sectionsData = sectionsData.map((section) => ({
          ...section,
          capacity: section.capacity || 0,
          current_enrollment: enrollmentCounts.get(section.id) || 0,
        }));

        // Fetch exams
        let examsData: Exam[] = [];
        if (examsRes && examsRes.ok) {
          const examsResult = await examsRes.json();
          examsData = "data" in examsResult ? examsResult.data : examsResult;
        }

        console.log(
          "[ManualRegistration] Fetched exams:",
          examsData?.length || 0
        );

        setAllSections(sectionsData);
        setExams(examsData || []);
        setCachedData("allSections", sectionsData);
        setCachedData("exams", examsData || []);
      } catch (error) {
        console.error("Error fetching sections:", error);
        toast.error("Failed to load sections");
      } finally {
        setSectionsLoading(false);
      }
    },
    [getAuthHeaderCached]
  );

  const fetchStudentEnrollments = useCallback(
    async (studentId: string) => {
      setEnrollmentsLoading(true);
      try {
        const authHeader = await getAuthHeaderCached();
        const response = await fetch(
          `/api/registrar/student-enrollments?student_id=${studentId}&status=registered`,
          {
            headers: authHeader ? { Authorization: authHeader } : {},
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch enrollments");
        }
        const result = await response.json();
        // Handle both wrapped and unwrapped responses
        const data: Enrollment[] = "data" in result ? result.data : result;
        setEnrollments(data || []);
      } catch (error) {
        console.error("Error fetching enrollments:", error);
        toast.error("Failed to load student enrollments");
        setEnrollments([]);
      } finally {
        setEnrollmentsLoading(false);
      }
    },
    [getAuthHeaderCached]
  );

  // Initial data load - fetch students first, sections lazily when student selected
  useEffect(() => {
    const loadInitialData = async () => {
      setIsInitialLoading(true);
      // Fetch students first (usually smaller dataset)
      await fetchStudents();
      // Fetch sections in parallel but don't block initial render
      fetchSections();
      setIsInitialLoading(false);
    };
    loadInitialData();
  }, [fetchStudents, fetchSections]);

  // Load enrollments when student changes
  useEffect(() => {
    if (selectedStudent) {
      fetchStudentEnrollments(selectedStudent);
    } else {
      setEnrollments([]);
    }
  }, [selectedStudent, fetchStudentEnrollments]);

  const handleRegister = useCallback(async () => {
    if (!selectedStudent || !selectedSection) {
      toast.error("Please select both a student and a section");
      return;
    }

    setIsLoading(true);

    try {
      const authHeader = await getAuthHeaderCached();
      const response = await fetch("/api/registrar/student-enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify({
          student_id: selectedStudent,
          section_id: selectedSection,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage =
          result.error || result.message || "Failed to register student";
        throw new Error(errorMessage);
      }

      toast.success(result.message || "Student registered successfully");

      // Invalidate sections cache and refresh
      apiCache.delete("allSections");
      apiCache.delete("exams");

      // Refresh enrollments and sections in parallel
      await Promise.all([
        fetchStudentEnrollments(selectedStudent),
        fetchSections(false), // Skip cache
      ]);

      // Reset section selection
      setSelectedSection("");
    } catch (error) {
      console.error("Error registering student:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to register student";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedStudent,
    selectedSection,
    fetchStudentEnrollments,
    fetchSections,
    getAuthHeaderCached,
  ]);

  const handleDropEnrollment = useCallback(
    async (enrollment: Enrollment) => {
      setIsDroppingEnrollment(enrollment.id);

      try {
        const authHeader = await getAuthHeaderCached();
        const response = await fetch(
          `/api/registrar/student-enrollments?enrollment_id=${enrollment.id}`,
          {
            method: "DELETE",
            headers: authHeader ? { Authorization: authHeader } : {},
          }
        );

        const result = await response.json();

        if (!response.ok) {
          const errorMessage =
            result.error || result.message || "Failed to drop enrollment";
          throw new Error(errorMessage);
        }

        toast.success(result.message || "Enrollment dropped successfully");

        // Invalidate sections cache and refresh
        apiCache.delete("allSections");
        apiCache.delete("exams");

        // Refresh enrollments and sections in parallel
        await Promise.all([
          selectedStudent
            ? fetchStudentEnrollments(selectedStudent)
            : Promise.resolve(),
          fetchSections(false), // Skip cache
        ]);
      } catch (error) {
        console.error("Error dropping enrollment:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to drop enrollment";
        toast.error(errorMessage);
      } finally {
        setIsDroppingEnrollment(null);
        setEnrollmentToDelete(null);
      }
    },
    [
      selectedStudent,
      fetchStudentEnrollments,
      fetchSections,
      getAuthHeaderCached,
    ]
  );

  const confirmDropEnrollment = useCallback((enrollment: Enrollment) => {
    setEnrollmentToDelete(enrollment);
  }, []);

  const selectedStudentData = useMemo(
    () => students.find((s) => s.user_id === selectedStudent),
    [students, selectedStudent]
  );

  // Compute available sections with conflict info
  // - Exclude sections the student is already registered in
  // - Check for schedule conflicts (time AND day overlap)
  // - Check for exam conflicts
  const sections = useMemo(() => {
    if (!selectedStudent) {
      // If no student selected, show all sections
      return allSections.map((section) => ({
        ...section,
        conflict: undefined,
      }));
    }

    // Get enrolled section IDs and course codes
    const enrolledSectionIds = new Set(enrollments.map((e) => e.section_id));
    const enrolledCourseCodes = enrollments
      .map((e) => e.section?.course_code)
      .filter(Boolean) as string[];

    // Get enrolled sections with meeting patterns
    const enrolledSections = enrollments
      .filter((e) => e.section)
      .map((e) => ({
        meeting_pattern: e.section?.meeting_pattern,
        course_code: e.section?.course_code || "",
        section_no: e.section?.section_no || "",
      }));

    return allSections
      .filter((section) => !enrolledSectionIds.has(section.id)) // Exclude already registered sections
      .map((section) => {
        // Check for schedule conflicts
        let conflict: ConflictInfo | undefined;

        for (const enrolledSection of enrolledSections) {
          const scheduleConflict = checkScheduleConflict(
            {
              meeting_pattern: section.meeting_pattern,
              course_code: section.course_code,
              section_no: section.section_no,
            },
            enrolledSection
          );
          if (scheduleConflict) {
            conflict = scheduleConflict;
            break;
          }
        }

        // Check for exam conflicts if no schedule conflict
        if (!conflict) {
          const examConflict = checkExamConflict(
            section.course_code,
            enrolledCourseCodes,
            exams
          );
          if (examConflict) {
            conflict = examConflict;
          }
        }

        return {
          ...section,
          conflict,
        };
      });
  }, [allSections, enrollments, exams, selectedStudent]);

  const selectedSectionData = useMemo(
    () => sections.find((s) => s.id === selectedSection),
    [sections, selectedSection]
  );

  // Filter students by search term (name, email, student number)
  const filteredStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          studentSearch === "" ||
          student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
          student.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
          (student.student_number &&
            student.student_number.includes(studentSearch)) ||
          student.user_id.toLowerCase().includes(studentSearch.toLowerCase())
      ),
    [students, studentSearch]
  );

  // Handle student number search - if exact match found, auto-select
  useEffect(() => {
    if (studentSearch.length === 10 && /^\d{10}$/.test(studentSearch)) {
      const matchedStudent = students.find(
        (s) => s.student_number === studentSearch
      );
      if (matchedStudent) {
        setSelectedStudent(matchedStudent.user_id);
        setStudentSearch(""); // Clear search after selection
      }
    }
  }, [studentSearch, students]);

  const filteredSections = useMemo(
    () =>
      sections.filter(
        (section) =>
          sectionSearch === "" ||
          section.course_code
            .toLowerCase()
            .includes(sectionSearch.toLowerCase()) ||
          section.course?.title
            ?.toLowerCase()
            .includes(sectionSearch.toLowerCase()) ||
          section.section_no.toLowerCase().includes(sectionSearch.toLowerCase())
      ),
    [sections, sectionSearch]
  );

  // Show loading state during initial load
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Manual Student Registration
          </CardTitle>
          <CardDescription>
            Register students in sections with optional validation bypass
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Student Selection with Search */}
          <div className="space-y-2">
            <Label>Student (Search by name, email, or student number)</Label>
            <Input
              placeholder="Type student number (10 digits) or search by name/email..."
              value={studentSearch}
              onChange={(e) => {
                setStudentSearch(e.target.value);
                // If typing student number, don't change selected student yet
                if (
                  e.target.value.length !== 10 ||
                  !/^\d{10}$/.test(e.target.value)
                ) {
                  setSelectedStudent("");
                }
              }}
              className="mb-2"
            />
            <Select
              value={selectedStudent}
              onValueChange={(value) => {
                setSelectedStudent(value);
                setStudentSearch(""); // Clear search when selecting from dropdown
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a student from list" />
              </SelectTrigger>
              <SelectContent>
                {filteredStudents.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    {studentSearch
                      ? "No students found"
                      : "No students available"}
                  </div>
                ) : (
                  filteredStudents.slice(0, 50).map((student) => (
                    <SelectItem key={student.user_id} value={student.user_id}>
                      {student.student_number
                        ? `[${student.student_number}] `
                        : ""}
                      {student.name} ({student.email}) - Level{" "}
                      {student.level || "N/A"}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedStudentData && (
              <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                Selected:{" "}
                {selectedStudentData.student_number
                  ? `Student #${selectedStudentData.student_number} - `
                  : ""}
                {selectedStudentData.name} ({selectedStudentData.email})
              </div>
            )}
          </div>

          {/* Section Selection */}
          <div className="space-y-2">
            <Label>Section (with available capacity)</Label>
            <Input
              placeholder="Search sections by course code or title..."
              value={sectionSearch}
              onChange={(e) => setSectionSearch(e.target.value)}
              className="mb-2"
            />
            {sections.length === 0 ? (
              <div className="p-4 border rounded-lg bg-muted text-center text-sm text-muted-foreground">
                {selectedStudent
                  ? "No available sections found. The student may already be registered in all available sections, or all sections are at full capacity."
                  : "Please select a student first to see available sections (sections the student is already enrolled in will be hidden)."}
              </div>
            ) : (
              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
                disabled={!selectedStudent}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSections.slice(0, 50).map((section) => (
                    <SelectItem
                      key={section.id}
                      value={section.id}
                      className={
                        section.conflict
                          ? "text-amber-600 dark:text-amber-400"
                          : ""
                      }
                    >
                      {section.conflict && "⚠️ "}
                      {section.course_code} - {section.section_no} |{" "}
                      {section.course?.title || "Unknown Course"} |{" "}
                      {section.instructor?.name || "No instructor"} |{" "}
                      {section.current_enrollment}/{section.capacity} enrolled
                      {section.conflict &&
                        ` | ${
                          section.conflict.type === "schedule"
                            ? "Schedule"
                            : "Exam"
                        } conflict`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Selected Section Info */}
          {selectedSectionData && (
            <div
              className={`p-4 border rounded-lg space-y-2 ${
                selectedSectionData.conflict
                  ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                  : "bg-muted"
              }`}
            >
              <div className="font-medium">
                {selectedSectionData.course_code} - Section{" "}
                {selectedSectionData.section_no}
              </div>
              <div className="text-sm">
                {selectedSectionData.course?.title || "Unknown Course"} •{" "}
                {selectedSectionData.course?.credits || 0} credits
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">
                  {selectedSectionData.course?.is_elective
                    ? "Elective"
                    : "Required"}
                </Badge>
                <Badge variant="outline">
                  Level {selectedSectionData.course?.level || "N/A"}
                </Badge>
                <Badge
                  variant={
                    selectedSectionData.state === "released"
                      ? "default"
                      : "secondary"
                  }
                >
                  {selectedSectionData.state}
                </Badge>
                <Badge
                  variant={
                    (selectedSectionData.current_enrollment || 0) >=
                    (selectedSectionData.capacity || 0)
                      ? "destructive"
                      : "outline"
                  }
                >
                  {selectedSectionData.current_enrollment}/
                  {selectedSectionData.capacity} enrolled
                </Badge>
              </div>

              {/* Conflict Warning */}
              {selectedSectionData.conflict && (
                <div className="mt-3 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-md border border-amber-300 dark:border-amber-700">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800 dark:text-amber-200">
                        {selectedSectionData.conflict.type === "schedule"
                          ? "Schedule Conflict Detected"
                          : "Exam Conflict Detected"}
                      </p>
                      <p className="text-amber-700 dark:text-amber-300 mt-1">
                        This section conflicts with{" "}
                        <span className="font-semibold">
                          {selectedSectionData.conflict.conflictingCourseCode}
                          {selectedSectionData.conflict.conflictingSectionNo &&
                            ` - ${selectedSectionData.conflict.conflictingSectionNo}`}
                        </span>{" "}
                        that the student is already enrolled in.
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                        💡 To register in this section, drop the conflicting
                        enrollment first.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Manual Registration
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  As a registrar, you can manually register students in any
                  section with available capacity. This bypasses normal
                  registration validation rules.
                </p>
              </div>
            </div>
          </div>

          {/* Register Button */}
          <Button
            onClick={handleRegister}
            disabled={!selectedStudent || !selectedSection || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Register Student"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Current Enrollments */}
      {selectedStudent && (
        <Card>
          <CardHeader>
            <CardTitle>Current Enrollments</CardTitle>
            <CardDescription>
              {selectedStudentData?.name}&apos;s active enrollments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {enrollmentsLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading enrollments...
              </div>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No enrollments yet
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Enrolled At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {enrollment.section?.course_code || "N/A"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {enrollment.section?.course?.title ||
                                "Unknown Course"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {enrollment.section?.section_no || "N/A"}
                        </TableCell>
                        <TableCell>
                          {enrollment.section?.course?.credits || 0}
                        </TableCell>
                        <TableCell>
                          {enrollment.enrolled_at
                            ? new Date(
                                enrollment.enrolled_at
                              ).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => confirmDropEnrollment(enrollment)}
                            disabled={isDroppingEnrollment === enrollment.id}
                          >
                            {isDroppingEnrollment === enrollment.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog for Dropping Enrollment */}
      <AlertDialog
        open={enrollmentToDelete !== null}
        onOpenChange={(open) => !open && setEnrollmentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Drop Enrollment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to drop {selectedStudentData?.name} from{" "}
              <strong>{enrollmentToDelete?.section?.course_code}</strong> -
              Section {enrollmentToDelete?.section?.section_no}?
              <br />
              <br />
              This action will mark the enrollment as dropped.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDroppingEnrollment !== null}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                enrollmentToDelete && handleDropEnrollment(enrollmentToDelete)
              }
              disabled={isDroppingEnrollment !== null}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDroppingEnrollment !== null ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Dropping...
                </>
              ) : (
                "Drop Enrollment"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
