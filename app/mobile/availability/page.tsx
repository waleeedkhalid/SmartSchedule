/**
 * Faculty Availability Page
 * 
 * Allows faculty to set their available, preferred, and unavailable time slots using a grid layout.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/mobile/lib/stores/auth.store";
import { availabilityRepository, type AvailabilityPreference, type TimeSlot } from "@/app/mobile/lib/repositories/availability.repository";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Loader2, Save, Clock, Info, RotateCcw, Trash2, ArrowLeft } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const TIME_SLOTS = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
];

type SelectionMode = 'preferred' | 'unavailable' | null;

export default function AvailabilityPage() {
    const router = useRouter();
    const { user, isAuthenticated, checkAuth } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Data state
    const [availability, setAvailability] = useState<AvailabilityPreference>({
        available_slots: [],
        preferred_slots: [],
        unavailable_slots: [],
        notes: ""
    });

    // UI state
    const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);
    const [hasChanges, setHasChanges] = useState(false);

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

        if (user?.role !== "faculty") {
            router.push("/mobile/schedule");
            return;
        }

        loadAvailability();
    }, [isAuthenticated, user, router]);

    const loadAvailability = async () => {
        setLoading(true);
        try {
            const data = await availabilityRepository.getAvailability();
            setAvailability({
                ...data,
                available_slots: data.available_slots || [],
                preferred_slots: data.preferred_slots || [],
                unavailable_slots: data.unavailable_slots || [],
                notes: data.notes || ""
            });
            setHasChanges(false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Helper to check if a slot matches
    const isSlotInList = (list: TimeSlot[], day: string, time: string) => {
        return list.some(slot => slot.day === day && slot.start_time === time);
    };

    const getNextHour = (time: string): string => {
        const [hours] = time.split(':').map(Number);
        const nextHour = hours + 1;
        return `${String(nextHour).padStart(2, '0')}:00`;
    };

    const toggleSlot = (day: string, time: string) => {
        if (!selectionMode) return;

        setHasChanges(true);
        const endTime = getNextHour(time);
        const newSlot: TimeSlot = { day, start_time: time, end_time: endTime };

        setAvailability(prev => {
            let newPreferred = [...prev.preferred_slots];
            let newUnavailable = [...prev.unavailable_slots];

            if (selectionMode === 'preferred') {
                // Remove from unavailable if present
                newUnavailable = newUnavailable.filter(s => !(s.day === day && s.start_time === time));

                // Toggle preferred
                if (isSlotInList(newPreferred, day, time)) {
                    newPreferred = newPreferred.filter(s => !(s.day === day && s.start_time === time));
                } else {
                    newPreferred.push(newSlot);
                }
            } else if (selectionMode === 'unavailable') {
                // Remove from preferred if present
                newPreferred = newPreferred.filter(s => !(s.day === day && s.start_time === time));

                // Toggle unavailable
                if (isSlotInList(newUnavailable, day, time)) {
                    newUnavailable = newUnavailable.filter(s => !(s.day === day && s.start_time === time));
                } else {
                    newUnavailable.push(newSlot);
                }
            }

            return {
                ...prev,
                preferred_slots: newPreferred,
                unavailable_slots: newUnavailable
            };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await availabilityRepository.updateAvailability(availability);
            toast.success("Availability saved successfully");
            setHasChanges(false);
        } catch (err) {
            toast.error("Failed to save availability");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleClearAll = () => {
        if (confirm("Are you sure you want to clear all selections?")) {
            setAvailability(prev => ({
                ...prev,
                preferred_slots: [],
                unavailable_slots: []
            }));
            setHasChanges(true);
        }
    };

    if (!isAuthenticated || !user || user.role !== "faculty") {
        return null;
    }

    return (
        <div className="min-h-screen p-4 pb-32">
            <div className="max-w-4xl mx-auto space-y-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push("/mobile/schedule")}
                                className="mr-2"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="flex-1">
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Availability Preferences
                                </CardTitle>
                                <CardDescription>
                                    Tap cells to mark them as preferred or unavailable.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        {/* Mode Selection */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col gap-3">
                                    <div className="flex gap-2">
                                        <Button
                                            variant={selectionMode === 'preferred' ? 'default' : 'outline'}
                                            onClick={() => setSelectionMode('preferred')}
                                            className={`flex-1 ${selectionMode === 'preferred' ? 'bg-green-600 hover:bg-green-700' : 'border-green-600 text-green-600 hover:bg-green-50'}`}
                                        >
                                            Preferred
                                        </Button>
                                        <Button
                                            variant={selectionMode === 'unavailable' ? 'default' : 'outline'}
                                            onClick={() => setSelectionMode('unavailable')}
                                            className={`flex-1 ${selectionMode === 'unavailable' ? 'bg-red-600 hover:bg-red-700' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
                                        >
                                            Unavailable
                                        </Button>
                                    </div>
                                    <Alert className="bg-muted/50">
                                        <Info className="h-4 w-4" />
                                        <AlertDescription className="text-xs">
                                            {selectionMode
                                                ? `Tap grid cells to mark as ${selectionMode}. Tap again to clear.`
                                                : "Select a mode above to start editing."}
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Grid */}
                        <Card className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <div className="inline-block min-w-full">
                                        <div className="grid" style={{
                                            gridTemplateColumns: `60px repeat(${DAYS.length}, minmax(80px, 1fr))`
                                        }}>
                                            {/* Header Row */}
                                            <div className="p-2 bg-muted/30 border-b border-r sticky left-0 z-10"></div>
                                            {DAYS.map(day => (
                                                <div key={day} className="p-2 font-semibold text-center text-sm border-b bg-muted/30 min-w-[80px]">
                                                    {day.slice(0, 3)}
                                                </div>
                                            ))}

                                            {/* Time Rows */}
                                            {TIME_SLOTS.map(time => (
                                                <div key={time} className="contents group">
                                                    <div className="p-2 text-xs font-medium border-r border-b bg-muted/10 sticky left-0 z-10 flex items-center justify-center">
                                                        {time}
                                                    </div>
                                                    {DAYS.map(day => {
                                                        const isPref = isSlotInList(availability.preferred_slots, day, time);
                                                        const isUnav = isSlotInList(availability.unavailable_slots, day, time);

                                                        return (
                                                            <div
                                                                key={`${day}-${time}`}
                                                                className={`
                                  h-12 border-b border-r cursor-pointer transition-colors
                                  ${isPref ? 'bg-green-200 dark:bg-green-900/60' : ''}
                                  ${isUnav ? 'bg-red-200 dark:bg-red-900/60' : ''}
                                  ${!isPref && !isUnav ? 'active:bg-muted' : ''}
                                `}
                                                                onClick={() => toggleSlot(day, time)}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                    <span className="text-2xl font-bold text-green-600">
                                        {availability.preferred_slots.length}
                                    </span>
                                    <span className="text-xs text-muted-foreground">Preferred Hours</span>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                    <span className="text-2xl font-bold text-red-600">
                                        {availability.unavailable_slots.length}
                                    </span>
                                    <span className="text-xs text-muted-foreground">Unavailable Hours</span>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Notes */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Additional Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    placeholder="Any specific constraints..."
                                    value={availability.notes}
                                    onChange={(e) => {
                                        setAvailability(prev => ({ ...prev, notes: e.target.value }));
                                        setHasChanges(true);
                                    }}
                                    className="min-h-[80px]"
                                />
                            </CardContent>
                        </Card>

                        {/* Actions Footer */}
                        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[90vw]">
                            <div className="flex gap-2 p-2 bg-background/80 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl items-center ring-1 ring-black/5 dark:ring-white/10">
                                <Button
                                    className="min-w-[100px] shadow-sm font-semibold"
                                    onClick={handleSave}
                                    disabled={!hasChanges || saving}
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save
                                        </>
                                    )}
                                </Button>

                                <div className="h-8 w-px bg-border/50 mx-1" />

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={loadAvailability}
                                    disabled={!hasChanges || saving}
                                    className="text-muted-foreground hover:text-foreground px-3"
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Reset
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearAll}
                                    disabled={saving}
                                    className="text-destructive/80 hover:text-destructive hover:bg-destructive/10 px-3"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
