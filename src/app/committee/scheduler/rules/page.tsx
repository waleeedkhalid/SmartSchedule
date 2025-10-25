"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Save,
  PlayCircle,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Info,
} from "lucide-react";
import { RulesTable } from "@/components/committee/scheduler/rules/RulesTable";
import { RuleForm } from "@/components/committee/scheduler/rules/RuleForm";
import { PriorityWeightsEditor } from "@/components/committee/scheduler/rules/PriorityWeightsEditor";
import { RuleTestResults } from "@/components/committee/scheduler/rules/RuleTestResults";
import type {
  SchedulingRulesConfig,
  SchedulingRules,
  PriorityWeights,
} from "@/types/scheduler";
import { useToast } from "@/components/ui/use-toast";

export default function RulesConfigurationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const termCode = searchParams.get("term") || "2025-1";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [rulesConfig, setRulesConfig] = useState<SchedulingRulesConfig | null>(null);
  const [isDefault, setIsDefault] = useState(false);
  const [editingRule, setEditingRule] = useState<keyof SchedulingRules | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Load rules configuration
  useEffect(() => {
    loadRulesConfig();
  }, [termCode]);

  const loadRulesConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/committee/scheduler/rules?term_code=${termCode}`
      );

      if (!response.ok) {
        throw new Error("Failed to load rules configuration");
      }

      const data = await response.json();
      setRulesConfig(data.data);
      setIsDefault(data.isDefault);
    } catch (error) {
      console.error("Error loading rules:", error);
      toast({
        title: "Error",
        description: "Failed to load rules configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRules = async () => {
    if (!rulesConfig) return;

    try {
      setSaving(true);

      const response = await fetch("/api/committee/scheduler/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term_code: termCode,
          rules: rulesConfig.rules,
          priority_weights: rulesConfig.priority_weights,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save rules");
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: data.message,
      });

      setHasChanges(false);
      setIsDefault(false);
      await loadRulesConfig();
    } catch (error) {
      console.error("Error saving rules:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save rules",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestRules = async () => {
    if (!rulesConfig) return;

    try {
      setTesting(true);
      setTestResults(null);

      const response = await fetch("/api/committee/scheduler/rules/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term_code: termCode,
          rules_config: rulesConfig,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to test rules");
      }

      const data = await response.json();
      setTestResults(data.data);

      toast({
        title: "Test Complete",
        description: `Found ${data.data.total_violations} violation(s)`,
      });
    } catch (error) {
      console.error("Error testing rules:", error);
      toast({
        title: "Error",
        description: "Failed to test rules configuration",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleRuleEdit = (key: keyof SchedulingRules) => {
    setEditingRule(key);
  };

  const handleRuleSave = (key: keyof SchedulingRules, value: any) => {
    if (!rulesConfig) return;

    setRulesConfig({
      ...rulesConfig,
      rules: {
        ...rulesConfig.rules,
        [key]: value,
      },
    });
    setHasChanges(true);
    setEditingRule(null);
  };

  const handleWeightsChange = (weights: PriorityWeights) => {
    if (!rulesConfig) return;

    setRulesConfig({
      ...rulesConfig,
      priority_weights: weights,
    });
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!rulesConfig) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load rules configuration. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/committee/scheduler")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Scheduler
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Rules Configuration</h1>
              <p className="text-muted-foreground">
                Configure scheduling constraints and priorities for term {termCode}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDefault && (
            <Badge variant="secondary" className="gap-1">
              <Info className="h-3 w-3" />
              Using Default Config
            </Badge>
          )}
          {hasChanges && (
            <Badge variant="default" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Unsaved Changes
            </Badge>
          )}
        </div>
      </div>

      {/* Default Config Warning */}
      {isDefault && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Default Configuration</AlertTitle>
          <AlertDescription>
            You are viewing the default rules configuration. Save changes to create a custom
            configuration for this term.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleTestRules}
          disabled={testing || hasChanges}
          className="gap-2"
        >
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Testing Rules...
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4" />
              Test Rules Against Current Schedule
            </>
          )}
        </Button>
        <div className="flex-1" />
        <Button
          onClick={handleSaveRules}
          disabled={saving || !hasChanges}
          className="gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="rules" className="space-y-6">
        <TabsList>
          <TabsTrigger value="rules">Scheduling Rules</TabsTrigger>
          <TabsTrigger value="weights">Priority Weights</TabsTrigger>
          {testResults && (
            <TabsTrigger value="test-results" className="gap-2">
              Test Results
              {testResults.total_violations > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {testResults.total_violations}
                </Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="rules">
          <RulesTable
            rules={rulesConfig.rules}
            onEdit={handleRuleEdit}
          />
        </TabsContent>

        <TabsContent value="weights">
          <PriorityWeightsEditor
            weights={rulesConfig.priority_weights}
            onChange={handleWeightsChange}
          />
        </TabsContent>

        {testResults && (
          <TabsContent value="test-results">
            <RuleTestResults results={testResults} />
          </TabsContent>
        )}
      </Tabs>

      {/* Rule Edit Dialog */}
      <RuleForm
        open={editingRule !== null}
        onClose={() => setEditingRule(null)}
        ruleKey={editingRule}
        currentValue={editingRule ? rulesConfig.rules[editingRule] : null}
        onSave={handleRuleSave}
      />
    </div>
  );
}

