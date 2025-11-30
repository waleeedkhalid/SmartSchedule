/**
 * Generate Schedule Page
 * 
 * Allows scheduler to trigger schedule generation.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/mobile/lib/stores/auth.store";
import { semestersRepository } from "@/app/mobile/lib/repositories/semesters.repository";
import { schedulesRepository } from "@/app/mobile/lib/repositories/schedules.repository";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Play, CheckCircle, AlertTriangle } from "lucide-react";
import type { Semester } from "@/app/mobile/lib/api/types";

export default function GenerateSchedulePage() {
    const router = useRouter();
    const { user, isAuthenticated, checkAuth } = useAuthStore();
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [selectedSemester, setSelectedSemester] = useState<string>("");
    const [loading, setLoading] = useState(true);

    // Generation State
    const [generating, setGenerating] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState<string | null>(null);

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

        loadSemesters();
    }, [isAuthenticated, user, router]);

    const loadSemesters = async () => {
        setLoading(true);
        try {
            const data = await semestersRepository.getSemesters();
            setSemesters(data);
            // Select current or first
            const current = data.find(s => s.is_current);
            if (current) {
                setSelectedSemester(current.id);
            } else if (data.length > 0) {
                setSelectedSemester(data[0].id);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load semesters");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedSemester) {
            toast.error("Please select a semester");
            return;
        }

        setGenerating(true);
        setProgress(0);
        setStatus("starting");
        setMessage("Initializing generation...");

        try {
            const { job_id } = await schedulesRepository.generateSchedule(selectedSemester);
            setJobId(job_id);
            pollStatus(job_id);
        } catch (err) {
            toast.error("Failed to start generation");
            console.error(err);
            setGenerating(false);
            setStatus("failed");
        }
    };

    const pollStatus = async (id: string) => {
        try {
            const data = await schedulesRepository.getGenerationStatus(id);
            setStatus(data.status);
            setProgress(data.progress);
            setMessage(data.message || null);

            if (data.status === "completed" || data.status === "failed") {
                setGenerating(false);
                if (data.status === "completed") {
                    toast.success("Schedule generation completed!");
                } else {
                    toast.error("Schedule generation failed");
                }
            } else {
                // Poll again in 2 seconds
                setTimeout(() => pollStatus(id), 2000);
            }
        } catch (err) {
            console.error("Polling error:", err);
            // Don't stop polling immediately on network error, maybe retry?
            // For now, stop to avoid infinite loop
            setGenerating(false);
            setStatus("error");
            toast.error("Lost connection to generation status");
        }
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
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push("/mobile/scheduler")}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <CardTitle>Generate Schedule</CardTitle>
                                <CardDescription>
                                    Run the scheduling algorithm for a semester
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Academic Term</Label>
                            {loading ? (
                                <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                            ) : (
                                <Select value={selectedSemester} onValueChange={setSelectedSemester} disabled={generating}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select term" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {semesters.map((semester) => (
                                            <SelectItem key={semester.id} value={semester.id}>
                                                {semester.name} {semester.is_current && "(Current)"}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full"
                            onClick={handleGenerate}
                            disabled={generating || loading || !selectedSemester}
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 h-4 w-4" />
                                    Start Generation
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Status */}
                {(status || generating) && (
                    <Card className="animate-in fade-in slide-in-from-bottom-4">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                {status === "completed" ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : status === "failed" || status === "error" ? (
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                ) : (
                                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                )}
                                Generation Status
                            </CardTitle>
                            <CardDescription>
                                {status === "completed" ? "Generation finished successfully" :
                                    status === "failed" ? "Generation failed" :
                                        "Processing..."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Progress value={progress} className="h-2" />
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>{message || "Processing..."}</span>
                                <span>{Math.round(progress)}%</span>
                            </div>

                            {status === "completed" && (
                                <Button
                                    variant="outline"
                                    className="w-full mt-2"
                                    onClick={() => router.push("/mobile/schedule")}
                                >
                                    View Schedule
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
