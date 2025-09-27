import * as React from "react";

import { cn } from "@/lib/utils";

const alertVariants = {
  default: "bg-muted text-foreground",
  info: "bg-sky-500/10 text-sky-800 border border-sky-500/30",
  success: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/30",
  warning: "bg-amber-500/10 text-amber-700 border border-amber-500/30",
  destructive: "bg-red-500/10 text-red-700 border border-red-500/30",
} as const;

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: keyof typeof alertVariants;
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    role="status"
    className={cn(
      "relative w-full rounded-xl px-4 py-3 text-sm shadow-sm",
      alertVariants[variant],
      className,
    )}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-semibold", className)} {...props} />
  ),
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm", className)} {...props} />
  ),
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, AlertTitle };
