"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { RulesConfigurationTable } from "./RulesConfigurationTable";
import { PriorityWeightsConfig } from "./PriorityWeightsConfig";
import {
  mockSchedulingRules,
  mockRulePriorities,
} from "@/lib/mock-data/scheduler-data";
import { useToast } from "@/components/ui/use-toast";
import { MockRulePriority } from "@/types/scheduler-mock";

/**
 * Rules Management Page
 * Configure scheduling rules and priority weights
 * 
 * Features:
 * - Scheduling rules configuration
 * - Priority weights management
 * - Rule testing interface
 * 
 * TODO: Replace mock data with actual API calls when backend is ready
 */
export function RulesManagementPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("rules");

  // Rule Handlers
  const handleAddRule = () => {
    toast({
      title: "Add Rule",
      description: "Opening rule creation form...",
    });
    // TODO: Open dialog with rule form
  };

  const handleEditRule = (ruleId: string) => {
    toast({
      title: "Edit Rule",
      description: `Editing rule: ${ruleId}`,
    });
    // TODO: Open dialog with rule edit form
  };

  const handleDeleteRule = (ruleId: string) => {
    toast({
      title: "Delete Rule",
      description: "Rule will be deleted",
      variant: "destructive",
    });
    // TODO: Implement delete with confirmation
  };

  const handleToggleRule = (ruleId: string, isActive: boolean) => {
    toast({
      title: isActive ? "Rule Activated" : "Rule Deactivated",
      description: `Rule status updated`,
    });
    // TODO: Implement API call to toggle rule
  };

  const handleTestRule = (ruleId: string) => {
    toast({
      title: "Testing Rule",
      description: "Running rule validation...",
    });
    // TODO: Implement rule testing logic
  };

  // Priority Handlers
  const handleSavePriorities = (priorities: MockRulePriority[]) => {
    toast({
      title: "Priorities Updated",
      description: "Priority weights have been saved successfully",
    });
    // TODO: Implement API call to save priorities
  };

  const handleResetPriorities = () => {
    toast({
      title: "Priorities Reset",
      description: "Priority weights reset to default values",
    });
    // TODO: Implement reset logic
  };

  return (
    <div className="space-y-6 p-6">
      {/* Back to Dashboard Button */}
      <Link href="/committee/scheduler/dashboard">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <div>
        <h2 className="text-3xl font-bold tracking-tight">Rules Management</h2>
        <p className="text-muted-foreground">
          Configure scheduling rules and priority weights
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="rules">Scheduling Rules</TabsTrigger>
          <TabsTrigger value="priorities">Priority Weights</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <RulesConfigurationTable
            rules={mockSchedulingRules}
            onAddRule={handleAddRule}
            onEditRule={handleEditRule}
            onDeleteRule={handleDeleteRule}
            onToggleRule={handleToggleRule}
            onTestRule={handleTestRule}
          />
        </TabsContent>

        <TabsContent value="priorities" className="space-y-4">
          <PriorityWeightsConfig
            priorities={mockRulePriorities}
            onSave={handleSavePriorities}
            onReset={handleResetPriorities}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

