/**
 * Action Card Component
 * Memoized to prevent unnecessary re-renders
 */

import React, { memo } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, LucideIcon } from "lucide-react";

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  href: string;
  buttonText: string;
  variant?: "default" | "outline";
  borderColorClass?: string;
}

export const ActionCard = memo(function ActionCard({
  title,
  description,
  icon: Icon,
  features,
  href,
  buttonText,
  variant = "outline",
  borderColorClass = "",
}: ActionCardProps) {
  return (
    <Card className={`hover:shadow-lg transition-all ${borderColorClass}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              {title === "Course Management" ? "Course management tools:" :
               title === "Student Enrollment" ? "Enrollment tracking tools:" :
               title === "Schedule Generation" ? "Schedule generation tools:" :
               title === "Exam Management" ? "Exam scheduling tools:" :
               "Configuration options:"}
            </p>
            <ul className="list-disc list-inside space-y-1">
              {features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
          <Button asChild className="w-full" variant={variant} size="lg">
            <Link href={href}>
              {buttonText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

