'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function DashboardsPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { role, loading } = useAuth() as any;

  useEffect(() => {
    if (loading) return;

    // Redirect based on user role
    switch (role) {
      case 'student':
        router.push('/phase5/dashboards/student');
        break;
      case 'faculty':
        router.push('/phase5/dashboards/faculty');
        break;
      case 'registrar':
        router.push('/phase5/dashboards/registrar');
        break;
      case 'teaching_load':
        router.push('/phase5/dashboards/teaching-load');
        break;
      case 'scheduling':
        router.push('/phase5/dashboards/scheduling');
        break;
      default:
        // If no role or unknown role, redirect to scheduling dashboard
        router.push('/phase5/dashboards/scheduling');
    }
  }, [role, loading, router]);

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-96">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Dashboard...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Redirecting to your role-specific dashboard...</p>
        </CardContent>
      </Card>
    </div>
  );
}
