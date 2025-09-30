"use client";
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type LoadRow = {
	id: string;
	instructor: string;
	courseCode: string;
	section: string;
	credits: number;
	hoursPerWeek: number;
};

export type LoadReviewTableProps = {
	initialRows?: LoadRow[];
	balancedTargetHours?: number;
	title?: string;
	subtitle?: string;
};

const DEFAULT_ROWS: LoadRow[] = [
	{ id: "1", instructor: "Dr. Smith", courseCode: "CS101", section: "A", credits: 3, hoursPerWeek: 3 },
	{ id: "2", instructor: "Dr. Smith", courseCode: "CS245", section: "B", credits: 3, hoursPerWeek: 3 },
	{ id: "3", instructor: "Dr. Khan", courseCode: "IT328", section: "A", credits: 3, hoursPerWeek: 3 },
	{ id: "4", instructor: "Dr. Khan", courseCode: "IT350", section: "A", credits: 3, hoursPerWeek: 4 },
	{ id: "5", instructor: "Dr. Lee", courseCode: "MATH106", section: "C", credits: 4, hoursPerWeek: 5 },
];

export function LoadReviewTable({ initialRows = DEFAULT_ROWS, balancedTargetHours = 6, title = "Teaching Load Review", subtitle = "Inspect instructor loads and imbalances" }: LoadReviewTableProps): React.ReactElement {
	const [rows, setRows] = useState<LoadRow[]>(initialRows);
	const [q, setQ] = useState("");

	const byInstructor = useMemo(() => {
		const map = new Map<string, { hours: number; credits: number }>();
		rows.forEach((r) => {
			const agg = map.get(r.instructor) ?? { hours: 0, credits: 0 };
			agg.hours += r.hoursPerWeek;
			agg.credits += r.credits;
			map.set(r.instructor, agg);
		});
		return map;
	}, [rows]);

	const filtered = useMemo(() => {
		const query = q.trim().toLowerCase();
		if (!query) return rows;
		return rows.filter((r) => [r.instructor, r.courseCode, r.section].some((v) => v.toLowerCase().includes(query)));
	}, [q, rows]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					<Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search instructor or course..." />
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Instructor</TableHead>
									<TableHead className="w-24">Course</TableHead>
									<TableHead className="w-20">Section</TableHead>
									<TableHead className="w-20 text-right">Credits</TableHead>
									<TableHead className="w-28 text-right">Hours/Week</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filtered.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} className="text-center text-sm text-muted-foreground">No assignments</TableCell>
									</TableRow>
								) : (
									filtered.map((r) => (
										<TableRow key={r.id}>
											<TableCell>{r.instructor}</TableCell>
											<TableCell>{r.courseCode}</TableCell>
											<TableCell>{r.section}</TableCell>
											<TableCell className="text-right">{r.credits}</TableCell>
											<TableCell className="text-right">{r.hoursPerWeek}</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						{Array.from(byInstructor.entries()).map(([instructor, agg]) => {
							const diff = agg.hours - balancedTargetHours;
							const color = diff > 0 ? "text-red-600" : diff < 0 ? "text-amber-600" : "text-emerald-700";
							const label = diff === 0 ? "Balanced" : diff > 0 ? `+${diff}h overload` : `${diff}h under`;
							return (
								<div key={instructor} className="p-3 rounded-md border bg-gray-50">
									<div className="font-medium">{instructor}</div>
									<div className="text-sm text-muted-foreground">Credits: {agg.credits}</div>
									<div className={"text-sm font-semibold " + color}>Hours: {agg.hours} ({label})</div>
								</div>
							);
						})}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default LoadReviewTable;


