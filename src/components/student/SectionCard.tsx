/**
 * Section Card Component
 * Displays section information for elective registration
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Clock,
  MapPin,
  User,
  Users,
  BookOpen,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { registerForSection } from "@/app/student/register-electives/actions";

interface SectionTime {
  day: string;
  start_time: string;
  end_time: string;
}

interface SectionCardProps {
  section: {
    id: string;
    course_code: string;
    capacity: number;
    enrolled_count: number;
    course: {
      code: string;
      name: string;
      description?: string;
      credits: number;
      department?: string;
    };
    section_time?: SectionTime[];
    instructor?: {
      full_name: string;
    };
    room?: {
      number: string;
    };
  };
  isEnrolled?: boolean;
  onEnrollmentChange?: () => void;
}

export function SectionCard({
  section,
  isEnrolled = false,
  onEnrollmentChange,
}: SectionCardProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const { toast } = useToast();

  const availableSeats = section.capacity - section.enrolled_count;
  const utilizationPercent = (section.enrolled_count / section.capacity) * 100;

  // Determine availability status
  const getAvailabilityStatus = () => {
    if (availableSeats === 0) return { label: "Full", variant: "destructive" as const };
    if (availableSeats <= 3)
      return { label: "Almost Full", variant: "secondary" as const };
    return { label: "Available", variant: "default" as const };
  };

  const status = getAvailabilityStatus();

  // Format time slots
  const formatTimeSlots = () => {
    if (!section.section_time || section.section_time.length === 0) {
      return "TBA";
    }

    return section.section_time
      .map((time) => {
        const day = time.day.substring(0, 3); // Sun, Mon, etc.
        return `${day} ${time.start_time}-${time.end_time}`;
      })
      .join(", ");
  };

  const handleRegister = async () => {
    try {
      setIsRegistering(true);

      const result = await registerForSection(section.id);

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        onEnrollmentChange?.();
      } else {
        // Show validation errors
        const errors = result.validation?.errors || [result.message];
        toast({
          title: "Registration Failed",
          description: (
            <div className="space-y-1">
              {errors.map((error, idx) => (
                <p key={idx} className="text-sm">
                  • {error}
                </p>
              ))}
            </div>
          ),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {section.course.code}: {section.course.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {section.course.department || "Computer Science"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={status.variant}>{status.label}</Badge>
            {isEnrolled && (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Enrolled
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Description */}
        {section.course.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {section.course.description}
          </p>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Credits */}
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span>{section.course.credits} Credits</span>
          </div>

          {/* Capacity */}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {section.enrolled_count}/{section.capacity} students
            </span>
          </div>

          {/* Instructor */}
          {section.instructor && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{section.instructor.full_name}</span>
            </div>
          )}

          {/* Room */}
          {section.room && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>Room {section.room.number}</span>
            </div>
          )}
        </div>

        {/* Time Slots */}
        <div className="flex items-start gap-2">
          <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
          <span className="text-sm">{formatTimeSlots()}</span>
        </div>

        {/* Capacity Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Capacity</span>
            <span>{utilizationPercent.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                utilizationPercent >= 90
                  ? "bg-destructive"
                  : utilizationPercent >= 75
                    ? "bg-yellow-500"
                    : "bg-primary"
              }`}
              style={{ width: `${utilizationPercent}%` }}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter>
        {isEnrolled ? (
          <div className="w-full flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-500">
            <CheckCircle2 className="h-4 w-4" />
            <span>You are enrolled in this section</span>
          </div>
        ) : availableSeats === 0 ? (
          <div className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>This section is full</span>
          </div>
        ) : (
          <Button
            className="w-full"
            onClick={handleRegister}
            disabled={isRegistering}
          >
            {isRegistering ? "Registering..." : "Register for this Section"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

