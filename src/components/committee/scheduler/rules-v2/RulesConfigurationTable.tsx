"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Play,
  Plus,
} from "lucide-react";
import { MockSchedulingRule } from "@/types/scheduler-mock";

interface RulesConfigurationTableProps {
  rules: MockSchedulingRule[];
  onAddRule?: () => void;
  onEditRule?: (ruleId: string) => void;
  onDeleteRule?: (ruleId: string) => void;
  onToggleRule?: (ruleId: string, isActive: boolean) => void;
  onTestRule?: (ruleId: string) => void;
}

export function RulesConfigurationTable({
  rules,
  onAddRule,
  onEditRule,
  onDeleteRule,
  onToggleRule,
  onTestRule,
}: RulesConfigurationTableProps) {
  const activeRules = rules.filter((r) => r.is_active).length;
  const inactiveRules = rules.filter((r) => !r.is_active).length;

  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case "TIME_CONSTRAINT":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ROOM_CONSTRAINT":
        return "bg-green-100 text-green-800 border-green-200";
      case "INSTRUCTOR_CONSTRAINT":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "ENROLLMENT_CONSTRAINT":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "CUSTOM":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return "text-red-600 font-bold";
    if (priority >= 5) return "text-orange-600 font-semibold";
    return "text-gray-600";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Scheduling Rules
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Configure and manage scheduling constraints and rules
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-green-600">{activeRules}</span>{" "}
              active,{" "}
              <span className="font-medium text-gray-600">{inactiveRules}</span>{" "}
              inactive
            </div>
            <Button onClick={onAddRule}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No rules configured</h3>
            <p className="text-muted-foreground mb-4">
              Create your first scheduling rule to get started
            </p>
            <Button onClick={onAddRule}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">
                      {rule.rule_name}
                    </TableCell>
                    <TableCell>
                      <Badge className={getRuleTypeColor(rule.rule_type)}>
                        {rule.rule_type.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        {rule.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={getPriorityColor(rule.priority)}>
                          {rule.priority}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          / 10
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={(checked) =>
                            onToggleRule?.(rule.id, checked)
                          }
                        />
                        {rule.is_active ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{rule.created_by}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(rule.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onTestRule?.(rule.id)}
                          title="Test rule"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditRule?.(rule.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteRule?.(rule.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

