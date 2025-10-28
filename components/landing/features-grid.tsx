import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Users, 
  LayoutDashboard, 
  Clock, 
  Heart, 
  GitBranch 
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Intelligent Scheduling",
    description: "One-click generation of conflict-free schedules. Automatically detects and resolves room, time, and instructor conflicts.",
    color: "text-brand-blue-600 dark:text-brand-blue-500",
  },
  {
    icon: Users,
    title: "Real-Time Collaboration",
    description: "Live editing with comments and notifications. Multiple team members can work together seamlessly on the same schedule.",
    color: "text-teal-600 dark:text-teal-500",
  },
  {
    icon: LayoutDashboard,
    title: "Multi-Role Dashboards",
    description: "Customized views for each persona. Students, faculty, and administrators see exactly what they need.",
    color: "text-brand-blue-700 dark:text-brand-blue-600",
  },
  {
    icon: Clock,
    title: "Exam Management",
    description: "Automated conflict detection and spacing for exams. Ensure fair scheduling with built-in constraints and rules.",
    color: "text-teal-700 dark:text-teal-600",
  },
  {
    icon: Heart,
    title: "Elective Preferences",
    description: "Student choice integration for elective courses. Collect, analyze, and incorporate student preferences into scheduling.",
    color: "text-brand-blue-600 dark:text-brand-blue-500",
  },
  {
    icon: GitBranch,
    title: "Version Control",
    description: "Named releases and change tracking. Review history, restore previous versions, and maintain audit trails.",
    color: "text-teal-600 dark:text-teal-500",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="w-full py-16 md:py-24 bg-slate-50 dark:bg-slate-900">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Powerful Features for Every Need
          </h2>
          <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-400 md:text-lg">
            Everything you need to create, manage, and collaborate on academic schedules
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.title}
                className="group hover:shadow-md transition-all duration-200 hover:border-brand-blue-300 dark:hover:border-brand-blue-700"
              >
                <CardHeader>
                  <div className="mb-2">
                    <Icon className={`h-10 w-10 ${feature.color} group-hover:scale-110 transition-transform duration-200`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

