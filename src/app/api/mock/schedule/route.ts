/**
 * Mock Schedule API Route
 * GET: Fetch mock schedule data for testing/demo
 */

import { successResponse } from "@/lib/api";
import type { ScheduleData } from "@/types";

export async function GET() {
  const mockSchedule: ScheduleData = {
    term: "Spring 2025",
    courses: [
      {
        courseCode: "SWE312",
        courseName: "Software Engineering Principles",
        section: "001",
        instructor: "Dr. Ahmed Al-Khalidi",
        credits: 3,
        schedule: [
          {
            day: "Sunday",
            startTime: "08:00",
            endTime: "08:50",
            room: "Building A, Room 101",
            type: "LEC",
          },
          {
            day: "Tuesday",
            startTime: "08:00",
            endTime: "08:50",
            room: "Building A, Room 101",
            type: "LEC",
          },
          {
            day: "Thursday",
            startTime: "08:00",
            endTime: "08:50",
            room: "Building A, Room 101",
            type: "LEC",
          },
        ],
      },
      {
        courseCode: "SWE314",
        courseName: "Database Systems",
        section: "002",
        instructor: "Dr. Fatima Al-Mansouri",
        credits: 3,
        schedule: [
          {
            day: "Sunday",
            startTime: "09:00",
            endTime: "09:50",
            room: "Building B, Room 205",
            type: "LEC",
          },
          {
            day: "Tuesday",
            startTime: "09:00",
            endTime: "09:50",
            room: "Building B, Room 205",
            type: "LEC",
          },
          {
            day: "Wednesday",
            startTime: "10:00",
            endTime: "11:50",
            room: "Lab 3",
            type: "LAB",
          },
        ],
      },
      {
        courseCode: "SWE499",
        courseName: "Advanced Web Development",
        section: "001",
        instructor: "Dr. Mohammed Al-Rashid",
        credits: 3,
        schedule: [
          {
            day: "Monday",
            startTime: "08:00",
            endTime: "08:50",
            room: "Building C, Room 301",
            type: "LEC",
          },
          {
            day: "Wednesday",
            startTime: "08:00",
            endTime: "08:50",
            room: "Building C, Room 301",
            type: "LEC",
          },
        ],
      },
      {
        courseCode: "SWE413",
        courseName: "Software Testing and QA",
        section: "001",
        instructor: "Dr. Sarah Al-Zahrani",
        credits: 3,
        schedule: [
          {
            day: "Monday",
            startTime: "09:00",
            endTime: "09:50",
            room: "Building A, Room 102",
            type: "LEC",
          },
          {
            day: "Thursday",
            startTime: "09:00",
            endTime: "09:50",
            room: "Building A, Room 102",
            type: "LEC",
          },
        ],
      },
    ],
    conflicts: [],
  };

  return successResponse({ schedule: mockSchedule });
}
