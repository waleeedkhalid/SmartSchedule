// /**
//  * GenerateScheduleDialog
//  *
//  * UI component for triggering schedule generation.
//  * Allows users to:
//  * - Select levels to generate (4-8)
//  * - Choose optimization goals
//  * - Toggle irregular students consideration
//  * - Trigger generation via API
//  */

// "use client";

// import { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
// import { Loader2, Sparkles } from "lucide-react";
// import { ScheduleGenerationRequest, GeneratedSchedule } from "@/lib/types";

// interface GenerateScheduleDialogProps {
//   semester: string;
//   onScheduleGenerated: (schedule: GeneratedSchedule) => void;
//   triggerButton?: React.ReactNode;
// }

// export function GenerateScheduleDialog({
//   semester,
//   onScheduleGenerated,
//   triggerButton,
// }: GenerateScheduleDialogProps) {
//   const [open, setOpen] = useState(false);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [selectedLevels, setSelectedLevels] = useState<number[]>([
//     4, 5, 6, 7, 8,
//   ]);
//   const [considerIrregular, setConsiderIrregular] = useState(false);
//   const [optimizationGoals, setOptimizationGoals] = useState<
//     ("minimize-conflicts" | "balance-load" | "prefer-morning")[]
//   >(["minimize-conflicts"]);

//   const levels = [4, 5, 6, 7, 8];

//   const optimizationOptions: Array<{
//     value: "minimize-conflicts" | "balance-load" | "prefer-morning";
//     label: string;
//   }> = [
//     { value: "minimize-conflicts", label: "Minimize Conflicts" },
//     { value: "balance-load", label: "Balance Faculty Load" },
//     { value: "prefer-morning", label: "Prefer Morning Slots" },
//   ];

//   const toggleLevel = (level: number) => {
//     setSelectedLevels((prev) =>
//       prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
//     );
//   };

//   const toggleOptimization = (
//     goal: "minimize-conflicts" | "balance-load" | "prefer-morning"
//   ) => {
//     setOptimizationGoals((prev) => {
//       if (prev.includes(goal)) {
//         return prev.filter((g) => g !== goal);
//       } else {
//         return [...prev, goal];
//       }
//     });
//   };

//   const handleGenerate = async () => {
//     if (selectedLevels.length === 0) {
//       alert("Please select at least one level to generate.");
//       return;
//     }

//     setIsGenerating(true);

//     try {
//       const request: ScheduleGenerationRequest = {
//         semester,
//         levels: selectedLevels.sort((a, b) => a - b),
//         considerIrregularStudents: considerIrregular,
//         optimizationGoals,
//       };

//       console.log("Sending schedule generation request:", request);

//       const response = await fetch("/api/schedule/generate", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(request),
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.error || "Failed to generate schedule");
//       }

//       const schedule: GeneratedSchedule = await response.json();
//       console.log("Schedule generated successfully:", schedule);

//       onScheduleGenerated(schedule);
//       setOpen(false);
//     } catch (error) {
//       console.error("Schedule generation failed:", error);
//       alert(
//         error instanceof Error
//           ? error.message
//           : "Failed to generate schedule. Check console for details."
//       );
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         {triggerButton || (
//           <Button>
//             <Sparkles className="w-4 h-4 mr-2" />
//             Generate Schedule
//           </Button>
//         )}
//       </DialogTrigger>
//       <DialogContent className="max-w-2xl">
//         <DialogHeader>
//           <DialogTitle>Generate Course Schedule</DialogTitle>
//           <DialogDescription>
//             Configure parameters for automated schedule generation for{" "}
//             {semester}
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-6 py-4">
//           {/* Level Selection */}
//           <div className="space-y-3">
//             <Label className="text-base font-medium">Select Levels</Label>
//             <div className="grid grid-cols-5 gap-4">
//               {levels.map((level) => (
//                 <div key={level} className="flex items-center space-x-2">
//                   <Checkbox
//                     id={`level-${level}`}
//                     checked={selectedLevels.includes(level)}
//                     onChange={() => toggleLevel(level)}
//                   />
//                   <Label
//                     htmlFor={`level-${level}`}
//                     className="text-sm font-normal cursor-pointer"
//                   >
//                     Level {level}
//                   </Label>
//                 </div>
//               ))}
//             </div>
//             <p className="text-xs text-muted-foreground">
//               Selected: {selectedLevels.length} level
//               {selectedLevels.length !== 1 ? "s" : ""}
//             </p>
//           </div>

//           {/* Optimization Goals */}
//           <div className="space-y-3">
//             <Label className="text-base font-medium">Optimization Goals</Label>
//             <div className="space-y-2">
//               {optimizationOptions.map((option) => (
//                 <div key={option.value} className="flex items-center space-x-2">
//                   <Checkbox
//                     id={option.value}
//                     checked={optimizationGoals.includes(option.value)}
//                     onChange={() => toggleOptimization(option.value)}
//                   />
//                   <Label
//                     htmlFor={option.value}
//                     className="text-sm font-normal cursor-pointer"
//                   >
//                     {option.label}
//                   </Label>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Irregular Students */}
//           <div className="space-y-3">
//             <div className="flex items-center space-x-2">
//               <Checkbox
//                 id="irregular"
//                 checked={considerIrregular}
//                 onChange={() => setConsiderIrregular(!considerIrregular)}
//               />
//               <Label
//                 htmlFor="irregular"
//                 className="text-sm font-normal cursor-pointer"
//               >
//                 Consider irregular students (experimental)
//               </Label>
//             </div>
//             <p className="text-xs text-muted-foreground">
//               When enabled, the generator will account for students taking
//               courses outside their regular level.
//             </p>
//           </div>
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={() => setOpen(false)}>
//             Cancel
//           </Button>
//           <Button onClick={handleGenerate} disabled={isGenerating}>
//             {isGenerating ? (
//               <>
//                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                 Generating...
//               </>
//             ) : (
//               <>
//                 <Sparkles className="w-4 h-4 mr-2" />
//                 Generate Schedule
//               </>
//             )}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
