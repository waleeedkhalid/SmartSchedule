'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Shield,
  Users,
  BarChart3,
  MessageSquare,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export function FeatureHighlights() {
  const features = [
    {
      icon: Zap,
      title: 'Intelligent Scheduling',
      description: 'One-click schedule generation with conflict detection',
      highlight: 'Zero conflicts',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Secure dashboards for each persona with RLS',
      highlight: '5 personas',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Real-time comments and feedback system',
      highlight: 'Live updates',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Interactive charts for enrollment and load tracking',
      highlight: 'Chart.js',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: MessageSquare,
      title: 'Feedback System',
      description: 'Dual-layer comments for all stakeholders',
      highlight: 'All roles',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      icon: Calendar,
      title: 'Student Portal',
      description: 'Elective registration with constraint validation',
      highlight: '20-credit limit',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const technicalHighlights = [
    'Next.js 15 App Router',
    'TypeScript',
    'Supabase Auth + Postgres',
    'Row-Level Security (RLS)',
    'shadcn/ui Components',
    'Tailwind CSS',
    'Chart.js Visualizations',
    'Real-time Collaboration',
  ];

  const achievements = [
    {
      title: 'Zero Conflicts',
      description: 'Conflict-free schedules for all students and faculty',
      icon: CheckCircle2,
      color: 'text-green-600',
    },
    {
      title: 'Fast Performance',
      description: 'Dashboard loads in under 2 seconds',
      icon: Zap,
      color: 'text-yellow-600',
    },
    {
      title: 'Full Coverage',
      description: 'All 5 personas with complete feature sets',
      icon: Users,
      color: 'text-blue-600',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Feature Grid */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Comprehensive Features
          </h2>
          <p className="text-muted-foreground mt-2">
            Everything you need for intelligent course scheduling
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`p-3 rounded-lg ${feature.bgColor} w-fit`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">{feature.highlight}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Technical Stack */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Modern Tech Stack
          </CardTitle>
          <CardDescription className="text-center">
            Built with industry-leading technologies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-3">
            {technicalHighlights.map((tech) => (
              <Badge key={tech} variant="outline" className="text-sm px-4 py-2">
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Key Achievements
          </h2>
          <p className="text-muted-foreground mt-2">
            Delivering on all project requirements
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <Card key={achievement.title} className="text-center border-2">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-muted">
                      <Icon className={`h-8 w-8 ${achievement.color}`} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

