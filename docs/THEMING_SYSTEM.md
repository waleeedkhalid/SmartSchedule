# SmartSchedule Theming System Integration

## Overview

SmartSchedule now has **full shadcn/ui theming integration** with three story-driven color palettes. All shadcn components automatically adapt to the selected theme using CSS variables.

## 🎨 The Three Themes

### 1. Academic Twilight 🌙 (Default)

**Story:** The contemplative hours of scholarly work  
**Mood:** Evening scholar atmosphere  
**Colors:** Deep blues, warm ambers, muted violets  
**Use Case:** Default theme, focused work sessions

### 2. Desert Dawn ☀️

**Story:** The energetic awakening of campus life  
**Mood:** Morning campus energy  
**Colors:** Terracotta, sunrise golds, sage greens  
**Use Case:** Student-facing views, collaborative planning

### 3. Emerald Library 🏛️

**Story:** The timeless wisdom of academic tradition  
**Mood:** Traditional academic prestige  
**Colors:** Forest greens, leather browns, brass accents  
**Use Case:** Administrative views, formal reports

## 🚀 Quick Start

### View the Theme Demo

```bash
npm run dev
```

Visit: **http://localhost:3000/demo/themes**

### Apply a Theme Programmatically

```typescript
import { applyTheme } from "@/lib/colors";

// Apply a specific theme
applyTheme("academicTwilight");
applyTheme("desertDawn");
applyTheme("emeraldLibrary");
```

### Use the Theme Switcher Component

```tsx
import { ThemeSwitcher } from "@/components/shared/ThemeSwitcher";

export default function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <ThemeSwitcher />
    </div>
  );
}
```

## 🔧 Technical Implementation

### CSS Classes

Themes are applied via CSS classes added to the root element:

- `.theme-academic-twilight`
- `.theme-desert-dawn`
- `.theme-emerald-library`

### shadcn/ui Integration

All themes define the full set of shadcn/ui semantic color variables:

```css
/* Example: Academic Twilight Light Mode */
.theme-academic-twilight {
  --background: oklch(0.96 0.01 65); /* parchment */
  --foreground: oklch(0.18 0.02 270); /* textPrimary */
  --primary: oklch(0.27 0.08 265); /* scholarBlue */
  --secondary: oklch(0.35 0.08 260); /* inkwell */
  --accent: oklch(0.71 0.08 60); /* amberGlow */
  --muted: oklch(0.91 0.02 65); /* manuscript */
  --border: oklch(0.91 0.02 65);
  --card: oklch(0.91 0.02 65);
  --destructive: oklch(0.52 0.12 15); /* error */
  /* ... and more */
}
```

### Color Format

All colors use **OKLCH** format for:

- ✅ Perceptually uniform color space
- ✅ Better interpolation than RGB/HSL
- ✅ More predictable lightness
- ✅ Modern CSS standard

### Dark Mode Support

Each theme has dark mode variants:

```css
.theme-academic-twilight.dark {
  --background: oklch(0.12 0.02 270); /* midnight */
  --foreground: oklch(0.96 0.01 65); /* light text */
  --primary: oklch(0.71 0.08 60); /* amberGlow */
  /* ... inverted colors */
}
```

## 📦 File Structure

```
src/
├── app/
│   ├── globals.css              # Theme CSS classes defined here
│   └── demo/themes/page.tsx     # Theme demo & documentation page
├── components/
│   └── shared/
│       └── ThemeSwitcher.tsx    # Theme selection component
└── lib/
    └── colors.ts                # Theme utilities & palette definitions
```

## 🎯 Usage in Components

All shadcn/ui components automatically use the themed colors:

```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// These automatically adapt to the active theme
<Card>
  <Button>Primary Button</Button>
  <Button variant="secondary">Secondary Button</Button>
  <Badge>Status Badge</Badge>
</Card>;
```

## 🛠️ Available Utilities

### `applyTheme(paletteName)`

Apply a theme globally to the application.

```typescript
import { applyTheme } from "@/lib/colors";
applyTheme("desertDawn");
```

### `getThemeClassName(paletteName)`

Get the CSS class name for a theme.

```typescript
import { getThemeClassName } from "@/lib/colors";
const className = getThemeClassName("emeraldLibrary");
// Returns: "theme-emerald-library"
```

### `isThemeActive(paletteName)`

Check if a theme is currently active.

```typescript
import { isThemeActive } from "@/lib/colors";
const isActive = isThemeActive("academicTwilight");
```

### Legacy Color Access (for custom components)

Access specific colors from a palette:

```typescript
import { getColor, getRgbString } from "@/lib/colors";

// Get hex color
const color = getColor("academicTwilight", "scholarBlue");
// Returns: "#2d3561"

// Get RGB for transparency
const rgb = getRgbString("academicTwilight", "scholarBlue");
// Returns: "45, 53, 97"
// Use as: rgba(45, 53, 97, 0.5)
```

## 🎨 Semantic Color Mapping

Each theme maps to shadcn's semantic colors:

| shadcn Variable | Academic Twilight | Desert Dawn  | Emerald Library  |
| --------------- | ----------------- | ------------ | ---------------- |
| `--background`  | Parchment         | Morning Mist | Ivory Page       |
| `--primary`     | Scholar Blue      | Terracotta   | Emerald          |
| `--secondary`   | Inkwell           | Sunbaked     | Moss Green       |
| `--accent`      | Amber Glow        | Sunrise Gold | Brass Fixture    |
| `--muted`       | Manuscript        | Sandstone    | Ivory Page       |
| `--destructive` | Error Red         | Error Red    | Burgundy Leather |

## 📝 Customization

### Adding a New Theme

1. **Define palette in `globals.css`:**

```css
.theme-new-theme {
  --background: oklch(...);
  --foreground: oklch(...);
  /* ... all other variables */
}

.theme-new-theme.dark {
  /* ... dark mode variants */
}
```

2. **Update utilities in `colors.ts`:**

```typescript
export function getThemeClassName(paletteName: PaletteName): string {
  const themeMap: Record<PaletteName, string> = {
    academicTwilight: "theme-academic-twilight",
    desertDawn: "theme-desert-dawn",
    emeraldLibrary: "theme-emerald-library",
    newTheme: "theme-new-theme", // Add here
  };
  return themeMap[paletteName];
}
```

3. **Add to ThemeSwitcher component:**

```typescript
const themes = [
  // ... existing themes
  {
    name: "newTheme",
    label: "New Theme",
    icon: "🎨",
    description: "Description of the new theme",
  },
];
```

## 🎉 Benefits

### For Users

- ✅ **Personalization**: Choose a theme that matches their preference
- ✅ **Mood-based**: Select themes based on time of day or task
- ✅ **Accessibility**: Each theme maintains WCAG AA contrast ratios
- ✅ **Persistence**: Theme choice saved in localStorage

### For Developers

- ✅ **Zero Config**: All shadcn components work automatically
- ✅ **Consistent**: Uses standard shadcn semantic variables
- ✅ **Maintainable**: Themes defined in one place (globals.css)
- ✅ **Type-Safe**: TypeScript types for all palette names
- ✅ **Modern**: Uses OKLCH color space for better color management

## 🔮 Future Enhancements

- [ ] Time-based auto-switching (Academic Twilight for evening, Desert Dawn for morning)
- [ ] Persona-based default themes (Students get Desert Dawn, Faculty get Emerald Library)
- [ ] Custom theme builder UI
- [ ] Reduced motion variants
- [ ] High contrast accessibility mode
- [ ] Department-specific color accent overrides

## 📚 Related Documentation

- **Color System Details**: `docs/COLOR_SYSTEM.md` (Complete palette specifications)
- **Quick Start**: `docs/COLOR_SYSTEM_QUICKSTART.md` (Quick reference)
- **shadcn/ui Theming**: https://ui.shadcn.com/docs/theming
- **OKLCH Color Space**: https://oklch.com/

## 🧪 Testing

Visit `/demo/themes` to:

- ✅ Switch between all three themes in real-time
- ✅ Preview how UI components look in each theme
- ✅ See color token mappings
- ✅ Test dark mode variants
- ✅ Verify localStorage persistence

---

**Status:** ✅ Complete and Production-Ready  
**Created:** 2025-10-01  
**Files Modified:** `globals.css`, `colors.ts`, `ThemeSwitcher.tsx`, `page.tsx`
