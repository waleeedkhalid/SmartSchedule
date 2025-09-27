"use client";

import * as React from "react";
import { ClipboardSignature, Search } from "lucide-react";

import { irregularStudents, mockRooms, mockTimeslots } from "@/data/mock";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const caseTypes = [
  "Prerequisite Override",
  "Capacity Exception",
  "Schedule Conflict",
  "Late Enrollment",
];

export function RegistrarIrregularEntry() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);
  const [overrideSeat, setOverrideSeat] = React.useState(true);
  const [overrideTime, setOverrideTime] = React.useState(false);
  const [caseType, setCaseType] = React.useState(caseTypes[0]);
  const [notes, setNotes] = React.useState("Assign to evening section with lab waiver.");
  const [targetRoom, setTargetRoom] = React.useState<string | undefined>();
  const [targetSlot, setTargetSlot] = React.useState<string | undefined>();
  const [submitted, setSubmitted] = React.useState(false);

  const filteredStudents = React.useMemo(() => {
    if (!searchTerm) return irregularStudents;
    return irregularStudents.filter((student) => {
      const haystack = `${student.name} ${student.id} ${student.major} ${student.nationalId}`.toLowerCase();
      return haystack.includes(searchTerm.toLowerCase());
    });
  }, [searchTerm]);

  const selectedStudent = irregularStudents.find((student) => student.id === selectedStudentId);

  React.useEffect(() => {
    setSubmitted(false);
  }, [selectedStudentId]);

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!selectedStudent) return;
      setSubmitted(true);
    },
    [selectedStudent],
  );

  return (
    <Card data-test="registrar-irregular-card">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ClipboardSignature className="size-5 text-primary" aria-hidden="true" />
              Irregular student entry
            </CardTitle>
            <CardDescription>
              Search students with pending exceptions, capture justification, and push overrides to SmartSchedule.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, ID, or national ID"
              className="pl-9"
              data-test="irregular-search"
            />
          </div>
          <div className="max-h-[420px] space-y-2 overflow-auto pr-2" data-test="irregular-results">
            {filteredStudents.map((student) => (
              <button
                key={student.id}
                type="button"
                onClick={() => setSelectedStudentId(student.id)}
                className={`w-full rounded-lg border p-3 text-left transition ${
                  student.id === selectedStudentId ? "border-primary bg-primary/10" : "bg-background hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{student.name}</span>
                  <Badge variant="outline" className="bg-muted/50">
                    {student.standing}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{student.id} • {student.major}</p>
                {student.lastCase ? (
                  <p className="mt-1 text-[11px] text-muted-foreground">Last case: {student.lastCase}</p>
                ) : null}
              </button>
            ))}
            {filteredStudents.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                No students matched the query.
              </div>
            ) : null}
          </div>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} data-test="irregular-form">
          {!selectedStudent ? (
            <Alert variant="info">
              <AlertTitle>Select a student to begin</AlertTitle>
              <AlertDescription>Overrides and case notes will appear once a student record is active.</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">{selectedStudent.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedStudent.id} • National ID {selectedStudent.nationalId}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Case type</label>
                  <Select value={caseType} onValueChange={setCaseType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select case" />
                    </SelectTrigger>
                    <SelectContent>
                      {caseTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target room</label>
                  <Select
                    value={targetRoom ?? ""}
                    onValueChange={(value) => setTargetRoom(value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {mockRooms.map((room) => (
                        <SelectItem key={room} value={room}>
                          {room}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preferred timeslot</label>
                  <Select
                    value={targetSlot ?? ""}
                    onValueChange={(value) => setTargetSlot(value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeslot" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {mockTimeslots.slice(0, 20).map((slot) => (
                        <SelectItem key={slot.id} value={`${slot.day} ${slot.start}`}>
                          {slot.day} • {slot.start}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Seat override</p>
                      <p className="text-xs text-muted-foreground">Allow exceeding section capacity</p>
                    </div>
                    <Switch checked={overrideSeat} onCheckedChange={setOverrideSeat} data-test="override-seat" />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Time conflict override</p>
                      <p className="text-xs text-muted-foreground">Waive advisor approval for conflicts</p>
                    </div>
                    <Switch checked={overrideTime} onCheckedChange={setOverrideTime} data-test="override-time" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="irregular-notes">
                  Notes to scheduler
                </label>
                <Textarea
                  id="irregular-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="min-h-32"
                />
              </div>
              <Alert variant="warning">
                <AlertTitle>Registry audit log</AlertTitle>
                <AlertDescription>
                  Submission will log overrides under the registrar account with timestamp and device fingerprint.
                </AlertDescription>
              </Alert>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Seat override: {overrideSeat ? "Enabled" : "Disabled"} • Conflict override: {overrideTime ? "Enabled" : "Disabled"}
                </span>
                <Button type="submit" data-test="irregular-submit">
                  Submit override
                </Button>
              </div>
            </>
          )}
        </form>
      </CardContent>
      {submitted && selectedStudent ? (
        <CardFooter>
          <Alert variant="success" className="w-full" data-test="irregular-success">
            <AlertTitle>Override queued for {selectedStudent.name}</AlertTitle>
            <AlertDescription>
              SmartSchedule will lock the seat and notify the advising team within 15 minutes.
            </AlertDescription>
          </Alert>
        </CardFooter>
      ) : null}
    </Card>
  );
}
