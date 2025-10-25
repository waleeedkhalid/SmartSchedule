"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Clock, Calendar, AlertCircle, Loader2, CheckSquare, Square } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu"] as const;
const daysFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"] as const;
const timeSlots = [
  { label: "8 AM", value: "08:00" },
  { label: "9 AM", value: "09:00" },
  { label: "10 AM", value: "10:00" },
  { label: "11 AM", value: "11:00" },
  { label: "12 PM", value: "12:00" },
  { label: "1 PM", value: "13:00" },
  { label: "2 PM", value: "14:00" },
  { label: "3 PM", value: "15:00" },
  { label: "4 PM", value: "16:00" },
  { label: "5 PM", value: "17:00" },
  { label: "6 PM", value: "18:00" },
  { label: "7 PM", value: "19:00" },
  { label: "8 PM", value: "20:00" },
] as const;

type SlotKey = `${(typeof daysFull)[number]}-${string}`;

interface FacultyAvailabilityProps {
  canSubmit?: boolean;
  lockReason?: string;
}

export function FacultyAvailability({ 
  canSubmit = true, 
  lockReason 
}: FacultyAvailabilityProps) {
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Fetch existing availability on mount
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("/api/faculty/availability");
        const result = await response.json();

        if (result.success && result.data) {
          setAvailability(result.data.availability_data || {});
          setLastSaved(result.data.lastUpdated);
        }
      } catch (err) {
        console.error("Error fetching availability:", err);
        setError("Failed to load availability data");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  const toggle = (key: SlotKey) => {
    if (!canSubmit) return;
    
    setAvailability((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaved(false);
  };

  const save = async () => {
    if (!canSubmit) return;
    
    try {
      setSaving(true);
      setError(null);

      const response = await fetch("/api/faculty/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ availability }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save availability");
      }

      setSaved(true);
      setLastSaved(result.data.lastUpdated);
      
      // Auto-hide saved status after 3 seconds
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving availability:", err);
      setError(err instanceof Error ? err.message : "Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  const clearAll = () => {
    if (!canSubmit) return;
    setAvailability({});
    setSaved(false);
  };

  const selectAll = () => {
    if (!canSubmit) return;
    const allSlots: Record<string, boolean> = {};
    daysFull.forEach((day) => {
      timeSlots.forEach((slot) => {
        allSlots[`${day}-${slot.value}`] = true;
      });
    });
    setAvailability(allSlots);
    setSaved(false);
  };

  const toggleDay = (dayIndex: number) => {
    if (!canSubmit) return;
    const day = daysFull[dayIndex];
    const allDaySelected = timeSlots.every((slot) => availability[`${day}-${slot.value}`]);
    
    const newAvailability = { ...availability };
    timeSlots.forEach((slot) => {
      newAvailability[`${day}-${slot.value}`] = !allDaySelected;
    });
    setAvailability(newAvailability);
    setSaved(false);
  };

  const toggleTimeSlot = (slotValue: string) => {
    if (!canSubmit) return;
    const allDaysSelected = daysFull.every((day) => availability[`${day}-${slotValue}`]);
    
    const newAvailability = { ...availability };
    daysFull.forEach((day) => {
      newAvailability[`${day}-${slotValue}`] = !allDaysSelected;
    });
    setAvailability(newAvailability);
    setSaved(false);
  };

  const totalAvailable = Object.values(availability).filter(Boolean).length;
  const totalSlots = daysFull.length * timeSlots.length;

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading availability data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Weekly Availability</CardTitle>
              </div>
              <CardDescription className="mt-1.5">
                Click on time slots to mark when you&apos;re available to teach
              </CardDescription>
            </div>
            {lastSaved && (
              <Badge variant="outline" className="hidden sm:flex">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(lastSaved).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Phase Lock Alert */}
          {!canSubmit && lockReason && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{lockReason}</AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">
                {totalAvailable} / {totalSlots} slots
              </span>
              <span className="text-muted-foreground">selected</span>
            </div>

            <div className="flex items-center gap-2">
              {saved && (
                <Badge className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Saved
                </Badge>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAll}
                disabled={!canSubmit || totalAvailable === 0}
              >
                Clear All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={selectAll}
                disabled={!canSubmit}
              >
                Select All
              </Button>
            </div>
          </div>

          {/* Simplified Grid */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Column Headers with Day Toggle */}
              <div className="grid grid-cols-[auto_repeat(5,1fr)] gap-2 mb-3">
                <div className="w-16"></div>
                {days.map((day, idx) => {
                  const allSelected = timeSlots.every((slot) => 
                    availability[`${daysFull[idx]}-${slot.value}`]
                  );
                  return (
                    <Tooltip key={day}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => toggleDay(idx)}
                          disabled={!canSubmit}
                          className={`
                            flex items-center justify-center gap-1 p-2 rounded-md border
                            transition-colors text-sm font-medium
                            ${canSubmit ? 'hover:bg-muted cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                          `}
                        >
                          {allSelected ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span>{day}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {allSelected ? 'Deselect' : 'Select'} all {daysFull[idx]}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>

              {/* Time Slots Grid */}
              {timeSlots.map((slot) => {
                const allSelected = daysFull.every((day) => 
                  availability[`${day}-${slot.value}`]
                );
                return (
                  <div key={slot.value} className="grid grid-cols-[auto_repeat(5,1fr)] gap-2 mb-2">
                    {/* Time Label with Row Toggle */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => toggleTimeSlot(slot.value)}
                          disabled={!canSubmit}
                          className={`
                            flex items-center justify-between gap-1 px-2 py-2 rounded-md
                            text-sm font-medium border w-16
                            ${canSubmit ? 'hover:bg-muted cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                          `}
                        >
                          <span className="text-xs">{slot.label}</span>
                          {allSelected ? (
                            <CheckSquare className="h-3 w-3 text-primary" />
                          ) : (
                            <Square className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {allSelected ? 'Deselect' : 'Select'} {slot.label} all days
                      </TooltipContent>
                    </Tooltip>

                    {/* Day Slots */}
                    {daysFull.map((day) => {
                      const key: SlotKey = `${day}-${slot.value}`;
                      const isAvailable = availability[key];

                      return (
                        <button
                          key={key}
                          onClick={() => toggle(key)}
                          disabled={!canSubmit}
                          className={`
                            h-10 rounded-md border-2 transition-all duration-150
                            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
                            ${
                              isAvailable
                                ? "bg-green-500/90 hover:bg-green-600 border-green-600 text-white"
                                : "bg-background hover:bg-muted border-border"
                            }
                            ${!canSubmit ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                          `}
                          aria-label={`${day} ${slot.label} - ${
                            isAvailable ? "Available" : "Unavailable"
                          }`}
                        >
                          {isAvailable && (
                            <CheckCircle2 className="h-4 w-4 mx-auto" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Help Text */}
          <div className="text-xs text-muted-foreground space-y-1 pt-2">
            <p className="flex items-center gap-2">
              <span className="font-medium">Tip:</span>
              Click on day names or time labels to select entire rows/columns
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {totalAvailable === 0 && "⚠️ No slots selected"}
            {totalAvailable > 0 && totalAvailable < 10 && "💡 Consider adding more slots"}
            {totalAvailable >= 10 && "✓ Good coverage"}
          </div>

          <Button
            onClick={save}
            disabled={saving || totalAvailable === 0 || !canSubmit}
            className="w-full sm:w-auto"
            size="lg"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Save Availability
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
