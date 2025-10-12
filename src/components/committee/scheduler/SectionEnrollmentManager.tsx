// "use client";
// import React, { useState, useMemo } from "react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { mockCourseOfferings, mockSWEStudents } from "@/data/demo-data";
// import { getSectionsByCourseCode } from "@/lib/committee-data-helpers";
// import {
//   getEnrollmentOverridesForSection,
//   addEnrollmentOverride,
//   removeEnrollmentOverride,
//   createEnrollmentRequest,
// } from "@/lib/local-state";
// import type { SWEStudent } from "@/lib/types";
// import { cn } from "@/lib/utils";
// import {
//   Users,
//   UserPlus,
//   Search,
//   X,
//   CheckCircle2,
//   AlertCircle,
//   Info,
// } from "lucide-react";

// interface SectionCapacityInfo {
//   sectionId: string;
//   courseCode: string;
//   capacity: number;
//   bufferSeats: number;
// }

// export const SectionEnrollmentManager: React.FC = () => {
//   const [courseCodeFilter, setCourseCodeFilter] = useState("");
//   const [activeSection, setActiveSection] = useState<{
//     sectionId: string;
//     courseCode: string;
//   } | null>(null);
//   const [studentSearch, setStudentSearch] = useState("");
//   const [studentIdInput, setStudentIdInput] = useState("");
//   const [enrollMode, setEnrollMode] = useState<"committee" | "student">(
//     "committee"
//   );
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [notification, setNotification] = useState<{
//     type: "success" | "error" | "info";
//     message: string;
//   } | null>(null);
//   const [capacityOverrides] = useState<Record<string, SectionCapacityInfo>>({});

//   // Auto-hide notifications
//   React.useEffect(() => {
//     if (notification) {
//       const timer = setTimeout(() => setNotification(null), 4000);
//       return () => clearTimeout(timer);
//     }
//   }, [notification]);

//   const filteredCourses = useMemo(
//     () =>
//       mockCourseOfferings.filter(
//         (c) =>
//           c.department === "SWE" &&
//           (!courseCodeFilter ||
//             c.code.toLowerCase().includes(courseCodeFilter.toLowerCase()) ||
//             c.name.toLowerCase().includes(courseCodeFilter.toLowerCase()))
//       ),
//     [courseCodeFilter]
//   );

//   const selectedCourseSections = useMemo(() => {
//     if (!activeSection) return [];
//     return getSectionsByCourseCode(
//       mockCourseOfferings,
//       activeSection.courseCode
//     );
//   }, [activeSection]);

//   function getCapacityInfo(
//     sectionId: string,
//     courseCode: string
//   ): SectionCapacityInfo {
//     if (capacityOverrides[sectionId]) {
//       return capacityOverrides[sectionId];
//     }
//     return {
//       sectionId,
//       courseCode,
//       capacity: 30,
//       bufferSeats: 0,
//     };
//   }

//   // Reserved for future capacity override integration with registrar
//   // function setCapacityInfo(info: SectionCapacityInfo) {
//   //   setCapacityOverrides(prev => ({ ...prev, [info.sectionId]: info }));
//   // }

//   function getEnrolledStudents(sectionId: string): string[] {
//     return getEnrollmentOverridesForSection(sectionId).map((o) => o.studentId);
//   }

//   function handleEnrollStudent(
//     sectionId: string,
//     courseCode: string,
//     studentId: string,
//     studentName: string
//   ) {
//     if (!studentId) return;

//     const enrolled = getEnrolledStudents(sectionId);
//     if (enrolled.includes(studentId)) {
//       setNotification({
//         type: "error",
//         message: `Student ${studentId} is already enrolled in this section`,
//       });
//       return;
//     }

//     const capacityInfo = getCapacityInfo(sectionId, courseCode);
//     const limit = capacityInfo.capacity + capacityInfo.bufferSeats;

//     if (enrollMode === "committee") {
//       // Committee can override up to limit
//       if (enrolled.length >= limit) {
//         setNotification({
//           type: "error",
//           message: `Section full (${enrolled.length}/${limit}). Cannot add more students.`,
//         });
//         return;
//       }

//       addEnrollmentOverride(sectionId, courseCode, studentId, "committee");
//       setNotification({
//         type: "success",
//         message: `✅ Committee enrolled ${studentName} (${studentId}) in ${courseCode}`,
//       });
//     } else {
//       // Student mode: if full, create request
//       if (enrolled.length >= limit) {
//         createEnrollmentRequest(sectionId, courseCode, studentId, studentName);
//         setNotification({
//           type: "info",
//           message: `📝 Request submitted for ${studentName} (${studentId}). Pending registrar approval.`,
//         });
//       } else {
//         // Section has space, enroll directly
//         addEnrollmentOverride(sectionId, courseCode, studentId, "committee");
//         setNotification({
//           type: "success",
//           message: `✅ Student ${studentName} (${studentId}) enrolled in ${courseCode}`,
//         });
//       }
//     }

//     setStudentIdInput("");
//     setStudentSearch("");
//     setDialogOpen(false);
//   }

//   function handleRemoveStudent(
//     sectionId: string,
//     courseCode: string,
//     studentId: string
//   ) {
//     const success = removeEnrollmentOverride(sectionId, studentId);
//     if (success) {
//       setNotification({
//         type: "success",
//         message: `Removed student ${studentId} from ${courseCode}`,
//       });
//     } else {
//       setNotification({ type: "error", message: "Failed to remove student" });
//     }
//   }

//   const matchingStudents: SWEStudent[] = useMemo(() => {
//     if (!studentSearch) return mockSWEStudents.slice(0, 30);
//     const search = studentSearch.toLowerCase();
//     return mockSWEStudents
//       .filter(
//         (s) =>
//           s.id.toLowerCase().includes(search) ||
//           s.name.toLowerCase().includes(search)
//       )
//       .slice(0, 50);
//   }, [studentSearch]);

//   const totalEnrolled = useMemo(() => {
//     return selectedCourseSections.reduce((sum, sec) => {
//       return sum + getEnrolledStudents(sec.id).length;
//     }, 0);
//   }, [selectedCourseSections]);

//   return (
//     <Card className="mt-8">
//       <CardHeader>
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div>
//             <CardTitle className="flex items-center gap-2">
//               <Users className="h-5 w-5" />
//               Section Enrollment Management
//             </CardTitle>
//             <p className="text-sm text-muted-foreground mt-1">
//               Committee: Direct enrollment up to capacity • Students: Request
//               when full
//             </p>
//           </div>
//           <div className="flex items-center gap-2">
//             <Badge
//               variant={enrollMode === "committee" ? "default" : "outline"}
//               className="cursor-pointer"
//               onClick={() => setEnrollMode("committee")}
//             >
//               Committee Mode
//             </Badge>
//             <Badge
//               variant={enrollMode === "student" ? "default" : "outline"}
//               className="cursor-pointer"
//               onClick={() => setEnrollMode("student")}
//             >
//               Student Mode
//             </Badge>
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         {notification && (
//           <Alert
//             variant={notification.type === "error" ? "destructive" : "default"}
//             className="animate-in fade-in slide-in-from-top-2"
//           >
//             {notification.type === "success" && (
//               <CheckCircle2 className="h-4 w-4" />
//             )}
//             {notification.type === "error" && (
//               <AlertCircle className="h-4 w-4" />
//             )}
//             {notification.type === "info" && <Info className="h-4 w-4" />}
//             <AlertDescription>{notification.message}</AlertDescription>
//           </Alert>
//         )}

//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div className="md:col-span-2 space-y-2">
//             <label className="flex items-center gap-2 text-sm font-medium">
//               <Search className="h-4 w-4" />
//               Search SWE Courses
//             </label>
//             <Input
//               placeholder="Course code or name..."
//               value={courseCodeFilter}
//               onChange={(e) => setCourseCodeFilter(e.target.value)}
//               className="h-9"
//             />
//           </div>
//           <div className="p-4 border rounded-lg bg-muted/40 flex flex-col justify-center">
//             <div className="text-2xl font-bold">{filteredCourses.length}</div>
//             <div className="text-xs text-muted-foreground">
//               Available Courses
//             </div>
//           </div>
//           <div className="p-4 border rounded-lg bg-muted/40 flex flex-col justify-center">
//             <div className="text-2xl font-bold">{totalEnrolled}</div>
//             <div className="text-xs text-muted-foreground">Total Overrides</div>
//           </div>
//         </div>

//         <Tabs defaultValue="courses" className="w-full">
//           <TabsList className="grid w-full grid-cols-2">
//             <TabsTrigger value="courses">Course Selection</TabsTrigger>
//             <TabsTrigger value="sections" disabled={!activeSection}>
//               Section Details {activeSection && `(${activeSection.courseCode})`}
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="courses" className="space-y-3 mt-4">
//             <ScrollArea className="h-[400px] pr-4">
//               <div className="space-y-2">
//                 {filteredCourses.map((c) => {
//                   const sections = getSectionsByCourseCode(
//                     mockCourseOfferings,
//                     c.code
//                   );
//                   const enrolled = sections.reduce(
//                     (sum, sec) => sum + getEnrolledStudents(sec.id).length,
//                     0
//                   );
//                   return (
//                     <div
//                       key={c.code}
//                       className="border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors cursor-pointer"
//                       onClick={() =>
//                         setActiveSection({ sectionId: "", courseCode: c.code })
//                       }
//                     >
//                       <div className="flex items-start justify-between gap-3">
//                         <div className="flex-1">
//                           <div className="flex items-center gap-2">
//                             <span className="font-semibold text-base">
//                               {c.code}
//                             </span>
//                             <Badge variant="secondary" className="text-xs">
//                               {sections.length}{" "}
//                               {sections.length === 1 ? "section" : "sections"}
//                             </Badge>
//                             {enrolled > 0 && (
//                               <Badge variant="outline" className="text-xs">
//                                 {enrolled} enrolled
//                               </Badge>
//                             )}
//                           </div>
//                           <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
//                             {c.name}
//                           </p>
//                         </div>
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             setActiveSection({
//                               sectionId: "",
//                               courseCode: c.code,
//                             });
//                           }}
//                         >
//                           View Sections
//                         </Button>
//                       </div>
//                     </div>
//                   );
//                 })}
//                 {filteredCourses.length === 0 && (
//                   <div className="text-center py-12 text-muted-foreground">
//                     <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
//                     <p>
//                       No courses found matching &quot;{courseCodeFilter}&quot;
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </ScrollArea>
//           </TabsContent>

//           <TabsContent value="sections" className="space-y-3 mt-4">
//             {activeSection && (
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-lg font-semibold">
//                     Sections for {activeSection.courseCode}
//                   </h3>
//                   <Button
//                     size="sm"
//                     variant="ghost"
//                     onClick={() => setActiveSection(null)}
//                   >
//                     <X className="h-4 w-4 mr-1" />
//                     Close
//                   </Button>
//                 </div>

//                 <ScrollArea className="h-[400px] pr-4">
//                   <div className="space-y-3">
//                     {selectedCourseSections.map((sec) => {
//                       const enrolled = getEnrolledStudents(sec.id);
//                       const capacityInfo = getCapacityInfo(
//                         sec.id,
//                         sec.courseCode
//                       );
//                       const limit =
//                         capacityInfo.capacity + capacityInfo.bufferSeats;
//                       const isFull = enrolled.length >= limit;
//                       const utilization =
//                         limit > 0 ? (enrolled.length / limit) * 100 : 0;

//                       return (
//                         <div
//                           key={sec.id}
//                           className={cn(
//                             "border rounded-lg p-4 bg-card transition-all",
//                             isFull &&
//                               "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20"
//                           )}
//                         >
//                           <div className="space-y-3">
//                             <div className="flex items-start justify-between gap-3">
//                               <div>
//                                 <div className="flex items-center gap-2">
//                                   <span className="font-semibold text-base">
//                                     {sec.courseCode} - {sec.id}
//                                   </span>
//                                   {isFull && (
//                                     <Badge variant="secondary">Full</Badge>
//                                   )}
//                                 </div>
//                                 <p className="text-sm text-muted-foreground mt-0.5">
//                                   Instructor: {sec.instructor}
//                                 </p>
//                               </div>
//                               <Dialog
//                                 open={dialogOpen}
//                                 onOpenChange={setDialogOpen}
//                               >
//                                 <DialogTrigger asChild>
//                                   <Button size="sm" variant="outline">
//                                     <UserPlus className="h-4 w-4 mr-1" />
//                                     Enroll
//                                   </Button>
//                                 </DialogTrigger>
//                                 <DialogContent className="sm:max-w-lg">
//                                   <DialogHeader>
//                                     <DialogTitle>
//                                       Enroll Student - {sec.courseCode} {sec.id}
//                                     </DialogTitle>
//                                     <DialogDescription>
//                                       {enrollMode === "committee"
//                                         ? "Committee can directly enroll students up to capacity."
//                                         : "Students can enroll if space available, or submit a request if full."}
//                                     </DialogDescription>
//                                   </DialogHeader>
//                                   <div className="space-y-4 py-4">
//                                     <div className="grid grid-cols-3 gap-3 p-3 bg-muted/50 rounded-lg text-sm">
//                                       <div>
//                                         <div className="text-xs text-muted-foreground">
//                                           Enrolled
//                                         </div>
//                                         <div className="text-lg font-bold">
//                                           {enrolled.length}
//                                         </div>
//                                       </div>
//                                       <div>
//                                         <div className="text-xs text-muted-foreground">
//                                           Capacity
//                                         </div>
//                                         <div className="text-lg font-bold">
//                                           {limit}
//                                         </div>
//                                       </div>
//                                       <div>
//                                         <div className="text-xs text-muted-foreground">
//                                           Available
//                                         </div>
//                                         <div className="text-lg font-bold text-green-600 dark:text-green-400">
//                                           {Math.max(0, limit - enrolled.length)}
//                                         </div>
//                                       </div>
//                                     </div>

//                                     <div className="space-y-2">
//                                       <label className="text-sm font-medium">
//                                         Student ID
//                                       </label>
//                                       <div className="flex gap-2">
//                                         <Input
//                                           value={studentIdInput}
//                                           onChange={(e) =>
//                                             setStudentIdInput(e.target.value)
//                                           }
//                                           placeholder="e.g., 2021001234"
//                                           className="h-9"
//                                         />
//                                         <Button
//                                           size="sm"
//                                           onClick={() => {
//                                             const student =
//                                               mockSWEStudents.find(
//                                                 (s) => s.id === studentIdInput
//                                               );
//                                             handleEnrollStudent(
//                                               sec.id,
//                                               sec.courseCode,
//                                               studentIdInput,
//                                               student?.name || "Unknown Student"
//                                             );
//                                           }}
//                                           disabled={!studentIdInput}
//                                         >
//                                           Add
//                                         </Button>
//                                       </div>
//                                     </div>

//                                     <div className="relative">
//                                       <div className="absolute inset-0 flex items-center">
//                                         <span className="w-full border-t" />
//                                       </div>
//                                       <div className="relative flex justify-center text-xs uppercase">
//                                         <span className="bg-background px-2 text-muted-foreground">
//                                           Or search
//                                         </span>
//                                       </div>
//                                     </div>

//                                     <div className="space-y-2">
//                                       <label className="text-sm font-medium">
//                                         Search Students
//                                       </label>
//                                       <Input
//                                         value={studentSearch}
//                                         onChange={(e) =>
//                                           setStudentSearch(e.target.value)
//                                         }
//                                         placeholder="Name or ID..."
//                                         className="h-9"
//                                       />
//                                       <ScrollArea className="h-[200px] border rounded-md p-2">
//                                         <div className="space-y-1">
//                                           {matchingStudents.map((st) => {
//                                             const alreadyEnrolled =
//                                               enrolled.includes(st.id);
//                                             return (
//                                               <div
//                                                 key={st.id}
//                                                 className={cn(
//                                                   "flex items-center justify-between gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors",
//                                                   alreadyEnrolled &&
//                                                     "opacity-50"
//                                                 )}
//                                               >
//                                                 <div className="flex-1 min-w-0">
//                                                   <div className="font-medium text-sm truncate">
//                                                     {st.name}
//                                                   </div>
//                                                   <div className="text-xs text-muted-foreground">
//                                                     {st.id}
//                                                   </div>
//                                                 </div>
//                                                 <Button
//                                                   size="sm"
//                                                   variant="ghost"
//                                                   className="h-7"
//                                                   disabled={alreadyEnrolled}
//                                                   onClick={() =>
//                                                     handleEnrollStudent(
//                                                       sec.id,
//                                                       sec.courseCode,
//                                                       st.id,
//                                                       st.name
//                                                     )
//                                                   }
//                                                 >
//                                                   {alreadyEnrolled
//                                                     ? "Enrolled"
//                                                     : enrollMode ===
//                                                         "student" && isFull
//                                                     ? "Request"
//                                                     : "Add"}
//                                                 </Button>
//                                               </div>
//                                             );
//                                           })}
//                                           {matchingStudents.length === 0 && (
//                                             <div className="text-center py-8 text-sm text-muted-foreground">
//                                               No students found
//                                             </div>
//                                           )}
//                                         </div>
//                                       </ScrollArea>
//                                     </div>
//                                   </div>
//                                   <DialogFooter>
//                                     <Button
//                                       variant="outline"
//                                       onClick={() => setDialogOpen(false)}
//                                     >
//                                       Close
//                                     </Button>
//                                   </DialogFooter>
//                                 </DialogContent>
//                               </Dialog>
//                             </div>

//                             <div className="space-y-2">
//                               <div className="flex items-center justify-between text-xs">
//                                 <span className="text-muted-foreground">
//                                   Capacity Utilization
//                                 </span>
//                                 <span className="font-medium">
//                                   {enrolled.length} / {limit} (
//                                   {utilization.toFixed(0)}%)
//                                 </span>
//                               </div>
//                               <div className="h-2 bg-muted rounded-full overflow-hidden">
//                                 <div
//                                   className={cn(
//                                     "h-full transition-all rounded-full",
//                                     utilization >= 100
//                                       ? "bg-red-500"
//                                       : utilization >= 80
//                                       ? "bg-amber-500"
//                                       : "bg-green-500"
//                                   )}
//                                   style={{
//                                     width: `${Math.min(utilization, 100)}%`,
//                                   }}
//                                 />
//                               </div>
//                             </div>

//                             <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
//                               <div className="p-2 bg-muted/50 rounded">
//                                 <div className="text-muted-foreground">
//                                   Base
//                                 </div>
//                                 <div className="font-semibold">
//                                   {capacityInfo.capacity}
//                                 </div>
//                               </div>
//                               <div className="p-2 bg-muted/50 rounded">
//                                 <div className="text-muted-foreground">
//                                   Buffer
//                                 </div>
//                                 <div className="font-semibold">
//                                   {capacityInfo.bufferSeats}
//                                 </div>
//                               </div>
//                               <div className="p-2 bg-muted/50 rounded">
//                                 <div className="text-muted-foreground">
//                                   Enrolled
//                                 </div>
//                                 <div className="font-semibold">
//                                   {enrolled.length}
//                                 </div>
//                               </div>
//                               <div className="p-2 bg-muted/50 rounded">
//                                 <div className="text-muted-foreground">
//                                   Available
//                                 </div>
//                                 <div className="font-semibold text-green-600 dark:text-green-400">
//                                   {Math.max(0, limit - enrolled.length)}
//                                 </div>
//                               </div>
//                             </div>

//                             {enrolled.length > 0 && (
//                               <div className="space-y-2">
//                                 <div className="text-xs font-medium text-muted-foreground">
//                                   Enrolled Students ({enrolled.length})
//                                 </div>
//                                 <div className="flex flex-wrap gap-1.5">
//                                   {enrolled.map((studentId) => {
//                                     const student = mockSWEStudents.find(
//                                       (s) => s.id === studentId
//                                     );
//                                     return (
//                                       <Badge
//                                         key={studentId}
//                                         variant="outline"
//                                         className="text-xs group relative pr-6"
//                                       >
//                                         <span
//                                           className="truncate max-w-[120px]"
//                                           title={student?.name}
//                                         >
//                                           {student?.name || studentId}
//                                         </span>
//                                         <Button
//                                           size="sm"
//                                           variant="ghost"
//                                           className="absolute right-0 top-0 h-full w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
//                                           onClick={() =>
//                                             handleRemoveStudent(
//                                               sec.id,
//                                               sec.courseCode,
//                                               studentId
//                                             )
//                                           }
//                                         >
//                                           <X className="h-3 w-3" />
//                                         </Button>
//                                       </Badge>
//                                     );
//                                   })}
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </ScrollArea>
//               </div>
//             )}
//           </TabsContent>
//         </Tabs>
//       </CardContent>
//     </Card>
//   );
// };

// export default SectionEnrollmentManager;
