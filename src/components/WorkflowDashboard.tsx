// "use client";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { Badge } from "@/components/ui/badge";
// import { workflowSteps, mockWorkflowState } from "@/data/mockData";

// const statusColors = {
//   COMPLETED: "bg-green-500",
//   IN_PROGRESS: "bg-blue-500",
//   PENDING: "bg-gray-200",
//   BLOCKED: "bg-red-500"
// } as const;

// export function WorkflowDashboard() {
//   const completedSteps = workflowSteps.filter(
//     (step) => step.status === "COMPLETED"
//   ).length;
//   const progress = Math.round((completedSteps / workflowSteps.length) * 100);

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="text-2xl font-bold tracking-tight">Workflow Progress</h2>
//         <p className="text-muted-foreground">
//           {completedSteps} of {workflowSteps.length} steps completed
//         </p>
//         <Progress value={progress} className="mt-2 h-2" />
//       </div>

//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//         {workflowSteps.map((step) => (
//           <Card key={step.id} className="h-full">
//             <CardHeader className="pb-2">
//               <div className="flex items-center justify-between">
//                 <CardTitle className="text-lg">{step.name}</CardTitle>
//                 <Badge
//                   variant="outline"
//                   className={`${
//                     statusColors[step.status] || "bg-gray-200"
//                   } text-white`}
//                 >
//                   {step.status.replace("_", " ")}
//                 </Badge>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <p className="text-sm text-muted-foreground">
//                 {step.description}
//               </p>
//               <div className="mt-4 text-sm">
//                 <div className="font-medium">Responsible:</div>
//                 <div className="text-muted-foreground">
//                   {step.responsible}
//                 </div>
//                 {step.artifacts && step.artifacts.length > 0 && (
//                   <div className="mt-2">
//                     <div className="font-medium">Artifacts:</div>
//                     <div className="text-muted-foreground">
//                       {step.artifacts.join(", ")}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }
