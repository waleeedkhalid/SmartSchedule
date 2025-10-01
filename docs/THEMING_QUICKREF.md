# SmartSchedule Theming - Quick Reference

## 🚀 Quick Start

### Apply a Theme in Your App

```typescript
import { applyTheme } from "@/lib/colors";

// In a component or page
useEffect(() => {
  applyTheme("academicTwilight");
}, []);
```

### Add Theme Switcher to Settings

```tsx
import { ThemeSwitcher } from "@/components/shared/ThemeSwitcher";

export default function SettingsPage() {
  return (
    <div>
      <h1>Preferences</h1>
      <ThemeSwitcher />
    </div>
  );
}
```

## 🎨 Available Themes

| Theme                | Class Name                | Use Case               |
| -------------------- | ------------------------- | ---------------------- |
| 🌙 Academic Twilight | `theme-academic-twilight` | Default, evening study |
| ☀️ Desert Dawn       | `theme-desert-dawn`       | Student views, morning |
| 🏛️ Emerald Library   | `theme-emerald-library`   | Admin, formal reports  |

## 📦 Utility Functions

```typescript
import {
  applyTheme,
  getThemeClassName,
  isThemeActive,
  getColor,
  getRgbString,
} from "@/lib/colors";

// Apply theme
applyTheme("desertDawn");

// Get CSS class name
const className = getThemeClassName("emeraldLibrary");
// Returns: "theme-emerald-library"

// Check if theme is active
const isActive = isThemeActive("academicTwilight");

// Get specific color (for custom components)
const color = getColor("academicTwilight", "scholarBlue");
// Returns: "#2d3561"

// Get RGB string for transparency
const rgb = getRgbString("desertDawn", "terracotta");
// Returns: "198, 93, 59"
// Use as: rgba(198, 93, 59, 0.5)
```

## 🎯 Using with shadcn Components

All shadcn/ui components automatically use themed colors:

```tsx
import { Button, Card, Badge } from "@/components/ui";

// These adapt to the active theme automatically
<Card>
  <Button>Primary</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="outline">Outline</Button>
  <Badge>Status</Badge>
</Card>;
```

## 🎨 Semantic Color Variables

Your custom components can use these CSS variables:

```tsx
<div className="bg-background text-foreground">
  <div className="bg-card border-border">
    <button className="bg-primary text-primary-foreground">
      Primary Button
    </button>
    <div className="bg-muted text-muted-foreground">Muted text</div>
  </div>
</div>
```

Available variables:

- `background` / `foreground`
- `card` / `card-foreground`
- `primary` / `primary-foreground`
- `secondary` / `secondary-foreground`
- `accent` / `accent-foreground`
- `muted` / `muted-foreground`
- `border`, `input`, `ring`

## 🌙 Dark Mode

Each theme has dark mode support:

```tsx
// Dark mode is automatically applied with .dark class
<html className="theme-academic-twilight dark">
  {/* All components use dark mode colors */}
</html>
```

## 📁 Files

| File                                      | Purpose                         |
| ----------------------------------------- | ------------------------------- |
| `src/app/globals.css`                     | Theme CSS classes               |
| `src/lib/colors.ts`                       | Palette definitions & utilities |
| `src/components/shared/ThemeSwitcher.tsx` | UI component                    |
| `src/app/demo/themes/page.tsx`            | Live demo                       |

## 🔗 Demo Pages

- **Theme Demo**: `/demo/themes` - Switch themes, preview components
- **Color System**: `/demo/color-system` - Explore palette details

## 📚 Full Documentation

- **Complete Guide**: `docs/THEMING_SYSTEM.md`
- **Color Details**: `docs/COLOR_SYSTEM.md`
- **Quick Start**: `docs/COLOR_SYSTEM_QUICKSTART.md`

## 💡 Tips

1. **Persistence**: Theme choice auto-saves to localStorage
2. **TypeScript**: All palette names are type-safe
3. **Performance**: Themes are CSS-only, no re-renders needed
4. **Accessibility**: All themes maintain WCAG AA contrast ratios
5. **Customization**: Add new themes by editing `globals.css`

---

**Last Updated:** 2025-10-01
