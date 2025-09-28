import * as React from 'react';
import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DayOfWeek } from '@/types/rules';

type DayOfWeekOption = {
  value: DayOfWeek;
  label: string;
};

const daysOfWeek: DayOfWeekOption[] = [
  { value: DayOfWeek.MONDAY, label: 'Mon' },
  { value: DayOfWeek.TUESDAY, label: 'Tue' },
  { value: DayOfWeek.WEDNESDAY, label: 'Wed' },
  { value: DayOfWeek.THURSDAY, label: 'Thu' },
  { value: DayOfWeek.FRIDAY, label: 'Fri' },
  { value: DayOfWeek.SATURDAY, label: 'Sat' },
  { value: DayOfWeek.SUNDAY, label: 'Sun' },
];

interface DayPickerProps {
  selectedDays: DayOfWeek[];
  onSelectedDaysChange: (days: DayOfWeek[]) => void;
  className?: string;
  disabled?: boolean;
}

export function DayPicker({
  selectedDays,
  onSelectedDaysChange,
  className,
  disabled = false,
}: DayPickerProps) {
  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      onSelectedDaysChange(selectedDays.filter((d) => d !== day));
    } else {
      onSelectedDaysChange([...selectedDays, day]);
    }
  };

  const selectAllDays = () => {
    if (selectedDays.length === daysOfWeek.length) {
      onSelectedDaysChange([]);
    } else {
      onSelectedDaysChange(daysOfWeek.map((day) => day.value));
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={selectAllDays}
        className="h-8 w-full text-xs"
        disabled={disabled}
      >
        {selectedDays.length === daysOfWeek.length ? 'Clear All' : 'Select All'}
      </Button>
      <div className="grid grid-cols-7 gap-1">
        {daysOfWeek.map((day) => (
          <Button
            key={day.value}
            type="button"
            variant={selectedDays.includes(day.value) ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'h-8 w-full p-0 text-xs font-normal',
              selectedDays.includes(day.value) && 'bg-primary/90 hover:bg-primary'
            )}
            onClick={() => toggleDay(day.value)}
            disabled={disabled}
          >
            {selectedDays.includes(day.value) && (
              <Check className="mr-1 h-3 w-3" />
            )}
            {day.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
