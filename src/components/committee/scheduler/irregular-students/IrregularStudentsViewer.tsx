// "use client";
// import React from "react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { BellIcon, Users } from "lucide-react";
// import { mockSWEIrregularStudents } from "@/data/demo-data";
// import { useToastContext } from "@/components/ui/toast-provider";

// export function IrregularStudentsViewer() {
//   const toast = useToastContext();

//   const handleNotifyRegistrar = () => {
//     toast.push({
//       title: "Registrar Notified",
//       description:
//         "The registrar has been notified about the irregular students.",
//     });
//   };

//   if (mockSWEIrregularStudents.length === 0) {
//     return (
//       <Card className="border-dashed border-2">
//         <CardHeader className="text-center space-y-4 p-8">
//           <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
//             <Users className="h-8 w-8 text-primary" />
//           </div>
//           <div className="space-y-2">
//             <h3 className="text-lg font-medium">No Irregular Students</h3>
//             <p className="text-sm text-muted-foreground">
//               There are currently no students with special scheduling
//               requirements.
//             </p>
//           </div>
//           <Button
//             variant="outline"
//             size="sm"
//             className="mt-2 mx-auto gap-2"
//             onClick={handleNotifyRegistrar}
//           >
//             <BellIcon className="h-4 w-4" />
//             Request Registrar Review
//           </Button>
//         </CardHeader>
//       </Card>
//     );
//   }

//   return (
//     <Card className="overflow-hidden">
//       <div className="p-1">
//         <CardHeader className="pb-3 px-6 pt-4">
//           <div className="flex items-center justify-between">
//             <div className="space-y-1">
//               <div className="flex items-center gap-2">
//                 <Users className="h-5 w-5 text-primary" />
//                 <CardTitle className="text-lg">Irregular Students</CardTitle>
//               </div>
//               <CardDescription className="text-sm">
//                 Students requiring special scheduling arrangements
//               </CardDescription>
//             </div>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={handleNotifyRegistrar}
//               className="gap-2 bg-background/80 backdrop-blur-sm"
//             >
//               <BellIcon className="h-4 w-4" />
//               Notify Registrar
//             </Button>
//           </div>
//         </CardHeader>
//       </div>

//       <CardContent className="p-0 divide-y">
//         {mockSWEIrregularStudents.map((student, index) => (
//           <div key={index} className="p-4 hover:bg-muted/30 transition-colors">
//             <div className="flex items-start justify-between">
//               <div className="space-y-2">
//                 <div className="flex items-center gap-2">
//                   <h3 className="font-medium">{student.name}</h3>
//                   <Badge variant="outline" className="text-xs">
//                     {student.requiredCourses.length} course
//                     {student.requiredCourses.length !== 1 ? "s" : ""}
//                   </Badge>
//                 </div>
//                 <div className="flex flex-wrap gap-1.5">
//                   {student.requiredCourses.map((course, i) => (
//                     <Badge
//                       key={i}
//                       variant="secondary"
//                       className="font-mono text-xs px-2 py-0.5"
//                     >
//                       {course}
//                     </Badge>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </CardContent>
//     </Card>
//   );
// }
