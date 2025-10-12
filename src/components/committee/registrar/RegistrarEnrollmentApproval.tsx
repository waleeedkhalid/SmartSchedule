// "use client";
// import React, { useState, useEffect } from "react";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   getPendingEnrollmentRequests,
//   approveEnrollmentRequest,
//   denyEnrollmentRequest,
//   getEnrollmentOverridesForSection,
//   type EnrollmentRequest,
// } from "@/lib/local-state";
// import { cn } from "@/lib/utils";
// import {
//   ClipboardCheck,
//   CheckCircle,
//   XCircle,
//   Clock,
//   UserCheck,
//   AlertTriangle,
// } from "lucide-react";

// export const RegistrarEnrollmentApproval: React.FC = () => {
//   const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
//   const [selectedRequest, setSelectedRequest] =
//     useState<EnrollmentRequest | null>(null);
//   const [denyReason, setDenyReason] = useState("");
//   const [notification, setNotification] = useState<{
//     type: "success" | "error" | "info";
//     message: string;
//   } | null>(null);
//   const [actionDialogOpen, setActionDialogOpen] = useState(false);
//   const [actionType, setActionType] = useState<"approve" | "deny">("approve");

//   useEffect(() => {
//     refreshRequests();
//   }, []);

//   useEffect(() => {
//     if (notification) {
//       const timer = setTimeout(() => setNotification(null), 4000);
//       return () => clearTimeout(timer);
//     }
//   }, [notification]);

//   function refreshRequests() {
//     setRequests(getPendingEnrollmentRequests());
//   }

//   function handleApprove(request: EnrollmentRequest) {
//     // Check current capacity
//     const enrolled = getEnrollmentOverridesForSection(request.sectionId);
//     const limit = 30 + 5; // Base + buffer (prototype hardcoded)

//     if (enrolled.length >= limit) {
//       setNotification({
//         type: "error",
//         message: `Cannot approve: Section ${request.sectionId} is at capacity (${enrolled.length}/${limit})`,
//       });
//       return;
//     }

//     const success = approveEnrollmentRequest(request.id, "Registrar");
//     if (success) {
//       setNotification({
//         type: "success",
//         message: `✅ Approved enrollment for ${request.studentName} in ${request.courseCode}`,
//       });
//       refreshRequests();
//       setActionDialogOpen(false);
//       setSelectedRequest(null);
//     } else {
//       setNotification({
//         type: "error",
//         message:
//           "Failed to approve request. It may have been already processed.",
//       });
//     }
//   }

//   function handleDeny(request: EnrollmentRequest) {
//     if (!denyReason.trim()) {
//       setNotification({
//         type: "error",
//         message: "Please provide a reason for denial",
//       });
//       return;
//     }

//     const success = denyEnrollmentRequest(request.id, "Registrar", denyReason);
//     if (success) {
//       setNotification({
//         type: "info",
//         message: `Denied enrollment request for ${request.studentName}`,
//       });
//       refreshRequests();
//       setActionDialogOpen(false);
//       setSelectedRequest(null);
//       setDenyReason("");
//     } else {
//       setNotification({
//         type: "error",
//         message: "Failed to deny request. It may have been already processed.",
//       });
//     }
//   }

//   function openActionDialog(
//     request: EnrollmentRequest,
//     type: "approve" | "deny"
//   ) {
//     setSelectedRequest(request);
//     setActionType(type);
//     setDenyReason("");
//     setActionDialogOpen(true);
//   }

//   const groupedRequests = React.useMemo(() => {
//     const groups: Record<string, EnrollmentRequest[]> = {};
//     requests.forEach((req) => {
//       const key = `${req.courseCode}-${req.sectionId}`;
//       if (!groups[key]) groups[key] = [];
//       groups[key].push(req);
//     });
//     return groups;
//   }, [requests]);

//   const totalPending = requests.length;

//   return (
//     <Card className="mt-8">
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <div>
//             <CardTitle className="flex items-center gap-2">
//               <ClipboardCheck className="h-5 w-5" />
//               Enrollment Request Approval
//             </CardTitle>
//             <CardDescription className="mt-1">
//               Review and approve student enrollment requests for full sections
//             </CardDescription>
//           </div>
//           <Badge
//             variant={totalPending > 0 ? "default" : "secondary"}
//             className="text-base px-3 py-1"
//           >
//             {totalPending} Pending
//           </Badge>
//         </div>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         {notification && (
//           <Alert
//             variant={notification.type === "error" ? "destructive" : "default"}
//             className="animate-in fade-in slide-in-from-top-2"
//           >
//             {notification.type === "success" && (
//               <CheckCircle className="h-4 w-4" />
//             )}
//             {notification.type === "error" && <XCircle className="h-4 w-4" />}
//             {notification.type === "info" && <Clock className="h-4 w-4" />}
//             <AlertDescription>{notification.message}</AlertDescription>
//           </Alert>
//         )}

//         {totalPending === 0 ? (
//           <div className="text-center py-12 text-muted-foreground">
//             <UserCheck className="h-16 w-16 mx-auto mb-4 opacity-20" />
//             <p className="text-lg font-medium">No Pending Requests</p>
//             <p className="text-sm mt-1">
//               All enrollment requests have been processed
//             </p>
//           </div>
//         ) : (
//           <ScrollArea className="h-[500px] pr-4">
//             <div className="space-y-4">
//               {Object.entries(groupedRequests).map(([key, groupRequests]) => {
//                 const firstReq = groupRequests[0];
//                 const enrolled = getEnrollmentOverridesForSection(
//                   firstReq.sectionId
//                 );
//                 const limit = 30 + 5; // Prototype capacity
//                 const available = Math.max(0, limit - enrolled.length);

//                 return (
//                   <div
//                     key={key}
//                     className="border rounded-lg p-4 bg-card space-y-3"
//                   >
//                     <div className="flex items-start justify-between">
//                       <div>
//                         <div className="flex items-center gap-2">
//                           <h3 className="font-semibold text-base">
//                             {firstReq.courseCode} - {firstReq.sectionId}
//                           </h3>
//                           <Badge variant="outline" className="text-xs">
//                             {groupRequests.length}{" "}
//                             {groupRequests.length === 1
//                               ? "request"
//                               : "requests"}
//                           </Badge>
//                         </div>
//                         <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
//                           <span>
//                             Enrolled: {enrolled.length}/{limit}
//                           </span>
//                           <span
//                             className={cn(
//                               "font-medium",
//                               available > 0
//                                 ? "text-green-600 dark:text-green-400"
//                                 : "text-red-600 dark:text-red-400"
//                             )}
//                           >
//                             Available: {available}
//                           </span>
//                         </div>
//                       </div>
//                       {available === 0 && (
//                         <Badge variant="secondary" className="text-xs">
//                           <AlertTriangle className="h-3 w-3 mr-1" />
//                           At Capacity
//                         </Badge>
//                       )}
//                     </div>

//                     <div className="space-y-2">
//                       {groupRequests.map((request) => {
//                         const requestDate = new Date(request.timestamp);

//                         return (
//                           <div
//                             key={request.id}
//                             className="flex items-center justify-between gap-3 p-3 bg-muted/30 rounded-md border"
//                           >
//                             <div className="flex-1 min-w-0">
//                               <div className="flex items-center gap-2">
//                                 <span className="font-medium text-sm truncate">
//                                   {request.studentName}
//                                 </span>
//                                 <Badge variant="outline" className="text-xs">
//                                   {request.studentId}
//                                 </Badge>
//                               </div>
//                               <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
//                                 <Clock className="h-3 w-3" />
//                                 <span>
//                                   {requestDate.toLocaleDateString()} at{" "}
//                                   {requestDate.toLocaleTimeString([], {
//                                     hour: "2-digit",
//                                     minute: "2-digit",
//                                   })}
//                                 </span>
//                               </div>
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
//                                 onClick={() =>
//                                   openActionDialog(request, "approve")
//                                 }
//                                 disabled={available === 0}
//                               >
//                                 <CheckCircle className="h-4 w-4 mr-1" />
//                                 Approve
//                               </Button>
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
//                                 onClick={() =>
//                                   openActionDialog(request, "deny")
//                                 }
//                               >
//                                 <XCircle className="h-4 w-4 mr-1" />
//                                 Deny
//                               </Button>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </ScrollArea>
//         )}

//         <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
//           <DialogContent className="sm:max-w-md">
//             <DialogHeader>
//               <DialogTitle>
//                 {actionType === "approve"
//                   ? "Approve Enrollment Request"
//                   : "Deny Enrollment Request"}
//               </DialogTitle>
//               <DialogDescription>
//                 {selectedRequest && (
//                   <>
//                     {actionType === "approve"
//                       ? `Approve ${selectedRequest.studentName} (${selectedRequest.studentId}) for ${selectedRequest.courseCode} - ${selectedRequest.sectionId}?`
//                       : `Deny ${selectedRequest.studentName}'s request for ${selectedRequest.courseCode} - ${selectedRequest.sectionId}?`}
//                   </>
//                 )}
//               </DialogDescription>
//             </DialogHeader>

//             {actionType === "deny" && (
//               <div className="space-y-2 py-4">
//                 <label className="text-sm font-medium">Reason for Denial</label>
//                 <Textarea
//                   value={denyReason}
//                   onChange={(e) => setDenyReason(e.target.value)}
//                   placeholder="Explain why this request cannot be approved..."
//                   rows={4}
//                   className="resize-none"
//                 />
//               </div>
//             )}

//             <DialogFooter className="gap-2">
//               <Button
//                 variant="outline"
//                 onClick={() => setActionDialogOpen(false)}
//               >
//                 Cancel
//               </Button>
//               {actionType === "approve" ? (
//                 <Button
//                   onClick={() =>
//                     selectedRequest && handleApprove(selectedRequest)
//                   }
//                   className="bg-green-600 hover:bg-green-700 text-white"
//                 >
//                   <CheckCircle className="h-4 w-4 mr-1" />
//                   Approve
//                 </Button>
//               ) : (
//                 <Button
//                   onClick={() => selectedRequest && handleDeny(selectedRequest)}
//                   variant="destructive"
//                 >
//                   <XCircle className="h-4 w-4 mr-1" />
//                   Deny
//                 </Button>
//               )}
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </CardContent>
//     </Card>
//   );
// };

// export default RegistrarEnrollmentApproval;

export default function RegistrarEnrollmentApproval() {
  return <div>Registrar Enrollment Approval Component</div>;
}
