"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StudentScheduleItem = {
	dow: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
	start: string; // e.g. "09:00"
	end: string; // e.g. "10:30"
	courseCode: string;
	courseName: string;
	room: string;
	type: "Lecture" | "Lab" | "Tutorial" | "Seminar" | string;
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
	"18:00",
];

const WEEK_DAYS: Array<StudentScheduleItem["dow"]> = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
];

function classTypeColor(type: string): string {
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
}

function findItemAt(
	items: StudentScheduleItem[],
	dow: StudentScheduleItem["dow"],
	time: string
): StudentScheduleItem | undefined {
	return items.find((item) => item.dow === dow && item.start === time);
}

export type StudentScheduleGridProps = {
	items?: StudentScheduleItem[];
	timeSlots?: string[];
	title?: string;
	subtitle?: string;
};

export function StudentScheduleGrid({
	items = [],
	timeSlots = DEFAULT_TIME_SLOTS,
	title = "Weekly Schedule",
	subtitle,
}: StudentScheduleGridProps): JSX.Element {
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
									const item = findItemAt(items, day, time);
									return (
										<div key={`${day}-${time}`} className="min-h-16 p-1">
											{item ? (
												<div className={cn("p-2 rounded-lg border h-full", classTypeColor(item.type))}>
													<div className="text-xs font-semibold truncate">{item.courseName}</div>
													<div className="text-xs opacity-75 flex items-center justify-between gap-2">
														<span className="truncate">{item.courseCode}</span>
														<span className="truncate">{item.room}</span>
													</div>
													<Badge variant="secondary" className="text-xs mt-1">{item.type}</Badge>
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

export default StudentScheduleGrid;


