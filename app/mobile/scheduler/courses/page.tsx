/**
 * Manage Courses Page
 * 
 * Allows scheduler to manage courses.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/mobile/lib/stores/auth.store";
import { coursesRepository } from "@/app/mobile/lib/repositories/courses.repository";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Plus, Trash2, Edit2 } from "lucide-react";
import type { Course } from "@/app/mobile/lib/api/types";

export default function ManageCoursesPage() {
    const router = useRouter();
    const { user, isAuthenticated, checkAuth } = useAuthStore();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    // New Course State
    const [isAdding, setIsAdding] = useState(false);
    const [newCourse, setNewCourse] = useState<Partial<Course>>({
        code: "",
        name: "",
        credits: 3,
        level: 1,
        course_type: "required"
    });
    const [saving, setSaving] = useState(false);

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

        if (user?.role !== "scheduling") {
            router.push("/mobile/schedule");
            return;
        }

        loadCourses();
    }, [isAuthenticated, user, router]);

    const loadCourses = async () => {
        setLoading(true);
        try {
            const data = await coursesRepository.getCourses();
            setCourses(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    const handleAddCourse = async () => {
        if (!newCourse.code || !newCourse.name) {
            toast.error("Please fill in all required fields");
            return;
        }

        setSaving(true);
        try {
            await coursesRepository.createCourse(newCourse);
            toast.success("Course created successfully");
            setIsAdding(false);
            setNewCourse({
                code: "",
                name: "",
                credits: 3,
                level: 1,
                course_type: "required"
            });
            loadCourses();
        } catch (err) {
            toast.error("Failed to create course");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCourse = async (code: string) => {
        if (!confirm(`Are you sure you want to delete ${code}?`)) return;

        try {
            await coursesRepository.deleteCourse(code);
            toast.success("Course deleted");
            loadCourses();
        } catch (err) {
            toast.error("Failed to delete course");
            console.error(err);
        }
    };

    if (!isAuthenticated || !user || user.role !== "scheduling") {
        return null;
    }

    return (
        <div className="min-h-screen p-4 pb-20">
            <div className="max-w-4xl mx-auto space-y-4">
                {/* Header */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push("/mobile/scheduler")}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <div>
                                    <CardTitle>Manage Courses</CardTitle>
                                    <CardDescription>
                                        {courses.length} courses available
                                    </CardDescription>
                                </div>
                            </div>
                            <Button onClick={() => setIsAdding(!isAdding)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Course
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                {/* Add Course Form */}
                {isAdding && (
                    <Card className="animate-in slide-in-from-top-4">
                        <CardHeader>
                            <CardTitle className="text-base">New Course Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Course Code</Label>
                                    <Input
                                        placeholder="e.g. CS101"
                                        value={newCourse.code}
                                        onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Course Name</Label>
                                    <Input
                                        placeholder="e.g. Introduction to Programming"
                                        value={newCourse.name}
                                        onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Credits</Label>
                                    <Input
                                        type="number"
                                        value={newCourse.credits}
                                        onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Level</Label>
                                    <Input
                                        type="number"
                                        value={newCourse.level}
                                        onChange={(e) => setNewCourse({ ...newCourse, level: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select
                                        value={newCourse.course_type}
                                        onValueChange={(val: "required" | "elective") => setNewCourse({ ...newCourse, course_type: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="required">Required</SelectItem>
                                            <SelectItem value="elective">Elective</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                            <Button onClick={handleAddCourse} disabled={saving}>
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Course"}
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {/* Course List */}
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="space-y-2">
                        {courses.map((course) => (
                            <Card key={course.code}>
                                <CardContent className="p-4 flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold">{course.code}</p>
                                            <Badge variant={course.course_type === "required" ? "default" : "secondary"}>
                                                {course.course_type}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{course.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {course.credits} cr • Level {course.level}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDeleteCourse(course.code)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
