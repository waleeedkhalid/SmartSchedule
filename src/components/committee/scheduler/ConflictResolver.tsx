/**
 * ConflictResolver Component
 * 
 * Interactive conflict resolution interface with:
 * - Conflict list with severity indicators
 * - Detailed conflict information
 * - Resolution suggestions
 * - Auto-resolve capabilities
 * - Manual resolution actions
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Users,
  Calendar,
  MapPin,
  User as UserIcon,
  RefreshCw,
  Settings,
} from "lucide-react";
import type { ScheduleConflict, ScheduledSection, SectionTimeSlot } from "@/types/scheduler";
import { ConflictResolutionDialog } from "./ConflictResolutionDialog";

export interface ConflictResolverProps {
  conflicts: ScheduleConflict[];
  allSections: ScheduledSection[];
  occupiedSlots: SectionTimeSlot[];
  onResolveConflict?: (conflictId: string, resolution: 'auto' | 'manual') => Promise<void>;
  onResolveAll?: () => Promise<void>;
  onRevalidate?: () => Promise<void>;
  isResolving?: boolean;
}

export function ConflictResolver({
  conflicts,
  allSections,
  occupiedSlots,
  onResolveConflict,
  onResolveAll,
  onRevalidate,
  isResolving = false,
}: ConflictResolverProps) {
  const [expandedConflict, setExpandedConflict] = useState<string | null>(null);
  const [resolvingConflicts, setResolvingConflicts] = useState<Set<string>>(new Set());
  const [selectedConflict, setSelectedConflict] = useState<ScheduleConflict | null>(null);
  const [showResolutionDialog, setShowResolutionDialog] = useState(false);
  const [revalidating, setRevalidating] = useState(false);

  // Group conflicts by severity
  const conflictsBySeverity = {
    critical: conflicts.filter(c => c.severity === 'critical'),
    error: conflicts.filter(c => c.severity === 'error'),
    warning: conflicts.filter(c => c.severity === 'warning'),
    info: conflicts.filter(c => c.severity === 'info'),
  };

  const autoResolvableCount = conflicts.filter(c => c.auto_resolvable).length;

  const getSeverityIcon = (severity: ScheduleConflict['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: ScheduleConflict['severity']) => {
    const variants = {
      critical: "bg-red-100 text-red-800 border-red-200",
      error: "bg-destructive/10 text-destructive border-destructive/20",
      warning: "bg-orange-100 text-orange-800 border-orange-200",
      info: "bg-blue-100 text-blue-800 border-blue-200",
    };

    return (
      <Badge variant="secondary" className={variants[severity]}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'student':
        return <Users className="w-4 h-4" />;
      case 'course':
      case 'section':
        return <Calendar className="w-4 h-4" />;
      case 'room':
        return <MapPin className="w-4 h-4" />;
      case 'faculty':
        return <UserIcon className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const handleResolveConflict = async (conflictId: string, type: 'auto' | 'manual') => {
    if (!onResolveConflict) return;

    setResolvingConflicts(prev => new Set(prev).add(conflictId));
    
    try {
      await onResolveConflict(conflictId, type);
    } finally {
      setResolvingConflicts(prev => {
        const next = new Set(prev);
        next.delete(conflictId);
        return next;
      });
    }
  };

  const handleResolveAll = async () => {
    if (!onResolveAll) return;
    await onResolveAll();
  };

  const handleManualResolve = (conflict: ScheduleConflict) => {
    setSelectedConflict(conflict);
    setShowResolutionDialog(true);
  };

  const handleApplyResolution = async (resolution: {
    section_id: string;
    new_time_slot?: { day: string; start_time: string; end_time: string; score: number; reason: string };
    new_room?: string;
  }) => {
    try {
      const response = await fetch("/api/committee/scheduler/conflicts/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conflict: selectedConflict,
          all_sections: allSections,
          resolution_type: "manual",
          manual_action: {
            section_id: resolution.section_id,
            new_time_slot: resolution.new_time_slot,
            new_room: resolution.new_room,
          },
        }),
      });

      if (response.ok) {
        // Trigger re-validation after successful resolution
        if (onRevalidate) {
          await handleRevalidate();
        }
      }
    } catch (error) {
      console.error("Error applying resolution:", error);
    }
  };

  const handleRevalidate = async () => {
    if (!onRevalidate) return;
    setRevalidating(true);
    try {
      await onRevalidate();
    } finally {
      setRevalidating(false);
    }
  };

  const getAffectedSections = (conflict: ScheduleConflict): ScheduledSection[] => {
    const sectionIds = conflict.affected_entities
      .filter((e) => e.type === "section")
      .map((e) => e.id);
    return allSections.filter((s) => sectionIds.includes(s.section_id));
  };

  if (conflicts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            No Conflicts Detected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              All schedule requirements have been successfully met with no conflicts.
              The schedule is ready for publication.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Schedule Conflicts ({conflicts.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Review and resolve conflicts to improve schedule quality
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onRevalidate && (
              <Button
                onClick={handleRevalidate}
                disabled={revalidating}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${revalidating ? 'animate-spin' : ''}`} />
                Re-validate
              </Button>
            )}
            {autoResolvableCount > 0 && onResolveAll && (
              <Button
                onClick={handleResolveAll}
                disabled={isResolving}
                variant="default"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Auto-Resolve All ({autoResolvableCount})
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {conflictsBySeverity.critical.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-900">Critical</span>
              </div>
              <div className="text-2xl font-bold text-red-900">
                {conflictsBySeverity.critical.length}
              </div>
            </div>
          )}

          {conflictsBySeverity.error.length > 0 && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium">Errors</span>
              </div>
              <div className="text-2xl font-bold">
                {conflictsBySeverity.error.length}
              </div>
            </div>
          )}

          {conflictsBySeverity.warning.length > 0 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Warnings</span>
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {conflictsBySeverity.warning.length}
              </div>
            </div>
          )}

          {conflictsBySeverity.info.length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Info</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {conflictsBySeverity.info.length}
              </div>
            </div>
          )}
        </div>

        {/* Conflicts List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Conflict Details</h4>
          
          <Accordion
            type="single"
            collapsible
            value={expandedConflict || undefined}
            onValueChange={setExpandedConflict}
          >
            {conflicts.map((conflict, index) => (
              <AccordionItem
                key={conflict.id || index}
                value={conflict.id || index.toString()}
                className="border rounded-lg mb-2"
              >
                <AccordionTrigger className="hover:no-underline px-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0">
                      {getSeverityIcon(conflict.severity)}
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{conflict.title}</span>
                        {getSeverityBadge(conflict.severity)}
                        {conflict.auto_resolvable && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Auto-resolvable
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {conflict.description}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4 pt-2">
                    {/* Description */}
                    <div>
                      <h5 className="text-sm font-medium mb-2">Description</h5>
                      <p className="text-sm text-muted-foreground">
                        {conflict.description}
                      </p>
                    </div>

                    {/* Affected Entities */}
                    {conflict.affected_entities.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium mb-2">Affected Entities</h5>
                        <div className="flex flex-wrap gap-2">
                          {conflict.affected_entities.map((entity, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {getEntityIcon(entity.type)}
                              <span className="capitalize">{entity.type}:</span>
                              <span className="font-mono">{entity.name || entity.id}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resolution Suggestions */}
                    {conflict.resolution_suggestions.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium mb-2">
                          Resolution Suggestions
                        </h5>
                        <ul className="space-y-1">
                          {conflict.resolution_suggestions.map((suggestion, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      {conflict.auto_resolvable && onResolveConflict && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleResolveConflict(conflict.id || index.toString(), 'auto')
                          }
                          disabled={resolvingConflicts.has(conflict.id || index.toString())}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Auto-Resolve
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleManualResolve(conflict)}
                        disabled={resolvingConflicts.has(conflict.id || index.toString())}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Manual Resolution
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Help Text */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Tip:</strong> Auto-resolvable conflicts can be fixed automatically by the
            system. For complex conflicts, use manual resolution to select alternative time
            slots or rooms. After making changes, click Re-validate to check for new conflicts.
          </AlertDescription>
        </Alert>
      </CardContent>

      {/* Resolution Dialog */}
      <ConflictResolutionDialog
        open={showResolutionDialog}
        onOpenChange={setShowResolutionDialog}
        conflict={selectedConflict}
        affectedSections={selectedConflict ? getAffectedSections(selectedConflict) : []}
        occupiedSlots={occupiedSlots}
        onResolve={handleApplyResolution}
      />
    </Card>
  );
}

