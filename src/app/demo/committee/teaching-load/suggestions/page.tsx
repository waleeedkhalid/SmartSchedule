"use client";
import React, { useState } from "react";
import {
  PersonaNavigation,
  PageContainer,
  teachingLoadNavItems,
} from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

interface LoadSuggestion {
  id: string;
  type: "REDISTRIBUTE" | "ADD_SECTION" | "REDUCE_LOAD";
  instructorName: string;
  currentLoad: number;
  proposedLoad: number;
  description: string;
  impact: string;
  status: "pending" | "approved" | "rejected";
}

const mockSuggestions: LoadSuggestion[] = [
  {
    id: "sug-1",
    type: "REDISTRIBUTE",
    instructorName: "Prof. Omar Badr",
    currentLoad: 18,
    proposedLoad: 15,
    description:
      "Transfer GRAD598 Graduate Seminar (3 hrs) to Dr. Ahmad Hassan",
    impact: "Reduces overload by 3 hours, brings Dr. Hassan to 12 hours",
    status: "pending",
  },
  {
    id: "sug-2",
    type: "ADD_SECTION",
    instructorName: "Dr. Ahmad Hassan",
    currentLoad: 9,
    proposedLoad: 12,
    description: "Assign GRAD598 Graduate Seminar (3 hrs) from Prof. Badr",
    impact: "Balances workload distribution across faculty",
    status: "pending",
  },
  {
    id: "sug-3",
    type: "REDUCE_LOAD",
    instructorName: "Dr. Sarah Al-Dossary",
    currentLoad: 12,
    proposedLoad: 10,
    description: "Remove CSC212-LAB (2 hrs) - conflicts with lecture time",
    impact: "Resolves Tuesday time overlap conflict",
    status: "approved",
  },
];

export default function Page(): React.ReactElement {
  const [suggestions, setSuggestions] =
    useState<LoadSuggestion[]>(mockSuggestions);
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const { toast } = useToast();

  const handleApproveSuggestion = (id: string) => {
    const suggestion = suggestions.find((s) => s.id === id);
    if (!suggestion) return;

    console.log("Approving suggestion:", {
      id,
      type: suggestion.type,
      instructorName: suggestion.instructorName,
      loadChange: suggestion.proposedLoad - suggestion.currentLoad,
    });

    // Update state
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "approved" as const } : s))
    );

    // Show success toast
    toast({
      title: "Suggestion Approved",
      description: `${suggestion.instructorName}'s workload change has been approved.`,
    });

    // TODO: Send to API endpoint POST /api/teaching-load/suggestions/:id/approve
  };

  const handleRejectSuggestion = (id: string) => {
    const suggestion = suggestions.find((s) => s.id === id);
    if (!suggestion) return;

    console.log("Rejecting suggestion:", {
      id,
      type: suggestion.type,
      instructorName: suggestion.instructorName,
      reason: "Manual rejection",
    });

    // Update state
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "rejected" as const } : s))
    );

    // Show info toast
    toast({
      title: "Suggestion Rejected",
      description: `${suggestion.instructorName}'s workload suggestion has been rejected.`,
    });

    // TODO: Send to API endpoint POST /api/teaching-load/suggestions/:id/reject
  };

  const getTypeColor = (type: LoadSuggestion["type"]) => {
    switch (type) {
      case "REDISTRIBUTE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "ADD_SECTION":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "REDUCE_LOAD":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    }
  };

  const getStatusIcon = (status: LoadSuggestion["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "approved":
        return <CheckCircle2 className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
    }
  };

  const filteredSuggestions = suggestions.filter((s) => {
    if (activeTab === "all") return true;
    return s.status === activeTab;
  });

  const stats = {
    total: suggestions.length,
    pending: suggestions.filter((s) => s.status === "pending").length,
    approved: suggestions.filter((s) => s.status === "approved").length,
    rejected: suggestions.filter((s) => s.status === "rejected").length,
  };

  return (
    <>
      <PersonaNavigation
        personaName="Teaching Load Committee"
        navItems={teachingLoadNavItems}
      />

      <PageContainer
        title="Load Balancing Suggestions"
        description="Review AI-generated suggestions for balancing instructor workloads"
      >
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-900 dark:text-blue-100">
              These suggestions are automatically generated based on current
              conflicts and workload distribution.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Suggestions
                </CardTitle>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending
                </CardTitle>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.pending}
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Approved
                </CardTitle>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.approved}
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Rejected
                </CardTitle>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.rejected}
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Tabs for filtering */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          >
            <TabsList>
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({stats.pending})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({stats.approved})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({stats.rejected})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredSuggestions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No {activeTab === "all" ? "" : activeTab} suggestions
                      found.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredSuggestions.map((suggestion) => (
                    <Card key={suggestion.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">
                                {suggestion.instructorName}
                              </CardTitle>
                              <Badge className={getTypeColor(suggestion.type)}>
                                {suggestion.type.replace("_", " ")}
                              </Badge>
                              {suggestion.status !== "pending" && (
                                <Badge
                                  variant={
                                    suggestion.status === "approved"
                                      ? "default"
                                      : "outline"
                                  }
                                  className={
                                    suggestion.status === "approved"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  }
                                >
                                  <span className="flex items-center gap-1">
                                    {getStatusIcon(suggestion.status)}
                                    {suggestion.status}
                                  </span>
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Current: {suggestion.currentLoad} hrs</span>
                              <span>→</span>
                              <span className="font-medium text-foreground">
                                Proposed: {suggestion.proposedLoad} hrs
                              </span>
                            </div>
                          </div>
                          {suggestion.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() =>
                                  handleApproveSuggestion(suggestion.id)
                                }
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleRejectSuggestion(suggestion.id)
                                }
                              >
                                <ThumbsDown className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <p className="text-sm font-medium">Suggestion</p>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.description}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Impact</p>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.impact}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>
    </>
  );
}
