# Color System Quick Start

## 🎨 Overview

SmartSchedule now has a comprehensive color system with **3 story-driven themed palettes**, ready to use throughout the application.

## 🚀 Quick Access

**Demo Page:** Navigate to `/demo/color-system` to view and test all palettes interactively.

```bash
npm run dev
# Then visit: http://localhost:3000/demo/color-system
```

## 🎭 The Three Palettes

### 1. Academic Twilight 🌙

**Mood:** Evening scholar, contemplative depth  
**Use Case:** Default theme, sophisticated academic atmosphere  
**Colors:** Deep blues, warm ambers, muted violets

### 2. Desert Dawn ☀️

**Mood:** Morning campus energy, warm optimism  
**Use Case:** Student-focused views, morning/daytime sessions  
**Colors:** Terracotta, sunrise golds, sage greens

### 3. Emerald Library 🏛️

**Mood:** Traditional academic prestige, timeless wisdom  
**Use Case:** Faculty/administrative views, formal reports  
**Colors:** Forest greens, leather browns, brass accents

## 📖 Basic Usage

### Import the Color Library

```typescript
import { colorPalettes, getColor } from "@/lib/colors";
```

### Get a Specific Color

```typescript
// Get a color from a palette
const primaryColor = getColor("academicTwilight", "primary");
// Returns: '#4a6fa5'

// Use in a component
<div style={{ backgroundColor: primaryColor }}>Hello World</div>;
```

### Generate CSS Variables

```typescript
import { getPaletteCSSVariables } from "@/lib/colors";

const cssVars = getPaletteCSSVariables("desertDawn");
// Returns object like: { '--color-primary': '#c65d3b', ... }
```

### Use RGB for Transparency

```typescript
import { getRgbString } from "@/lib/colors";

const rgbColor = getRgbString("emeraldLibrary", "accent");
// Returns: '91, 116, 94' (can use with rgba(91, 116, 94, 0.5))
```

## 🎨 Color Categories

Each palette includes:

- **8+ Core Colors**: Primary, secondary, accent, background, surface, etc.
- **4 Semantic Colors**: Success, warning, error, info
- **4 Text Colors**: Primary, secondary, muted, inverse

## 📚 Full Documentation

See **[COLOR_SYSTEM.md](./COLOR_SYSTEM.md)** for:

- Complete color tables with hex codes
- Contrast ratio specifications
- Implementation examples
- Best practices
- Future enhancement roadmap

## ✨ Interactive Features

The showcase component (`/demo/color-system`) lets you:

- ✅ Switch between all 3 palettes
- ✅ View all colors with hex codes
- ✅ Copy colors to clipboard (click any swatch)
- ✅ See CSS variable syntax
- ✅ Preview UI patterns with each theme

## 🔮 Next Steps (Future Implementation)

1. **Theme Switcher Component** - Let users select their preferred palette
2. **Persistence** - Save user theme preference to localStorage
3. **Global Application** - Apply selected palette to entire UI
4. **Persona Defaults** - Set default palettes per user role
5. **Time-Based Switching** - Auto-switch based on time of day

## 🎯 Try It Now

1. Start the dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/demo/color-system`
3. Click the palette buttons to switch themes
4. Click any color swatch to copy its hex code
5. Explore the theme previews at the bottom

---

**Created:** 2025-10-01  
**Status:** ✅ Complete & Ready to Use  
**Files:** `src/lib/colors.ts`, `src/components/shared/ColorPaletteShowcase.tsx`, `COLOR_SYSTEM.md`
