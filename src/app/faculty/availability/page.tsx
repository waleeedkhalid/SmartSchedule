"use client";

import { useState } from "react";
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
import { CheckCircle2, Clock, Calendar } from "lucide-react";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"] as const;
const hours = [
  "08:00 [8AM]",
  "09:00 [9AM]",
  "10:00 [10AM]",
  "11:00 [11AM]",
  "12:00 [12PM]",
  "13:00 [1PM]",
  "14:00 [2PM]",
  "15:00 [3PM]",
  "16:00 [4PM]",
  "17:00 [5PM]",
  "18:00 [6PM]",
  "19:00 [7PM]",
  "20:00 [8PM]",
] as const;

type SlotKey = `${(typeof days)[number]}-${(typeof hours)[number]}`;

export default function FacultyAvailability() {
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggle = (key: SlotKey) => {
    setAvailability((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaved(false);
  };

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      setSaved(true);
      setSaving(false);
      // Auto-hide saved status after 3 seconds
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const clearAll = () => {
    setAvailability({});
    setSaved(false);
  };

  const selectAll = () => {
    const allSlots: Record<string, boolean> = {};
    days.forEach((day) => {
      hours.forEach((hour) => {
        allSlots[`${day}-${hour}`] = true;
      });
    });
    setAvailability(allSlots);
    setSaved(false);
  };

  const totalAvailable = Object.values(availability).filter(Boolean).length;
  const totalSlots = days.length * hours.length;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <CardTitle>Weekly Teaching Schedule</CardTitle>
        </div>
        <CardDescription>
          Select your available time slots for teaching. Click individual slots
          or use bulk actions.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status and Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {totalAvailable} of {totalSlots} slots selected
            </span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              <span className="text-xs text-muted-foreground">Available</span>
              <div className="w-3 h-3 bg-muted border rounded-sm ml-2"></div>
              <span className="text-xs text-muted-foreground">Unavailable</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saved && (
              <Badge
                variant="default"
                className="bg-green-600 animate-in slide-in-from-right"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Saved successfully
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear All
            </Button>
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header */}
            <div className="grid grid-cols-6 gap-2 mb-2">
              <div className="text-center font-semibold text-sm p-3 text-muted-foreground">
                Time
              </div>
              {days.map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-sm p-3 border-b-2 border-blue-100"
                >
                  <div className="text-foreground">{day.slice(0, 3)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {day}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-6 gap-2 mb-2">
                {/* Time Column */}
                <div className="flex items-center justify-end pr-4 text-sm font-mono text-muted-foreground bg-muted/20 rounded-l-md">
                  {hour}
                </div>

                {/* Day Slots */}
                {days.map((day, dayIndex) => {
                  const key: SlotKey = `${day}-${hour}`;
                  const isAvailable = availability[key];

                  return (
                    <button
                      key={key}
                      onClick={() => toggle(key)}
                      className={`
                        h-12 rounded-md border-2 transition-all duration-200 relative group
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                        ${
                          isAvailable
                            ? "bg-green-500 hover:bg-green-600 border-green-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            : "bg-card hover:bg-muted/60 border-border hover:border-muted-foreground/40"
                        }
                        ${dayIndex === days.length - 1 ? "rounded-r-md" : ""}
                      `}
                      aria-label={`${day} ${hour} - ${
                        isAvailable ? "Available" : "Unavailable"
                      }`}
                    >
                      {isAvailable && (
                        <CheckCircle2 className="h-4 w-4 text-white absolute inset-0 m-auto opacity-80" />
                      )}

                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {day} {hour}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {totalAvailable === 0 && "Select your available time slots"}
          {totalAvailable > 0 &&
            totalAvailable < 10 &&
            "Consider adding more availability"}
          {totalAvailable >= 10 && "Great availability coverage!"}
        </div>

        <Button
          onClick={save}
          disabled={saving || totalAvailable === 0}
          className="min-w-[160px]"
          size="lg"
        >
          {saving ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Save Schedule
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
