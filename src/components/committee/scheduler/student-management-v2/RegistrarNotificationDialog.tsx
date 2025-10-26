"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, AlertCircle, CheckCircle, Send } from "lucide-react";

interface RegistrarNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  irregularStudentCount: number;
  onSendRequest: (message: string) => void;
  onConfirmNoIrregular: () => void;
}

export function RegistrarNotificationDialog({
  open,
  onOpenChange,
  irregularStudentCount,
  onSendRequest,
  onConfirmNoIrregular,
}: RegistrarNotificationDialogProps) {
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"request" | "confirm" | null>(null);

  const handleSendRequest = () => {
    if (message.trim()) {
      onSendRequest(message);
      setMessage("");
      setMode(null);
      onOpenChange(false);
    }
  };

  const handleConfirmNoIrregular = () => {
    onConfirmNoIrregular();
    setMode(null);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          setMode(null);
          setMessage("");
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Registrar Communication
          </DialogTitle>
          <DialogDescription>
            Communicate with the Registrar about irregular student cases
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {irregularStudentCount > 0 ? (
                <>
                  There are currently{" "}
                  <Badge variant="destructive" className="mx-1">
                    {irregularStudentCount}
                  </Badge>{" "}
                  irregular student cases pending.
                </>
              ) : (
                <>
                  No irregular students currently reported. Confirm with Registrar
                  if this is accurate.
                </>
              )}
            </AlertDescription>
          </Alert>

          {!mode ? (
            /* Selection Mode */
            <div className="grid grid-cols-1 gap-4 py-4">
              <Button
                variant="outline"
                className="h-auto py-6 flex-col items-start"
                onClick={() => setMode("request")}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Send className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">
                    Request Irregular Student List
                  </span>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  Ask the Registrar to provide or update the list of irregular
                  students who need special course arrangements
                </p>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-6 flex-col items-start"
                onClick={() => setMode("confirm")}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">
                    Confirm No Irregular Students
                  </span>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  Confirm with the Registrar that there are no irregular students
                  for this term
                </p>
              </Button>
            </div>
          ) : mode === "request" ? (
            /* Request Mode */
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Message to Registrar
                </label>
                <Textarea
                  placeholder="Please provide the list of irregular students for this term, including their required courses and any special considerations..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  The Registrar will receive this request and can input irregular
                  student cases through their system.
                </p>
              </div>
            </div>
          ) : (
            /* Confirm Mode */
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900">
                <p className="font-medium mb-2">
                  Confirm No Irregular Students
                </p>
                <p className="text-sm">
                  By confirming, you acknowledge that the Registrar has verified
                  there are no irregular students requiring special arrangements
                  for this term. This confirmation will be recorded in the system.
                </p>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              if (mode) {
                setMode(null);
                setMessage("");
              } else {
                onOpenChange(false);
              }
            }}
          >
            {mode ? "Back" : "Cancel"}
          </Button>
          {mode === "request" && (
            <Button onClick={handleSendRequest} disabled={!message.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send Request
            </Button>
          )}
          {mode === "confirm" && (
            <Button onClick={handleConfirmNoIrregular} variant="default">
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

