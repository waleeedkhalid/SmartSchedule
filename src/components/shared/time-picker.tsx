import * as React from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
  minTime?: Date;
  maxTime?: Date;
  disabled?: boolean;
}

export function TimePicker({
  date,
  setDate,
  className,
  minTime,
  maxTime,
  disabled = false,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [hour, setHour] = React.useState<number>(date?.getHours() || 0);
  const [minute, setMinute] = React.useState<number>(date?.getMinutes() || 0);
  const [isAM, setIsAM] = React.useState<boolean>(
    date ? date.getHours() < 12 : true
  );

  // Update internal state when the date prop changes
  React.useEffect(() => {
    if (date) {
      setHour(date.getHours() % 12 || 12);
      setMinute(date.getMinutes());
      setIsAM(date.getHours() < 12);
    }
  }, [date]);

  // Handle hour change
  const handleHourChange = (newHour: number) => {
    setHour(newHour);
    updateDate(newHour, minute, isAM);
  };

  // Handle minute change
  const handleMinuteChange = (newMinute: number) => {
    setMinute(newMinute);
    updateDate(hour, newMinute, isAM);
  };

  // Toggle AM/PM
  const toggleAMPM = () => {
    const newIsAM = !isAM;
    setIsAM(newIsAM);
    updateDate(hour, minute, newIsAM);
  };

  // Update the date and call the onChange handler
  const updateDate = (h: number, m: number, isAm: boolean) => {
    if (h === 12) h = 0; // Convert 12 to 0 for calculations
    const hours24 = isAm ? h : h + 12;
    const newDate = new Date();
    newDate.setHours(hours24, m, 0, 0);
    
    // Check if the new time is within the allowed range
    if (minTime && newDate < minTime) {
      setDate(minTime);
    } else if (maxTime && newDate > maxTime) {
      setDate(maxTime);
    } else {
      setDate(newDate);
    }
  };

  // Generate time options for the dropdown
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {date ? format(date, 'h:mm a') : <span>Pick a time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="flex items-center space-x-2">
          {/* Hours */}
          <div className="grid grid-cols-3 gap-1 text-center">
            {hours.map((h) => (
              <Button
                key={h}
                variant={h === hour ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleHourChange(h)}
              >
                {h}
              </Button>
            ))}
          </div>
          
          {/* Minutes */}
          <div className="grid grid-cols-4 gap-1 text-center">
            {minutes.map((m) => (
              <Button
                key={m}
                variant={m === minute ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0 text-xs"
                onClick={() => handleMinuteChange(m)}
              >
                {m.toString().padStart(2, '0')}
              </Button>
            ))}
          </div>
          
          {/* AM/PM Toggle */}
          <div className="grid grid-cols-1 gap-1">
            <Button
              variant={isAM ? 'default' : 'ghost'}
              size="sm"
              className="h-8 w-12 p-0 text-xs"
              onClick={toggleAMPM}
            >
              AM
            </Button>
            <Button
              variant={!isAM ? 'default' : 'ghost'}
              size="sm"
              className="h-8 w-12 p-0 text-xs"
              onClick={toggleAMPM}
            >
              PM
            </Button>
          </div>
        </div>
        
        {/* Current Time Display */}
        <div className="mt-2 pt-2 border-t text-center text-sm">
          {date ? format(date, 'h:mm a') : 'No time selected'}
        </div>
        
        {/* Done Button */}
        <div className="mt-2 flex justify-end">
          <Button
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 text-xs"
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
