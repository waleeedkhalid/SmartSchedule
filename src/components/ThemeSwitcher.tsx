"use client";

import * as React from "react";
import { Moon, Sun, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { applyTheme, type PaletteName } from "@/lib/colors";

const themes = [
  {
    id: "academicTwilight" as PaletteName,
    name: "Academic Twilight",
    description: "Contemplative scholarly work",
    className: "theme-academic-twilight",
  },
  {
    id: "desertDawn" as PaletteName,
    name: "Desert Dawn",
    description: "Energetic campus life",
    className: "theme-desert-dawn",
  },
  {
    id: "emeraldLibrary" as PaletteName,
    name: "Emerald Library",
    description: "Timeless academic tradition",
    className: "theme-emerald-library",
  },
  {
    id: "ksuRoyal" as PaletteName,
    name: "KSU Royal",
    description: "King Saud University prestige",
    className: "theme-ksu-royal",
  },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [currentPalette, setCurrentPalette] =
    React.useState<PaletteName>("academicTwilight");

  React.useEffect(() => {
    setMounted(true);
    // Detect current theme from document
    const currentTheme = themes.find((t) =>
      document.documentElement.classList.contains(t.className)
    );
    if (currentTheme) {
      setCurrentPalette(currentTheme.id);
    }
  }, []);

  const handleThemeChange = (paletteId: PaletteName) => {
    setCurrentPalette(paletteId);
    applyTheme(paletteId);
  };

  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Dark Mode Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleDarkMode}
        title={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
        <span className="sr-only">Toggle dark mode</span>
      </Button>

      {/* Theme Palette Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" title="Change color theme">
            <Palette className="h-5 w-5" />
            <span className="sr-only">Change color theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Color Themes</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {themes.map((themeOption) => (
            <DropdownMenuItem
              key={themeOption.id}
              onClick={() => handleThemeChange(themeOption.id)}
              className={
                currentPalette === themeOption.id
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium">{themeOption.name}</span>
                <span className="text-xs text-muted-foreground">
                  {themeOption.description}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
