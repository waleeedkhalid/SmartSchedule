"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Save, RotateCcw, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { DayAvailability, TimeSlot } from "@/lib/db/faculty";

interface FacultyAvailabilityGridProps {
  instructorId: string;
  initialPreferredTimes?: DayAvailability[];
  initialUnavailableTimes?: DayAvailability[];
  maxLoadPerWeek?: number;
}

type SelectionMode = 'preferred' | 'unavailable' | null;

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

export function FacultyAvailabilityGrid({
  instructorId,
  initialPreferredTimes = [],
  initialUnavailableTimes = [],
  maxLoadPerWeek = 12,
}: FacultyAvailabilityGridProps) {
  const [preferredTimes, setPreferredTimes] = useState<DayAvailability[]>(initialPreferredTimes);
  const [unavailableTimes, setUnavailableTimes] = useState<DayAvailability[]>(initialUnavailableTimes);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check if a time slot is preferred
  const isPreferred = (day: string, time: string): boolean => {
    const dayData = preferredTimes.find(d => d.day === day);
    if (!dayData) return false;
    
    return dayData.slots.some(slot => 
      time >= slot.start && time < slot.end
    );
  };

  // Check if a time slot is unavailable
  const isUnavailable = (day: string, time: string): boolean => {
    const dayData = unavailableTimes.find(d => d.day === day);
    if (!dayData) return false;
    
    return dayData.slots.some(slot => 
      time >= slot.start && time < slot.end
    );
  };

  // Toggle time slot
  const toggleTimeSlot = (day: string, time: string) => {
    if (!selectionMode) return;
    
    setHasChanges(true);
    
    if (selectionMode === 'preferred') {
      // Remove from unavailable if present
      setUnavailableTimes(prev => 
        prev.map(d => d.day === day ? {
          ...d,
          slots: d.slots.filter(s => !(time >= s.start && time < s.end))
        } : d).filter(d => d.slots.length > 0)
      );
      
      // Toggle preferred
      if (isPreferred(day, time)) {
        // Remove
        setPreferredTimes(prev => 
          prev.map(d => d.day === day ? {
            ...d,
            slots: d.slots.filter(s => !(time >= s.start && time < s.end))
          } : d).filter(d => d.slots.length > 0)
        );
      } else {
        // Add
        setPreferredTimes(prev => {
          const existing = prev.find(d => d.day === day);
          if (existing) {
            return prev.map(d => d.day === day ? {
              ...d,
              slots: [...d.slots, { start: time, end: getNextHour(time), type: 'preferred' }]
            } : d);
          } else {
            return [...prev, {
              day,
              slots: [{ start: time, end: getNextHour(time), type: 'preferred' }]
            }];
          }
        });
      }
    } else if (selectionMode === 'unavailable') {
      // Remove from preferred if present
      setPreferredTimes(prev => 
        prev.map(d => d.day === day ? {
          ...d,
          slots: d.slots.filter(s => !(time >= s.start && time < s.end))
        } : d).filter(d => d.slots.length > 0)
      );
      
      // Toggle unavailable
      if (isUnavailable(day, time)) {
        // Remove
        setUnavailableTimes(prev => 
          prev.map(d => d.day === day ? {
            ...d,
            slots: d.slots.filter(s => !(time >= s.start && time < s.end))
          } : d).filter(d => d.slots.length > 0)
        );
      } else {
        // Add
        setUnavailableTimes(prev => {
          const existing = prev.find(d => d.day === day);
          if (existing) {
            return prev.map(d => d.day === day ? {
              ...d,
              slots: [...d.slots, { start: time, end: getNextHour(time), type: 'unavailable' }]
            } : d);
          } else {
            return [...prev, {
              day,
              slots: [{ start: time, end: getNextHour(time), type: 'unavailable' }]
            }];
          }
        });
      }
    }
  };

  // Get next hour
  const getNextHour = (time: string): string => {
    const [hours] = time.split(':').map(Number);
    const nextHour = hours + 1;
    return `${String(nextHour).padStart(2, '0')}:00`;
  };

  // Handle mouse events for dragging
  const handleMouseDown = (day: string, time: string) => {
    setIsDragging(true);
    toggleTimeSlot(day, time);
  };

  const handleMouseEnter = (day: string, time: string) => {
    if (isDragging) {
      toggleTimeSlot(day, time);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse up listener
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Save availability
  // DEMO MODE: Shows toast notification instead of actual save
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // DEMO MODE: Simulate save with delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('In Demo Mode: Availability preferences saved (Changes are not persisted)');
      setHasChanges(false);
      
      // In production, this would be the API call:
      /*
      const response = await fetch('/api/faculty/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferred_times: preferredTimes,
          unavailable_times: unavailableTimes,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }
      
      toast.success('Availability preferences saved successfully');
      setHasChanges(false);
      */
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to initial state
  const handleReset = () => {
    setPreferredTimes(initialPreferredTimes);
    setUnavailableTimes(initialUnavailableTimes);
    setHasChanges(false);
    toast.info('Availability reset to saved state');
  };

  // Clear all selections
  const handleClearAll = () => {
    setPreferredTimes([]);
    setUnavailableTimes([]);
    setHasChanges(true);
    toast.info('All selections cleared');
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Select a mode below, then click or drag on the grid to mark your preferred or unavailable times.
          Green cells indicate preferred times, red cells indicate unavailable times.
        </AlertDescription>
      </Alert>

      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Selection Mode</CardTitle>
          <CardDescription>Choose whether to mark times as preferred or unavailable</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant={selectionMode === 'preferred' ? 'default' : 'outline'}
            onClick={() => setSelectionMode('preferred')}
            className="bg-green-600 hover:bg-green-700"
          >
            Preferred Times
          </Button>
          <Button
            variant={selectionMode === 'unavailable' ? 'default' : 'outline'}
            onClick={() => setSelectionMode('unavailable')}
            className="bg-red-600 hover:bg-red-700"
          >
            Unavailable Times
          </Button>
          <Button
            variant="outline"
            onClick={() => setSelectionMode(null)}
          >
            Clear Selection Mode
          </Button>
        </CardContent>
      </Card>

      {/* Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Availability Grid</CardTitle>
          <CardDescription>
            Current load limit: {maxLoadPerWeek} sections per week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="grid" style={{
                gridTemplateColumns: `100px repeat(${DAYS.length}, minmax(80px, 1fr))`
              }}>
                {/* Header Row */}
                <div className="p-2 font-semibold border-b border-r"></div>
                {DAYS.map(day => (
                  <div key={day} className="p-2 font-semibold text-center border-b">
                    {day.slice(0, 3)}
                  </div>
                ))}
                
                {/* Time Rows */}
                {TIME_SLOTS.map(time => (
                  <React.Fragment key={time}>
                    <div key={`${time}-label`} className="p-2 text-sm font-medium border-r">
                      {time}
                    </div>
                    {DAYS.map(day => {
                      const preferred = isPreferred(day, time);
                      const unavailable = isUnavailable(day, time);
                      
                      return (
                        <div
                          key={`${day}-${time}`}
                          className={`
                            p-2 border cursor-pointer transition-colors select-none
                            ${preferred ? 'bg-green-200 dark:bg-green-900' : ''}
                            ${unavailable ? 'bg-red-200 dark:bg-red-900' : ''}
                            ${!preferred && !unavailable ? 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                          `}
                          onMouseDown={() => handleMouseDown(day, time)}
                          onMouseEnter={() => handleMouseEnter(day, time)}
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {preferredTimes.reduce((sum, d) => sum + d.slots.length, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Preferred time slots</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {unavailableTimes.reduce((sum, d) => sum + d.slots.length, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Unavailable time slots</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {maxLoadPerWeek}
            </div>
            <p className="text-sm text-muted-foreground">Max sections per week</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
        
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={!hasChanges || isSaving}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Saved
        </Button>
        
        <Button
          variant="destructive"
          onClick={handleClearAll}
          disabled={isSaving}
        >
          Clear All
        </Button>
      </div>
    </div>
  );
}

