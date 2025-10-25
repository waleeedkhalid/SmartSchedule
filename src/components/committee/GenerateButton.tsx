// // components/committee/GenerateButton.tsx

// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Badge } from "@/components/ui/badge";
// import type { ConflictInfo, ScheduleOut } from "@/types";

// interface GenerateResult {
//   versionId?: string;
//   schedule?: ScheduleOut;
//   conflicts?: ConflictInfo[];
//   error?: string;
// }

// export function GenerateButton() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [result, setResult] = useState<GenerateResult | null>(null);
//   const [showDialog, setShowDialog] = useState(false);

//   const handleGenerate = async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch("/api/committee/schedule/generate", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setResult(data);
//       } else {
//         setResult({ error: data.error || "Generation failed" });
//       }
//     } catch (error) {
//       setResult({
//         error: error instanceof Error ? error.message : "Network error",
//       });
//     } finally {
//       setIsLoading(false);
//       setShowDialog(true);
//     }
//   };

//   return (
//     <>
//       <Button onClick={handleGenerate} disabled={isLoading} size="lg">
//         {isLoading
//           ? "Generating Schedule..."
//           : "Generate Initial Schedule (V1)"}
//       </Button>

//       <Dialog open={showDialog} onOpenChange={setShowDialog}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>
//               {result?.error ? "Generation Failed" : "Schedule Generated"}
//             </DialogTitle>
//             <DialogDescription>
//               {result?.error ? (
//                 <Alert variant="destructive">
//                   <AlertDescription>{result.error}</AlertDescription>
//                 </Alert>
//               ) : (
//                 <div className="space-y-4">
//                   <Alert>
//                     <AlertDescription className="text-green-600">
//                       Schedule V1 generated successfully! Version ID:{" "}
//                       {result?.versionId}
//                     </AlertDescription>
//                   </Alert>

//                   {result?.schedule && (
//                     <div>
//                       <h4 className="font-semibold mb-2">Generated Courses:</h4>
//                       <div className="space-y-2">
//                         {result.schedule.courses.map((course) => (
//                           <div
//                             key={course.code}
//                             className="flex items-center gap-2"
//                           >
//                             <Badge variant="outline">{course.code}</Badge>
//                             <span className="text-sm">{course.name}</span>
//                             <span className="text-xs text-muted-foreground">
//                               ({course.sections.length} sections)
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {result?.conflicts && result.conflicts.length > 0 && (
//                     <div>
//                       <h4 className="font-semibold mb-2 text-orange-600">
//                         Conflicts Detected ({result.conflicts.length}):
//                       </h4>
//                       <div className="space-y-2 max-h-40 overflow-y-auto">
//                         {result.conflicts.map((conflict, index) => (
//                           <Alert key={index} variant="destructive">
//                             <AlertDescription>
//                               <div className="flex items-start gap-2">
//                                 <Badge variant="secondary" className="text-xs">
//                                   {conflict.type}
//                                 </Badge>
//                                 <span className="text-sm">
//                                   {conflict.message}
//                                 </span>
//                               </div>
//                             </AlertDescription>
//                           </Alert>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </DialogDescription>
//           </DialogHeader>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }
