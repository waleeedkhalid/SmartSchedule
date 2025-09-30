"use client";
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

const WEEK_DAYS: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = [
	"08:00-09:00",
	"09:00-10:00",
	"10:00-11:00",
	"11:00-12:00",
	"12:00-13:00",
	"13:00-14:00",
	"14:00-15:00",
	"15:00-16:00",
	"16:00-17:00",
];

export type FacultyAvailability = Record<DayOfWeek, Record<string, boolean>>;

function buildInitial(): FacultyAvailability {
	return WEEK_DAYS.reduce((acc, day) => {
		acc[day] = TIME_SLOTS.reduce((inner, slot) => {
			inner[slot] = false;
			return inner;
		}, {} as Record<string, boolean>);
		return acc;
	}, {} as FacultyAvailability);
}

export type FacultyAvailabilityFormProps = {
	initial?: FacultyAvailability;
	title?: string;
	subtitle?: string;
	onSubmit?: (availability: FacultyAvailability) => Promise<void> | void;
};

export function FacultyAvailabilityForm({
	initial,
	title = "Set Your Availability",
	subtitle = "Select the time slots you are available to teach",
	onSubmit,
}: FacultyAvailabilityFormProps): React.ReactElement {
	const [availability, setAvailability] = useState<FacultyAvailability>(initial ?? buildInitial());
	const [submitting, setSubmitting] = useState(false);
	const selectedCount = useMemo(() =>
		Object.values(availability).reduce(
			(total, day) => total + Object.values(day).filter(Boolean).length,
			0
		),
		[availability]
	);

	function toggle(day: DayOfWeek, slot: string) {
		setAvailability((prev) => ({
			...prev,
			[day]: {
				...prev[day],
				[slot]: !prev[day][slot],
			},
		}));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		try {
			setSubmitting(true);
			await onSubmit?.(availability);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{subtitle ? (
					<p className="text-sm text-muted-foreground">{subtitle}</p>
				) : null}
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="text-sm text-muted-foreground">Selected slots: {selectedCount}</div>
					<div className="overflow-x-auto">
						<div className="grid grid-cols-6 gap-2 min-w-[800px]">
							<div className="font-semibold text-center py-2 bg-gray-50 rounded">Time</div>
							{WEEK_DAYS.map((day) => (
								<div key={day} className="font-semibold text-center py-2 bg-gray-50 rounded">
									{day}
								</div>
							))}

							{TIME_SLOTS.map((slot) => (
								<React.Fragment key={slot}>
									<div className="text-sm text-gray-600 py-3 text-center font-medium">{slot}</div>
									{WEEK_DAYS.map((day) => (
										<div key={`${day}-${slot}`} className="min-h-12 p-2 flex items-center justify-center">
											<Label className="sr-only">{day} {slot}</Label>
											<Checkbox
												checked={availability[day][slot]}
												onChange={() => toggle(day, slot)}
												className="h-5 w-5"
											/>
										</div>
									))}
								</React.Fragment>
							))}
						</div>
					</div>

					<div className="flex justify-end pt-2">
						<Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Availability"}</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}

export default FacultyAvailabilityForm;


