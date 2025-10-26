"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Mail, CheckCircle, Clock, Edit, Send } from "lucide-react";
import { MockIrregularStudent } from "@/types/scheduler-mock";
import { formatDistanceToNow } from "date-fns";

interface IrregularStudentsTrackerProps {
  irregularStudents: MockIrregularStudent[];
  onNotifyStudent?: (studentId: string) => void;
  onResolve?: (irregularId: string) => void;
  onViewDetails?: (studentId: string) => void;
  onEditCourses?: (irregularId: string, studentId: string) => void;
  onRequestFromRegistrar?: () => void;
}

export function IrregularStudentsTracker({
  irregularStudents,
  onNotifyStudent,
  onResolve,
  onViewDetails,
  onEditCourses,
  onRequestFromRegistrar,
}: IrregularStudentsTrackerProps) {
  const pendingCount = irregularStudents.filter(
    (s) => s.status === "pending"
  ).length;
  const notifiedCount = irregularStudents.filter(
    (s) => s.status === "notified"
  ).length;
  const resolvedCount = irregularStudents.filter(
    (s) => s.status === "resolved"
  ).length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "notified":
        return <Mail className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadgeVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "pending":
        return "destructive";
      case "notified":
        return "secondary";
      case "resolved":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Irregular Students Tracker
            </CardTitle>
            <CardDescription>
              Monitor and manage students requiring special attention. Cases are
              provided by the Registrar.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive">{pendingCount} Pending</Badge>
            <Badge variant="secondary">{notifiedCount} Notified</Badge>
            <Badge variant="outline">{resolvedCount} Resolved</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Registrar Notice */}
        <Alert className="bg-blue-50 border-blue-200">
          <Send className="h-4 w-4 text-blue-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-blue-900 text-sm">
              Irregular student cases are input by the Registrar. Request updates
              if needed.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onRequestFromRegistrar}
              className="ml-4"
            >
              <Send className="h-4 w-4 mr-2" />
              Contact Registrar
            </Button>
          </AlertDescription>
        </Alert>
        {irregularStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No Irregular Students
            </h3>
            <p className="text-muted-foreground">
              All students are on track with their academic progress.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Courses Needed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {irregularStudents.map((irregular) => (
                  <TableRow key={irregular.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {irregular.student_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {irregular.student_number}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Level {irregular.level}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm">{irregular.reason}</p>
                        {irregular.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {irregular.notes}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {irregular.courses_needed.map((course) => (
                          <Badge key={course} variant="secondary" className="text-xs">
                            {course}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(irregular.status)}
                        className="flex items-center gap-1 w-fit"
                      >
                        {getStatusIcon(irregular.status)}
                        <span className="capitalize">{irregular.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">
                          {irregular.reported_by_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(irregular.created_at), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditCourses?.(irregular.id, irregular.student_id)}
                          title="Edit required courses"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {irregular.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              onNotifyStudent?.(irregular.student_id)
                            }
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Notify
                          </Button>
                        )}
                        {irregular.status !== "resolved" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onResolve?.(irregular.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

