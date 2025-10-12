// "use client";
// import React, { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { X, Filter } from "lucide-react";
// import { mockElectivePackages } from "@/data/demo-data";

// interface SelectedCourse {
//   code: string;
//   name: string;
//   category: string;
//   order: number;
// }

// export type ElectiveSurveyProps = {
//   maxChoices?: number;
//   onSubmitChoices?: (rankedCodes: string[]) => Promise<void> | void;
// };

// export function ElectiveSurvey({
//   maxChoices = 6,
//   onSubmitChoices,
// }: ElectiveSurveyProps): React.ReactElement {
//   const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([]);
//   const [submitting, setSubmitting] = useState(false);
//   const [submitted, setSubmitted] = useState(false);
//   const [activeFilter, setActiveFilter] = useState<string>("all");

//   // Get all elective courses from SWE plan (mockElectivePackages)
//   const electiveCourses = mockElectivePackages.flatMap((pkg) =>
//     pkg.courses.map((course) => ({
//       code: course.code,
//       name: course.name,
//       category: pkg.label,
//       credits: course.credits,
//     }))
//   );

//   // Get unique categories for filters
//   const categories = Array.from(
//     new Set(electiveCourses.map((c) => c.category))
//   );

//   const handleCourseSelect = (code: string) => {
//     const course = electiveCourses.find((c) => c.code === code);
//     if (course && !selectedCourses.find((selected) => selected.code === code)) {
//       if (selectedCourses.length >= maxChoices) {
//         return; // Max choices reached
//       }
//       const newCourse: SelectedCourse = {
//         code: course.code,
//         name: course.name,
//         category: course.category,
//         order: selectedCourses.length + 1,
//       };
//       setSelectedCourses([...selectedCourses, newCourse]);
//     }
//   };

//   const removeCourse = (codeToRemove: string) => {
//     const updatedCourses = selectedCourses
//       .filter((course) => course.code !== codeToRemove)
//       .map((course, index) => ({ ...course, order: index + 1 }));
//     setSelectedCourses(updatedCourses);
//   };

//   // Filter available courses based on active filter
//   const availableCourses = electiveCourses
//     .filter(
//       (course) =>
//         !selectedCourses.find((selected) => selected.code === course.code)
//     )
//     .filter((course) =>
//       activeFilter === "all" ? true : course.category === activeFilter
//     );

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     if (selectedCourses.length === 0) return;

//     try {
//       setSubmitting(true);
//       const rankedCodes = selectedCourses.map((c) => c.code);
//       await onSubmitChoices?.(rankedCodes);
//       setSubmitted(true);
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   if (submitted) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>✓ Preferences Submitted!</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p className="text-sm text-muted-foreground">
//             Your elective preferences have been recorded successfully.
//           </p>
//           <div className="mt-4 space-y-2">
//             <p className="text-xs font-medium text-muted-foreground">
//               Your ranked choices:
//             </p>
//             {selectedCourses.map((course) => (
//               <div key={course.code} className="text-sm">
//                 <span className="font-medium">#{course.order}</span>{" "}
//                 {course.code} - {course.name}
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Elective Course Preferences</CardTitle>
//         <p className="text-sm text-muted-foreground">
//           Select up to {maxChoices} elective courses in order of preference
//         </p>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Category Filters */}
//           <div className="space-y-2">
//             <div className="flex items-center gap-2">
//               <Filter className="h-3.5 w-3.5 text-muted-foreground" />
//               <Label className="text-xs font-medium text-muted-foreground">
//                 Filter by category
//               </Label>
//               {activeFilter !== "all" && (
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="h-5 px-2 text-xs"
//                   onClick={() => setActiveFilter("all")}
//                 >
//                   Clear filter
//                 </Button>
//               )}
//             </div>
//             <div className="flex flex-wrap gap-2">
//               <Badge
//                 variant={activeFilter === "all" ? "default" : "outline"}
//                 className="cursor-pointer hover:bg-accent transition-colors"
//                 onClick={() => setActiveFilter("all")}
//               >
//                 All Courses ({electiveCourses.length})
//               </Badge>
//               {categories.map((category) => {
//                 const count = electiveCourses.filter(
//                   (c) => c.category === category
//                 ).length;
//                 const availableCount = electiveCourses.filter(
//                   (c) =>
//                     c.category === category &&
//                     !selectedCourses.find((s) => s.code === c.code)
//                 ).length;
//                 return (
//                   <Badge
//                     key={category}
//                     variant={activeFilter === category ? "default" : "outline"}
//                     className="cursor-pointer hover:bg-accent transition-colors"
//                     onClick={() => setActiveFilter(category)}
//                   >
//                     {category} ({availableCount}/{count})
//                   </Badge>
//                 );
//               })}
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="select-course">Choose courses in order</Label>
//             <Select
//               key={selectedCourses.length}
//               onValueChange={handleCourseSelect}
//               disabled={selectedCourses.length >= maxChoices}
//             >
//               <SelectTrigger id="select-course" className="w-full">
//                 <SelectValue
//                   placeholder={
//                     availableCourses.length > 0
//                       ? selectedCourses.length >= maxChoices
//                         ? `Maximum ${maxChoices} courses selected`
//                         : activeFilter === "all"
//                         ? "Select a course..."
//                         : `Select from ${activeFilter}...`
//                       : activeFilter === "all"
//                       ? "All courses selected"
//                       : `All ${activeFilter} courses selected`
//                   }
//                 />
//               </SelectTrigger>
//               <SelectContent className="z-[100]">
//                 {availableCourses.map((course) => (
//                   <SelectItem key={course.code} value={course.code}>
//                     <div className="flex flex-col items-start">
//                       <div className="flex items-center gap-2">
//                         <span className="font-medium">{course.code}</span>
//                         <Badge
//                           variant="outline"
//                           className="text-[10px] px-1 py-0"
//                         >
//                           {course.category}
//                         </Badge>
//                       </div>
//                       <span className="text-xs text-muted-foreground">
//                         {course.name}
//                       </span>
//                     </div>
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <p className="text-xs text-muted-foreground">
//               {selectedCourses.length} of {maxChoices} courses selected
//             </p>
//           </div>

//           {/* Selected Courses Display */}
//           {selectedCourses.length > 0 && (
//             <div className="space-y-3">
//               <Label>Your course preferences (in order):</Label>
//               <div className="space-y-2 max-h-80 overflow-y-auto">
//                 {selectedCourses.map((course) => (
//                   <div
//                     key={course.code}
//                     className="flex items-center gap-3 p-3 bg-accent rounded-lg border"
//                   >
//                     <Badge
//                       variant="secondary"
//                       className="shrink-0 font-semibold"
//                     >
//                       #{course.order}
//                     </Badge>
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center gap-2">
//                         <span className="font-medium text-sm">
//                           {course.code}
//                         </span>
//                         <Badge
//                           variant="outline"
//                           className="text-[10px] px-1.5 py-0"
//                         >
//                           {course.category}
//                         </Badge>
//                       </div>
//                       <div className="text-xs text-muted-foreground truncate">
//                         {course.name}
//                       </div>
//                     </div>
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => removeCourse(course.code)}
//                       className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground shrink-0"
//                     >
//                       <X className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           <Button
//             type="submit"
//             className="w-full"
//             disabled={selectedCourses.length === 0 || submitting}
//           >
//             {submitting
//               ? "Submitting..."
//               : `Submit Preferences (${selectedCourses.length} course${
//                   selectedCourses.length !== 1 ? "s" : ""
//                 })`}
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   );
// }

// export default ElectiveSurvey;
