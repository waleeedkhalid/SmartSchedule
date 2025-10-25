"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { supabase } from "@/lib/supabase";
import {
  facultySetupFormSchema,
  facultyTitles,
  type FacultySetupFormData,
} from "@/lib/validations/faculty.schemas";

interface FacultySetupFormProps {
  userId: string;
  fullName: string;
  email: string;
  initialFacultyNumber?: string | null;
  initialTitle?: string | null;
}

type FacultyTitle = typeof facultyTitles[number];

export default function FacultySetupForm({
  userId,
  fullName,
  email,
  initialFacultyNumber,
  initialTitle,
}: FacultySetupFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit: handleFormSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<FacultySetupFormData>({
    resolver: zodResolver(facultySetupFormSchema),
    mode: "onChange",
    defaultValues: {
      facultyId: initialFacultyNumber ?? "",
      title: (initialTitle as FacultyTitle) ?? undefined,
    },
  });

  const titleValue = watch("title");

  const onSubmit = (data: FacultySetupFormData) => {
    startTransition(async () => {
      const { error } = await supabase.from("faculty").upsert({
        id: userId,
        faculty_number: data.facultyId,
        title: data.title,
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
        <form className="space-y-6" onSubmit={handleFormSubmit(onSubmit)}>
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
              <Label htmlFor="faculty_number">
                Faculty ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="faculty_number"
                placeholder="e.g. F12345"
                {...register("facultyId")}
                disabled={isPending}
                aria-invalid={errors.facultyId ? "true" : "false"}
              />
              {errors.facultyId ? (
                <p className="text-sm text-destructive">
                  {errors.facultyId.message}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Format: F followed by 4-6 digits (e.g., F12345)
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Select
                value={titleValue}
                onValueChange={(value) => setValue("title", value as FacultyTitle, { shouldValidate: true })}
                disabled={isPending}
              >
                <SelectTrigger id="title" aria-invalid={errors.title ? "true" : "false"}>
                  <SelectValue placeholder="Select your title" />
                </SelectTrigger>
                <SelectContent>
                  {facultyTitles.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>
          </section>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !isValid || !isDirty}
          >
            {isPending ? "Saving..." : "Continue to dashboard"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
