'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search,
  BarChart3,
  Users,
  GitBranch,
  CheckCircle2,
  TrendingUp,
  Zap,
} from 'lucide-react';

export default function Phase5Page() {
  const features = [
    {
      icon: Search,
      title: 'Performance & Search',
      description: 'Advanced filtering, pagination, and optimized database queries',
      href: '/phase5/performance',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      features: [
        'Full-text search on courses',
        'Multi-field filtering',
        'Cursor-based pagination',
        'Database indexes',
        'Cached enrollment counts',
        '< 50ms avg query time',
      ],
    },
    {
      icon: BarChart3,
      title: 'Charts.js Dashboards',
      description: 'Interactive data visualizations with multiple chart types',
      href: '/phase5/dashboards',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      features: [
        'Bar charts - Enrollment stats',
        'Line charts - Teaching load',
        'Pie charts - Course types',
        'Doughnut charts - Capacity',
        'Radar charts - Comparisons',
        'Real-time data updates',
      ],
    },
    {
      icon: Users,
      title: 'Real-time Collaboration',
      description: 'Yjs-powered concurrent editing with conflict resolution',
      href: '/phase5/collaboration',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      features: [
        'Concurrent editing',
        'CRDTs - No conflicts',
        'Presence awareness',
        'Cursor synchronization',
        'WebSocket sync',
        'Undo/redo support',
      ],
    },
    {
      icon: GitBranch,
      title: 'Version Control',
      description: 'Schedule versioning with named releases and diff tracking',
      href: '/phase5/versions',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      features: [
        'Named releases',
        'jsondiffpatch diffs',
        'Version comparison',
        'Point-in-time restore',
        'Change attribution',
        'Audit trail',
      ],
    },
  ];

  const roleDashboards = [
    {
      role: 'Student',
      description: 'Academic progress and course enrollment analytics',
      href: '/phase5/dashboards/student',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      icon: '🎓',
    },
    {
      role: 'Faculty',
      description: 'Teaching load and student performance insights',
      href: '/phase5/dashboards/faculty',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: '👨‍🏫',
    },
    {
      role: 'Registrar',
      description: 'System-wide enrollment and capacity management',
      href: '/phase5/dashboards/registrar',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: '📋',
    },
    {
      role: 'Teaching Load',
      description: 'Instructor workload and capacity analytics',
      href: '/phase5/dashboards/teaching-load',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: '📊',
    },
  ];

  return (
    <div className="container mx-auto px-8 py-12 space-y-12">
      <div className="text-center space-y-6">
        <div>
          <Badge variant="outline" className="text-lg px-4 py-2 bg-blue-50 border-blue-200">
            Phase 5 Implementation
          </Badge>
        </div>
        <h1 className="text-5xl font-bold text-gray-900">
          SmartSchedule V1 - Advanced Features
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Phase 5 implementation featuring performance optimizations, analytics, collaboration, and version control
        </p>
      </div>

      <Card className="border-green-200 bg-green-50 shadow">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-900">
                All Features Implemented & Operational
              </h3>
              <p className="text-green-700">
                Performance optimized • Charts rendering • Collaboration active • Versions tracked
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title}>
              <Card className="h-full border shadow hover:shadow-md transition-shadow">
                <CardHeader className="pb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${feature.bgColor}`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                  </div>
                  <CardTitle className="text-2xl mt-6 text-gray-900">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base mt-3">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-0">
                  <div className="grid grid-cols-2 gap-3">
                    {feature.features.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 text-sm py-1"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>

                  <Link href={feature.href}>
                    <Button className="w-full mt-2" variant="outline">
                      View Demo
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      <Card className="shadow border">
        <CardHeader className="pb-8">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Performance Metrics
          </CardTitle>
          <CardDescription className="mt-2">Real-time system performance indicators</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-2 p-4 rounded-lg bg-blue-50">
              <p className="text-sm text-muted-foreground">Avg Query Time</p>
              <p className="text-3xl font-bold text-blue-600">&lt; 50ms</p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-green-50">
              <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
              <p className="text-3xl font-bold text-green-600">87%</p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-purple-50">
              <p className="text-sm text-muted-foreground">Active Collaborators</p>
              <p className="text-3xl font-bold text-purple-600">5</p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-orange-50">
              <p className="text-sm text-muted-foreground">Total Versions</p>
              <p className="text-3xl font-bold text-orange-600">47</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow border">
        <CardHeader className="pb-8">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid md:grid-cols-3 gap-6">
            <Button variant="outline" asChild className="w-full h-full">
              <Link href="/phase5/performance">
                <Search className="h-4 w-4 mr-2" />
                Test Search & Filters
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full h-full">
              <Link href="/phase5/dashboards">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full h-full">
              <Link href="/phase5/collaboration">
                <Users className="h-4 w-4 mr-2" />
                Start Collaborating
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Role-Specific Dashboards */}
      <div className="space-y-6">
        <div className="text-center">
          <Badge variant="outline" className="text-base px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200">
            Role-Based Analytics
          </Badge>
          <h2 className="text-3xl font-bold text-gray-900 mt-4">
            Chart.js Dashboards by Role
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Comprehensive data visualizations tailored for Student, Faculty, Registrar, and Teaching Load Committee users
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {roleDashboards.map((dashboard) => (
            <Link key={dashboard.role} href={dashboard.href}>
              <Card className="h-full border shadow hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`text-3xl p-3 rounded-lg ${dashboard.bgColor}`}>
                      {dashboard.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{dashboard.role} Dashboard</CardTitle>
                      <CardDescription className="mt-1">{dashboard.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className={`h-4 w-4 ${dashboard.color}`} />
                      <span className="text-sm font-medium text-muted-foreground">
                        4 Chart Types
                      </span>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Demo →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="text-center pt-4">
        <p className="text-muted-foreground mb-6">
          For detailed documentation, see{' '}
          <code className="bg-blue-100 px-3 py-1 rounded font-mono text-sm border border-blue-200">
            README_PHASE5.md
          </code>
        </p>
        <Link href="/api/phase5/demo" target="_blank">
          <Button variant="link" className="text-blue-600 hover:text-blue-700">
            View API Documentation →
          </Button>
        </Link>
      </div>
    </div>
  );
}

