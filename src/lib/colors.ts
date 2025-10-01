/**
 * SmartSchedule Color System
 *
 * Three distinct themed palettes for the academic scheduling system.
 * Each palette tells a story and creates a unique atmosphere.
 */

// ============================================================================
// PALETTE 1: "Academic Twilight" - The Scholar's Evening
// ============================================================================
// Mood: Contemplative, focused, intellectual depth
// Story: The quiet hours when scholars work into the evening, surrounded by
// books and warm lamplight. Deep blues of twilight sky mixed with warm
// amber tones of study lamps.
// Use Case: Primary theme for focused work sessions, reading schedules,
// detailed planning views

export const academicTwilight = {
  name: "Academic Twilight",
  description: "The contemplative hours of scholarly work",

  // Core colors
  midnight: "#1a1f3a", // Deep navy - primary background
  scholarBlue: "#2d3561", // Rich blue-purple - cards, elevated surfaces
  inkwell: "#3d4a7a", // Blue-grey - secondary elements
  parchment: "#f4f1e8", // Warm off-white - text backgrounds
  manuscript: "#e8e3d3", // Aged paper - subtle backgrounds

  // Accent colors
  amberGlow: "#d4a574", // Warm amber - highlights, active states
  copperPen: "#b8956a", // Copper tone - interactive elements
  twilightViolet: "#6b5b95", // Purple accent - special markers

  // Semantic colors
  success: "#7ba05b", // Forest green - completed tasks
  warning: "#d4a574", // Amber - cautions
  error: "#a65959", // Muted red - errors
  info: "#5b8ba6", // Steel blue - information

  // Text colors
  textPrimary: "#2d2d3a", // Almost black with blue tint
  textSecondary: "#5a5a6b", // Medium grey-blue
  textTertiary: "#8a8a98", // Light grey-blue
  textInverse: "#f4f1e8", // Parchment for dark backgrounds
} as const;

// ============================================================================
// PALETTE 2: "Desert Dawn" - The Early Morning Campus
// ============================================================================
// Mood: Energetic, warm, optimistic, fresh starts
// Story: The campus awakening at sunrise, terracotta buildings catching
// golden light, students walking through sun-drenched courtyards. Warm
// earth tones mixed with bright morning sky.
// Use Case: Active scheduling mode, student-facing interfaces,
// collaborative planning sessions

export const desertDawn = {
  name: "Desert Dawn",
  description: "The energetic awakening of campus life",

  // Core colors
  terracotta: "#c65d3b", // Warm red-orange - primary accent
  sandstone: "#e8d5b5", // Light tan - backgrounds
  clayPot: "#9c5d3f", // Deep terracotta - emphasis
  morningMist: "#f9f5ef", // Pale cream - cards, elevated surfaces
  sunbaked: "#d4a276", // Golden tan - hover states

  // Accent colors
  desertSage: "#8b9e7d", // Sage green - success, growth
  sunriseGold: "#e6b35c", // Bright gold - highlights
  skyBloom: "#7ba8c9", // Morning sky blue - links, info

  // Semantic colors
  success: "#8b9e7d", // Desert sage - completed
  warning: "#e6b35c", // Sunrise gold - attention
  error: "#c65d3b", // Terracotta - errors
  info: "#7ba8c9", // Sky bloom - information

  // Text colors
  textPrimary: "#3a2f2a", // Warm dark brown
  textSecondary: "#6b5d54", // Medium brown
  textTertiary: "#9a8a7d", // Light warm grey
  textInverse: "#f9f5ef", // Morning mist for dark backgrounds
} as const;

// ============================================================================
// PALETTE 3: "Emerald Library" - The Timeless Archive
// ============================================================================
// Mood: Prestigious, calm, trustworthy, classical elegance
// Story: Ancient university libraries with green reading lamps, dark wood
// shelving, leather-bound volumes, and brass fixtures. Deep greens and
// rich browns creating a sense of academic tradition and gravitas.
// Use Case: Administrative views, official documents, formal reports,
// archival interfaces

export const emeraldLibrary = {
  name: "Emerald Library",
  description: "The timeless wisdom of academic tradition",

  // Core colors
  forestDeep: "#1c3a2e", // Deep forest green - primary background
  leatherBound: "#2d2318", // Dark brown - secondary background
  emerald: "#3d6e5c", // Rich emerald - cards, surfaces
  ivoryPage: "#f5f2e8", // Aged ivory - text backgrounds
  oakPanel: "#5c4a3a", // Medium oak brown - borders, dividers

  // Accent colors
  brassFixture: "#b89968", // Warm brass - active elements
  mossGreen: "#6b8e7a", // Lighter green - hover, secondary actions
  burgundyLeather: "#854442", // Deep red - important markers

  // Semantic colors
  success: "#6b8e7a", // Moss green - approved, complete
  warning: "#b89968", // Brass - caution
  error: "#854442", // Burgundy - errors, urgent
  info: "#5a7a8c", // Slate blue - information

  // Text colors
  textPrimary: "#2d2318", // Leather brown - almost black
  textSecondary: "#4a3f35", // Medium brown
  textTertiary: "#7a6f65", // Light brown-grey
  textInverse: "#f5f2e8", // Ivory for dark backgrounds
} as const;

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

export type ColorPalette =
  | typeof academicTwilight
  | typeof desertDawn
  | typeof emeraldLibrary
  | typeof ksuRoyal;

export type PaletteKey = keyof typeof academicTwilight;

// ============================================================================
// PALETTE REGISTRY
// ============================================================================

export const palettes = {
  academicTwilight,
  desertDawn,
  emeraldLibrary,
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
    academicTwilight: "theme-academic-twilight",
    desertDawn: "theme-desert-dawn",
    emeraldLibrary: "theme-emerald-library",
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
  const themeClasses = [
    "theme-academic-twilight",
    "theme-desert-dawn",
    "theme-emerald-library",
    "theme-ksu-royal",
  ];

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
