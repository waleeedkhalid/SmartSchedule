"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  Trash2,
  Check,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { formatDistance } from "date-fns";

interface ChangeRequest {
  id: string;
  section_id: string;
  request_type: string;
  reason: string;
  validation_status: string;
  validation_error: string | null;
  affects_irregular_students: boolean;
  irregular_students_affected: string[];
  applied: boolean;
  created_at: string;
  requested_by_user?: {
    full_name: string;
  };
  section?: {
    course_code: string;
  };
}

interface ChangeRequestsListProps {
  scheduleVersionId?: string;
  userRole?: 'teaching_load' | 'scheduling';
}

export function ChangeRequestsList({
  scheduleVersionId,
  userRole = 'teaching_load',
}: ChangeRequestsListProps) {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchRequests();
  }, [scheduleVersionId, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (scheduleVersionId) {
        params.append('schedule_version_id', scheduleVersionId);
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/committee/teaching-load/change-requests?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch change requests');
      }

      setRequests(data.data || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error fetching change requests:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to load change requests',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const response = await fetch(
        `/api/committee/teaching-load/change-requests/${requestId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ validation_status: 'APPROVED' }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to approve request');
      }

      toast({
        title: "Request Approved",
        description: result.message,
      });

      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to approve request',
        variant: "destructive",
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const response = await fetch(
        `/api/committee/teaching-load/change-requests/${requestId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ validation_status: 'REJECTED' }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reject request');
      }

      toast({
        title: "Request Rejected",
        description: result.message,
      });

      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to reject request',
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this request?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/committee/teaching-load/change-requests/${requestId}`,
        {
          method: 'DELETE',
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete request');
      }

      toast({
        title: "Request Deleted",
        description: result.message,
      });

      fetchRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete request',
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, applied: boolean) => {
    if (applied) {
      return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="mr-1 h-3 w-3" />Applied</Badge>;
    }

    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'VALID':
        return <Badge variant="outline" className="border-green-600 text-green-600"><CheckCircle2 className="mr-1 h-3 w-3" />Valid</Badge>;
      case 'INVALID':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Invalid</Badge>;
      case 'APPROVED':
        return <Badge variant="default" className="bg-blue-600"><Check className="mr-1 h-3 w-3" />Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive"><X className="mr-1 h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'REASSIGN_INSTRUCTOR': 'Reassign Instructor',
      'CHANGE_TIME_SLOT': 'Change Time Slot',
      'ADJUST_CAPACITY': 'Adjust Capacity',
      'CHANGE_ROOM': 'Change Room',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Change Requests</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Change Requests</CardTitle>
            <CardDescription>
              {stats?.total || 0} total requests
              {stats?.affecting_irregular > 0 && (
                <span className="ml-2 text-amber-600">
                  ({stats.affecting_irregular} affecting irregular students)
                </span>
              )}
            </CardDescription>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="VALID">Valid</SelectItem>
              <SelectItem value="INVALID">Invalid</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <Alert>
            <AlertDescription>
              No change requests found. Submit a request to adjust teaching assignments.
            </AlertDescription>
          </Alert>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Irregular</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.section?.course_code || request.section_id}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{getRequestTypeLabel(request.request_type)}</span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(request.validation_status, request.applied)}
                  </TableCell>
                  <TableCell>
                    {request.affects_irregular_students ? (
                      <div className="flex items-center gap-1 text-amber-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs">{request.irregular_students_affected.length}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDistance(new Date(request.created_at), new Date(), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-xs">
                    {request.requested_by_user?.full_name || 'Unknown'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {userRole === 'scheduling' && request.validation_status === 'VALID' && !request.applied && (
                          <>
                            <DropdownMenuItem onClick={() => handleApprove(request.id)}>
                              <Check className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReject(request.id)}>
                              <X className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {userRole === 'teaching_load' && !request.applied && (
                          <DropdownMenuItem onClick={() => handleDelete(request.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

