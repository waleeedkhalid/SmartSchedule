# SmartSchedule Design System

## Brand Philosophy

SmartSchedule embodies **intelligence, precision, and trust** for academic scheduling. The design system reflects these values through:

- **Intelligence**: Clean, sophisticated interfaces that communicate smart automation
- **Precision**: Exact spacing, clear hierarchy, and purposeful design decisions
- **Trust**: Professional aesthetics with accessible, WCAG-compliant color choices

The visual language avoids generic scheduling app aesthetics by focusing on academic context, collaborative workflows, and data clarity.

## Color System

### Primary Palette

Our primary blue conveys trust, professionalism, and intelligence—essential for an academic platform.

**Blue Scale**
- `blue-50`: `hsl(210 100% 97%)` - Lightest backgrounds
- `blue-100`: `hsl(210 95% 92%)` - Hover states, light accents
- `blue-200`: `hsl(210 90% 85%)` - Subtle highlights
- `blue-300`: `hsl(210 85% 72%)` - Muted interactive elements
- `blue-400`: `hsl(210 80% 60%)` - Secondary actions
- `blue-500`: `hsl(210 75% 50%)` - Primary brand color
- `blue-600`: `hsl(210 80% 42%)` - Primary hover states
- `blue-700`: `hsl(210 85% 35%)` - Active states
- `blue-800`: `hsl(210 90% 28%)` - Dark mode primary
- `blue-900`: `hsl(210 95% 20%)` - Darkest blue

### Neutral Palette

Gray/slate tones provide hierarchy and structure without competing with content.

**Slate Scale**
- `slate-50`: `hsl(210 20% 98%)` - Page backgrounds (light)
- `slate-100`: `hsl(210 20% 95%)` - Card backgrounds
- `slate-200`: `hsl(210 18% 90%)` - Borders, dividers
- `slate-300`: `hsl(210 16% 80%)` - Disabled states
- `slate-400`: `hsl(210 14% 65%)` - Placeholders
- `slate-500`: `hsl(210 12% 50%)` - Secondary text
- `slate-600`: `hsl(210 14% 40%)` - Primary text (light mode)
- `slate-700`: `hsl(210 16% 30%)` - Headings
- `slate-800`: `hsl(210 18% 20%)` - Dark backgrounds
- `slate-900`: `hsl(210 20% 12%)` - Darkest backgrounds

### Accent Palette

Teal/cyan adds energy and complements blue without overwhelming.

**Teal Scale**
- `teal-50`: `hsl(180 60% 97%)`
- `teal-100`: `hsl(180 55% 90%)`
- `teal-500`: `hsl(180 65% 45%)` - Accent highlights
- `teal-600`: `hsl(180 70% 38%)` - Accent hover
- `teal-900`: `hsl(180 75% 18%)`

### Semantic Colors

**Success** - Emerald
- `success`: `hsl(145 65% 45%)` - Success states, confirmations
- `success-light`: `hsl(145 60% 95%)` - Success backgrounds

**Warning** - Amber
- `warning`: `hsl(38 92% 50%)` - Warnings, caution
- `warning-light`: `hsl(38 90% 95%)` - Warning backgrounds

**Error** - Red
- `error`: `hsl(0 72% 51%)` - Errors, destructive actions
- `error-light`: `hsl(0 70% 97%)` - Error backgrounds

**Info** - Sky Blue
- `info`: `hsl(200 95% 50%)` - Informational messages
- `info-light`: `hsl(200 90% 96%)` - Info backgrounds

### Accessibility

All color combinations meet WCAG AA standards:
- Normal text: 4.5:1 contrast ratio minimum
- Large text (18px+): 3:1 contrast ratio minimum
- Interactive elements: Clear focus indicators with 3:1 contrast

## Typography

### Font Families

**Primary Font**: Inter (sans-serif)
- Headings, body text, UI elements
- Excellent readability at all sizes
- Modern, professional appearance

**Monospace Font**: JetBrains Mono
- Code snippets, technical content
- Fallback: `ui-monospace, monospace`

### Font Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 12px | 16px (1.33) | Captions, helper text |
| `text-sm` | 14px | 20px (1.43) | Small UI text, labels |
| `text-base` | 16px | 24px (1.5) | Body text, paragraphs |
| `text-lg` | 18px | 28px (1.56) | Large body, subtle emphasis |
| `text-xl` | 20px | 28px (1.4) | Section subheadings |
| `text-2xl` | 24px | 32px (1.33) | Card headings |
| `text-3xl` | 30px | 36px (1.2) | Page headings |
| `text-4xl` | 36px | 40px (1.11) | Hero headings |
| `text-5xl` | 48px | 1 (48px) | Display text |

### Font Weights

- `font-normal` (400): Body text
- `font-medium` (500): Emphasis, labels
- `font-semibold` (600): Subheadings, buttons
- `font-bold` (700): Headings, strong emphasis

### Heading Hierarchy

```css
h1: text-4xl md:text-5xl font-bold tracking-tight
h2: text-3xl md:text-4xl font-bold
h3: text-2xl md:text-3xl font-semibold
h4: text-xl md:text-2xl font-semibold
h5: text-lg md:text-xl font-medium
h6: text-base md:text-lg font-medium
```

## Spacing System

Based on 4px increments for consistent rhythm:

| Token | Value | Usage |
|-------|-------|-------|
| `0` | 0 | No spacing |
| `1` | 4px | Tight element spacing |
| `2` | 8px | Small gaps |
| `3` | 12px | Standard element spacing |
| `4` | 16px | Default component spacing |
| `6` | 24px | Section spacing |
| `8` | 32px | Large section spacing |
| `12` | 48px | Extra-large spacing |
| `16` | 64px | Page section spacing |
| `20` | 80px | Hero spacing |
| `24` | 96px | Maximum spacing |

## Border Radius

Soft, modern corners that feel approachable:

- `rounded-sm`: 4px - Small elements (badges, tags)
- `rounded`: 6px - Buttons, inputs
- `rounded-md`: 8px - Cards, panels (standard)
- `rounded-lg`: 12px - Large cards, modals
- `rounded-xl`: 16px - Feature cards, hero sections
- `rounded-full`: 9999px - Circular elements (avatars)

## Shadows

Subtle elevation system for depth and hierarchy:

**Level 1** - `shadow-sm`
```css
box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
```
*Usage*: Subtle lift for cards, inputs

**Level 2** - `shadow-md`
```css
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
```
*Usage*: Dropdowns, popovers, hoverable cards

**Level 3** - `shadow-lg`
```css
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
```
*Usage*: Modals, floating panels, important overlays

**Dark Mode Shadows**
Use `shadow-[color]/[opacity]` for visibility in dark mode:
```css
shadow-slate-900/20
```

## Iconography

### Icon Library
**Lucide React** - Consistent, modern icon set

### Icon Sizing
- `16px` (sm): Dense UI, inline with text
- `20px` (md): Standard UI elements, buttons
- `24px` (lg): Feature highlights, empty states

### Icon Style Guidelines
- Stroke width: 2px (consistent with Lucide default)
- Color: Match text color or use brand colors for emphasis
- Spacing: 8px gap between icon and text
- Interactive icons: Add hover states with color transitions

### Custom Icons
When creating schedule-specific icons:
- Maintain 24×24px artboard
- Use 2px stroke weight
- Follow grid/schedule theme (blocks, timelines, calendars)
- Export as inline SVG for better control

## Component Patterns

### Buttons

**Primary**: Blue background, white text
```tsx
<Button className="bg-blue-600 hover:bg-blue-700 text-white">
```

**Secondary**: Slate background, white text
```tsx
<Button variant="secondary">
```

**Outline**: Transparent with blue border
```tsx
<Button variant="outline" className="border-blue-600 text-blue-600">
```

**Ghost**: Transparent with hover background
```tsx
<Button variant="ghost">
```

### Cards

Standard card with modern styling:
```tsx
<Card className="rounded-lg shadow-sm border-slate-200">
  <CardHeader>
    <CardTitle className="text-xl font-semibold">
  </CardHeader>
  <CardContent>
```

### Forms

- Label above input, 8px gap
- Input focus: Blue ring with 2px width
- Error states: Red border and text
- Helper text: Small gray text below input

### Tables

- Header: Semibold, slate-700, bottom border
- Rows: Hover state with slate-50 background
- Borders: Subtle slate-200
- Zebra striping optional for dense data

## Design Principles

### 1. Clarity First
Every element serves a purpose. Remove visual noise. Use whitespace generously.

### 2. Consistent Hierarchy
Maintain clear visual hierarchy through size, weight, and color. Users should know what's important.

### 3. Predictable Interactions
Similar actions should look and behave similarly. Feedback should be immediate.

### 4. Responsive by Default
Design mobile-first, enhance for larger screens. Touch targets ≥44px.

### 5. Accessible Always
Contrast ratios, keyboard navigation, screen reader support, focus indicators—non-negotiable.

### 6. Performance Matters
Optimize images, lazy load components, use system fonts when possible.

## Animation Guidelines

### Timing
- Fast: 150ms - Hover effects, small transitions
- Standard: 200ms - Default animations
- Slow: 300ms - Complex transitions, modals

### Easing
- `ease-in-out`: Default transitions
- `ease-out`: Entering elements
- `ease-in`: Exiting elements

### Motion Principles
- Subtle, not distracting
- Purposeful: Guide attention, provide feedback
- Respect `prefers-reduced-motion`

## Dark Mode

All components support dark mode via Tailwind's `dark:` variant:

- Backgrounds: slate-900, slate-800
- Text: slate-50, slate-300
- Borders: slate-700
- Primary colors: Slightly lighter blues for better visibility
- Maintain contrast ratios

## Usage Examples

### Hero Section
```tsx
<section className="py-20 md:py-28">
  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
    Smart Scheduling for <span className="text-blue-600">Academic Excellence</span>
  </h1>
  <p className="mt-6 text-lg text-slate-600 max-w-2xl">
    Description text
  </p>
</section>
```

### Data Table
```tsx
<Table>
  <TableHeader>
    <TableRow className="border-slate-200">
      <TableHead className="font-semibold text-slate-700">
  </TableHeader>
</Table>
```

### Form
```tsx
<form className="space-y-4">
  <div className="space-y-2">
    <Label className="text-sm font-medium text-slate-700">
    <Input className="focus:ring-2 focus:ring-blue-600" />
  </div>
</form>
```

## Resources

- **Tailwind CSS**: https://tailwindcss.com
- **shadcn/ui**: https://ui.shadcn.com
- **Lucide Icons**: https://lucide.dev
- **Inter Font**: https://rsms.me/inter
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

