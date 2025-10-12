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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase-client";

interface FacultySetupFormProps {
  userId: string;
  fullName: string;
  email: string;
  initialFacultyNumber?: string | null;
  initialTitle?: string | null;
}

const titles = ["Dr.", "Prof.", "Mr.", "Ms."];

export default function FacultySetupForm({
  userId,
  fullName,
  email,
  initialFacultyNumber,
  initialTitle,
}: FacultySetupFormProps) {
  const [facultyNumber, setFacultyNumber] = useState(
    initialFacultyNumber ?? ""
  );
  const [title, setTitle] = useState(initialTitle ?? "");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!facultyNumber.trim() || !title) {
      toast({
        title: "Missing information",
        description: "Please provide your faculty number and title.",
      });
      return;
    }

    startTransition(async () => {
      const { error } = await supabase.from("faculty").upsert({
        id: userId,
        faculty_number: facultyNumber.trim(),
        title,
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
        description: "Your faculty details have been registered successfully.",
      });

      router.replace("/faculty/dashboard");
    });
  };

  const disableSubmit = isPending || !facultyNumber.trim() || !title;

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">
          Complete your faculty profile
        </CardTitle>
        <CardDescription>
          Provide your university information so SmartSchedule can tailor tools
          for teaching staff.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <section className="space-y-4">
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
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="faculty_number">Faculty number</Label>
              <Input
                id="faculty_number"
                placeholder="e.g. FAC-2025-87"
                value={facultyNumber}
                onChange={(event) => setFacultyNumber(event.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Select
                value={title}
                onValueChange={setTitle}
                disabled={isPending}
              >
                <SelectTrigger id="title">
                  <SelectValue placeholder="Select your title" />
                </SelectTrigger>
                <SelectContent>
                  {titles.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <Button type="submit" className="w-full" disabled={disableSubmit}>
            {isPending ? "Saving..." : "Continue to dashboard"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
