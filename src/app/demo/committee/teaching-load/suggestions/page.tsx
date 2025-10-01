"use client";
import React from "react";
import {
  PersonaNavigation,
  PageContainer,
  teachingLoadNavItems,
} from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, ThumbsUp, ThumbsDown } from "lucide-react";

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
  const handleApproveSuggestion = (id: string) => {
    console.log("Approving suggestion:", id);
    // TODO: Send to API endpoint POST /api/teaching-load/suggestions/:id/approve
  };

  const handleRejectSuggestion = (id: string) => {
    console.log("Rejecting suggestion:", id);
    // TODO: Send to API endpoint POST /api/teaching-load/suggestions/:id/reject
  };

  const getTypeColor = (type: LoadSuggestion["type"]) => {
    switch (type) {
      case "REDISTRIBUTE":
        return "bg-blue-100 text-blue-800";
      case "ADD_SECTION":
        return "bg-green-100 text-green-800";
      case "REDUCE_LOAD":
        return "bg-orange-100 text-orange-800";
    }
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
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-blue-900">
              These suggestions are automatically generated based on current
              conflicts and workload distribution.
            </p>
          </div>

          <div className="grid gap-4">
            {mockSuggestions.map((suggestion) => (
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
                                : "destructive"
                            }
                          >
                            {suggestion.status}
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
                          onClick={() => handleApproveSuggestion(suggestion.id)}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectSuggestion(suggestion.id)}
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
        </div>
      </PageContainer>
    </>
  );
}
