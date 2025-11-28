"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const changeRequestSchema = z.object({
  request_type: z.enum(['REASSIGN_INSTRUCTOR', 'CHANGE_TIME_SLOT', 'ADJUST_CAPACITY', 'CHANGE_ROOM']),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500),
  // Dynamic fields based on request type
  instructor_id: z.string().optional(),
  capacity: z.number().optional(),
  room_number: z.string().optional(),
});

type ChangeRequestFormData = z.infer<typeof changeRequestSchema>;

interface ChangeRequestFormProps {
  open: boolean;
  onClose: () => void;
  sectionId: string;
  sectionDetails: {
    course_code: string;
    section_number?: string;
    current_instructor?: string;
    current_capacity?: number;
    current_room?: string;
  };
  scheduleVersionId: string;
  onSuccess?: () => void;
}

export function ChangeRequestForm({
  open,
  onClose,
  sectionId,
  sectionDetails,
  scheduleVersionId,
  onSuccess,
}: ChangeRequestFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [requestType, setRequestType] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ChangeRequestFormData>({
    resolver: zodResolver(changeRequestSchema),
  });

  const onSubmit = async (data: ChangeRequestFormData) => {
    setIsSubmitting(true);
    setValidationResult(null);

    try {
      // Build changes object based on request type
      const changes: any = { from: {}, to: {} };

      switch (data.request_type) {
        case 'REASSIGN_INSTRUCTOR':
          changes.from.instructor_id = sectionDetails.current_instructor;
          changes.to.instructor_id = data.instructor_id;
          break;
        
        case 'ADJUST_CAPACITY':
          changes.from.capacity = sectionDetails.current_capacity;
          changes.to.capacity = data.capacity;
          break;
        
        case 'CHANGE_ROOM':
          changes.from.room_number = sectionDetails.current_room;
          changes.to.room_number = data.room_number;
          break;
        
        case 'CHANGE_TIME_SLOT':
          // Time slot changes would require more complex UI
          toast({
            title: "Not Implemented",
            description: "Time slot changes require a more complex interface. Please contact the scheduling committee directly.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
      }

      const response = await fetch('/api/committee/teaching-load/change-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule_version_id: scheduleVersionId,
          section_id: sectionId,
          request_type: data.request_type,
          changes,
          reason: data.reason,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit change request');
      }

      setValidationResult(result.validation);

      if (result.validation.isValid) {
        toast({
          title: "Request Submitted",
          description: result.message,
        });
        reset();
        onSuccess?.();
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        toast({
          title: "Validation Issues",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting change request:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to submit request',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestTypeChange = (value: string) => {
    setRequestType(value);
    setValue('request_type', value as any);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit Change Request</DialogTitle>
          <DialogDescription>
            Request changes to {sectionDetails.course_code} {sectionDetails.section_number || ''}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Request Type */}
          <div className="space-y-2">
            <Label htmlFor="request_type">Change Type</Label>
            <Select onValueChange={handleRequestTypeChange} value={requestType}>
              <SelectTrigger>
                <SelectValue placeholder="Select change type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REASSIGN_INSTRUCTOR">Reassign Instructor</SelectItem>
                <SelectItem value="ADJUST_CAPACITY">Adjust Capacity</SelectItem>
                <SelectItem value="CHANGE_ROOM">Change Room</SelectItem>
              </SelectContent>
            </Select>
            {errors.request_type && (
              <p className="text-sm text-destructive">{errors.request_type.message}</p>
            )}
          </div>

          {/* Dynamic Fields Based on Request Type */}
          {requestType === 'REASSIGN_INSTRUCTOR' && (
            <div className="space-y-2">
              <Label htmlFor="instructor_id">New Instructor ID</Label>
              <Input
                id="instructor_id"
                {...register('instructor_id')}
                placeholder="Enter instructor ID"
              />
              <p className="text-xs text-muted-foreground">
                Current: {sectionDetails.current_instructor || 'Not assigned'}
              </p>
            </div>
          )}

          {requestType === 'ADJUST_CAPACITY' && (
            <div className="space-y-2">
              <Label htmlFor="capacity">New Capacity</Label>
              <Input
                id="capacity"
                type="number"
                {...register('capacity', { valueAsNumber: true })}
                placeholder="Enter new capacity"
              />
              <p className="text-xs text-muted-foreground">
                Current capacity: {sectionDetails.current_capacity || 'Not set'}
              </p>
            </div>
          )}

          {requestType === 'CHANGE_ROOM' && (
            <div className="space-y-2">
              <Label htmlFor="room_number">New Room Number</Label>
              <Input
                id="room_number"
                {...register('room_number')}
                placeholder="Enter room number"
              />
              <p className="text-xs text-muted-foreground">
                Current room: {sectionDetails.current_room || 'Not assigned'}
              </p>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Change</Label>
            <Textarea
              id="reason"
              {...register('reason')}
              placeholder="Explain why this change is needed (10-500 characters)"
              rows={4}
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason.message}</p>
            )}
          </div>

          {/* Validation Result */}
          {validationResult && (
            <Alert variant={validationResult.isValid ? "default" : "destructive"}>
              {validationResult.isValid ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">
                    {validationResult.isValid ? 'Validation Passed' : 'Validation Failed'}
                  </p>
                  {validationResult.error && (
                    <p className="text-sm">{validationResult.error}</p>
                  )}
                  {validationResult.affectsIrregular && (
                    <div className="mt-2">
                      <p className="text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Affects {validationResult.affectedStudents?.length || 0} irregular student(s)
                      </p>
                    </div>
                  )}
                  {validationResult.warnings && validationResult.warnings.length > 0 && (
                    <ul className="list-disc list-inside text-sm mt-2">
                      {validationResult.warnings.map((warning: string, idx: number) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !requestType}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

