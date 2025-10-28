import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Sparkles, Users2 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Database,
    title: "Setup",
    description: "Import data via JSON or create courses, rooms, instructors, and student groups using intuitive forms.",
    color: "bg-brand-blue-100 text-brand-blue-700 dark:bg-brand-blue-950 dark:text-brand-blue-500",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Generate",
    description: "Click 'Recommend Schedule' to generate a conflict-free schedule in seconds using intelligent algorithms.",
    color: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-500",
  },
  {
    number: "03",
    icon: Users2,
    title: "Collaborate",
    description: "Make manual tweaks, add comments, and collaborate with your team in real-time with instant conflict detection.",
    color: "bg-brand-blue-100 text-brand-blue-700 dark:bg-brand-blue-950 dark:text-brand-blue-500",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-16 md:py-24">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            How It Works
          </h2>
          <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-400 md:text-lg">
            Three simple steps to transform your scheduling process
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-blue-200 via-teal-200 to-brand-blue-200 dark:from-brand-blue-900 dark:via-teal-900 dark:to-brand-blue-900 -z-10" />
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card 
                key={step.number}
                className="relative hover:shadow-md transition-all duration-200 border-slate-200 dark:border-slate-800"
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full gradient-blue flex items-center justify-center text-white text-2xl font-bold shadow-md">
                    {index + 1}
                  </div>
                  <div className={`inline-flex p-3 rounded-lg ${step.color} mx-auto mb-2`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base leading-relaxed">
                    {step.description}
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

