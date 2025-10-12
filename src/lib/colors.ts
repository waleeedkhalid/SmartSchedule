// ============================================================================
// PALETTE 4: "KSU Royal" - King Saud University Identity
// ============================================================================
// Mood: Scholarly, prestigious, authoritative, accessible
// Story: The distinguished halls of King Saud University, where royal blue
// banners meet golden accents, crisp white walls reflect natural light,
// and every detail speaks to academic excellence and institutional pride.
// Modern clarity meets timeless prestige.
// Use Case: Official university communications, administrative interfaces,
// formal academic documents, student portals with KSU branding

export const ksuRoyal = {
  name: "KSU Identity - Minimal Blue/White/Black",
  description: "Simplified palette with only blue, white, and black.",

  // Core brand colors
  royalBlue: "#0084BD", // KSU Blue
  softWhite: "#FFFFFF", // Pure white
  black: "#000000", // True black

  // Primary action (Blue states)
  actionBlue: "#007BB1",
  actionHover: "#006C9B",
  actionActive: "#005D84",

  // Interactive blues
  hoverBlue: "#006C9B",
  linkBlue: "#0084BD",
  focusRing: "#38A1D6",

  // Dark mode blues
  darkAction: "#0C5A7D",
  darkActionHover: "#094863",
  darkActionActive: "#063749",
  darkLink: "#93C5FD",

  // Dark mode neutrals
  darkBackground: "#000000", // black background
  darkCard: "#171A1D", // near-black card
  darkBorder: "rgba(255,255,255,0.08)",

  // Text
  textPrimary: "#000000",
  textInverse: "#FFFFFF",

  // Dark mode text
  textDarkPrimary: "#E6E9EF",
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ColorPalette = typeof ksuRoyal;

export type PaletteKey = keyof typeof ksuRoyal;

// ============================================================================
// PALETTE REGISTRY
// ============================================================================

export const palettes = {
  ksuRoyal,
} as const;

export type PaletteName = keyof typeof palettes;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a color from a specific palette
 */
export function getColor(palette: PaletteName, colorKey: PaletteKey): string {
  return palettes[palette][colorKey as keyof (typeof palettes)[typeof palette]];
}

/**
 * Utility function to generate CSS custom properties from a palette
 * Use this to dynamically inject theme variables
 */
export function getPaletteCSSVariables(
  paletteName: PaletteName
): Record<string, string> {
  const palette = palettes[paletteName];
  const cssVars: Record<string, string> = {};

  // All palette colors
  Object.entries(palette).forEach(([key, value]) => {
    if (typeof value === "string") {
      cssVars[`--color-${key}`] = value as string;
    }
  });

  return cssVars;
}

/**
 * Get the CSS class name for applying a themed palette
 * To use: add this class to your root html/body element
 *
 * Example:
 * ```tsx
 * <html className={getThemeClassName("academicTwilight")}>
 * ```
 */
export function getThemeClassName(paletteName: PaletteName): string {
  const themeMap: Record<PaletteName, string> = {
    ksuRoyal: "theme-ksu-royal",
  };
  return themeMap[paletteName];
}

/**
 * Helper to check if a theme is currently applied
 */
export function isThemeActive(paletteName: PaletteName): boolean {
  if (typeof document === "undefined") return false;
  const className = getThemeClassName(paletteName);
  return (
    document.documentElement.classList.contains(className) ||
    document.body.classList.contains(className)
  );
}

/**
 * Apply a theme by adding its class to the document
 */
export function applyTheme(paletteName: PaletteName): void {
  if (typeof document === "undefined") return;

  // Remove all existing theme classes
  const themeClasses = ["theme-ksu-royal"];

  themeClasses.forEach((cls) => {
    document.documentElement.classList.remove(cls);
    document.body.classList.remove(cls);
  });

  // Add the new theme class
  const className = getThemeClassName(paletteName);
  document.documentElement.classList.add(className);
}

/**
 * Convert hex to RGB for use with opacity
 */
export function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Get RGB string for CSS (useful for alpha transparency)
 */
export function getRgbString(
  palette: PaletteName,
  colorKey: PaletteKey
): string {
  const hex = getColor(palette, colorKey);
  const rgb = hexToRgb(hex);
  return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : "0, 0, 0";
}
