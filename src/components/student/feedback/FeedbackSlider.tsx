"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export type FeedbackSliderProps = {
	id: string;
	label: string;
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
	leftHint?: string;
	rightHint?: string;
};

export function FeedbackSlider({
	id,
	label,
	value,
	onChange,
	min = 1,
	max = 5,
	step = 1,
	leftHint = "1 (Poor)",
	rightHint = "5 (Excellent)",
}: FeedbackSliderProps): React.ReactElement {
	return (
		<div>
			<Label htmlFor={id} className="block mb-2">
				{label}: <strong>{value}/{max}</strong>
			</Label>
			<div className="flex items-center gap-4">
				<span className="text-sm text-muted-foreground">{leftHint}</span>
				<Slider
					id={id}
					min={min}
					max={max}
					step={step}
					value={[value]}
					onValueChange={([v]) => onChange(v)}
					className="flex-1"
				/>
				<span className="text-sm text-muted-foreground">{rightHint}</span>
			</div>
		</div>
	);
}

export default FeedbackSlider;
