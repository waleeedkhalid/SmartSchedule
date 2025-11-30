/**
 * Override Registration Page
 * 
 * Allows registrar to register students into sections, potentially overriding rules.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/mobile/lib/stores/auth.store";
import { studentsRepository, type Student } from "@/app/mobile/lib/repositories/students.repository";
import { coursesRepository } from "@/app/mobile/lib/repositories/courses.repository";
import { sectionsRepository } from "@/app/mobile/lib/repositories/sections.repository";
import { enrollmentsRepository } from "@/app/mobile/lib/repositories/enrollments.repository";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Search, ArrowLeft, User, ChevronDown, ChevronUp } from "lucide-react";
import type { Course, Section } from "@/app/mobile/lib/api/types";

export default function OverrideRegistrationPage() {
    const router = useRouter();
    const { user, isAuthenticated, checkAuth } = useAuthStore();

    // Student Search State
    const [studentQuery, setStudentQuery] = useState("");
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Course/Section State
    const [courses, setCourses] = useState<Course[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
    const [sections, setSections] = useState<Section[]>([]);
    const [loadingSections, setLoadingSections] = useState(false);
    const [registeringSection, setRegisteringSection] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            checkAuth();
        }
    }, [isAuthenticated, checkAuth]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/mobile/login");
            return;
        }

        if (user?.role !== "registrar") {
            router.push("/mobile/schedule");
            return;
        }

        loadCourses();
    }, [isAuthenticated, user, router]);

    const loadCourses = async () => {
        setLoadingCourses(true);
        try {
            const data = await coursesRepository.getCourses();
            setCourses(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load courses");
        } finally {
            setLoadingCourses(false);
        }
    };

    const handleSearchStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentQuery.trim()) return;

        setLoadingStudents(true);
        setStudents([]);
        setSelectedStudent(null);
        try {
            const data = await studentsRepository.searchStudents(studentQuery);
            setStudents(data);
            if (data.length === 0) {
                toast.info("No students found");
            }
        } catch (err) {
            toast.error("Failed to search students");
            console.error(err);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleExpandCourse = async (courseCode: string) => {
        if (expandedCourse === courseCode) {
            setExpandedCourse(null);
            setSections([]);
            return;
        }

        setExpandedCourse(courseCode);
        setLoadingSections(true);
        try {
            // Registrar sees all sections, even draft ones? Maybe just released for now.
            const data = await sectionsRepository.getSections({ courseCode });
            setSections(data);
        } catch (err) {
            toast.error("Failed to load sections");
            console.error(err);
        } finally {
            setLoadingSections(false);
        }
    };

    const handleRegister = async (sectionId: string) => {
        if (!selectedStudent) {
            toast.error("Please select a student first");
            return;
        }

        setRegisteringSection(sectionId);
        try {
            await enrollmentsRepository.createEnrollment({
                section_id: sectionId,
                student_id: selectedStudent.id
            });
            toast.success(`Successfully registered ${selectedStudent.name}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to register");
        } finally {
            setRegisteringSection(null);
        }
    };

    if (!isAuthenticated || !user || user.role !== "registrar") {
        return null;
    }

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-4xl mx-auto space-y-4">
                {/* Header */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push("/mobile/registrar")}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <CardTitle>Override Registration</CardTitle>
                                <CardDescription>
                                    Register students into sections
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Step 1: Select Student */}
                <Card className={selectedStudent ? "border-green-500" : ""}>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {selectedStudent ? "Selected Student" : "Step 1: Select Student"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedStudent ? (
                            <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                                <div>
                                    <p className="font-medium">{selectedStudent.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedStudent.email}</p>
                                    <p className="text-xs text-muted-foreground">ID: {selectedStudent.student_id_number}</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setSelectedStudent(null)}>
                                    Change
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <form onSubmit={handleSearchStudent} className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search student by name or ID..."
                                            className="pl-9"
                                            value={studentQuery}
                                            onChange={(e) => setStudentQuery(e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" disabled={loadingStudents}>
                                        {loadingStudents ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                                    </Button>
                                </form>

                                {students.length > 0 && (
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                        {students.map((student) => (
                                            <div
                                                key={student.id}
                                                className="flex justify-between items-center p-2 border rounded-md hover:bg-muted cursor-pointer"
                                                onClick={() => setSelectedStudent(student)}
                                            >
                                                <div>
                                                    <p className="font-medium text-sm">{student.name}</p>
                                                    <p className="text-xs text-muted-foreground">{student.email}</p>
                                                </div>
                                                <Badge variant="outline">{student.student_id_number}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Step 2: Select Course & Section */}
                {selectedStudent && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="font-semibold text-lg">Step 2: Select Section</h3>

                        {loadingCourses ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {courses.map((course) => (
                                    <Card key={course.code} className="overflow-hidden">
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-lg">{course.code}</CardTitle>
                                                    <CardDescription className="font-medium text-foreground">
                                                        {course.name}
                                                    </CardDescription>
                                                </div>
                                                <Badge variant={course.course_type === "required" ? "default" : "secondary"}>
                                                    {course.course_type}
                                                </Badge>
                                            </div>
                                        </CardHeader>

                                        <CardFooter className="bg-muted/30 p-3">
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-between"
                                                onClick={() => handleExpandCourse(course.code)}
                                            >
                                                {expandedCourse === course.code ? "Hide Sections" : "View Sections"}
                                                {expandedCourse === course.code ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </CardFooter>

                                        {expandedCourse === course.code && (
                                            <div className="border-t bg-muted/10 p-3 space-y-3 animate-in slide-in-from-top-2">
                                                {loadingSections ? (
                                                    <div className="flex justify-center py-4">
                                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                                    </div>
                                                ) : sections.length === 0 ? (
                                                    <p className="text-center text-sm text-muted-foreground py-2">
                                                        No sections available.
                                                    </p>
                                                ) : (
                                                    sections.map((section) => (
                                                        <div
                                                            key={section.id}
                                                            className="bg-card border rounded-lg p-3 space-y-2"
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <p className="font-semibold text-sm">
                                                                        Section {section.section_no}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {section.instructor?.name || "TBA"}
                                                                    </p>
                                                                </div>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {section.current_enrollment} / {section.capacity}
                                                                </Badge>
                                                            </div>

                                                            <div className="text-xs text-muted-foreground">
                                                                <p>
                                                                    {section.meeting_pattern?.days?.join(", ") || "TBA"} • {" "}
                                                                    {section.meeting_pattern?.start_time || section.meeting_pattern?.start || "TBA"}
                                                                </p>
                                                                <p>{section.room?.code || "Room TBA"}</p>
                                                            </div>

                                                            <Button
                                                                size="sm"
                                                                className="w-full mt-2"
                                                                onClick={() => handleRegister(section.id)}
                                                                disabled={registeringSection === section.id}
                                                                variant={section.current_enrollment >= section.capacity ? "destructive" : "default"}
                                                            >
                                                                {registeringSection === section.id ? (
                                                                    <>
                                                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                                        Registering...
                                                                    </>
                                                                ) : section.current_enrollment >= section.capacity ? (
                                                                    "Override Full Section"
                                                                ) : (
                                                                    "Register Student"
                                                                )}
                                                            </Button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
