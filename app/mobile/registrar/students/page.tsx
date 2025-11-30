/**
 * Student Lookup Page
 * 
 * Allows registrar to search for students and view their academic progress.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/mobile/lib/stores/auth.store";
import { studentsRepository, type Student } from "@/app/mobile/lib/repositories/students.repository";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, ArrowLeft, GraduationCap, BookOpen } from "lucide-react";
import { toast } from "sonner";
import type { AcademicPlanCourse } from "@/app/mobile/lib/api/types";

export default function StudentLookupPage() {
    const router = useRouter();
    const { user, isAuthenticated, checkAuth } = useAuthStore();
    const [query, setQuery] = useState("");
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [academicPlan, setAcademicPlan] = useState<AcademicPlanCourse[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingPlan, setLoadingPlan] = useState(false);

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
    }, [isAuthenticated, user, router]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setStudents([]);
        setSelectedStudent(null);
        try {
            const data = await studentsRepository.searchStudents(query);
            setStudents(data);
            if (data.length === 0) {
                toast.info("No students found");
            }
        } catch (err) {
            toast.error("Failed to search students");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectStudent = async (student: Student) => {
        setSelectedStudent(student);
        setLoadingPlan(true);
        try {
            const plan = await studentsRepository.getStudentAcademicPlan(student.id);
            setAcademicPlan(plan);
        } catch (err) {
            toast.error("Failed to load academic plan");
            console.error(err);
        } finally {
            setLoadingPlan(false);
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
                                onClick={() => {
                                    if (selectedStudent) {
                                        setSelectedStudent(null);
                                    } else {
                                        router.push("/mobile/registrar");
                                    }
                                }}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <CardTitle>Student Lookup</CardTitle>
                                <CardDescription>
                                    Search for students by name or ID
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {!selectedStudent ? (
                    <>
                        {/* Search Form */}
                        <Card>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSearch} className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search by name or ID..."
                                            className="pl-9"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Results */}
                        <div className="space-y-2">
                            {students.map((student) => (
                                <Card
                                    key={student.id}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleSelectStudent(student)}
                                >
                                    <CardContent className="p-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{student.name}</p>
                                            <p className="text-sm text-muted-foreground">{student.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline">{student.student_id_number || "No ID"}</Badge>
                                            {student.level && (
                                                <p className="text-xs text-muted-foreground mt-1">Level {student.level}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="space-y-4">
                        {/* Student Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    {selectedStudent.name}
                                </CardTitle>
                                <CardDescription>
                                    {selectedStudent.email} • ID: {selectedStudent.student_id_number}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Level:</span> {selectedStudent.level || "N/A"}
                                    </div>
                                    <div>
                                        <span className="font-medium">Program:</span> {selectedStudent.program || "N/A"}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Academic Plan */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Academic Progress
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingPlan ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : academicPlan.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-4">
                                        No academic plan found.
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {academicPlan.map((course) => (
                                            <div
                                                key={course.code}
                                                className="flex justify-between items-center p-2 border rounded-md"
                                            >
                                                <div>
                                                    <p className="font-medium">{course.code}</p>
                                                    <p className="text-sm text-muted-foreground">{course.name}</p>
                                                </div>
                                                <div className="text-right">
                                                    <Badge variant={course.course_type === "required" ? "default" : "secondary"}>
                                                        {course.course_type}
                                                    </Badge>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {course.credits} cr
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
