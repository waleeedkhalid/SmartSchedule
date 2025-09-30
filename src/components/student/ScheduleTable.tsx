"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Dummy schedule data
const schedule = {
  Monday: [
    {
      time: "09:00-10:30",
      course: "Advanced Algorithms",
      room: "CS-201",
      type: "Lecture",
    },
    {
      time: "14:00-15:30",
      course: "Database Systems",
      room: "CS-105",
      type: "Lab",
    },
  ],
  Tuesday: [
    {
      time: "10:00-11:30",
      course: "Software Engineering",
      room: "CS-301",
      type: "Tutorial",
    },
    {
      time: "15:00-16:30",
      course: "Machine Learning",
      room: "CS-205",
      type: "Lecture",
    },
  ],
  Wednesday: [
    {
      time: "09:00-10:30",
      course: "Advanced Algorithms",
      room: "CS-201",
      type: "Lecture",
    },
    {
      time: "13:00-14:30",
      course: "Computer Networks",
      room: "CS-107",
      type: "Lab",
    },
  ],
  Thursday: [
    {
      time: "10:00-11:30",
      course: "Software Engineering",
      room: "CS-301",
      type: "Lecture",
    },
    {
      time: "14:00-15:30",
      course: "Database Systems",
      room: "CS-105",
      type: "Tutorial",
    },
  ],
  Friday: [
    {
      time: "11:00-12:30",
      course: "Machine Learning",
      room: "CS-205",
      type: "Lecture",
    },
    {
      time: "16:00-17:30",
      course: "Computer Networks",
      room: "CS-107",
      type: "Lecture",
    },
  ],
};

const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const getClassTypeColor = (type: string) => {
  switch (type) {
    case "Lecture":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Lab":
      return "bg-green-100 text-green-800 border-green-200";
    case "Seminar":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "Tutorial":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function ScheduleTable() {
  const getClassForTimeSlot = (day: string, time: string) => {
    const daySchedule = schedule[day as keyof typeof schedule] || [];
    return daySchedule.find((classItem) => {
      const [startTime] = classItem.time.split("-");
      return startTime === time;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-6 gap-2 min-w-[800px]">
            {/* Header row */}
            <div className="font-semibold text-center py-2 bg-gray-50 rounded">
              Time
            </div>
            {days.map((day) => (
              <div
                key={day}
                className="font-semibold text-center py-2 bg-gray-50 rounded"
              >
                {day}
              </div>
            ))}

            {/* Time slots */}
            {timeSlots.map((time) => (
              <React.Fragment key={time}>
                <div className="text-sm text-gray-600 py-4 text-center font-medium">
                  {time}
                </div>
                {days.map((day) => {
                  const classItem = getClassForTimeSlot(day, time);
                  return (
                    <div key={`${day}-${time}`} className="min-h-16 p-1">
                      {classItem ? (
                        <div
                          className={cn(
                            "p-2 rounded-lg border h-full",
                            getClassTypeColor(classItem.type)
                          )}
                        >
                          <div className="text-xs font-semibold truncate">
                            {classItem.course}
                          </div>
                          <div className="text-xs opacity-75">
                            {classItem.room}
                          </div>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {classItem.type}
                          </Badge>
                        </div>
                      ) : (
                        <div className="h-full border border-dashed border-gray-200 rounded-lg"></div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
