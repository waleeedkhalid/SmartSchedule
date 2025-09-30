import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarDays } from "lucide-react";
import React from "react";

// Dummy exam data matching the screenshot pattern
const examData = [
  {
    week: 6,
    exams: [
      {
        day: "SUN",
        hijri: "6/4/1447",
        greg: "28/9/2025",
        slots: [],
      },
      {
        day: "MON",
        hijri: "7/4/1447",
        greg: "29/9/2025",
        slots: [
          {
            course: "106 MATH",
            name: "Calculus I",
            time: "12-2PM",
            color: "bg-blue-200",
          },
          {
            course: "244 MATH",
            name: "Linear Algebra",
            time: "12-2PM",
            color: "bg-blue-200",
          },
          {
            course: "254 MATH",
            name: "Statistics",
            time: "12-2PM",
            color: "bg-blue-200",
          },
        ],
      },
      {
        day: "TUE",
        hijri: "8/4/1447",
        greg: "30/9/2025",
        slots: [],
      },
      {
        day: "WED",
        hijri: "9/4/1447",
        greg: "1/10/2025",
        slots: [
          {
            course: "103 PHYS",
            name: "Physics I",
            time: "12-2PM",
            color: "bg-blue-200",
          },
          {
            course: "104 PHYS",
            name: "Physics II",
            time: "12-2PM",
            color: "bg-blue-200",
          },
          {
            course: "IT 328",
            name: "Database Systems",
            time: "12-2PM",
            color: "bg-yellow-200",
          },
        ],
      },
      {
        day: "THU",
        hijri: "10/4/1447",
        greg: "2/10/2025",
        slots: [],
      },
    ],
  },
  {
    week: 7,
    exams: [
      {
        day: "SUN",
        hijri: "13/4/1447",
        greg: "5/10/2025",
        slots: [],
      },
      {
        day: "MON",
        hijri: "14/4/1447",
        greg: "6/10/2025",
        slots: [
          {
            course: "151 MATH",
            name: "Calculus II",
            time: "12-2PM",
            color: "bg-blue-200",
          },
          {
            course: "122 OPER",
            name: "Operations Research",
            time: "12-2PM",
            color: "bg-blue-200",
          },
          {
            course: "329 CSC",
            name: "Software Engineering",
            time: "12-2PM",
            color: "bg-green-200",
          },
        ],
      },
      {
        day: "TUE",
        hijri: "15/4/1447",
        greg: "7/10/2025",
        slots: [
          {
            course: "245 CSC",
            name: "Data Structures",
            time: "12-2PM",
            color: "bg-green-200",
          },
          {
            course: "IT 210",
            name: "Web Development",
            time: "12-2PM",
            color: "bg-yellow-200",
          },
        ],
      },
      {
        day: "WED",
        hijri: "16/4/1447",
        greg: "8/10/2025",
        slots: [],
      },
      {
        day: "THU",
        hijri: "17/4/1447",
        greg: "9/10/2025",
        slots: [
          {
            course: "401 CSC",
            name: "Machine Learning",
            time: "12-2PM",
            color: "bg-green-200",
          },
          {
            course: "350 MATH",
            name: "Discrete Mathematics",
            time: "12-2PM",
            color: "bg-blue-200",
          },
        ],
      },
    ],
  },
];

// Maximum number of slots per day across all data
const maxSlotsPerDay = Math.max(
  ...examData.flatMap((week) => week.exams.map((day) => day.slots.length))
);

export default function ExamScheduleTable() {
  return (
    <Card>
      <CardHeader className="text-center space-y-1">
        <h2 className="text-lg font-bold text-gray-800">
          Comprehensive Midterm Exam Schedule
        </h2>
        <p className="text-sm text-gray-600">First Semester 471</p>

        {/* Existing English title with icon */}
        <CardTitle className="flex items-center justify-center mt-2">
          <CalendarDays className="mr-2 h-5 w-5 text-blue-600" />
          Exam Timetable
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-16 text-center font-semibold">
                  Week
                </TableHead>
                <TableHead className="w-12 text-center font-semibold">
                  Day
                </TableHead>
                <TableHead className="w-24 text-center font-semibold">
                  Hijri / Gregorian
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {examData.map((weekData, weekIndex) => (
                <React.Fragment key={weekData.week}>
                  {weekData.exams.map((dayData, dayIndex) => (
                    <TableRow
                      key={`${weekData.week}-${dayData.day}`}
                      className="border-b"
                    >
                      {/* Week column - only on first row of each week */}
                      {dayIndex === 0 && (
                        <TableCell
                          rowSpan={weekData.exams.length}
                          className="text-center font-semibold bg-gray-50 border-r"
                        >
                          {weekData.week}
                        </TableCell>
                      )}

                      {/* Day */}
                      <TableCell className="text-center font-medium bg-gray-50 border-r">
                        {dayData.day}
                      </TableCell>

                      {/* Hijri + Gregorian */}
                      <TableCell className="text-center text-sm text-gray-600 border-r">
                        {dayData.hijri}
                        <br />
                        {dayData.greg}
                      </TableCell>

                      {/* Exam slots */}
                      {Array.from(
                        { length: maxSlotsPerDay },
                        (_, slotIndex) => {
                          const slot = dayData.slots[slotIndex];
                          return (
                            <TableCell key={slotIndex} className="p-2">
                              {slot ? (
                                <div
                                  className={`${slot.color} rounded-md p-2 text-center border border-gray-300`}
                                >
                                  <div className="font-semibold text-sm">
                                    {slot.course}
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    {slot.time}
                                  </div>
                                </div>
                              ) : (
                                <div className="h-16" />
                              )}
                            </TableCell>
                          );
                        }
                      )}
                    </TableRow>
                  ))}
                  {/* Week separator */}
                  <TableRow>
                    <TableCell
                      colSpan={4 + maxSlotsPerDay}
                      className="h-2 bg-gray-100 border-0"
                    />
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-200 rounded border border-gray-300"></div>
            <span>Mathematics & Physics</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-200 rounded border border-gray-300"></div>
            <span>Information Technology</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 rounded border border-gray-300"></div>
            <span>Computer Science</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
