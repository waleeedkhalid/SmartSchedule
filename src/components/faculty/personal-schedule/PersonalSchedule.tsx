"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type FacultyAssignment = {
	dow: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
	start: string; // "09:00"
	end: string; // "10:30"
	courseCode: string;
	section: string;
	room: string;
	role?: "Instructor" | "TA" | string;
	activity?: "Lecture" | "Lab" | "Tutorial" | string;
};

const DEFAULT_TIME_SLOTS = [
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
];

const WEEK_DAYS: Array<FacultyAssignment["dow"]> = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
];

function activityColor(activity?: string): string {
	switch (activity) {
		case "Lecture":
			return "bg-blue-100 text-blue-800 border-blue-200";
		case "Lab":
			return "bg-green-100 text-green-800 border-green-200";
		case "Tutorial":
			return "bg-orange-100 text-orange-800 border-orange-200";
		default:
			return "bg-gray-100 text-gray-800 border-gray-200";
	}
}

function findAssignment(assignments: FacultyAssignment[], dow: FacultyAssignment["dow"], time: string): FacultyAssignment | undefined {
	return assignments.find((a) => a.dow === dow && a.start === time);
}

export type PersonalScheduleProps = {
	assignments?: FacultyAssignment[];
	timeSlots?: string[];
	title?: string;
	subtitle?: string;
};

export function PersonalSchedule({
	assignments = [],
	timeSlots = DEFAULT_TIME_SLOTS,
	title = "My Teaching Schedule",
	subtitle,
}: PersonalScheduleProps): React.ReactElement {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{subtitle ? (
					<p className="text-sm text-muted-foreground">{subtitle}</p>
				) : null}
			</CardHeader>
			<CardContent>
				<div className="overflow-x-auto">
					<div className="grid grid-cols-6 gap-2 min-w-[800px]">
						<div className="font-semibold text-center py-2 bg-gray-50 rounded">Time</div>
						{WEEK_DAYS.map((day) => (
							<div key={day} className="font-semibold text-center py-2 bg-gray-50 rounded">
								{day}
							</div>
						))}

						{timeSlots.map((time) => (
							<React.Fragment key={time}>
								<div className="text-sm text-gray-600 py-4 text-center font-medium">{time}</div>
								{WEEK_DAYS.map((day) => {
									const a = findAssignment(assignments, day, time);
									return (
										<div key={`${day}-${time}`} className="min-h-16 p-1">
											{a ? (
												<div className={cn("p-2 rounded-lg border h-full", activityColor(a.activity))}>
													<div className="text-xs font-semibold truncate">{a.courseCode} — {a.section}</div>
													<div className="text-xs opacity-75 flex items-center justify-between gap-2">
														<span className="truncate">{a.room}</span>
														<span className="truncate">{a.start}-{a.end}</span>
													</div>
													<div className="flex gap-2 mt-1">
														<Badge variant="secondary" className="text-xs">{a.activity ?? "Class"}</Badge>
														{a.role ? <Badge className="text-xs">{a.role}</Badge> : null}
													</div>
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

export default PersonalSchedule;


