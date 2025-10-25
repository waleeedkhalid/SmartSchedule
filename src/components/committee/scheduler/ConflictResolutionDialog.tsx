/**
 * Conflict Resolution Dialog
 * Modal dialog for manually resolving conflicts with alternative suggestions
 */

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Clock, MapPin, User, CheckCircle2, AlertCircle } from "lucide-react";
import type { ScheduleConflict, ScheduledSection, SectionTimeSlot } from "@/types/scheduler";

interface AlternativeTimeSlot {
  day: string;
  start_time: string;
  end_time: string;
  score: number;
  reason: string;
}

interface AlternativeRoom {
  room_number: string;
  capacity: number;
  score: number;
  reason: string;
}

interface ConflictResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflict: ScheduleConflict | null;
  affectedSections: ScheduledSection[];
  occupiedSlots: SectionTimeSlot[];
  onResolve: (resolution: {
    section_id: string;
    new_time_slot?: AlternativeTimeSlot;
    new_room?: string;
  }) => Promise<void>;
}

export function ConflictResolutionDialog({
  open,
  onOpenChange,
  conflict,
  affectedSections,
  occupiedSlots,
  onResolve,
}: ConflictResolutionDialogProps) {
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [resolutionType, setResolutionType] = useState<"time" | "room">("time");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [suggestions, setSuggestions] = useState<{
    time_slots?: AlternativeTimeSlot[];
    rooms?: AlternativeRoom[];
  }>({});
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open && conflict) {
      const firstSection = affectedSections[0];
      if (firstSection) {
        setSelectedSection(firstSection.section_id);
        fetchSuggestions(firstSection);
      }
      setSelectedTimeSlot("");
      setSelectedRoom("");
    }
  }, [open, conflict]);

  // Fetch suggestions when section changes
  const fetchSuggestions = async (section: ScheduledSection) => {
    setLoading(true);
    try {
      const response = await fetch("/api/committee/scheduler/conflicts/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          occupied_slots: occupiedSlots,
          occupied_rooms: affectedSections
            .filter((s) => s.section_id !== section.section_id)
            .map((s) => s.room_number)
            .filter(Boolean),
          required_capacity: 30,
          suggestion_type: "both",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.data.suggestions);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (sectionId: string) => {
    setSelectedSection(sectionId);
    const section = affectedSections.find((s) => s.section_id === sectionId);
    if (section) {
      fetchSuggestions(section);
    }
    setSelectedTimeSlot("");
    setSelectedRoom("");
  };

  const handleResolve = async () => {
    if (!selectedSection) return;

    setResolving(true);
    try {
      const resolution: {
        section_id: string;
        new_time_slot?: AlternativeTimeSlot;
        new_room?: string;
      } = {
        section_id: selectedSection,
      };

      if (resolutionType === "time" && selectedTimeSlot) {
        const timeSlot = suggestions.time_slots?.find(
          (slot) =>
            `${slot.day}-${slot.start_time}-${slot.end_time}` === selectedTimeSlot
        );
        if (timeSlot) {
          resolution.new_time_slot = timeSlot;
        }
      } else if (resolutionType === "room" && selectedRoom) {
        resolution.new_room = selectedRoom;
      }

      await onResolve(resolution);
      onOpenChange(false);
    } catch (error) {
      console.error("Error resolving conflict:", error);
    } finally {
      setResolving(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-green-500";
    if (score >= 70) return "text-yellow-600";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 80) return "bg-green-50 text-green-700 border-green-200";
    if (score >= 70) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (score >= 60) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  if (!conflict) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Resolve Conflict</DialogTitle>
          <DialogDescription>
            {conflict.title} - Choose a resolution option below
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Conflict Description */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{conflict.description}</AlertDescription>
          </Alert>

          {/* Select Section to Modify */}
          {affectedSections.length > 1 && (
            <div className="space-y-2">
              <Label>Select Section to Modify</Label>
              <Select value={selectedSection} onValueChange={handleSectionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a section" />
                </SelectTrigger>
                <SelectContent>
                  {affectedSections.map((section) => (
                    <SelectItem key={section.section_id} value={section.section_id}>
                      {section.course_code} - {section.course_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Resolution Options */}
          <Tabs value={resolutionType} onValueChange={(v) => setResolutionType(v as "time" | "room")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="time">
                <Clock className="w-4 h-4 mr-2" />
                Change Time
              </TabsTrigger>
              <TabsTrigger value="room">
                <MapPin className="w-4 h-4 mr-2" />
                Change Room
              </TabsTrigger>
            </TabsList>

            <TabsContent value="time" className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Finding alternative time slots...</span>
                </div>
              ) : suggestions.time_slots && suggestions.time_slots.length > 0 ? (
                <div className="space-y-2">
                  <Label>Alternative Time Slots</Label>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {suggestions.time_slots.map((slot, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                          selectedTimeSlot === `${slot.day}-${slot.start_time}-${slot.end_time}`
                            ? "border-primary bg-accent"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="time-slot"
                          value={`${slot.day}-${slot.start_time}-${slot.end_time}`}
                          checked={
                            selectedTimeSlot === `${slot.day}-${slot.start_time}-${slot.end_time}`
                          }
                          onChange={(e) => setSelectedTimeSlot(e.target.value)}
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {slot.day} {slot.start_time} - {slot.end_time}
                            </span>
                            <Badge variant="secondary" className={getScoreBadge(slot.score)}>
                              Score: {slot.score}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{slot.reason}</p>
                        </div>
                        {slot.score >= 90 && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No alternative time slots available. All slots are occupied.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="room" className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Finding alternative rooms...</span>
                </div>
              ) : suggestions.rooms && suggestions.rooms.length > 0 ? (
                <div className="space-y-2">
                  <Label>Alternative Rooms</Label>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {suggestions.rooms.map((room, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                          selectedRoom === room.room_number
                            ? "border-primary bg-accent"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="room"
                          value={room.room_number}
                          checked={selectedRoom === room.room_number}
                          onChange={(e) => setSelectedRoom(e.target.value)}
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{room.room_number}</span>
                            <Badge variant="outline">Capacity: {room.capacity}</Badge>
                            <Badge variant="secondary" className={getScoreBadge(room.score)}>
                              Score: {room.score}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{room.reason}</p>
                        </div>
                        {room.score >= 90 && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No alternative rooms available at this time.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={resolving}>
            Cancel
          </Button>
          <Button
            onClick={handleResolve}
            disabled={
              resolving ||
              !selectedSection ||
              (resolutionType === "time" && !selectedTimeSlot) ||
              (resolutionType === "room" && !selectedRoom)
            }
          >
            {resolving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Resolving...
              </>
            ) : (
              "Apply Resolution"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

