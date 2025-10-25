"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Clock,
  Users,
  Calendar,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Edit,
  Info,
} from "lucide-react";
import type { SchedulingRules } from "@/types/scheduler";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RulesTableProps {
  rules: SchedulingRules;
  onEdit: (ruleKey: keyof SchedulingRules) => void;
  readOnly?: boolean;
}

interface RuleDefinition {
  key: keyof SchedulingRules;
  category: "Time" | "Weekly" | "Section" | "Faculty" | "Exam" | "Elective" | "Room";
  icon: React.ReactNode;
  label: string;
  description: string;
  getValue: (rules: SchedulingRules) => string | boolean;
  isBoolean?: boolean;
  important?: boolean;
}

const RULE_DEFINITIONS: RuleDefinition[] = [
  // Time constraints
  {
    key: "max_daily_hours",
    category: "Time",
    icon: <Clock className="h-4 w-4" />,
    label: "Max Daily Hours",
    description: "Maximum hours a student can have per day",
    getValue: (r) => `${r.max_daily_hours} hours`,
    important: true,
  },
  {
    key: "min_gap_between_classes",
    category: "Time",
    icon: <Clock className="h-4 w-4" />,
    label: "Min Gap Between Classes",
    description: "Minimum break time between classes",
    getValue: (r) => `${r.min_gap_between_classes} min`,
  },
  {
    key: "max_gap_between_classes",
    category: "Time",
    icon: <Clock className="h-4 w-4" />,
    label: "Max Gap Between Classes",
    description: "Maximum allowed gap between classes",
    getValue: (r) => `${r.max_gap_between_classes} min`,
  },
  {
    key: "earliest_class_time",
    category: "Time",
    icon: <Clock className="h-4 w-4" />,
    label: "Earliest Class Time",
    description: "Earliest time a class can start",
    getValue: (r) => r.earliest_class_time,
  },
  {
    key: "latest_class_time",
    category: "Time",
    icon: <Clock className="h-4 w-4" />,
    label: "Latest Class Time",
    description: "Latest time a class can end",
    getValue: (r) => r.latest_class_time,
  },

  // Weekly constraints
  {
    key: "max_weekly_hours",
    category: "Weekly",
    icon: <Calendar className="h-4 w-4" />,
    label: "Max Weekly Hours",
    description: "Maximum credit hours per week",
    getValue: (r) => `${r.max_weekly_hours} hours`,
    important: true,
  },
  {
    key: "allow_back_to_back",
    category: "Weekly",
    icon: <Calendar className="h-4 w-4" />,
    label: "Allow Back-to-Back Classes",
    description: "Whether to allow classes with no gap",
    getValue: (r) => r.allow_back_to_back,
    isBoolean: true,
  },

  // Section constraints
  {
    key: "max_students_per_section",
    category: "Section",
    icon: <Users className="h-4 w-4" />,
    label: "Max Students Per Section",
    description: "Maximum capacity for each section",
    getValue: (r) => `${r.max_students_per_section} students`,
    important: true,
  },
  {
    key: "min_students_per_section",
    category: "Section",
    icon: <Users className="h-4 w-4" />,
    label: "Min Students Per Section",
    description: "Minimum students required to open section",
    getValue: (r) => `${r.min_students_per_section} students`,
  },
  {
    key: "allow_section_overflow",
    category: "Section",
    icon: <Users className="h-4 w-4" />,
    label: "Allow Section Overflow",
    description: "Allow slight capacity overflow",
    getValue: (r) => r.allow_section_overflow,
    isBoolean: true,
  },
  {
    key: "overflow_percentage",
    category: "Section",
    icon: <Users className="h-4 w-4" />,
    label: "Overflow Percentage",
    description: "Maximum overflow percentage allowed",
    getValue: (r) => `${r.overflow_percentage}%`,
  },

  // Faculty constraints
  {
    key: "respect_faculty_availability",
    category: "Faculty",
    icon: <Users className="h-4 w-4" />,
    label: "Respect Faculty Availability",
    description: "Honor faculty availability preferences",
    getValue: (r) => r.respect_faculty_availability,
    isBoolean: true,
    important: true,
  },
  {
    key: "max_faculty_daily_hours",
    category: "Faculty",
    icon: <Users className="h-4 w-4" />,
    label: "Max Faculty Daily Hours",
    description: "Maximum teaching hours per day for faculty",
    getValue: (r) => `${r.max_faculty_daily_hours} hours`,
  },
  {
    key: "min_gap_between_faculty_classes",
    category: "Faculty",
    icon: <Users className="h-4 w-4" />,
    label: "Min Gap Between Faculty Classes",
    description: "Minimum break time for faculty",
    getValue: (r) => `${r.min_gap_between_faculty_classes} min`,
  },

  // Exam constraints
  {
    key: "min_days_between_exams",
    category: "Exam",
    icon: <Calendar className="h-4 w-4" />,
    label: "Min Days Between Exams",
    description: "Minimum days between student exams",
    getValue: (r) => `${r.min_days_between_exams} days`,
    important: true,
  },
  {
    key: "avoid_exam_conflicts",
    category: "Exam",
    icon: <Calendar className="h-4 w-4" />,
    label: "Avoid Exam Conflicts",
    description: "Prevent overlapping exam times",
    getValue: (r) => r.avoid_exam_conflicts,
    isBoolean: true,
    important: true,
  },
  {
    key: "max_exams_per_day",
    category: "Exam",
    icon: <Calendar className="h-4 w-4" />,
    label: "Max Exams Per Day",
    description: "Maximum exams a student can have per day",
    getValue: (r) => `${r.max_exams_per_day} exams`,
  },

  // Elective preferences
  {
    key: "honor_elective_preferences",
    category: "Elective",
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: "Honor Elective Preferences",
    description: "Respect student elective preferences",
    getValue: (r) => r.honor_elective_preferences,
    isBoolean: true,
    important: true,
  },
  {
    key: "min_preference_rank_to_honor",
    category: "Elective",
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: "Min Preference Rank to Honor",
    description: "Only honor top N preferences",
    getValue: (r) => `Top ${r.min_preference_rank_to_honor}`,
  },

  // Room constraints
  {
    key: "require_room_assignment",
    category: "Room",
    icon: <Building2 className="h-4 w-4" />,
    label: "Require Room Assignment",
    description: "All sections must have assigned rooms",
    getValue: (r) => r.require_room_assignment,
    isBoolean: true,
  },
  {
    key: "respect_room_capacity",
    category: "Room",
    icon: <Building2 className="h-4 w-4" />,
    label: "Respect Room Capacity",
    description: "Enforce room capacity limits",
    getValue: (r) => r.respect_room_capacity,
    isBoolean: true,
    important: true,
  },
];

export function RulesTable({ rules, onEdit, readOnly = false }: RulesTableProps) {
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(RULE_DEFINITIONS.map((r) => r.category)))];
  const filteredRules =
    filterCategory === "All"
      ? RULE_DEFINITIONS
      : RULE_DEFINITIONS.filter((r) => r.category === filterCategory);

  const groupedRules = filteredRules.reduce((acc, rule) => {
    if (!acc[rule.category]) {
      acc[rule.category] = [];
    }
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, RuleDefinition[]>);

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <Button
            key={category}
            variant={filterCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Rules by Category */}
      {Object.entries(groupedRules).map(([category, categoryRules]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {categoryRules[0].icon}
              {category} Constraints
            </CardTitle>
            <CardDescription>
              {getCategoryDescription(category)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Rule</TableHead>
                  <TableHead>Current Value</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  {!readOnly && <TableHead className="w-[100px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryRules.map((rule) => {
                  const value = rule.getValue(rules);
                  const isBoolean = rule.isBoolean;

                  return (
                    <TableRow key={rule.key}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{rule.label}</span>
                            {rule.important && (
                              <Badge variant="secondary" className="text-xs">
                                Important
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {rule.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isBoolean ? (
                          <div className="flex items-center gap-2">
                            <Switch checked={value as boolean} disabled />
                            <span className="text-sm">
                              {value ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                        ) : (
                          <span className="font-mono">{value as string}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isBoolean ? (
                          value ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Inactive
                            </Badge>
                          )
                        ) : (
                          <Badge variant="outline">Configured</Badge>
                        )}
                      </TableCell>
                      {!readOnly && (
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onEdit(rule.key)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit {rule.label}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    Time: "Configure daily time constraints and class scheduling windows",
    Weekly: "Set weekly scheduling patterns and preferences",
    Section: "Manage section capacity and enrollment limits",
    Faculty: "Define faculty teaching load and availability constraints",
    Exam: "Control exam scheduling and conflict prevention",
    Elective: "Configure elective preference handling",
    Room: "Set room assignment and capacity rules",
  };

  return descriptions[category] || "";
}
