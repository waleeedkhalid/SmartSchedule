'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface TimelineEventFormProps {
	event?: any
	semester?: string
	onSubmit: (data: any) => Promise<void>
	onCancel?: () => void
}

const USER_ROLES = ['scheduling', 'registrar', 'teaching_load', 'faculty', 'student']

const EVENT_TYPES = [
	{ value: 'registration', label: 'Registration Period' },
	{ value: 'add_drop', label: 'Add/Drop Period' },
	{ value: 'midterm_exams', label: 'Midterm Exams' },
	{ value: 'final_exams', label: 'Final Exams' },
	{ value: 'grades_due', label: 'Grade Submission Deadline' },
	{ value: 'holiday', label: 'Holiday/Break' },
	{ value: 'faculty_availability', label: 'Faculty Availability Submission' },
	{ value: 'schedule_publication', label: 'Schedule Publication' },
]

export function TimelineEventForm({
	event,
	semester,
	onSubmit,
	onCancel,
}: TimelineEventFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [formData, setFormData] = useState({
		term_code: event?.term_code || semester || '',
		event_type: event?.event_type || '',
		title: event?.title || '', // Will be auto-filled based on event type
		end_date: event?.end_date
			? new Date(event.end_date).toISOString().slice(0, 16)
			: '',
		target_roles: event?.target_roles || [],
		// Default values for hidden fields
		start_date: event?.start_date
			? new Date(event.start_date).toISOString().slice(0, 16)
			: new Date().toISOString().slice(0, 16), // Default to now if new
		description: event?.description || '',
		category: event?.category || 'administrative',
		priority: event?.priority || 'medium',
		status: event?.status || 'upcoming',
		requires_action: event?.requires_action ?? true,
		is_deadline: event?.is_deadline ?? true,
		notification_days_before: event?.notification_days_before || [7, 3, 1],
	})

	function handleChange(field: string, value: any) {
		setFormData((prev) => {
			const updates: any = { [field]: value }
			
			// Auto-fill title based on event type if title is empty or matches a type label
			if (field === 'event_type') {
				const typeOption = EVENT_TYPES.find(t => t.value === value)
				if (typeOption) {
					updates.title = typeOption.label
					
					// Set appropriate category
					if (value.includes('exam') || value.includes('grade')) {
						updates.category = 'exam'
					} else if (value === 'registration' || value === 'add_drop') {
						updates.category = 'registration'
					} else {
						updates.category = 'administrative'
					}
				}
			}
			
			// If setting deadline, sync start date to same day if not set
			if (field === 'end_date' && !prev.start_date) {
				updates.start_date = value
			}

			return { ...prev, ...updates }
		})
	}

	function toggleRole(role: string) {
		const roles = formData.target_roles.includes(role)
			? formData.target_roles.filter((r: string) => r !== role)
			: [...formData.target_roles, role]
		handleChange('target_roles', roles)
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setIsSubmitting(true)

		try {
			// Use end_date as start_date for deadlines (single point in time)
			// unless start_date was explicitly set earlier
			const startDate = formData.start_date || formData.end_date;

			const submitData = {
				...formData,
				start_date: new Date(startDate).toISOString(),
				end_date: new Date(formData.end_date).toISOString(),
			}

			await onSubmit(submitData)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="grid gap-4">
				{/* Event Type */}
				<div className="space-y-2">
					<Label htmlFor="event_type">Event Type</Label>
					<Select 
						value={formData.event_type} 
						onValueChange={(value) => handleChange('event_type', value)}
						required
					>
						<SelectTrigger>
							<SelectValue placeholder="Select event type" />
						</SelectTrigger>
						<SelectContent>
							{EVENT_TYPES.map((type) => (
								<SelectItem key={type.value} value={type.value}>
									{type.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Deadline Date */}
				<div className="space-y-2">
					<Label htmlFor="end_date">Deadline</Label>
					<Input
						id="end_date"
						type="datetime-local"
						value={formData.end_date}
						onChange={(e) => handleChange('end_date', e.target.value)}
						required
					/>
					<p className="text-xs text-muted-foreground">
						When is this due or when does it happen?
					</p>
				</div>

				{/* Target Roles */}
				<div className="space-y-2">
					<Label>Who is this for? (Target Roles)</Label>
					<div className="flex flex-wrap gap-2 border rounded-md p-3">
						{USER_ROLES.map((role) => (
							<Badge
								key={role}
								variant={formData.target_roles.includes(role) ? 'default' : 'outline'}
								className="cursor-pointer hover:bg-primary/90"
								onClick={() => toggleRole(role)}
							>
								{role}
								{formData.target_roles.includes(role) ? (
									<X className="ml-1 h-3 w-3" />
								) : (
									<span className="ml-1 opacity-50">+</span>
								)}
							</Badge>
						))}
					</div>
					<p className="text-xs text-muted-foreground">
						Click to select roles that need to see this event
					</p>
				</div>
			</div>

			{/* Actions */}
			<div className="flex justify-end gap-2 pt-4">
				{onCancel && (
					<Button type="button" variant="outline" onClick={onCancel}>
						Cancel
					</Button>
				)}
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
				</Button>
			</div>
		</form>
	)
}

