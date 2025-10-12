// "use client";
// import React, { useState, useMemo } from "react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { cn } from "@/lib/utils";
// import { getSectionsByCourseCode } from "@/lib/committee-data-helpers";
// import type { CourseOffering } from "@/lib/types";
// import { mockCourseOfferings } from "@/data/demo-data";

// interface CapacityRecord {
//   courseCode: string;
//   sectionId: string;
//   baseCapacity: number;
//   bufferPercent: number; // 5-15 allowed
// }

// interface RegistrarCapacityManagerProps {
//   initial?: CapacityRecord[];
// }

// function clampBuffer(pct: number): number {
//   if (pct < 5) return 5;
//   if (pct > 15) return 15;
//   return pct;
// }

// export const RegistrarCapacityManager: React.FC<
//   RegistrarCapacityManagerProps
// > = ({ initial = [] }) => {
//   const [records, setRecords] = useState<CapacityRecord[]>(initial);
//   const [selectedCourse, setSelectedCourse] = useState<string>("");
//   const [openNewSection, setOpenNewSection] = useState(false);
//   const [newSection, setNewSection] = useState({
//     courseCode: "",
//     instructor: "",
//     dayPattern: "Sun/Tue/Thu",
//     start: "09:00",
//     end: "09:50",
//     room: "",
//     capacity: 30,
//   });

//   const sweCourses = useMemo(
//     () => mockCourseOfferings.filter((c) => c.department === "SWE"),
//     []
//   );

//   const currentSections = useMemo(() => {
//     if (!selectedCourse)
//       return [] as ReturnType<typeof getSectionsByCourseCode>;
//     return getSectionsByCourseCode(
//       mockCourseOfferings as unknown as CourseOffering[],
//       selectedCourse
//     );
//   }, [selectedCourse]);

//   function updateBuffer(sectionId: string, delta: number) {
//     setRecords((prev) => {
//       const rec = prev.find((r) => r.sectionId === sectionId);
//       if (!rec) return prev;
//       const nextPct = clampBuffer(rec.bufferPercent + delta);
//       const updated = prev.map((r) =>
//         r.sectionId === sectionId ? { ...r, bufferPercent: nextPct } : r
//       );
//       console.log("Registrar: updating capacity buffer", {
//         sectionId,
//         bufferPercent: nextPct,
//       });
//       return updated;
//     });
//   }

//   function attachSection(
//     sectionId: string,
//     courseCode: string,
//     baseCapacity: number
//   ) {
//     setRecords((prev) => {
//       if (prev.some((r) => r.sectionId === sectionId)) return prev;
//       const bufferPercent = 5;
//       const next = [
//         ...prev,
//         { sectionId, courseCode, baseCapacity, bufferPercent },
//       ];
//       console.log("Registrar: tracking section capacity buffer", {
//         sectionId,
//         courseCode,
//         baseCapacity,
//         bufferPercent,
//       });
//       return next;
//     });
//   }

//   const totalAddedSeats = records.reduce(
//     (sum, r) => sum + Math.floor((r.baseCapacity * r.bufferPercent) / 100),
//     0
//   );
//   function effectiveCapacity(r: CapacityRecord): number {
//     return (
//       r.baseCapacity + Math.floor((r.baseCapacity * r.bufferPercent) / 100)
//     );
//   }

//   function createNewSection() {
//     if (!newSection.courseCode || !newSection.instructor || !newSection.room)
//       return;
//     const id = `${newSection.courseCode}-${Math.random()
//       .toString(36)
//       .slice(2, 8)}`;
//     console.log("Registrar: creating NEW SECTION (prototype only)", {
//       id,
//       ...newSection,
//     });
//     attachSection(id, newSection.courseCode, newSection.capacity);
//     setOpenNewSection(false);
//   }

//   return (
//     <Card className="mt-8">
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <div>
//             <CardTitle>Section Capacity & Additions</CardTitle>
//             <p className="text-xs text-muted-foreground mt-1">
//               Registrar-managed buffer (5% - 15%) & prototype new section
//               requests
//             </p>
//           </div>
//           <Dialog open={openNewSection} onOpenChange={setOpenNewSection}>
//             <DialogTrigger asChild>
//               <Button size="sm" variant="secondary">
//                 New Section
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-lg">
//               <DialogHeader>
//                 <DialogTitle>Create New Section (Prototype)</DialogTitle>
//               </DialogHeader>
//               <div className="space-y-4">
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-xs font-medium mb-1">
//                       Course
//                     </label>
//                     <Select
//                       value={newSection.courseCode}
//                       onValueChange={(v) =>
//                         setNewSection((s) => ({ ...s, courseCode: v }))
//                       }
//                     >
//                       <SelectTrigger className="h-8 text-xs">
//                         <SelectValue placeholder="Select" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {sweCourses.map((c) => (
//                           <SelectItem key={c.code} value={c.code}>
//                             {c.code}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium mb-1">
//                       Instructor
//                     </label>
//                     <Input
//                       value={newSection.instructor}
//                       onChange={(e) =>
//                         setNewSection((s) => ({
//                           ...s,
//                           instructor: e.target.value,
//                         }))
//                       }
//                       placeholder="Dr. Name"
//                       className="h-8 text-xs"
//                     />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-3 gap-3">
//                   <div>
//                     <label className="block text-xs font-medium mb-1">
//                       Start
//                     </label>
//                     <Input
//                       value={newSection.start}
//                       onChange={(e) =>
//                         setNewSection((s) => ({ ...s, start: e.target.value }))
//                       }
//                       className="h-8 text-xs"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium mb-1">
//                       End
//                     </label>
//                     <Input
//                       value={newSection.end}
//                       onChange={(e) =>
//                         setNewSection((s) => ({ ...s, end: e.target.value }))
//                       }
//                       className="h-8 text-xs"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium mb-1">
//                       Capacity
//                     </label>
//                     <Input
//                       type="number"
//                       value={newSection.capacity}
//                       onChange={(e) =>
//                         setNewSection((s) => ({
//                           ...s,
//                           capacity: Number(e.target.value),
//                         }))
//                       }
//                       className="h-8 text-xs"
//                     />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-xs font-medium mb-1">
//                       Room
//                     </label>
//                     <Input
//                       value={newSection.room}
//                       onChange={(e) =>
//                         setNewSection((s) => ({ ...s, room: e.target.value }))
//                       }
//                       className="h-8 text-xs"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium mb-1">
//                       Pattern
//                     </label>
//                     <Input
//                       value={newSection.dayPattern}
//                       onChange={(e) =>
//                         setNewSection((s) => ({
//                           ...s,
//                           dayPattern: e.target.value,
//                         }))
//                       }
//                       className="h-8 text-xs"
//                     />
//                   </div>
//                 </div>
//                 <div className="flex justify-end gap-2 pt-2">
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => setOpenNewSection(false)}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     size="sm"
//                     onClick={createNewSection}
//                     disabled={
//                       !newSection.courseCode ||
//                       !newSection.instructor ||
//                       !newSection.room
//                     }
//                   >
//                     Create
//                   </Button>
//                 </div>
//               </div>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="space-y-2">
//             <label className="block text-xs font-semibold">Select Course</label>
//             <Select value={selectedCourse} onValueChange={setSelectedCourse}>
//               <SelectTrigger className="h-8 text-xs">
//                 <SelectValue placeholder="Choose" />
//               </SelectTrigger>
//               <SelectContent>
//                 {sweCourses.map((c) => (
//                   <SelectItem key={c.code} value={c.code}>
//                     {c.code}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="p-3 border rounded-md bg-muted/40 text-xs flex flex-col gap-1">
//             <div>
//               <span className="font-semibold">Tracked Sections:</span>{" "}
//               {records.length}
//             </div>
//             <div>
//               <span className="font-semibold">Total Added Seats:</span>{" "}
//               {totalAddedSeats}
//             </div>
//           </div>
//           <div className="p-3 border rounded-md bg-muted/40 text-xs flex flex-col gap-1">
//             <div className="font-semibold">Policy</div>
//             <div>Registrar may expand 5%-15% capacity per section.</div>
//           </div>
//         </div>
//         <div className="border rounded-md p-3 bg-muted/30">
//           <h4 className="font-semibold mb-2 text-sm">Sections</h4>
//           {!selectedCourse && (
//             <p className="text-xs text-muted-foreground">
//               Select a course to view sections.
//             </p>
//           )}
//           {selectedCourse && currentSections.length === 0 && (
//             <p className="text-xs text-muted-foreground">No sections found.</p>
//           )}
//           {selectedCourse && currentSections.length > 0 && (
//             <ScrollArea className="max-h-80 pr-2">
//               <div className="space-y-2">
//                 {currentSections.map((sec) => {
//                   const rec = records.find((r) => r.sectionId === sec.id);
//                   const baseCap = 30; // prototype default, real value from data later
//                   return (
//                     <div
//                       key={sec.id}
//                       className={cn(
//                         "border rounded-md bg-white dark:bg-slate-900 p-3 text-xs flex flex-col gap-2",
//                         rec && "ring-2 ring-primary/50"
//                       )}
//                     >
//                       <div className="flex flex-wrap items-center justify-between gap-2">
//                         <div className="flex flex-col">
//                           <span className="font-semibold tracking-tight">
//                             {sec.courseCode} - {sec.id}
//                           </span>
//                           <span className="text-[10px] text-muted-foreground">
//                             {sec.instructor}
//                           </span>
//                         </div>
//                         {!rec && (
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             className="h-7"
//                             onClick={() =>
//                               attachSection(sec.id, sec.courseCode, baseCap)
//                             }
//                           >
//                             Track
//                           </Button>
//                         )}
//                         {rec && (
//                           <div className="flex items-center gap-1">
//                             <Button
//                               size="sm"
//                               variant="ghost"
//                               className="h-7 px-2"
//                               onClick={() => updateBuffer(sec.id, -1)}
//                               disabled={rec.bufferPercent <= 5}
//                             >
//                               -
//                             </Button>
//                             <Badge
//                               variant="secondary"
//                               className="px-2 py-0 h-6 flex items-center justify-center font-medium"
//                             >
//                               {rec.bufferPercent}%
//                             </Badge>
//                             <Button
//                               size="sm"
//                               variant="ghost"
//                               className="h-7 px-2"
//                               onClick={() => updateBuffer(sec.id, +1)}
//                               disabled={rec.bufferPercent >= 15}
//                             >
//                               +
//                             </Button>
//                           </div>
//                         )}
//                       </div>
//                       {rec && (
//                         <div className="grid grid-cols-3 gap-2 text-[10px]">
//                           <div>
//                             <span className="font-semibold">Base:</span>{" "}
//                             {rec.baseCapacity}
//                           </div>
//                           <div>
//                             <span className="font-semibold">Added:</span>{" "}
//                             {Math.floor(
//                               (rec.baseCapacity * rec.bufferPercent) / 100
//                             )}
//                           </div>
//                           <div>
//                             <span className="font-semibold">Effective:</span>{" "}
//                             {effectiveCapacity(rec)}
//                           </div>
//                           <div className="col-span-3 text-muted-foreground mt-1">
//                             Console payload logged on changes.
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </ScrollArea>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default RegistrarCapacityManager;

export default function RegistrarCapacityManager() {
  return <div>Registrar Capacity Manager - Coming Soon!</div>;
}
