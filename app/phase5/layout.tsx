/**
 * Phase 5 Layout
 * 
 * Layout wrapper for all Phase 5 demo pages
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Phase 5 - Advanced Features | SmartSchedule',
  description: 'Performance optimization, Charts.js dashboards, Yjs collaboration, and version control demonstrations',
};

export default function Phase5Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}

