"use client";

import { MonitorCog, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const rotateTheme = React.useCallback(() => {
    const order: Array<string | undefined> = ["light", "dark", "system"];
    const currentIndex = order.indexOf(theme);
    const nextTheme = order[(currentIndex + 1) % order.length] ?? "system";
    setTheme(nextTheme);
  }, [setTheme, theme]);

  const icon = theme === "dark" ? (
    <Moon className="size-4" aria-hidden="true" />
  ) : theme === "light" ? (
    <Sun className="size-4" aria-hidden="true" />
  ) : (
    <MonitorCog className="size-4" aria-hidden="true" />
  );

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className="relative"
      aria-label="Toggle theme"
      data-test="theme-toggle"
      onClick={rotateTheme}
    >
      {icon}
    </Button>
  );
}
