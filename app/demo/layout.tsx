import { DemoProvider } from '@/lib/demo/demo-context';
import { DemoNav } from '@/components/demo/demo-nav';
import { ReactNode } from 'react';

export const metadata = {
  title: 'SmartSchedule Demo - Experience All Personas',
  description: 'Interactive demo showcasing SmartSchedule functionality for all user roles: Student, Faculty, Scheduling Committee, Teaching Load Committee, and Registrar.',
};

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <DemoProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <DemoNav />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </DemoProvider>
  );
}

