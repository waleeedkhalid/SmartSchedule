// Student Section Layout - Shared layout for all student pages
import { ReactNode } from "react";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/10">
      <div>{children}</div>
    </div>
  );
}
