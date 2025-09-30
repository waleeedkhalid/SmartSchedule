"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export type IrregularStudent = {
	studentId: string;
	studentName: string;
	reason: string;
	affectedCourses: string;
};

export type RegistrarIrregularFormProps = {
	onSubmit?: (data: IrregularStudent) => Promise<void> | void;
	title?: string;
	subtitle?: string;
};

export function RegistrarIrregularForm({ onSubmit, title = "Irregular Student Entry", subtitle = "Record irregularity details for scheduling consideration" }: RegistrarIrregularFormProps): React.ReactElement {
	const [studentId, setStudentId] = useState("");
	const [studentName, setStudentName] = useState("");
	const [reason, setReason] = useState("");
	const [affectedCourses, setAffectedCourses] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	const canSubmit = studentId.trim() && studentName.trim() && reason.trim();

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!canSubmit) return;
		try {
			setSubmitting(true);
			await onSubmit?.({ studentId, studentName, reason, affectedCourses });
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
					<p className="text-sm text-muted-foreground">Irregular record created for {studentName} ({studentId}).</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label htmlFor="sid">Student ID</Label>
						<Input id="sid" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="201812345" />
					</div>
					<div>
						<Label htmlFor="sname">Student Name</Label>
						<Input id="sname" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="John Doe" />
					</div>
					<div>
						<Label htmlFor="reason">Reason</Label>
						<Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g., Transfer credits, prerequisite waiver, special accommodation" rows={4} />
					</div>
					<div>
						<Label htmlFor="courses">Affected Courses (optional)</Label>
						<Textarea id="courses" value={affectedCourses} onChange={(e) => setAffectedCourses(e.target.value)} placeholder="List course codes or descriptions" rows={3} />
					</div>
					<div className="flex justify-end">
						<Button type="submit" disabled={!canSubmit || submitting}>{submitting ? "Saving..." : "Save Record"}</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}

export default RegistrarIrregularForm;


