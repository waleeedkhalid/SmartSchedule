"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";

type TimeSlot = {
  day: string;
  startTime: string;
  endTime: string;
};

export function AvailabilityForm() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [currentSlot, setCurrentSlot] = useState<Omit<TimeSlot, "day">>({
    startTime: "",
    endTime: "",
  });

  const addTimeSlot = () => {
    if (!date || !currentSlot.startTime || !currentSlot.endTime) return;

    const newSlot: TimeSlot = {
      day: format(date, "EEEE"), // e.g., "Monday"
      startTime: currentSlot.startTime,
      endTime: currentSlot.endTime,
    };

    setTimeSlots([...timeSlots, newSlot]);
    setCurrentSlot({ startTime: "", endTime: "" });
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would call an API endpoint here
    console.log("Submitting availability:", { date, timeSlots });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium">Select Day</h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={currentSlot.startTime}
                onChange={(e) =>
                  setCurrentSlot({ ...currentSlot, startTime: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={currentSlot.endTime}
                onChange={(e) =>
                  setCurrentSlot({ ...currentSlot, endTime: e.target.value })
                }
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={addTimeSlot}
            disabled={!date || !currentSlot.startTime || !currentSlot.endTime}
            className="w-full"
          >
            Add Time Slot
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Your Availability</h3>
          {timeSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No time slots added yet. Select a day and time range to add
              availability.
            </p>
          ) : (
            <div className="space-y-2">
              {timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <p className="font-medium">{slot.day}</p>
                    <p className="text-sm text-muted-foreground">
                      {slot.startTime} - {slot.endTime}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTimeSlot(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={timeSlots.length === 0}>
          Save Availability
        </Button>
      </div>
    </form>
  );
}
