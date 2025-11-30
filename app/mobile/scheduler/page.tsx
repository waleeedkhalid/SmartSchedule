/**
 * Scheduler Dashboard
 * 
 * Central hub for scheduler actions.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/mobile/lib/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, Settings, LogOut, Play } from "lucide-react";

export default function SchedulerPage() {
    const router = useRouter();
    const { user, isAuthenticated, checkAuth, logout } = useAuthStore();

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
    }, [isAuthenticated, user, router]);

    const handleLogout = async () => {
        await logout();
        router.push("/mobile/login");
    };

    if (!isAuthenticated || !user || user.role !== "scheduling") {
        return null;
    }

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-4xl mx-auto space-y-4">
                {/* Header */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Scheduler Dashboard</CardTitle>
                                <CardDescription>
                                    Welcome, {user.name}
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="icon" onClick={handleLogout}>
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                {/* Actions Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => router.push("/mobile/scheduler/courses")}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-blue-500" />
                                Manage Courses
                            </CardTitle>
                            <CardDescription>
                                Add, edit, or remove courses
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => router.push("/mobile/scheduler/generate")}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Play className="h-5 w-5 text-green-500" />
                                Generate Schedule
                            </CardTitle>
                            <CardDescription>
                                Run the scheduling algorithm
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => router.push("/mobile/elective-stats")}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-purple-500" />
                                Elective Stats
                            </CardTitle>
                            <CardDescription>
                                View elective demand
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors opacity-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-gray-500" />
                                Configuration
                            </CardTitle>
                            <CardDescription>
                                Manage rooms and constraints (Coming Soon)
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </div>
    );
}
