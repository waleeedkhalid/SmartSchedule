'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface TimelineEventFormProps {
	event?: any
	semester?: string
	onSubmit: (data: any) => Promise<void>
	onCancel?: () => void
}

const USER_ROLES = ['scheduling', 'registrar', 'teaching_load', 'faculty', 'student']

const EVENT_CATEGORIES = [
	{ value: 'registration', label: 'Registration' },
	{ value: 'academic', label: 'Academic' },
	{ value: 'exam', label: 'Exam' },
	{ value: 'administrative', label: 'Administrative' },
]

const NOTIFICATION_PRESETS = [
	{ label: '1 day before', value: 1 },
	{ label: '3 days before', value: 3 },
	{ label: '1 week before', value: 7 },
	{ label: '2 weeks before', value: 14 },
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
		title: event?.title || '',
		description: event?.description || '',
		event_type: event?.event_type || '',
		category: event?.category || 'administrative',
		start_date: event?.start_date
			? new Date(event.start_date).toISOString().slice(0, 16)
			: '',
		end_date: event?.end_date
			? new Date(event.end_date).toISOString().slice(0, 16)
			: '',
		priority: event?.priority || 'medium',
		status: event?.status || 'upcoming',
		requires_action: event?.requires_action ?? false,
		is_deadline: event?.is_deadline ?? false,
		target_roles: event?.target_roles || [],
		notification_days_before: event?.notification_days_before || [7, 3, 1],
	})

	function handleChange(field: string, value: any) {
		setFormData((prev) => ({ ...prev, [field]: value }))
	}

	function toggleRole(role: string) {
		const roles = formData.target_roles.includes(role)
			? formData.target_roles.filter((r: string) => r !== role)
			: [...formData.target_roles, role]
		handleChange('target_roles', roles)
	}

	function toggleNotificationDay(day: number) {
		const days = formData.notification_days_before.includes(day)
			? formData.notification_days_before.filter((d: number) => d !== day)
			: [...formData.notification_days_before, day].sort((a, b) => b - a)
		handleChange('notification_days_before', days)
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setIsSubmitting(true)

		try {
			// Convert date strings to ISO format
			const submitData = {
				...formData,
				start_date: new Date(formData.start_date).toISOString(),
				end_date: new Date(formData.end_date).toISOString(),
			}

			await onSubmit(submitData)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="grid gap-4 md:grid-cols-2">
				{/* Title */}
				<div className="space-y-2 md:col-span-2">
					<Label htmlFor="title">Event Title</Label>
					<Input
						id="title"
						value={formData.title}
						onChange={(e) => handleChange('title', e.target.value)}
						required
						placeholder="e.g., Faculty Availability Submission"
					/>
				</div>

				{/* Description */}
				<div className="space-y-2 md:col-span-2">
					<Label htmlFor="description">Description</Label>
					<Textarea
						id="description"
						value={formData.description}
						onChange={(e) => handleChange('description', e.target.value)}
						placeholder="Provide details about this event..."
						rows={3}
					/>
				</div>

				{/* Event Type */}
				<div className="space-y-2">
					<Label htmlFor="event_type">Event Type</Label>
					<Input
						id="event_type"
						value={formData.event_type}
						onChange={(e) => handleChange('event_type', e.target.value)}
						required
						placeholder="e.g., faculty_availability, registration"
					/>
				</div>

				{/* Category */}
				<div className="space-y-2">
					<Label htmlFor="category">Category</Label>
					<Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{EVENT_CATEGORIES.map((cat) => (
								<SelectItem key={cat.value} value={cat.value}>
									{cat.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Start Date */}
				<div className="space-y-2">
					<Label htmlFor="start_date">Start Date & Time</Label>
					<Input
						id="start_date"
						type="datetime-local"
						value={formData.start_date}
						onChange={(e) => handleChange('start_date', e.target.value)}
						required
					/>
				</div>

				{/* End Date */}
				<div className="space-y-2">
					<Label htmlFor="end_date">End Date & Time</Label>
					<Input
						id="end_date"
						type="datetime-local"
						value={formData.end_date}
						onChange={(e) => handleChange('end_date', e.target.value)}
						required
					/>
				</div>

				{/* Priority */}
				<div className="space-y-2">
					<Label htmlFor="priority">Priority</Label>
					<Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="low">Low</SelectItem>
							<SelectItem value="medium">Medium</SelectItem>
							<SelectItem value="high">High</SelectItem>
							<SelectItem value="critical">Critical</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Status */}
				<div className="space-y-2">
					<Label htmlFor="status">Status</Label>
					<Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="upcoming">Upcoming</SelectItem>
							<SelectItem value="in_progress">In Progress</SelectItem>
							<SelectItem value="completed">Completed</SelectItem>
							<SelectItem value="overdue">Overdue</SelectItem>
							<SelectItem value="cancelled">Cancelled</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Flags */}
			<div className="space-y-3">
				<div className="flex items-center space-x-2">
					<Checkbox
						id="requires_action"
						checked={formData.requires_action}
						onCheckedChange={(checked) => handleChange('requires_action', checked)}
					/>
					<Label htmlFor="requires_action" className="font-normal">
						Requires Action (users must take action)
					</Label>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="is_deadline"
						checked={formData.is_deadline}
						onCheckedChange={(checked) => handleChange('is_deadline', checked)}
					/>
					<Label htmlFor="is_deadline" className="font-normal">
						Hard Deadline (must be met)
					</Label>
				</div>
			</div>

			{/* Target Roles */}
			<div className="space-y-2">
				<Label>Target Roles (who should be notified)</Label>
				<div className="flex flex-wrap gap-2">
					{USER_ROLES.map((role) => (
						<Badge
							key={role}
							variant={formData.target_roles.includes(role) ? 'default' : 'outline'}
							className="cursor-pointer"
							onClick={() => toggleRole(role)}
						>
							{role}
							{formData.target_roles.includes(role) && (
								<X className="ml-1 h-3 w-3" />
							)}
						</Badge>
					))}
				</div>
			</div>

			{/* Notification Days */}
			<div className="space-y-2">
				<Label>Send Notifications</Label>
				<div className="flex flex-wrap gap-2">
					{NOTIFICATION_PRESETS.map((preset) => (
						<Badge
							key={preset.value}
							variant={
								formData.notification_days_before.includes(preset.value)
									? 'default'
									: 'outline'
							}
							className="cursor-pointer"
							onClick={() => toggleNotificationDay(preset.value)}
						>
							{preset.label}
							{formData.notification_days_before.includes(preset.value) && (
								<X className="ml-1 h-3 w-3" />
							)}
						</Badge>
					))}
				</div>
				<p className="text-sm text-muted-foreground">
					Selected: {formData.notification_days_before.sort((a: number, b: number) => b - a).join(', ')} days before
				</p>
			</div>

			{/* Actions */}
			<div className="flex justify-end gap-2">
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

