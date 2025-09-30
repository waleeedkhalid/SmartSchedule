"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import data from "@/data/external-departments.json";

type ExternalCourseTime = { day: string; start: string; end: string };
type ExternalCourseSection = {
  id: string;
  courseCode: string;
  instructor: string;
  room: string;
  times: ExternalCourseTime[];
};
type ExternalCourse = {
	code: string;
	name: string;
	credits: number;
	department: string;
	level: number;
	type: string;
	exams: {
		midterm?: { date: string; time: string; duration: number };
		midterm2?: { date: string; time: string; duration: number };
		final?: { date: string; time: string; duration: number };
	};
	sections: ExternalCourseSection[];
};

type ExternalDepartmentsData = { courses: ExternalCourse[] };

const externalData = (data as unknown as ExternalDepartmentsData);

const ALL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export type ExternalConstraint = {
	department: string;
	constraint: string;
	courseCode?: string;
  exams?: ExternalCourse["exams"];
  sections?: ExternalCourseSection[];
};

export type ExternalConstraintFormProps = {
	onSubmit?: (data: ExternalConstraint) => Promise<void> | void;
	title?: string;
	subtitle?: string;
};

export function ExternalCoursesEditor({ onSubmit, title = "External Department Constraints", subtitle = "Capture constraints that affect scheduling" }: ExternalConstraintFormProps): React.ReactElement {
	const [department, setDepartment] = useState("");
	const [courseCode, setCourseCode] = useState("");
	const [constraint, setConstraint] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	const [editableExams, setEditableExams] = useState<ExternalCourse["exams"] | undefined>(undefined);
	const [editableSections, setEditableSections] = useState<ExternalCourseSection[] | undefined>(undefined);

	const departments = useMemo(() => {
		const set = new Set<string>();
		externalData.courses.forEach((c) => set.add(c.department));
		return Array.from(set).sort();
	}, []);

	const departmentCourses = useMemo((): Array<{ code: string; name: string; level: number; type: string }> => {
		if (!department) return [];
		return externalData.courses
			.filter((c) => c.department === department)
			.map((c) => ({ code: c.code, name: c.name, level: c.level, type: c.type }));
	}, [department]);

	const canSubmit = department.trim() && constraint.trim();

	useEffect(() => {
		if (!courseCode) {
			setEditableExams(undefined);
			setEditableSections(undefined);
			return;
		}
		const course = externalData.courses.find((c) => c.code === courseCode);
		if (course) {
			setEditableExams(course.exams ?? {});
			// deep clone sections times for safe editing
			const cloned = course.sections.map((s) => ({
				...s,
				times: s.times.map((t) => ({ ...t })),
			}));
			setEditableSections(cloned);
		}
	}, [courseCode]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!canSubmit) return;
		try {
			setSubmitting(true);
			await onSubmit?.({ department, constraint, courseCode: courseCode || undefined, exams: editableExams, sections: editableSections });
			setSubmitted(true);
		} finally {
			setSubmitting(false);
		}
	}

	if (submitted) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Saved</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">Constraint recorded for {department}.</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label>Department</Label>
						<Select value={department} onValueChange={(v) => { setDepartment(v); setCourseCode(""); }}>
							<SelectTrigger>
								<SelectValue placeholder="Select department" />
							</SelectTrigger>
							<SelectContent>
								{departments.map((d) => (
									<SelectItem key={d} value={d}>{d}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div>
						<Label>Specific Course (optional)</Label>
						<Select value={courseCode} onValueChange={setCourseCode} disabled={!department}>
							<SelectTrigger>
								<SelectValue placeholder={department ? "Select course" : "Select a department first"} />
							</SelectTrigger>
							<SelectContent>
								{departmentCourses.map((c) => (
									<SelectItem key={c.code} value={c.code}>{c.code} — {c.name}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div>
						<Label htmlFor="constraint">Constraint</Label>
						<Textarea id="constraint" value={constraint} onChange={(e) => setConstraint(e.target.value)} placeholder="Avoid scheduling MATH labs on Mondays 12-2 PM" rows={4} />
					</div>

					{courseCode ? (
						<>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label>Exams</Label>
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
									<div>
										<Label className="text-xs">Midterm Date</Label>
										<Input type="date" value={editableExams?.midterm?.date || ""} onChange={(e) => setEditableExams((prev) => ({ ...(prev || {}), midterm: { date: e.target.value, time: prev?.midterm?.time || "", duration: prev?.midterm?.duration || 90 } }))} />
									</div>
									<div>
										<Label className="text-xs">Midterm Time</Label>
										<Input type="time" value={editableExams?.midterm?.time || ""} onChange={(e) => setEditableExams((prev) => ({ ...(prev || {}), midterm: { date: prev?.midterm?.date || "", time: e.target.value, duration: prev?.midterm?.duration || 90 } }))} />
									</div>
									<div>
										<Label className="text-xs">Midterm Duration (min)</Label>
										<Input type="number" value={editableExams?.midterm?.duration ?? 90} onChange={(e) => setEditableExams((prev) => ({ ...(prev || {}), midterm: { date: prev?.midterm?.date || "", time: prev?.midterm?.time || "", duration: Number(e.target.value) || 0 } }))} />
									</div>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
									<div>
										<Label className="text-xs">2nd Midterm Date</Label>
										<Input type="date" value={editableExams?.midterm2?.date || ""} onChange={(e) => setEditableExams((prev) => ({ ...(prev || {}), midterm2: { date: e.target.value, time: prev?.midterm2?.time || "", duration: prev?.midterm2?.duration || 90 } }))} />
									</div>
									<div>
										<Label className="text-xs">2nd Midterm Time</Label>
										<Input type="time" value={editableExams?.midterm2?.time || ""} onChange={(e) => setEditableExams((prev) => ({ ...(prev || {}), midterm2: { date: prev?.midterm2?.date || "", time: e.target.value, duration: prev?.midterm2?.duration || 90 } }))} />
									</div>
									<div>
										<Label className="text-xs">2nd Midterm Duration (min)</Label>
										<Input type="number" value={editableExams?.midterm2?.duration ?? 90} onChange={(e) => setEditableExams((prev) => ({ ...(prev || {}), midterm2: { date: prev?.midterm2?.date || "", time: prev?.midterm2?.time || "", duration: Number(e.target.value) || 0 } }))} />
									</div>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
									<div>
										<Label className="text-xs">Final Date</Label>
										<Input type="date" value={editableExams?.final?.date || ""} onChange={(e) => setEditableExams((prev) => ({ ...(prev || {}), final: { date: e.target.value, time: prev?.final?.time || "", duration: prev?.final?.duration || 120 } }))} />
									</div>
									<div>
										<Label className="text-xs">Final Time</Label>
										<Input type="time" value={editableExams?.final?.time || ""} onChange={(e) => setEditableExams((prev) => ({ ...(prev || {}), final: { date: prev?.final?.date || "", time: e.target.value, duration: prev?.final?.duration || 120 } }))} />
									</div>
									<div>
										<Label className="text-xs">Final Duration (min)</Label>
										<Input type="number" value={editableExams?.final?.duration ?? 120} onChange={(e) => setEditableExams((prev) => ({ ...(prev || {}), final: { date: prev?.final?.date || "", time: prev?.final?.time || "", duration: Number(e.target.value) || 0 } }))} />
									</div>
								</div>
							</div>

							<div className="space-y-2">
								<Label>Sections & Times</Label>
								<div className="space-y-3">
									{editableSections?.map((s, si) => (
										<div key={s.id} className="border rounded p-3 space-y-2">
											<div className="text-sm font-medium">{s.id} — {s.instructor} • {s.room}</div>
											<div className="space-y-2">
												{s.times.map((t, ti) => (
													<div key={ti} className="grid grid-cols-1 sm:grid-cols-7 gap-2 items-end">
														<div className="sm:col-span-3">
															<Label className="text-xs">Day</Label>
															<Select value={t.day} onValueChange={(v) => setEditableSections((prev) => prev?.map((sec, idx) => idx === si ? { ...sec, times: sec.times.map((tt, j) => j === ti ? { ...tt, day: v } : tt) } : sec))}>
																<SelectTrigger>
																	<SelectValue />
																</SelectTrigger>
																<SelectContent>
																	{ALL_DAYS.map((d) => (
																		<SelectItem key={d} value={d}>{d}</SelectItem>
																	))}
																</SelectContent>
															</Select>
														</div>
														<div>
															<Label className="text-xs">Start</Label>
															<Input type="time" value={t.start} onChange={(e) => setEditableSections((prev) => prev?.map((sec, idx) => idx === si ? { ...sec, times: sec.times.map((tt, j) => j === ti ? { ...tt, start: e.target.value } : tt) } : sec))} />
														</div>
														<div>
															<Label className="text-xs">End</Label>
															<Input type="time" value={t.end} onChange={(e) => setEditableSections((prev) => prev?.map((sec, idx) => idx === si ? { ...sec, times: sec.times.map((tt, j) => j === ti ? { ...tt, end: e.target.value } : tt) } : sec))} />
														</div>
														<div className="sm:col-span-1">
															<Button type="button" variant="destructive" onClick={() => setEditableSections((prev) => prev?.map((sec, idx) => idx === si ? { ...sec, times: sec.times.filter((_, j) => j !== ti) } : sec))} className="w-full">Remove</Button>
														</div>
													</div>
												))}
												<div>
													<Button type="button" variant="outline" onClick={() => setEditableSections((prev) => prev?.map((sec, idx) => idx === si ? { ...sec, times: [...sec.times, { day: "Sunday", start: "08:00", end: "08:50" }] } : sec))}>Add Time</Button>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
						</>
					) : null}
					<div className="flex justify-end">
						<Button type="submit" disabled={!canSubmit || submitting}>{submitting ? "Saving..." : "Save"}</Button>
					</div>
				</form>
			</CardContent>
			</Card>

			{department ? (
			<Card>
				<CardHeader>
					<CardTitle className="text-base">{department} — Courses Preview ({departmentCourses.length})</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="max-h-60 overflow-auto space-y-2">
						{departmentCourses.map((c) => (
							<div key={c.code} className="text-sm flex items-center justify-between border rounded p-2">
								<span className="font-medium">{c.code}</span>
								<span className="truncate ml-2 flex-1">{c.name}</span>
								<span className="ml-2 text-xs text-muted-foreground">L{c.level} • {c.type}</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		) : null}
		</div>
	);
}

export default ExternalCoursesEditor;


