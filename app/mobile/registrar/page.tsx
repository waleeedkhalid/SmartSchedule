/**
 * Registrar Dashboard
 * 
 * Central hub for registrar actions.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/mobile/lib/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Settings, LogOut } from "lucide-react";

export default function RegistrarPage() {
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

        if (user?.role !== "registrar") {
            router.push("/mobile/schedule");
            return;
        }
    }, [isAuthenticated, user, router]);

    const handleLogout = async () => {
        await logout();
        router.push("/mobile/login");
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
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Registrar Dashboard</CardTitle>
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
                        onClick={() => router.push("/mobile/registrar/students")}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-500" />
                                Student Lookup
                            </CardTitle>
                            <CardDescription>
                                View academic progress and history
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => router.push("/mobile/registrar/registration")}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-green-500" />
                                Override Registration
                            </CardTitle>
                            <CardDescription>
                                Register students into full sections
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors opacity-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-gray-500" />
                                System Settings
                            </CardTitle>
                            <CardDescription>
                                Manage academic terms (Coming Soon)
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </div>
    );
}
