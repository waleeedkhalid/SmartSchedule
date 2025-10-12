// /**
//  * GeneratedScheduleResults
//  *
//  * Displays generated schedule with:
//  * - Metadata (utilization stats)
//  * - Conflicts by severity
//  * - Section details per level
//  * - Export/publish options
//  */

// "use client";

// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   AlertCircle,
//   AlertTriangle,
//   Check,
//   Download,
//   FileText,
// } from "lucide-react";
// import { GeneratedSchedule } from "@/lib/types";

// interface GeneratedScheduleResultsProps {
//   schedule: GeneratedSchedule;
//   onExport?: () => void;
//   onPublish?: () => void;
// }

// export function GeneratedScheduleResults({
//   schedule,
//   onExport,
//   onPublish,
// }: GeneratedScheduleResultsProps) {
//   const [selectedLevel, setSelectedLevel] = useState<number>(
//     schedule.levels[0]?.level || 4
//   );

//   // Categorize conflicts by severity
//   const errorConflicts = schedule.conflicts.filter(
//     (c) => c.severity === "ERROR"
//   );
//   const warningConflicts = schedule.conflicts.filter(
//     (c) => c.severity === "WARNING"
//   );

//   const getSeverityIcon = (severity: "ERROR" | "WARNING") => {
//     switch (severity) {
//       case "ERROR":
//         return <AlertCircle className="w-4 h-4 text-destructive" />;
//       case "WARNING":
//         return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
//       default:
//         return null;
//     }
//   };

//   const getSeverityBadge = (severity: "ERROR" | "WARNING") => {
//     return (
//       <Badge
//         variant="secondary"
//         className={
//           severity === "ERROR" ? "bg-red-100 text-red-800 border-red-200" : ""
//         }
//       >
//         {severity}
//       </Badge>
//     );
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold">Generated Schedule</h2>
//           <p className="text-sm text-muted-foreground">
//             {schedule.semester} • Generated{" "}
//             {new Date(schedule.generatedAt).toLocaleString()}
//           </p>
//         </div>
//         <div className="flex gap-2">
//           {onExport && (
//             <Button variant="outline" onClick={onExport}>
//               <Download className="w-4 h-4 mr-2" />
//               Export
//             </Button>
//           )}
//           {onPublish && (
//             <Button onClick={onPublish}>
//               <FileText className="w-4 h-4 mr-2" />
//               Publish Schedule
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Metadata Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               Total Sections
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-3xl font-bold">
//               {schedule.metadata.totalSections}
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               Total Exams
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-3xl font-bold">{schedule.metadata.totalExams}</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               Faculty Utilization
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-3xl font-bold">
//               {schedule.metadata.facultyUtilization.toFixed(1)}%
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               Room Utilization
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-3xl font-bold">
//               {schedule.metadata.roomUtilization.toFixed(1)}%
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Conflicts Summary */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             {schedule.conflicts.length === 0 ? (
//               <>
//                 <Check className="w-5 h-5 text-green-500" />
//                 No Conflicts Detected
//               </>
//             ) : (
//               <>
//                 <AlertCircle className="w-5 h-5 text-destructive" />
//                 {schedule.conflicts.length} Conflict
//                 {schedule.conflicts.length !== 1 ? "s" : ""} Detected
//               </>
//             )}
//           </CardTitle>
//         </CardHeader>
//         {schedule.conflicts.length > 0 && (
//           <CardContent>
//             <div className="space-y-4">
//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div className="flex items-center gap-2">
//                   <AlertCircle className="w-4 h-4 text-destructive" />
//                   <span className="font-medium">{errorConflicts.length}</span>
//                   <span className="text-muted-foreground">Errors</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <AlertTriangle className="w-4 h-4 text-yellow-500" />
//                   <span className="font-medium">{warningConflicts.length}</span>
//                   <span className="text-muted-foreground">Warnings</span>
//                 </div>
//               </div>

//               {/* Conflict Details Table */}
//               <div className="border rounded-md">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead className="w-[100px]">Severity</TableHead>
//                       <TableHead className="w-[120px]">Type</TableHead>
//                       <TableHead>Message</TableHead>
//                       <TableHead className="w-[150px]">Affected</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {schedule.conflicts.slice(0, 10).map((conflict, index) => (
//                       <TableRow key={index}>
//                         <TableCell>
//                           <div className="flex items-center gap-2">
//                             {getSeverityIcon(conflict.severity)}
//                             {getSeverityBadge(conflict.severity)}
//                           </div>
//                         </TableCell>
//                         <TableCell className="font-mono text-xs">
//                           {conflict.type}
//                         </TableCell>
//                         <TableCell className="text-sm">
//                           {conflict.message}
//                         </TableCell>
//                         <TableCell className="font-mono text-xs">
//                           {conflict.affected.map((a) => a.label).join(", ")}
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>
//               {schedule.conflicts.length > 10 && (
//                 <p className="text-sm text-muted-foreground text-center">
//                   Showing 10 of {schedule.conflicts.length} conflicts
//                 </p>
//               )}
//             </div>
//           </CardContent>
//         )}
//       </Card>

//       {/* Level Schedule Details */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Schedule Details by Level</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Tabs
//             value={selectedLevel.toString()}
//             onValueChange={(value) => setSelectedLevel(parseInt(value))}
//           >
//             <TabsList>
//               {schedule.levels.map((ls) => (
//                 <TabsTrigger key={ls.level} value={ls.level.toString()}>
//                   Level {ls.level}
//                   <Badge variant="secondary" className="ml-2">
//                     {ls.studentCount}
//                   </Badge>
//                 </TabsTrigger>
//               ))}
//             </TabsList>

//             {schedule.levels.map((levelSchedule) => (
//               <TabsContent
//                 key={levelSchedule.level}
//                 value={levelSchedule.level.toString()}
//                 className="space-y-4"
//               >
//                 {/* Level Summary */}
//                 <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-md">
//                   <div>
//                     <p className="text-sm text-muted-foreground">Students</p>
//                     <p className="text-2xl font-bold">
//                       {levelSchedule.studentCount}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-muted-foreground">SWE Courses</p>
//                     <p className="text-2xl font-bold">
//                       {levelSchedule.courses.length}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-muted-foreground">Sections</p>
//                     <p className="text-2xl font-bold">
//                       {levelSchedule.courses.reduce(
//                         (sum, course) => sum + course.sections.length,
//                         0
//                       )}
//                     </p>
//                   </div>
//                 </div>

//                 {/* SWE Courses Table */}
//                 <div>
//                   <h4 className="font-semibold mb-3">SWE Courses & Sections</h4>
//                   <div className="border rounded-md">
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>Course</TableHead>
//                           <TableHead>Section</TableHead>
//                           <TableHead>Instructor</TableHead>
//                           <TableHead>Time</TableHead>
//                           <TableHead>Room</TableHead>
//                           <TableHead className="text-right">Capacity</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {levelSchedule.courses.map((course) =>
//                           course.sections.map((section) => (
//                             <TableRow key={section.id}>
//                               <TableCell className="font-mono text-sm">
//                                 {course.code}
//                                 <br />
//                                 <span className="text-xs text-muted-foreground">
//                                   {course.name}
//                                 </span>
//                               </TableCell>
//                               <TableCell className="font-mono text-xs">
//                                 {section.id}
//                               </TableCell>
//                               <TableCell className="text-sm">
//                                 {section.instructor}
//                               </TableCell>
//                               <TableCell className="text-xs">
//                                 {section.times.map((time, idx) => (
//                                   <div key={idx}>
//                                     {time.day} {time.start}-{time.end}
//                                   </div>
//                                 ))}
//                               </TableCell>
//                               <TableCell className="text-sm">
//                                 {section.room}
//                               </TableCell>
//                               <TableCell className="text-right">
//                                 {section.capacity || 30}
//                               </TableCell>
//                             </TableRow>
//                           ))
//                         )}
//                       </TableBody>
//                     </Table>
//                   </div>
//                 </div>

//                 {/* External Courses */}
//                 {levelSchedule.externalCourses.length > 0 && (
//                   <div>
//                     <h4 className="font-semibold mb-3">
//                       External Courses (Reference)
//                     </h4>
//                     <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//                       {levelSchedule.externalCourses.map((course) => (
//                         <div
//                           key={course.code}
//                           className="p-3 border rounded-md bg-muted/30"
//                         >
//                           <p className="font-mono text-sm font-medium">
//                             {course.code}
//                           </p>
//                           <p className="text-xs text-muted-foreground">
//                             {course.department}
//                           </p>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </TabsContent>
//             ))}
//           </Tabs>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
