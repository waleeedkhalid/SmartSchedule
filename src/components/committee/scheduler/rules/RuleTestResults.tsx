"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  AlertCircle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import type { ScheduleConflict } from "@/types/scheduler";

interface RuleTestResultsProps {
  results: {
    total_violations: number;
    violations_by_type: Record<string, number>;
    violations: ScheduleConflict[];
    passed_checks: string[];
    summary: {
      critical: number;
      error: number;
      warning: number;
      info: number;
    };
  };
  onResolveConflict?: (conflict: ScheduleConflict) => void;
}

const SEVERITY_ICONS = {
  critical: <XCircle className="h-4 w-4" />,
  error: <AlertCircle className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
};

const SEVERITY_VARIANTS = {
  critical: "destructive",
  error: "destructive",
  warning: "default",
  info: "secondary",
} as const;

const CONFLICT_TYPE_LABELS: Record<string, string> = {
  time_overlap: "Time Overlap",
  exam_overlap: "Exam Overlap",
  capacity_exceeded: "Capacity Exceeded",
  prerequisite_violation: "Prerequisite Violation",
  room_conflict: "Room Conflict",
  faculty_conflict: "Faculty Conflict",
  constraint_violation: "Constraint Violation",
  elective_unavailable: "Elective Unavailable",
  excessive_daily_load: "Excessive Daily Load",
  excessive_weekly_load: "Excessive Weekly Load",
  large_gap: "Large Gap",
  faculty_unavailable: "Faculty Unavailable",
  missing_required_course: "Missing Required Course",
};

export function RuleTestResults({ results, onResolveConflict }: RuleTestResultsProps) {
  const { total_violations, violations_by_type, violations, passed_checks, summary } = results;

  const severityOrder: Array<"critical" | "error" | "warning" | "info"> = [
    "critical",
    "error",
    "warning",
    "info",
  ];

  const violationsBySeverity = severityOrder.map((severity) => ({
    severity,
    violations: violations.filter((v) => v.severity === severity),
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.critical}</div>
            <p className="text-xs text-muted-foreground">Must be resolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.error}</div>
            <p className="text-xs text-muted-foreground">Should be fixed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.warning}</div>
            <p className="text-xs text-muted-foreground">Review recommended</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passed Checks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{passed_checks.length}</div>
            <p className="text-xs text-muted-foreground">Rules satisfied</p>
          </CardContent>
        </Card>
      </div>

      {/* Violations by Type */}
      {Object.keys(violations_by_type).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Violations by Type</CardTitle>
            <CardDescription>Distribution of rule violations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(violations_by_type)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {CONFLICT_TYPE_LABELS[type] || type}
                    </span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Violations */}
      {total_violations > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Violations</CardTitle>
            <CardDescription>
              Review and resolve {total_violations} violation{total_violations !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {violationsBySeverity.map(
                ({ severity, violations: severityViolations }) =>
                  severityViolations.length > 0 && (
                    <AccordionItem key={severity} value={severity}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          {SEVERITY_ICONS[severity]}
                          <span className="capitalize font-medium">{severity}</span>
                          <Badge variant={SEVERITY_VARIANTS[severity]}>
                            {severityViolations.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          {severityViolations.map((violation, idx) => (
                            <div
                              key={violation.id || idx}
                              className="border rounded-lg p-4 space-y-3"
                            >
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <h4 className="font-medium">{violation.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {violation.description}
                                  </p>
                                </div>
                                {violation.auto_resolvable && (
                                  <Badge variant="outline" className="gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    Auto-resolvable
                                  </Badge>
                                )}
                              </div>

                              {/* Affected Entities */}
                              {violation.affected_entities.length > 0 && (
                                <div className="space-y-1">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Affected:
                                  </span>
                                  <div className="flex gap-2 flex-wrap">
                                    {violation.affected_entities.map((entity, i) => (
                                      <Badge key={i} variant="secondary" className="text-xs">
                                        {entity.type}: {entity.name || entity.id}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Resolution Suggestions */}
                              {violation.resolution_suggestions.length > 0 && (
                                <div className="space-y-2">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Suggested Actions:
                                  </span>
                                  <ul className="space-y-1">
                                    {violation.resolution_suggestions.map((suggestion, i) => (
                                      <li
                                        key={i}
                                        className="text-sm flex items-start gap-2"
                                      >
                                        <ArrowRight className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                        <span>{suggestion}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Action Button */}
                              {onResolveConflict && (
                                <div className="flex justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onResolveConflict(violation)}
                                  >
                                    Resolve Conflict
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
              )}
            </Accordion>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">All Rules Passed!</h3>
            <p className="text-muted-foreground text-center">
              No violations found. Your schedule configuration meets all defined rules.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Passed Checks */}
      {passed_checks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Passed Checks</CardTitle>
            <CardDescription>Rules that are currently satisfied</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {passed_checks.map((check, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>{check}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

