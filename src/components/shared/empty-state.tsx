import { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
};

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <Card className="items-center text-center">
      <CardHeader>
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {actionLabel ? (
        <CardContent>
          <Button onClick={onAction}>{actionLabel}</Button>
        </CardContent>
      ) : null}
    </Card>
  );
}
