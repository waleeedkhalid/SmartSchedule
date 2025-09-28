import * as React from 'react';
import { AlertCircle, BookOpen, Calendar, ChevronsUpDown, Clock, Home, Star, Trash2, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { TimeRangePicker } from './time-range-picker';
import { DayPicker } from './day-picker';
import { 
  DayOfWeek, 
  RuleType, 
  type ScheduleRule, 
  type TimeBlockRule, 
  type DayRestrictionRule
} from '@/types/rules';

type TimeRange = {
  start: string;
  end: string;
};

type RuleOption = {
  value: string;
  label: string;
  description: string;
  type: RuleType;
  icon: React.ReactNode;
};

interface RuleSelectorProps {
  selectedRules: ScheduleRule[];
  onRulesChange: (rules: ScheduleRule[]) => void;
  className?: string;
  disabled?: boolean;
}

const ruleOptions: RuleOption[] = [
  {
    value: 'time-block',
    label: 'Time Block',
    description: 'Block out specific time ranges',
    type: RuleType.TimeBlock,
    icon: <Clock className="h-4 w-4" />,
  },
  {
    value: 'day-restriction',
    label: 'Day Restriction',
    description: 'Restrict scheduling on specific days',
    type: RuleType.DayRestriction,
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    value: 'faculty-availability',
    label: 'Faculty Availability',
    description: 'Set faculty availability',
    type: RuleType.FacultyAvailability,
    icon: <User className="h-4 w-4" />,
  },
  {
    value: 'room-availability',
    label: 'Room Availability',
    description: 'Set room availability',
    type: RuleType.RoomAvailability,
    icon: <Home className="h-4 w-4" />,
  },
  {
    value: 'course-prerequisite',
    label: 'Course Prerequisite',
    description: 'Enforce course prerequisites',
    type: RuleType.CoursePrerequisite,
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    value: 'faculty-load',
    label: 'Faculty Load',
    description: 'Set faculty teaching load limits',
    type: RuleType.FacultyLoad,
    icon: <Users className="h-4 w-4" />,
  },
  {
    value: 'student-conflict',
    label: 'Student Conflict',
    description: 'Prevent scheduling conflicts for students',
    type: RuleType.StudentConflict,
    icon: <AlertCircle className="h-4 w-4" />,
  },
  {
    value: 'preferred-time',
    label: 'Preferred Time',
    description: 'Set preferred time slots',
    type: RuleType.PreferredTime,
    icon: <Star className="h-4 w-4" />,
  },
];

export const RuleSelector = ({ selectedRules, onRulesChange, className, disabled = false }: RuleSelectorProps) => {
  const [open, setOpen] = React.useState(false);
  const [selectedRuleType, setSelectedRuleType] = React.useState<RuleType | null>(null);
  const [ruleName, setRuleName] = React.useState('');
  const [ruleDescription, setRuleDescription] = React.useState('');
  const [rulePriority] = React.useState(5);
  const [newRule, setNewRule] = React.useState<Partial<ScheduleRule> | null>(null);
  const [timeRange, setTimeRange] = React.useState<TimeRange>({ start: '09:00', end: '17:00' });
  const [selectedDays, setSelectedDays] = React.useState<DayOfWeek[]>([]);

  // Get rule option by type
  const getRuleOption = (type: RuleType) => {
    return ruleOptions.find((option) => option.type === type);
  };

  // Handle adding a new rule
  const handleAddRule = (ruleType: RuleType) => {
    const ruleOption = getRuleOption(ruleType);
    if (!ruleOption) return;

    const baseRule: Partial<ScheduleRule> = {
      id: `rule-${Date.now()}`,
      type: ruleType,
      name: ruleOption.label,
      isActive: true,
      priority: 5,
    };

    // Set default values based on rule type
  switch (ruleType) {
    case RuleType.TimeBlock:
      setNewRule({
        ...baseRule,
        timeRanges: [
          {
            days: selectedDays,
            timeRange: timeRange,
          },
        ],
        blockType: 'BLACKLIST',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user',
        updatedBy: 'user',
      } as TimeBlockRule);
      break;
    case RuleType.DayRestriction:
      setNewRule({
        ...baseRule,
        restrictedDays: selectedDays,
        restrictionType: 'BLACKLIST',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user',
        updatedBy: 'user',
      } as DayRestrictionRule);
      break;
    default:
      // Default case for other rule types
      setNewRule({
        ...baseRule,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user',
        updatedBy: 'user',
      } as ScheduleRule);
      break;
  }
  };

  // handleRuleTypeChange function has been removed as it was not being used
  // It can be re-implemented in the future if needed

  // Toggle rule active state
  const toggleRuleActive = (ruleId: string) => {
    onRulesChange(
      selectedRules.map((rule) =>
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  };

  // Update rule priority
  const updateRulePriority = (ruleId: string, priority: number) => {
    onRulesChange(
      selectedRules.map((rule) =>
        rule.id === ruleId ? { ...rule, priority } : rule
      )
    );
  };

  // Remove a rule
  const handleRemoveRule = (ruleId: string) => {
    onRulesChange(selectedRules.filter((rule) => rule.id !== ruleId));
  };

  // Handle saving a new rule
  const handleSaveRule = () => {
    if (!newRule || !selectedRuleType) return;

    const updatedRule: ScheduleRule = {
      ...newRule,
      id: `rule-${Date.now()}`,
      type: selectedRuleType,
      name: ruleName || newRule.name || 'New Rule',
      description: ruleDescription || newRule.description || '',
      priority: rulePriority,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user',
      updatedBy: 'user'
    } as ScheduleRule;

    onRulesChange([...selectedRules, updatedRule]);
    setNewRule(null);
    setSelectedRuleType(null);
    setRuleName('');
    setRuleDescription('');
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Selected Rules */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Selected Rules</h4>
          <span className="text-xs text-muted-foreground">
            {selectedRules.length} rules selected
          </span>
        </div>
        
        {selectedRules.length === 0 ? (
          <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            No rules selected. Add rules to customize scheduling constraints.
          </div>
        ) : (
          <div className="space-y-2">
            {selectedRules.map((rule) => {
              const option = getRuleOption(rule.type);
              return (
                <div
                  key={rule.id}
                  className="flex items-center justify-between rounded-md border p-3 text-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="rounded-md bg-primary/10 p-1.5">
                      {option?.icon || <Clock className="h-4 w-4 text-primary" />}
                    </div>
                    <div>
                      <div className="font-medium">{rule.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {rule.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={rule.isActive ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleRuleActive(rule.id)}
                    >
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((priority) => (
                        <button
                          key={priority}
                          onClick={() => updateRulePriority(rule.id, priority)}
                          className={cn(
                            'h-2 w-2 rounded-full',
                            rule.priority >= priority
                              ? 'bg-primary'
                              : 'bg-muted'
                          )}
                          aria-label={`Set priority to ${priority}`}
                        />
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemoveRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Rule Button */}
      <Popover open={!newRule && open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span>Add Rule</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search rules..." />
            <CommandList>
              <CommandEmpty>No rule found.</CommandEmpty>
              <CommandGroup>
              {ruleOptions.map((option) => {
                const ruleType = option.type as RuleType;
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      handleAddRule(ruleType);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                  <div className="mr-2 flex h-4 w-4 items-center justify-center">
                    {option.icon}
                  </div>
                  <div>
                    <div className="text-sm">{option.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                  </CommandItem>
                );
              })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Rule Configuration Form */}
      {newRule && selectedRuleType && (
        <div className="mt-4 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Configure Rule</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setNewRule(null);
                setSelectedRuleType(null);
              }}
            >
              Cancel
            </Button>
          </div>
          
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Rule Name</label>
              <input
                type="text"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                className="w-full rounded-md border p-2 text-sm"
                placeholder="Enter rule name"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                value={ruleDescription}
                onChange={(e) => setRuleDescription(e.target.value)}
                className="w-full rounded-md border p-2 text-sm"
                rows={2}
                placeholder="Enter rule description"
              />
            </div>
            
            {/* Time Range Picker for Time Block Rule */}
            {selectedRuleType === RuleType.TimeBlock && (
              <div>
                <label className="mb-1 block text-sm font-medium">Time Range</label>
                <TimeRangePicker
                  value={timeRange}
                  onChange={setTimeRange}
                />
              </div>
            )}
            
            {/* Day Picker for Day Restriction Rule */}
            {selectedRuleType === RuleType.DayRestriction && (
              <div>
                <label className="mb-1 block text-sm font-medium">Days</label>
                <DayPicker
                  selectedDays={selectedDays}
                  onSelectedDaysChange={setSelectedDays}
                />
              </div>
            )}
            
            {/* Add more rule type specific configurations here */}
            
            <div className="pt-2">
              <Button
                onClick={handleSaveRule}
                className="w-full"
                disabled={!ruleName}
              >
                Save Rule
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
