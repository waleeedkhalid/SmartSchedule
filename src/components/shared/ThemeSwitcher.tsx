"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type PaletteName, palettes, applyTheme } from "@/lib/colors";

const THEME_STORAGE_KEY = "smartschedule-theme";

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] =
    useState<PaletteName>("academicTwilight");

  // Load saved theme on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(
        THEME_STORAGE_KEY
      ) as PaletteName | null;
      if (saved && saved in palettes) {
        setCurrentTheme(saved);
        applyTheme(saved);
      }
    }
  }, []);

  const handleThemeChange = (theme: PaletteName) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  };

  const themes: Array<{
    name: PaletteName;
    label: string;
    icon: string;
    description: string;
  }> = [
    {
      name: "academicTwilight",
      label: "Academic Twilight",
      icon: "🌙",
      description: "Evening scholar atmosphere - contemplative and focused",
    },
    {
      name: "desertDawn",
      label: "Desert Dawn",
      icon: "☀️",
      description: "Morning campus energy - warm and optimistic",
    },
    {
      name: "emeraldLibrary",
      label: "Emerald Library",
      icon: "🏛️",
      description: "Traditional academic prestige - timeless and elegant",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Preferences</CardTitle>
        <CardDescription>
          Choose a visual theme for your SmartSchedule experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {themes.map((theme) => {
          const isActive = currentTheme === theme.name;
          return (
            <button
              key={theme.name}
              onClick={() => handleThemeChange(theme.name)}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all
                ${
                  isActive
                    ? "border-primary bg-accent"
                    : "border-border hover:border-muted-foreground hover:bg-muted"
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{theme.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{theme.label}</span>
                      {isActive && (
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {theme.description}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Preview Components</h4>
          <div className="space-y-2">
            <Button className="w-full">Primary Button</Button>
            <Button variant="secondary" className="w-full">
              Secondary Button
            </Button>
            <Button variant="outline" className="w-full">
              Outline Button
            </Button>
            <div className="flex gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Your theme preference is saved locally and will persist across
          sessions.
        </p>
      </CardContent>
    </Card>
  );
}
