"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Calendar,
  Clock,
  BookOpen,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "outline" | "secondary" | "ghost";
}

const quickActions: QuickAction[] = [
  {
    title: "View Schedule",
    description: "Check your teaching schedule",
    href: "/faculty/schedule",
    icon: Calendar,
    variant: "default",
  },
  {
    title: "Set Availability",
    description: "Update your weekly availability",
    href: "/faculty/availability",
    icon: Clock,
    variant: "outline",
  },
  {
    title: "My Courses",
    description: "View course assignments",
    href: "/faculty/courses",
    icon: BookOpen,
    variant: "outline",
  },
  {
    title: "Student Feedback",
    description: "Review course feedback",
    href: "/faculty/feedback",
    icon: MessageSquare,
    variant: "outline",
  },
];

interface QuickActionsEnhancedProps {
  className?: string;
}

export function QuickActionsEnhanced({ className }: QuickActionsEnhancedProps) {
  return (
    <Card className={cn("border-2 shadow-sm", className)}>
      <CardHeader className="border-b bg-muted/30 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription className="mt-1">
              Access frequently used features
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Option 1: Button Group Layout (Horizontal) */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-3">Primary Actions</p>
          <ButtonGroup className="w-full">
            {quickActions.slice(0, 2).map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.href}
                  asChild
                  variant={action.variant}
                  className="flex-1 gap-2"
                >
                  <Link href={action.href}>
                    <Icon className="h-4 w-4" />
                    {action.title}
                  </Link>
                </Button>
              );
            })}
          </ButtonGroup>
        </div>

        {/* Option 2: Grid Layout (Original with improvements) */}
        <div>
          <p className="text-sm font-medium mb-3">More Actions</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickActions.slice(2).map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.href}
                  asChild
                  variant="outline"
                  className="h-auto flex-col items-start gap-2 p-4 text-left"
                >
                  <Link href={action.href}>
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{action.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

