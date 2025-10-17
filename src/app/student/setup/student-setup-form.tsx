"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/utils/supabase/client";

interface StudentSetupFormProps {
  userId: string;
  fullName: string;
  email: string;
}

const levels = Array.from({ length: 8 }, (_, i) => i + 1).slice(3); // Levels 4 to 8

export default function StudentSetupForm({
  userId,
  fullName,
  email,
}: StudentSetupFormProps) {
  const [studentNumber, setStudentNumber] = useState("");
  const [level, setLevel] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!studentNumber.trim() || !level) {
      toast({
        title: "Missing information",
        description: "Please provide your student number and level.",
      });
      return;
    }

    if (isNaN(Number(level)) || Number(level) < 4 || Number(level) > 8) {
      toast({
        title: "Invalid level",
        description: "Level must be between 4 and 8.",
      });
      return;
    }

    startTransition(async () => {
      const { error } = await supabase.from("students").upsert({
        id: userId,
        student_number: studentNumber.trim(),
        level: Number(level),
      });

      if (error) {
        toast({
          title: "Unable to complete setup",
          description: error.message,
        });
        return;
      }

      toast({
        title: "Profile saved",
        description: "Your student details have been registered successfully.",
      });

      router.replace("/student/dashboard");
    });
  };

  const disableSubmit = isPending || !studentNumber.trim() || !level;

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">
          Finish setting up your account
        </CardTitle>
        <CardDescription>
          Provide your university information so SmartSchedule can personalize
          your experience.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label className="text-sm text-muted-foreground">Full name</Label>
            <p className="rounded-md border bg-muted/50 px-4 py-2 text-sm font-medium">
              {fullName || "Your name on file"}
            </p>
          </div>

          <div className="grid gap-2">
            <Label className="text-sm text-muted-foreground">Email</Label>
            <p className="rounded-md border bg-muted/50 px-4 py-2 text-sm">
              {email}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="student_number">Student number</Label>
            <Input
              id="student_number"
              placeholder="e.g. 2025-12345"
              value={studentNumber}
              onChange={(event) => setStudentNumber(event.target.value)}
              disabled={isPending}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="level">Level</Label>
            <Select value={level} onValueChange={setLevel} disabled={isPending}>
              <SelectTrigger id="level">
                <SelectValue placeholder="Select your level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    Level {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={disableSubmit}>
            {isPending ? "Saving..." : "Complete registration"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
