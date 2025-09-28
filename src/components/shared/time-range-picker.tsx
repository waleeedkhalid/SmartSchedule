import * as React from 'react';
import { format, parse } from 'date-fns';
import { Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { TimePicker } from './time-picker';

export interface TimeRange {
  start: string; // Format: "HH:MM"
  end: string;   // Format: "HH:MM"
}

interface TimeRangePickerProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
  className?: string;
  disabled?: boolean;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function TimeRangePicker({
  value,
  onChange,
  className,
  disabled = false,
  align = 'start',
  side = 'bottom',
}: TimeRangePickerProps) {
  const [startTime, setStartTime] = React.useState<string>(value.start);
  const [endTime, setEndTime] = React.useState<string>(value.end);
  const [isOpen, setIsOpen] = React.useState(false);

  // Parse time strings to Date objects for the time picker
  const parseTimeString = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Format Date object to time string
  const formatTime = (date: Date): string => {
    return format(date, 'HH:mm');
  };

  // Handle start time change
  const handleStartTimeChange = (date: Date | undefined) => {
    if (!date) return;
    const newStartTime = formatTime(date);
    setStartTime(newStartTime);
    
    // If end time is before start time, update it to be 1 hour after start time
    const startDate = parse(newStartTime, 'HH:mm', new Date());
    const endDate = parse(endTime, 'HH:mm', new Date());
    
    if (endDate <= startDate) {
      const newEndDate = new Date(startDate);
      newEndDate.setHours(newEndDate.getHours() + 1);
      const newEndTime = formatTime(newEndDate);
      setEndTime(newEndTime);
      onChange({ start: newStartTime, end: newEndTime });
    } else {
      onChange({ start: newStartTime, end: endTime });
    }
  };

  // Handle end time change
  const handleEndTimeChange = (date: Date | undefined) => {
    if (!date) return;
    const newEndTime = formatTime(date);
    setEndTime(newEndTime);
    
    // If start time is after end time, update it to be 1 hour before end time
    const startDate = parse(startTime, 'HH:mm', new Date());
    const endDate = parse(newEndTime, 'HH:mm', new Date());
    
    if (endDate <= startDate) {
      const newStartDate = new Date(endDate);
      newStartDate.setHours(newStartDate.getHours() - 1);
      const newStartTime = formatTime(newStartDate);
      setStartTime(newStartTime);
      onChange({ start: newStartTime, end: newEndTime });
    } else {
      onChange({ start: startTime, end: newEndTime });
    }
  };

  // Format time for display (e.g., "9:00 AM - 5:00 PM")
  const formatDisplayTime = (time: string) => {
    return format(parse(time, 'HH:mm', new Date()), 'h:mm a');
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !value && 'text-muted-foreground'
            )}
            disabled={disabled}
          >
            <Clock className="mr-2 h-4 w-4" />
            {value ? (
              <span>
                {formatDisplayTime(value.start)} - {formatDisplayTime(value.end)}
              </span>
            ) : (
              <span>Pick a time range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align={align} side={side}>
          <div className="flex items-center space-x-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-center">Start Time</p>
              <TimePicker
                date={parseTimeString(startTime)}
                setDate={handleStartTimeChange}
                className="border rounded-md"
              />
            </div>
            <div className="flex items-center h-8">
              <span className="text-muted-foreground">to</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-center">End Time</p>
              <TimePicker
                date={parseTimeString(endTime)}
                setDate={handleEndTimeChange}
                className="border rounded-md"
                minTime={parseTimeString(startTime)}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-xs h-8"
            >
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function TimeRangeDisplay({ range, className }: { range: TimeRange; className?: string }) {
  const formatTime = (time: string) => {
    return format(parse(time, 'HH:mm', new Date()), 'h:mm a');
  };

  return (
    <div className={cn('flex items-center text-sm', className)}>
      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
      <span>
        {formatTime(range.start)} - {formatTime(range.end)}
      </span>
    </div>
  );
}
