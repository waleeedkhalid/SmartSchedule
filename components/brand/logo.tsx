import { cn } from "@/lib/utils";

type LogoVariant = "full" | "icon" | "wordmark";
type LogoSize = "sm" | "md" | "lg" | "xl";

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
}

const sizeClasses: Record<
  LogoSize,
  { container: string; icon: string; text: string }
> = {
  sm: {
    container: "h-6",
    icon: "h-6 w-6",
    text: "text-base",
  },
  md: {
    container: "h-8",
    icon: "h-8 w-8",
    text: "text-lg",
  },
  lg: {
    container: "h-10",
    icon: "h-10 w-10",
    text: "text-xl",
  },
  xl: {
    container: "h-12",
    icon: "h-12 w-12",
    text: "text-2xl",
  },
};

function IconMark({
  sizes,
}: {
  sizes: { container: string; icon: string; text: string };
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizes.icon, "flex-shrink-0")}
      aria-hidden="true"
    >
      {/* Grid pattern representing schedule/calendar */}
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(210, 75%, 50%)" />
          <stop offset="100%" stopColor="hsl(210, 85%, 35%)" />
        </linearGradient>
      </defs>

      {/* Background rounded square */}
      <rect width="40" height="40" rx="8" fill="url(#logo-gradient)" />

      {/* Abstract schedule grid - 3x3 blocks */}
      {/* Top row */}
      <rect
        x="8"
        y="8"
        width="6"
        height="6"
        rx="1.5"
        fill="white"
        opacity="0.9"
      />
      <rect
        x="17"
        y="8"
        width="6"
        height="6"
        rx="1.5"
        fill="white"
        opacity="0.6"
      />
      <rect
        x="26"
        y="8"
        width="6"
        height="6"
        rx="1.5"
        fill="white"
        opacity="0.4"
      />

      {/* Middle row */}
      <rect
        x="8"
        y="17"
        width="6"
        height="6"
        rx="1.5"
        fill="white"
        opacity="0.6"
      />
      <rect
        x="17"
        y="17"
        width="6"
        height="6"
        rx="1.5"
        fill="white"
        opacity="0.9"
      />
      <rect
        x="26"
        y="17"
        width="6"
        height="6"
        rx="1.5"
        fill="white"
        opacity="0.6"
      />

      {/* Bottom row - merged cells showing schedule flexibility */}
      <rect
        x="8"
        y="26"
        width="15"
        height="6"
        rx="1.5"
        fill="white"
        opacity="0.4"
      />
      <rect
        x="26"
        y="26"
        width="6"
        height="6"
        rx="1.5"
        fill="white"
        opacity="0.9"
      />
    </svg>
  );
}

function Wordmark({
  sizes,
}: {
  sizes: { container: string; icon: string; text: string };
}) {
  return (
    <span className={cn("font-bold tracking-tight", sizes.text)}>
      Smart
      <span className="text-brand-blue dark:text-brand-blue-500">Schedule</span>
    </span>
  );
}

export function Logo({ variant = "full", size = "md", className }: LogoProps) {
  const sizes = sizeClasses[size];

  return (
    <div className={cn("flex items-center gap-2", sizes.container, className)}>
      {variant !== "wordmark" && <IconMark sizes={sizes} />}
      {variant !== "icon" && <Wordmark sizes={sizes} />}
    </div>
  );
}
