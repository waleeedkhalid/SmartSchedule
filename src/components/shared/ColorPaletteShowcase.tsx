/**
 * Color Palette Showcase Component
 *
 * Interactive component to view and switch between different color themes
 * for the SmartSchedule application.
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Palette } from "lucide-react";
import { palettes, type PaletteName, type ColorPalette } from "@/lib/colors";

export function ColorPaletteShowcase() {
  const [selectedPalette, setSelectedPalette] =
    useState<PaletteName>("academicTwilight");
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const currentPalette = palettes[selectedPalette];

  const copyToClipboard = (color: string, name: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(name);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  // Filter out non-color properties (name, description)
  const getColorEntries = (palette: ColorPalette) => {
    return Object.entries(palette).filter(
      ([, value]) => typeof value === "string" && value.startsWith("#")
    );
  };

  const paletteInfo = {
    academicTwilight: {
      emoji: "🌙",
      mood: "Contemplative & Focused",
      useCase: "Deep work, detailed planning, evening study sessions",
    },
    desertDawn: {
      emoji: "🌅",
      mood: "Energetic & Optimistic",
      useCase: "Active scheduling, student interfaces, collaboration",
    },
    emeraldLibrary: {
      emoji: "📚",
      mood: "Prestigious & Classical",
      useCase: "Administrative views, formal reports, archival data",
    },
    ksuRoyal: {
      emoji: "👑",
      mood: "Institutional & Prestigious",
      useCase: "Official university branded interfaces and documents",
    },
  };

  // Type refinement: some palettes (e.g., ksuRoyal) do not define textSecondary.
  function getSecondaryTextColor(p: typeof currentPalette): string {
    return (
      (p as Partial<Record<string, string>>).textSecondary || p.textPrimary
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6" />
            <div>
              <CardTitle>SmartSchedule Color System</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Three story-driven palettes for immersive academic experiences
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(palettes) as PaletteName[]).map((paletteName) => (
              <Button
                key={paletteName}
                variant={
                  selectedPalette === paletteName ? "default" : "outline"
                }
                onClick={() => setSelectedPalette(paletteName)}
                className="flex items-center gap-2"
              >
                <span>{paletteInfo[paletteName].emoji}</span>
                <span className="capitalize">
                  {paletteName.replace(/([A-Z])/g, " $1").trim()}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Palette Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {paletteInfo[selectedPalette].emoji}
                <span>{currentPalette.name}</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {currentPalette.description}
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {getColorEntries(currentPalette).length} colors
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mood & Use Case */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Mood
              </p>
              <p className="text-sm">{paletteInfo[selectedPalette].mood}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Use Case
              </p>
              <p className="text-sm">{paletteInfo[selectedPalette].useCase}</p>
            </div>
          </div>

          {/* Color Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {getColorEntries(currentPalette).map(([name, color]) => (
              <div
                key={name}
                className="group relative overflow-hidden rounded-lg border hover:shadow-lg transition-all"
              >
                {/* Color Swatch */}
                <div
                  className="h-24 w-full cursor-pointer transition-transform group-hover:scale-105"
                  style={{ backgroundColor: color }}
                  onClick={() => copyToClipboard(color, name)}
                />

                {/* Color Info */}
                <div className="p-3 bg-background">
                  <p className="font-medium text-sm capitalize">
                    {name.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <code className="text-xs text-muted-foreground font-mono">
                      {color}
                    </code>
                    <button
                      onClick={() => copyToClipboard(color, name)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy hex code"
                    >
                      {copiedColor === name ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CSS Variables Export */}
          <div className="mt-6">
            <p className="text-sm font-semibold mb-2">CSS Variables</p>
            <div className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code className="text-xs font-mono block whitespace-pre">
                {`:root {\n${getColorEntries(currentPalette)
                  .map(([name, color]) => `  --color-${name}: ${color};`)
                  .join("\n")}\n}`}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Preview</CardTitle>
          <p className="text-sm text-muted-foreground">
            See how the palette looks in common UI patterns
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Background Preview */}
          <div>
            <p className="text-sm font-semibold mb-3">Background & Cards</p>
            <div
              className="p-6 rounded-lg"
              style={{
                backgroundColor:
                  currentPalette[
                    Object.keys(currentPalette).find(
                      (k) =>
                        k.toLowerCase().includes("background") ||
                        k === "midnight" ||
                        k === "forestDeep" ||
                        k === "sandstone"
                    ) as keyof typeof currentPalette
                  ] || currentPalette.textPrimary,
              }}
            >
              <div
                className="p-4 rounded-md"
                style={{
                  backgroundColor:
                    currentPalette[
                      Object.keys(currentPalette).find(
                        (k) =>
                          k.includes("parchment") ||
                          k.includes("mist") ||
                          k.includes("ivory")
                      ) as keyof typeof currentPalette
                    ] || "#ffffff",
                  color: currentPalette.textPrimary,
                }}
              >
                <h3 className="font-semibold mb-2">Sample Card Content</h3>
                <p
                  className="text-sm"
                  style={{ color: getSecondaryTextColor(currentPalette) }}
                >
                  This is how text and cards would appear with this theme
                  applied to the scheduling interface.
                </p>
              </div>
            </div>
          </div>

          {/* Status Colors */}
          <div>
            <p className="text-sm font-semibold mb-3">Status Indicators</p>
            <div className="flex flex-wrap gap-2">
              {["success", "warning", "error", "info"].map((status) => (
                <Badge
                  key={status}
                  style={{
                    backgroundColor:
                      currentPalette[status as keyof typeof currentPalette],
                    color: "#ffffff",
                  }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
