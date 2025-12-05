"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Lock, Loader2 } from "lucide-react";

// Lazy load heavy Card components
const Card = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.Card),
  { ssr: false }
);
const CardContent = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardContent),
  { ssr: false }
);
const CardDescription = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardDescription),
  { ssr: false }
);
const CardHeader = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardHeader),
  { ssr: false }
);
const CardTitle = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardTitle),
  { ssr: false }
);

const profileSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // If any password field is filled, all must be filled
      const hasPasswordFields =
        data.currentPassword || data.newPassword || data.confirmPassword;
      if (hasPasswordFields) {
        return data.currentPassword && data.newPassword && data.confirmPassword;
      }
      return true;
    },
    {
      message: "All password fields are required to change password",
      path: ["currentPassword"],
    }
  )
  .refine(
    (data) => {
      // New password must be at least 8 characters if provided
      if (data.newPassword && data.newPassword.length < 8) {
        return false;
      }
      return true;
    },
    {
      message: "New password must be at least 8 characters",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      // Passwords must match if provided
      if (data.newPassword && data.confirmPassword) {
        return data.newPassword === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  initialName: string;
  initialEmail: string;
}

export function ProfileEditForm({
  initialName,
  initialEmail,
}: ProfileEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const router = useRouter();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialName,
      email: initialEmail,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ProfileFormData) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully");

      // Reset password fields
      form.setValue("currentPassword", "");
      form.setValue("newPassword", "");
      form.setValue("confirmPassword", "");
      setShowPasswordFields(false);

      // Refresh the page to update the UI
      router.refresh();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>Update your name and email address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Enter your full name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="Enter your email"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Note: Changing your email will require verification
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showPasswordFields ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPasswordFields(true)}
            >
              Change Password
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...form.register("currentPassword")}
                  placeholder="Enter current password"
                />
                {form.formState.errors.currentPassword && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...form.register("newPassword")}
                  placeholder="Enter new password (min. 8 characters)"
                />
                {form.formState.errors.newPassword && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...form.register("confirmPassword")}
                  placeholder="Confirm new password"
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowPasswordFields(false);
                  form.setValue("currentPassword", "");
                  form.setValue("newPassword", "");
                  form.setValue("confirmPassword", "");
                }}
              >
                Cancel Password Change
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
