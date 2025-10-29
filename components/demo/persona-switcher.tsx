'use client';

import { useDemoContext } from '@/lib/demo/demo-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  GraduationCap,
  Users,
  Calendar,
  BarChart3,
  UserCog,
  ChevronRight,
} from 'lucide-react';
import { DemoRole } from '@/lib/demo/mock-data';
import { cn } from '@/lib/utils';

const personaConfig = {
  student: {
    icon: GraduationCap,
    title: 'Student',
    description: 'Register for electives, view schedule & exams',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
  faculty: {
    icon: Users,
    title: 'Faculty',
    description: 'View teaching schedule, set availability, provide feedback',
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
  },
  scheduling: {
    icon: Calendar,
    title: 'Scheduling Committee',
    description: 'Generate schedules, resolve conflicts, manage data',
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
  },
  teaching_load: {
    icon: BarChart3,
    title: 'Teaching Load Committee',
    description: 'Review instructor loads, balance assignments',
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
  },
  registrar: {
    icon: UserCog,
    title: 'Registrar',
    description: 'Manage irregular students, manual registrations',
    color: 'pink',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-200',
  },
};

interface PersonaSwitcherProps {
  variant?: 'compact' | 'full';
}

export function PersonaSwitcher({ variant = 'full' }: PersonaSwitcherProps) {
  const { currentPersona, setPersona } = useDemoContext();

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-2">
        {Object.entries(personaConfig).map(([key, config]) => {
          const Icon = config.icon;
          const isActive = currentPersona === key;
          
          return (
            <Button
              key={key}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPersona(key as DemoRole)}
              className={cn(
                'transition-all',
                isActive && 'shadow-md'
              )}
            >
              <Icon className="h-4 w-4 mr-2" />
              {config.title}
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <Card className="shadow-lg border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Switch Persona
        </CardTitle>
        <CardDescription>
          Experience SmartSchedule from different user perspectives
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(personaConfig).map(([key, config]) => {
            const Icon = config.icon;
            const isActive = currentPersona === key;
            
            return (
              <button
                key={key}
                onClick={() => setPersona(key as DemoRole)}
                className={cn(
                  'relative p-4 rounded-lg border-2 transition-all text-left',
                  'hover:shadow-md hover:scale-105',
                  isActive
                    ? `${config.borderColor} ${config.bgColor} shadow-md scale-105`
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                {isActive && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                )}
                
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={cn(
                    'p-3 rounded-full',
                    isActive ? config.bgColor : 'bg-gray-100'
                  )}>
                    <Icon className={cn(
                      'h-6 w-6',
                      isActive ? config.textColor : 'text-gray-600'
                    )} />
                  </div>
                  
                  <div>
                    <p className={cn(
                      'font-semibold text-sm',
                      isActive ? config.textColor : 'text-gray-900'
                    )}>
                      {config.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {config.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Current View:</strong>{' '}
            {personaConfig[currentPersona].title} Dashboard
          </p>
          <p className="text-xs text-blue-700 mt-1">
            {personaConfig[currentPersona].description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Mini indicator for current persona (for navigation)
export function PersonaIndicator() {
  const { currentPersona } = useDemoContext();
  const config = personaConfig[currentPersona];
  const Icon = config.icon;
  
  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
      config.bgColor,
      config.textColor,
      config.borderColor,
      'border'
    )}>
      <Icon className="h-4 w-4" />
      <span>{config.title}</span>
    </div>
  );
}

