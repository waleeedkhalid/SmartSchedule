# Color System Documentation

## Overview

The SmartSchedule application uses a comprehensive, accessible color system built on **OKLCH color space** and **CSS custom properties**. All colors meet or exceed **WCAG AA contrast requirements** and provide consistent theming across light and dark modes.

## Table of Contents

1. [Color Philosophy](#color-philosophy)
2. [Color Tokens](#color-tokens)
3. [Usage Guidelines](#usage-guidelines)
4. [Accessibility Standards](#accessibility-standards)
5. [Theme Customization](#theme-customization)
6. [Migration Guide](#migration-guide)

---

## Color Philosophy

### Design Principles

1. **Accessibility First**: All text colors meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
2. **Semantic Naming**: Colors are named by purpose, not appearance (e.g., `primary` not `blue`)
3. **State Awareness**: Explicit hover, active, and disabled states for all interactive elements
4. **Theme Consistency**: Unified system that works seamlessly across light and dark modes
5. **KSU Brand Alignment**: Colors reflect King Saud University's identity while maintaining accessibility

### Why OKLCH?

We use OKLCH (Lightness, Chroma, Hue) color space because:
- **Perceptually uniform**: Equal changes in values produce equal perceived changes
- **Better interpolation**: Smooth color transitions between states
- **Predictable lightness**: Easy to create accessible color variations
- **Modern standard**: Native CSS support in all modern browsers

---

## Color Tokens

### Base Colors

| Token | Light Mode | Dark Mode | Purpose |
|-------|------------|-----------|---------|
| `background` | oklch(0.99 0 0) | oklch(0.18 0.02 250) | Main page background |
| `foreground` | oklch(0.25 0.015 250) | oklch(0.92 0.005 250) | Primary text color |
| `card` | oklch(1 0 0) | oklch(0.22 0.025 250) | Elevated surface (cards, modals) |
| `card-foreground` | oklch(0.25 0.015 250) | oklch(0.92 0.005 250) | Text on card surfaces |

**Contrast Ratios:**
- Light mode: 14.8:1 (exceeds WCAG AAA)
- Dark mode: 13.2:1 (exceeds WCAG AAA)

### Primary Colors (Brand - KSU Blue)

| Token | Light Mode | Dark Mode | Contrast | Usage |
|-------|------------|-----------|----------|-------|
| `primary` | oklch(0.48 0.17 250) | oklch(0.68 0.16 250) | 5.1:1 / 7.2:1 | Primary buttons, key actions |
| `primary-foreground` | oklch(0.99 0 0) | oklch(0.15 0.02 250) | ✅ AA+ | Text on primary background |
| `primary-hover` | oklch(0.42 0.16 250) | oklch(0.72 0.17 250) | - | Hover state |
| `primary-active` | oklch(0.38 0.15 250) | oklch(0.76 0.18 250) | - | Active/pressed state |

**Usage Example:**
```tsx
<Button className="bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active">
  Submit
</Button>
```

### Secondary Colors

| Token | Light Mode | Dark Mode | Contrast | Usage |
|-------|------------|-----------|----------|-------|
| `secondary` | oklch(0.92 0.01 250) | oklch(0.28 0.03 250) | - | Secondary buttons, less emphasis |
| `secondary-foreground` | oklch(0.25 0.015 250) | oklch(0.92 0.005 250) | 8.2:1 / 9.1:1 | Text on secondary background |
| `secondary-hover` | oklch(0.88 0.015 250) | oklch(0.32 0.035 250) | - | Hover state |
| `secondary-active` | oklch(0.84 0.02 250) | oklch(0.36 0.04 250) | - | Active state |

### Muted Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `muted` | oklch(0.95 0.005 250) | oklch(0.24 0.02 250) | Background for muted/disabled areas |
| `muted-foreground` | oklch(0.48 0.04 250) | oklch(0.70 0.02 250) | Secondary text, labels, placeholders |
| `muted-hover` | oklch(0.92 0.01 250) | oklch(0.28 0.025 250) | Hover state |

**Contrast:** 6.5:1 (light) / 6.8:1 (dark) - exceeds WCAG AA

### Accent Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `accent` | oklch(0.94 0.008 250) | oklch(0.26 0.03 250) | Subtle highlights, selected items |
| `accent-foreground` | oklch(0.25 0.015 250) | oklch(0.92 0.005 250) | Text on accent backgrounds |
| `accent-hover` | oklch(0.90 0.015 250) | oklch(0.30 0.035 250) | Hover state |

### Semantic Colors

#### Success (Green)

| Token | Light Mode | Dark Mode | Contrast |
|-------|------------|-----------|----------|
| `success` | oklch(0.52 0.14 145) | oklch(0.65 0.16 145) | 5.3:1 / 6.5:1 ✅ |
| `success-foreground` | oklch(0.99 0 0) | oklch(0.15 0.02 145) | ✅ AA+ |
| `success-bg` | oklch(0.95 0.04 145) | oklch(0.24 0.04 145) | Background for success alerts |
| `success-border` | oklch(0.78 0.10 145) | oklch(0.45 0.12 145) | Border for success elements |

**Usage:**
```tsx
<Alert className="bg-success-bg border-success-border">
  <CheckCircle className="text-success" />
  <AlertDescription>Operation completed successfully!</AlertDescription>
</Alert>
```

#### Warning (Amber)

| Token | Light Mode | Dark Mode | Contrast |
|-------|------------|-----------|----------|
| `warning` | oklch(0.58 0.15 75) | oklch(0.70 0.16 75) | 5.1:1 / 7.8:1 ✅ |
| `warning-foreground` | oklch(0.15 0.01 75) | oklch(0.15 0.01 75) | ✅ AA+ |
| `warning-bg` | oklch(0.96 0.04 75) | oklch(0.26 0.04 75) | Background for warnings |
| `warning-border` | oklch(0.80 0.12 75) | oklch(0.50 0.13 75) | Border for warnings |

#### Info (Blue)

| Token | Light Mode | Dark Mode | Contrast |
|-------|------------|-----------|----------|
| `info` | oklch(0.52 0.14 240) | oklch(0.68 0.15 240) | 5.2:1 / 7.0:1 ✅ |
| `info-foreground` | oklch(0.99 0 0) | oklch(0.15 0.02 240) | ✅ AA+ |
| `info-bg` | oklch(0.95 0.03 240) | oklch(0.24 0.03 240) | Background for info alerts |
| `info-border` | oklch(0.78 0.10 240) | oklch(0.48 0.12 240) | Border for info elements |

#### Destructive (Red)

| Token | Light Mode | Dark Mode | Contrast |
|-------|------------|-----------|----------|
| `destructive` | oklch(0.52 0.18 25) | oklch(0.65 0.20 25) | 5.2:1 / 6.1:1 ✅ |
| `destructive-foreground` | oklch(0.99 0 0) | oklch(0.15 0.02 250) | ✅ AA+ |
| `destructive-hover` | oklch(0.46 0.17 25) | oklch(0.70 0.21 25) | Hover state |

### Border and Input Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `border` | oklch(0.88 0.005 250) | oklch(0.32 0.03 250) | Default borders |
| `input` | oklch(0.88 0.005 250) | oklch(0.26 0.025 250) | Input field borders |
| `input-hover` | oklch(0.84 0.008 250) | oklch(0.30 0.03 250) | Input hover state |

### Focus States

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `ring` | oklch(0.48 0.17 250) | oklch(0.68 0.16 250) | Focus ring color |

**Implementation:**
```css
.input:focus-visible {
  outline: none;
  ring: 2px solid hsl(var(--ring));
}
```

### Link Colors

| Token | Light Mode | Dark Mode | Contrast |
|-------|------------|-----------|----------|
| `link` | oklch(0.45 0.16 250) | oklch(0.72 0.15 250) | 7.2:1 / 8.1:1 ✅ |
| `link-hover` | oklch(0.38 0.15 250) | oklch(0.78 0.16 250) | Hover state |
| `link-visited` | oklch(0.42 0.12 280) | oklch(0.68 0.12 280) | Visited links |

### Chart Colors

| Token | Light Mode | Dark Mode | Purpose |
|-------|------------|-----------|---------|
| `chart-1` | oklch(0.52 0.16 250) | oklch(0.68 0.16 250) | Primary data series (Blue) |
| `chart-2` | oklch(0.58 0.14 240) | oklch(0.70 0.15 240) | Secondary series (Cyan) |
| `chart-3` | oklch(0.55 0.15 145) | oklch(0.65 0.16 145) | Tertiary series (Green) |
| `chart-4` | oklch(0.60 0.15 75) | oklch(0.72 0.16 75) | Quaternary series (Amber) |
| `chart-5` | oklch(0.54 0.16 25) | oklch(0.66 0.18 25) | Quinary series (Red) |

---

## Usage Guidelines

### Do's and Don'ts

#### ✅ DO

- Use semantic tokens (`primary`, `success`, `warning`) for consistent meaning
- Use `-foreground` variants for text on colored backgrounds
- Use explicit hover states (`primary-hover`, `secondary-hover`)
- Test color combinations with accessibility tools
- Respect the visual hierarchy (primary > secondary > muted)

#### ❌ DON'T

- Don't use hard-coded color values (e.g., `bg-blue-500`)
- Don't use opacity for hover states on text (reduces contrast)
- Don't mix design system colors with arbitrary colors
- Don't override semantic meaning (e.g., using `destructive` for success)

### Component Patterns

#### Buttons

```tsx
// Primary action
<Button className="bg-primary text-primary-foreground hover:bg-primary-hover">
  Save Changes
</Button>

// Secondary action
<Button className="bg-secondary text-secondary-foreground hover:bg-secondary-hover">
  Cancel
</Button>

// Destructive action
<Button className="bg-destructive text-destructive-foreground hover:bg-destructive-hover">
  Delete
</Button>
```

#### Alerts

```tsx
// Success alert
<Alert className="bg-success-bg border-success-border">
  <CheckCircle className="text-success" />
  <AlertDescription>Success message</AlertDescription>
</Alert>

// Warning alert
<Alert className="bg-warning-bg border-warning-border">
  <AlertTriangle className="text-warning" />
  <AlertDescription>Warning message</AlertDescription>
</Alert>

// Info alert
<Alert className="bg-info-bg border-info-border">
  <Info className="text-info" />
  <AlertDescription>Info message</AlertDescription>
</Alert>
```

#### Forms

```tsx
<input className="border-input hover:border-input-hover focus:ring-ring" />
<label className="text-foreground">Email</label>
<p className="text-muted-foreground">Helper text</p>
```

---

## Accessibility Standards

### WCAG Compliance

All colors meet or exceed **WCAG 2.1 Level AA** standards:

| Requirement | Standard | Our Implementation |
|-------------|----------|-------------------|
| Normal text | 4.5:1 | 5.1:1 - 14.8:1 |
| Large text (18px+) | 3:1 | 5.1:1+ |
| UI Components | 3:1 | 5.1:1+ |
| Interactive focus | 3:1 | 5.1:1+ |

### Testing Tools

Test color contrast using:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyser (CCA)](https://www.tpgi.com/color-contrast-checker/)
- Chrome DevTools Lighthouse
- Browser extensions: axe DevTools, WAVE

### Color Blindness Considerations

Our color system considers common color vision deficiencies:
- **Sufficient contrast**: All colors have high luminance contrast
- **Not relying on color alone**: Icons and labels supplement color
- **Distinguishable hues**: Primary, success, warning, and destructive use distinct hues
- **Pattern support**: Charts can include patterns/textures in addition to color

---

## Theme Customization

### Switching Themes

The application automatically respects the user's system preference and provides a theme toggle:

```tsx
import { useTheme } from 'next-themes'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </Button>
  )
}
```

### Creating Custom Themes

To create a custom theme variant, add new color values in `globals.css`:

```css
.theme-high-contrast {
  --primary: oklch(0.40 0.20 250); /* Even darker blue */
  --foreground: oklch(0.10 0.02 250); /* Near black */
  --background: oklch(1 0 0); /* Pure white */
  /* ... other tokens */
}
```

### Accessing Colors in JavaScript

Use the `colors.ts` utility for programmatic access:

```tsx
import { ksuRoyal } from '@/lib/colors'

// Get a specific color
const primaryBlue = ksuRoyal.royalBlue // "#0084BD"

// Use with inline styles
<div style={{ color: ksuRoyal.textPrimary }} />
```

---

## Migration Guide

### From Hard-Coded Colors

**Before:**
```tsx
<div className="bg-blue-500 text-white hover:bg-blue-600">
  Button
</div>
```

**After:**
```tsx
<div className="bg-primary text-primary-foreground hover:bg-primary-hover">
  Button
</div>
```

### From Opacity-Based Hovers

**Before:**
```tsx
<button className="bg-primary hover:bg-primary/90">
  Click Me
</button>
```

**After:**
```tsx
<button className="bg-primary hover:bg-primary-hover">
  Click Me
</button>
```

### Common Replacements

| Old Class | New Class |
|-----------|-----------|
| `bg-blue-50` | `bg-accent` or `bg-info-bg` |
| `bg-green-50` | `bg-success-bg` |
| `bg-amber-50` | `bg-warning-bg` |
| `text-gray-600` | `text-muted-foreground` |
| `text-gray-900` | `text-foreground` |
| `border-gray-200` | `border-border` |
| `text-blue-600` | `text-primary` or `text-link` |

---

## Best Practices

### Performance

1. **Use CSS variables**: They're faster than inline styles
2. **Avoid recalculation**: CSS custom properties update instantly on theme change
3. **Minimize specificity**: Use single classes over complex selectors

### Maintainability

1. **Centralized definition**: All colors in `globals.css`
2. **Semantic naming**: Purpose over appearance
3. **Documentation**: Update this guide when adding new tokens
4. **Component library**: Use shadcn/ui components that respect the design system

### Consistency

1. **Follow patterns**: Use established component patterns
2. **Visual review**: Test both themes before merging
3. **Accessibility audit**: Run automated and manual tests
4. **Peer review**: Have designers review color usage

---

## Support and Resources

### Internal Documentation
- [Architecture Overview](../system/architecture.md)
- [Component Library](../../src/components/ui/README.md)
- [Design Tokens](../../src/lib/colors.ts)

### External Resources
- [OKLCH Color Picker](https://oklch.com/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Getting Help

Questions about the color system? Contact:
- Design Team: design@smartschedule.edu.sa
- Engineering Team: dev@smartschedule.edu.sa
- Accessibility Team: a11y@smartschedule.edu.sa

---

**Last Updated:** January 2025  
**Version:** 2.0  
**Maintained by:** SmartSchedule Design & Engineering Team

