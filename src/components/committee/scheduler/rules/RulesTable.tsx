"use client";
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Day = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday";
const DAYS: Day[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const LEVELS = ["3", "4", "5", "6", "7", "8"]; // demo levels

type RuleKey =
	| "Break Times"
	| "Midterm Slots"
	| "Elective Levels"
	| "Prerequisite Linking"
	| "Balanced Distribution"
	| "Lab Continuity";

type RuleState = {
	breakTimes: { start: string; end: string };
	midtermSlots: { days: Day[]; start: string; end: string };
	electiveLevels: { levels: string[] };
	prerequisiteLinking: { pairs: { course: string; prerequisite: string }[] };
	balancedDistribution: { minElectivesPerGroup: number; dayOffRequired: boolean };
	labContinuity: { blockLengthHours: number };
	// enabled flags per rule
	breakTimesEnabled: boolean;
	midtermSlotsEnabled: boolean;
	electiveLevelsEnabled: boolean;
	prerequisiteLinkingEnabled: boolean;
	balancedDistributionEnabled: boolean;
	labContinuityEnabled: boolean;
};

const DEFAULT_STATE: RuleState = {
	breakTimes: { start: "12:00", end: "13:00" },
	midtermSlots: { days: ["Monday", "Wednesday"], start: "12:00", end: "14:00" },
	electiveLevels: { levels: ["5", "6", "7", "8"] },
	prerequisiteLinking: { pairs: [] },
	balancedDistribution: { minElectivesPerGroup: 1, dayOffRequired: true },
	labContinuity: { blockLengthHours: 2 },
	breakTimesEnabled: true,
	midtermSlotsEnabled: true,
	electiveLevelsEnabled: true,
	prerequisiteLinkingEnabled: true,
	balancedDistributionEnabled: true,
	labContinuityEnabled: true,
};

function summarize(state: RuleState, key: RuleKey): React.ReactNode {
	switch (key) {
		case "Break Times": {
			if (!state.breakTimesEnabled) return <Badge variant="secondary">Disabled</Badge>;
			const { start, end } = state.breakTimes;
			return <span>{start}–{end}</span>;
		}
		case "Midterm Slots": {
			if (!state.midtermSlotsEnabled) return <Badge variant="secondary">Disabled</Badge>;
			const { days, start, end } = state.midtermSlots;
			return (
				<div className="flex flex-wrap gap-1 items-center">
					{days.map((d) => (
						<Badge key={d} variant="secondary" className="text-xs">{d.slice(0, 3)}</Badge>
					))}
					<span className="text-sm text-muted-foreground ml-1">{start}–{end}</span>
				</div>
			);
		}
		case "Elective Levels": {
			if (!state.electiveLevelsEnabled) return <Badge variant="secondary">Disabled</Badge>;
			return (
				<div className="flex flex-wrap gap-1">
					{state.electiveLevels.levels.map((lvl) => (
						<Badge key={lvl} variant="secondary" className="text-xs">L{lvl}</Badge>
					))}
				</div>
			);
		}
		case "Prerequisite Linking": {
			if (!state.prerequisiteLinkingEnabled) return <Badge variant="secondary">Disabled</Badge>;
			if (state.prerequisiteLinking.pairs.length === 0) {
				return <span className="text-sm text-muted-foreground">No pairs</span>;
			}
			return (
				<div className="flex flex-wrap gap-2">
					{state.prerequisiteLinking.pairs.map((p, idx) => (
						<Badge key={idx} className="text-xs">{p.prerequisite} → {p.course}</Badge>
					))}
				</div>
			);
		}
		case "Balanced Distribution": {
			if (!state.balancedDistributionEnabled) return <Badge variant="secondary">Disabled</Badge>;
			const s = state.balancedDistribution;
			return (
				<div className="flex items-center gap-2">
					<Badge variant="secondary" className="text-xs">Min {s.minElectivesPerGroup} electives/group</Badge>
					<Badge className="text-xs" variant={s.dayOffRequired ? "default" : "secondary"}>{s.dayOffRequired ? "Day-off required" : "Day-off optional"}</Badge>
				</div>
			);
		}
		case "Lab Continuity": {
			if (!state.labContinuityEnabled) return <Badge variant="secondary">Disabled</Badge>;
			return <span>{state.labContinuity.blockLengthHours}h continuous</span>;
		}
	}
}

export function RulesTable(): React.ReactElement {
	const [state, setState] = useState<RuleState>(DEFAULT_STATE);
	const [editing, setEditing] = useState<RuleKey | null>(null);

	const rows = useMemo(() => (
		[
			{ key: "Break Times" as RuleKey, desc: "Daily break window for all schedules" },
			{ key: "Midterm Slots" as RuleKey, desc: "Midterm exam days and time window" },
			{ key: "Elective Levels" as RuleKey, desc: "Levels where electives apply" },
			{ key: "Prerequisite Linking" as RuleKey, desc: "Declare prerequisite → course pairs" },
			{ key: "Balanced Distribution" as RuleKey, desc: "Electives per group and day-off policy" },
			{ key: "Lab Continuity" as RuleKey, desc: "Minimum continuous lab duration" },
		]
	), []);

	function close() {
		setEditing(null);
	}

	return (
		<div className="p-6 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Scheduling Rules</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-56">Rule</TableHead>
									<TableHead>Description</TableHead>
									<TableHead className="w-32">Enabled</TableHead>
									<TableHead className="w-[40%]">Current Parameters</TableHead>
									<TableHead className="w-28 text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.map((r) => (
									<TableRow key={r.key}>
										<TableCell className="font-medium">{r.key}</TableCell>
										<TableCell className="text-sm text-muted-foreground">{r.desc}</TableCell>
										<TableCell>
											{(() => {
												switch (r.key) {
													case "Break Times":
														return <Switch checked={state.breakTimesEnabled} onCheckedChange={(v) => setState((s) => ({ ...s, breakTimesEnabled: v }))} />;
													case "Midterm Slots":
														return <Switch checked={state.midtermSlotsEnabled} onCheckedChange={(v) => setState((s) => ({ ...s, midtermSlotsEnabled: v }))} />;
													case "Elective Levels":
														return <Switch checked={state.electiveLevelsEnabled} onCheckedChange={(v) => setState((s) => ({ ...s, electiveLevelsEnabled: v }))} />;
													case "Prerequisite Linking":
														return <Switch checked={state.prerequisiteLinkingEnabled} onCheckedChange={(v) => setState((s) => ({ ...s, prerequisiteLinkingEnabled: v }))} />;
													case "Balanced Distribution":
														return <Switch checked={state.balancedDistributionEnabled} onCheckedChange={(v) => setState((s) => ({ ...s, balancedDistributionEnabled: v }))} />;
													case "Lab Continuity":
														return <Switch checked={state.labContinuityEnabled} onCheckedChange={(v) => setState((s) => ({ ...s, labContinuityEnabled: v }))} />;
												}
											})()}
										</TableCell>
										<TableCell>{summarize(state, r.key)}</TableCell>
										<TableCell className="text-right">
											<Dialog open={editing === r.key} onOpenChange={(o) => setEditing(o ? r.key : null)}>
												<DialogTrigger asChild>
													<Button variant="outline" onClick={() => setEditing(r.key)}>Edit</Button>
												</DialogTrigger>
												<DialogContent className="sm:max-w-lg">
													<DialogHeader>
														<DialogTitle>Edit {r.key}</DialogTitle>
													</DialogHeader>
													{r.key === "Break Times" && (
														<BreakTimesForm
															value={state.breakTimes}
															onSave={(v) => { setState((s) => ({ ...s, breakTimes: v })); close(); }}
															onCancel={close}
														/>
													)}
													{r.key === "Midterm Slots" && (
														<MidtermSlotsForm
															value={state.midtermSlots}
															onSave={(v) => { setState((s) => ({ ...s, midtermSlots: v })); close(); }}
															onCancel={close}
														/>
													)}
													{r.key === "Elective Levels" && (
														<ElectiveLevelsForm
															value={state.electiveLevels}
															onSave={(v) => { setState((s) => ({ ...s, electiveLevels: v })); close(); }}
															onCancel={close}
														/>
													)}
													{r.key === "Prerequisite Linking" && (
														<PrerequisiteLinkingForm
															value={state.prerequisiteLinking}
															onSave={(v) => { setState((s) => ({ ...s, prerequisiteLinking: v })); close(); }}
															onCancel={close}
														/>
													)}
													{r.key === "Balanced Distribution" && (
														<BalancedDistributionForm
															value={state.balancedDistribution}
															onSave={(v) => { setState((s) => ({ ...s, balancedDistribution: v })); close(); }}
															onCancel={close}
														/>
													)}
													{r.key === "Lab Continuity" && (
														<LabContinuityForm
															value={state.labContinuity}
															onSave={(v) => { setState((s) => ({ ...s, labContinuity: v })); close(); }}
															onCancel={close}
														/>
													)}
												</DialogContent>
											</Dialog>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// Forms

function Row({ children }: { children: React.ReactNode }) {
	return <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">{children}</div>;
}

function BreakTimesForm({ value, onSave, onCancel }: { value: RuleState["breakTimes"]; onSave: (v: RuleState["breakTimes"]) => void; onCancel: () => void }): React.ReactElement {
	const [start, setStart] = useState(value.start);
	const [end, setEnd] = useState(value.end);
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSave({ start, end });
			}}
			className="space-y-4"
		>
			<Row>
				<Label>Start</Label>
				<div className="sm:col-span-2"><Input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></div>
			</Row>
			<Row>
				<Label>End</Label>
				<div className="sm:col-span-2"><Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
			</Row>
			<DialogFooter>
				<Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
				<Button type="submit">Save</Button>
			</DialogFooter>
		</form>
	);
}

function MidtermSlotsForm({ value, onSave, onCancel }: { value: RuleState["midtermSlots"]; onSave: (v: RuleState["midtermSlots"]) => void; onCancel: () => void }): React.ReactElement {
	const [days, setDays] = useState<Day[]>(value.days);
	const [start, setStart] = useState(value.start);
	const [end, setEnd] = useState(value.end);
	function toggleDay(d: Day) {
		setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
	}
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSave({ days, start, end });
			}}
			className="space-y-4"
		>
			<div className="space-y-2">
				<Label>Days</Label>
				<div className="flex flex-wrap gap-2">
					{DAYS.map((d) => {
						const active = days.includes(d);
						return (
							<Button type="button" key={d} variant={active ? "default" : "outline"} size="sm" onClick={() => toggleDay(d)}>
								{d}
							</Button>
						);
					})}
				</div>
			</div>
			<Row>
				<Label>Start</Label>
				<div className="sm:col-span-2"><Input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></div>
			</Row>
			<Row>
				<Label>End</Label>
				<div className="sm:col-span-2"><Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
			</Row>
			<DialogFooter>
				<Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
				<Button type="submit">Save</Button>
			</DialogFooter>
		</form>
	);
}

function ElectiveLevelsForm({ value, onSave, onCancel }: { value: RuleState["electiveLevels"]; onSave: (v: RuleState["electiveLevels"]) => void; onCancel: () => void }): React.ReactElement {
	const [levels, setLevels] = useState<string[]>(value.levels);
	function toggle(l: string) {
		setLevels((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]));
	}
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSave({ levels });
			}}
			className="space-y-4"
		>
			<div className="space-y-2">
				<Label>Levels</Label>
				<div className="flex flex-wrap gap-2">
					{LEVELS.map((l) => {
						const active = levels.includes(l);
						return (
							<Button type="button" key={l} variant={active ? "default" : "outline"} size="sm" onClick={() => toggle(l)}>
								Level {l}
							</Button>
						);
					})}
				</div>
			</div>
			<DialogFooter>
				<Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
				<Button type="submit">Save</Button>
			</DialogFooter>
		</form>
	);
}

function PrerequisiteLinkingForm({ value, onSave, onCancel }: { value: RuleState["prerequisiteLinking"]; onSave: (v: RuleState["prerequisiteLinking"]) => void; onCancel: () => void }): React.ReactElement {
	const [pairs, setPairs] = useState<Array<{ course: string; prerequisite: string }>>(value.pairs);
	function add() {
		setPairs((prev) => [...prev, { course: "", prerequisite: "" }]);
	}
	function update(i: number, patch: Partial<{ course: string; prerequisite: string }>) {
		setPairs((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
	}
	function remove(i: number) {
		setPairs((prev) => prev.filter((_, idx) => idx !== i));
	}
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSave({ pairs });
			}}
			className="space-y-4"
		>
			<div className="space-y-3">
				{pairs.length === 0 && (
					<p className="text-sm text-muted-foreground">No prerequisite pairs. Add one below.</p>
				)}
				{pairs.map((p, i) => (
					<div key={i} className="grid grid-cols-1 sm:grid-cols-7 gap-2 items-end">
						<div className="sm:col-span-3">
							<Label>Prerequisite</Label>
							<Input placeholder="e.g., CS101" value={p.prerequisite} onChange={(e) => update(i, { prerequisite: e.target.value })} />
						</div>
						<div className="sm:col-span-3">
							<Label>Course</Label>
							<Input placeholder="e.g., CS201" value={p.course} onChange={(e) => update(i, { course: e.target.value })} />
						</div>
						<div className="sm:col-span-1">
							<Button type="button" variant="destructive" onClick={() => remove(i)} className="w-full">Remove</Button>
						</div>
					</div>
				))}
			</div>
			<div className="flex justify-between">
				<Button type="button" variant="outline" onClick={add}>Add Pair</Button>
			</div>
			<DialogFooter>
				<Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
				<Button type="submit">Save</Button>
			</DialogFooter>
		</form>
	);
}

function BalancedDistributionForm({ value, onSave, onCancel }: { value: RuleState["balancedDistribution"]; onSave: (v: RuleState["balancedDistribution"]) => void; onCancel: () => void }): React.ReactElement {
	const [minElectivesPerGroup, setMin] = useState<number>(value.minElectivesPerGroup);
	const [dayOffRequired, setDayOffRequired] = useState<boolean>(value.dayOffRequired);
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSave({ minElectivesPerGroup: Number(minElectivesPerGroup) || 0, dayOffRequired });
			}}
			className="space-y-4"
		>
			<Row>
				<Label>Min electives per group</Label>
				<div className="sm:col-span-2"><Input type="number" value={minElectivesPerGroup} onChange={(e) => setMin(Number(e.target.value))} /></div>
			</Row>
			<Row>
				<Label>Require day-off</Label>
				<div className="sm:col-span-2">
					<Switch checked={dayOffRequired} onCheckedChange={setDayOffRequired} />
				</div>
			</Row>
			<DialogFooter>
				<Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
				<Button type="submit">Save</Button>
			</DialogFooter>
		</form>
	);
}

function LabContinuityForm({ value, onSave, onCancel }: { value: RuleState["labContinuity"]; onSave: (v: RuleState["labContinuity"]) => void; onCancel: () => void }): React.ReactElement {
	const [blockLengthHours, setBlock] = useState<number>(value.blockLengthHours);
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSave({ blockLengthHours: Number(blockLengthHours) || 1 });
			}}
			className="space-y-4"
		>
			<Row>
				<Label>Continuous block length (hours)</Label>
				<div className="sm:col-span-2"><Input type="number" value={blockLengthHours} min={1} max={6} onChange={(e) => setBlock(Number(e.target.value))} /></div>
			</Row>
			<DialogFooter>
				<Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
				<Button type="submit">Save</Button>
			</DialogFooter>
		</form>
	);
}

export default RulesTable;


