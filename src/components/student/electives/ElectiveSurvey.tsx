"use client";
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type ElectiveOption = {
	code: string;
	name: string;
	group?: string;
};

export type ElectiveSurveyProps = {
	options?: ElectiveOption[];
	numChoices?: number;
	title?: string;
	subtitle?: string;
	onSubmitChoices?: (rankedCodes: string[]) => Promise<void> | void;
};

const DEFAULT_OPTIONS: ElectiveOption[] = [
	{ code: "CS401", name: "Machine Learning", group: "CS" },
	{ code: "CS402", name: "Computer Vision", group: "CS" },
	{ code: "IT328", name: "Database Systems", group: "IT" },
	{ code: "IT350", name: "Cloud Computing", group: "IT" },
	{ code: "MATH350", name: "Discrete Mathematics", group: "MATH" },
	{ code: "STAT320", name: "Applied Statistics", group: "STAT" },
];

export function ElectiveSurvey({
	options = DEFAULT_OPTIONS,
	numChoices = 3,
	title = "Elective Preferences",
	subtitle = "Rank your preferred electives in order",
	onSubmitChoices,
}: ElectiveSurveyProps): React.ReactElement {
	const [selected, setSelected] = useState<string[]>(Array.from({ length: numChoices }, () => ""));
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	const codeToOption = useMemo(() => {
		const map = new Map<string, ElectiveOption>();
		options.forEach((opt) => map.set(opt.code, opt));
		return map;
	}, [options]);

	function updateChoice(index: number, value: string) {
		setSelected((prev) => {
			const next = [...prev];
			next[index] = value;
			return next;
		});
	}

	const validationError = useMemo(() => {
		if (selected.some((c) => !c)) return "Please select all ranks.";
		const dedup = new Set(selected);
		if (dedup.size !== selected.length) return "Each elective must be unique.";
		return "";
	}, [selected]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (validationError) return;
		try {
			setSubmitting(true);
			await onSubmitChoices?.(selected);
			setSubmitted(true);
		} finally {
			setSubmitting(false);
		}
	}

	if (submitted) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Thank you!</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Your elective preferences have been recorded.
					</p>
				</CardContent>
			</Card>
		);
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
				<form onSubmit={handleSubmit} className="space-y-6">
					{Array.from({ length: numChoices }, (_, idx) => {
						const rank = idx + 1;
						const otherSelected = new Set(selected.filter((c, i) => i !== idx && c));
						return (
							<div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
								<Label className="md:col-span-1">Rank {rank}</Label>
								<div className="md:col-span-2">
									<Select value={selected[idx]} onValueChange={(v) => updateChoice(idx, v)}>
										<SelectTrigger>
											<SelectValue placeholder="Select elective" />
										</SelectTrigger>
										<SelectContent>
											{options.map((opt) => (
												<SelectItem key={opt.code} value={opt.code} disabled={otherSelected.has(opt.code)}>
													<span className={cn("flex items-center gap-2", otherSelected.has(opt.code) && "opacity-50")}>
														<span className="font-medium">{opt.code}</span>
														<span className="text-muted-foreground">{opt.name}</span>
													</span>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						);
					})}

					{validationError ? (
						<p className="text-sm text-red-600">{validationError}</p>
					) : null}

					<div className="flex justify-end">
						<Button type="submit" disabled={!!validationError || submitting}>
							{submitting ? "Submitting..." : "Submit Preferences"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}

export default ElectiveSurvey;


