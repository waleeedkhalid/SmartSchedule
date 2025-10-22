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
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/utils/supabase/client";
import {
  studentSetupFormSchema,
  type StudentSetupFormData,
  type StudentSetupFormInput,
} from "@/lib/validations/student.schemas";

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
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit: handleFormSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<StudentSetupFormInput, unknown, StudentSetupFormData>({
    resolver: zodResolver(studentSetupFormSchema),
    mode: "onChange",
    defaultValues: {
      studentNumber: "",
      level: "",
    },
  });

  const levelValue = watch("level");

  const onSubmit = (data: StudentSetupFormData) => {
    startTransition(async () => {
      const { error } = await supabase.from("students").upsert({
        id: userId,
        student_number: data.studentNumber,
        level: data.level,
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
        <form className="space-y-6" onSubmit={handleFormSubmit(onSubmit)}>
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
            <Label htmlFor="student_number">
              Student number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="student_number"
              placeholder="e.g. 444100000"
              minLength={9}
              maxLength={9}
              {...register("studentNumber")}
              disabled={isPending}
              aria-invalid={errors.studentNumber ? "true" : "false"}
            />
            {errors.studentNumber && (
              <p className="text-sm text-destructive">
                {errors.studentNumber.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="level">
              Level <span className="text-destructive">*</span>
            </Label>
            <Select
              value={levelValue}
              onValueChange={(value) =>
                setValue("level", value, { shouldValidate: true })
              }
              disabled={isPending}
            >
              <SelectTrigger
                id="level"
                aria-invalid={errors.level ? "true" : "false"}
              >
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
            {errors.level && (
              <p className="text-sm text-destructive">{errors.level.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !isValid || !isDirty}
          >
            {isPending ? "Saving..." : "Complete registration"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
