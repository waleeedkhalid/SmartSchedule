# KSU Royal Theme - Quick Start Guide

## 🚀 Getting Started

The KSU Royal theme is ready to use immediately in your SmartSchedule application. No additional setup required!

## 📍 How to Switch to KSU Royal Theme

### Option 1: Using the Theme Switcher (Recommended)

1. **Navigate to any page** in SmartSchedule
2. **Look for the theme controls** in the top-right corner:
   - 🌙/☀️ Dark/Light mode toggle button
   - 🎨 Color palette selector button
3. **Click the palette icon** (🎨)
4. **Select "KSU Royal"** from the dropdown menu
5. **Theme applies instantly!**

### Option 2: Programmatic Application

Add this to any component or page:

```typescript
import { applyTheme } from "@/lib/colors";

// Apply KSU Royal theme
applyTheme("ksuRoyal");
```

## 🎨 Color Reference

### Use in Your Components

```typescript
import { ksuRoyal } from "@/lib/colors";

// Access any color
const myColor = ksuRoyal.royalBlue; // "#002147"
const accent = ksuRoyal.goldenBeige; // "#C5A46D"
```

### Use CSS Variables (Preferred)

```tsx
// In your component
<div className="bg-primary text-primary-foreground">
  KSU Royal Blue Background
</div>

<button className="bg-secondary text-secondary-foreground hover:bg-accent">
  Golden Beige Button
</button>
```

## 🌓 Dark Mode

Toggle dark mode anytime:

- Click the sun/moon icon (🌙/☀️) in the top-right
- Dark mode works seamlessly with KSU Royal theme
- All colors automatically adjust for optimal readability

## 📱 Component Examples

### Button Styles

```tsx
// Primary Button (Royal Blue)
<Button variant="default">
  Primary Action
</Button>

// Secondary Button (Golden Beige)
<Button variant="secondary">
  Secondary Action
</Button>

// Outline Button
<Button variant="outline">
  Outline Style
</Button>
```

### Card Styles

```tsx
<Card>
  <CardHeader>
    <CardTitle>KSU Styled Card</CardTitle>
    <CardDescription>Automatically uses soft gray background</CardDescription>
  </CardHeader>
  <CardContent>Content with proper contrast</CardContent>
</Card>
```

### Text Styles

```tsx
// Primary Text (Headings)
<h1 className="text-foreground">
  Main Heading
</h1>

// Secondary Text (Body)
<p className="text-muted-foreground">
  Body text with proper contrast
</p>
```

## ✅ Accessibility Features

### High Contrast

- All text meets WCAG AA+ standards
- Contrast ratios from 8.9:1 to 13.6:1
- Clear focus indicators on all interactive elements

### Keyboard Navigation

- Focus rings use brighter blue (#1E40AF)
- Clear visual feedback for all states
- Tab navigation fully supported

### Screen Readers

- Semantic HTML elements
- Proper ARIA labels
- Color-independent information

## 🎓 Typography Setup (Optional)

To match the full KSU academic aesthetic, install these fonts:

```bash
# These fonts are already available via next/font/google
# No installation needed, just import them
```

Then in your `layout.tsx`:

```typescript
import { Merriweather } from "next/font/google";
import { Inter } from "next/font/google";

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-header",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${merriweather.variable} ${inter.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  );
}
```

Add to your `globals.css`:

```css
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--font-header);
  font-weight: 700;
}

body,
p,
span,
div {
  font-family: var(--font-body);
}
```

## 🎯 Use Cases

### Perfect For:

✅ **Official KSU Communications**

- Student portals
- Faculty management systems
- Administrative dashboards
- Course registration

✅ **Academic Interfaces**

- Scheduling systems (like SmartSchedule!)
- Grade management
- Course catalogs
- Academic calendars

✅ **Professional Presentations**

- Reports
- Statistics dashboards
- Administrative tools
- Official documents

## 🌟 Theme Features

### What You Get:

✨ **Royal Blue Primary** (#002147) - KSU's official color  
✨ **Golden Beige Accents** (#C5A46D) - Academic prestige  
✨ **Clean White Background** (#FFFFFF) - Maximum clarity  
✨ **High-Contrast Text** - WCAG AAA compliance  
✨ **Professional Dark Mode** - Navy backgrounds with golden accents  
✨ **Semantic Colors** - Green (success), Amber (warning), Red (error)

## 🔄 Switching Between Themes

You can easily switch between all four available themes:

1. **Academic Twilight** - Contemplative scholarly work
2. **Desert Dawn** - Energetic campus life
3. **Emerald Library** - Timeless academic tradition
4. **KSU Royal** ⭐ - Official KSU branding

Just use the theme switcher dropdown!

## 💡 Tips & Best Practices

### Do's ✅

- Use the theme switcher for quick testing
- Test in both light and dark modes
- Use semantic color classes (`bg-primary`, `text-secondary`)
- Maintain high contrast for accessibility

### Don'ts ❌

- Don't hardcode KSU colors (use CSS variables)
- Don't mix themes within the same page
- Don't reduce contrast below WCAG standards
- Don't rely on color alone to convey information

## 🐛 Troubleshooting

### Theme Not Applying?

1. Check that the HTML element has the class: `.theme-ksu-royal`
2. Clear browser cache and refresh
3. Verify you're using CSS variables, not hardcoded colors

### Colors Look Wrong?

1. Check if dark mode is enabled (toggle to test)
2. Verify your browser supports OKLCH colors (all modern browsers do)
3. Check console for any CSS errors

### Dark Mode Issues?

1. Ensure `.dark` class is present on HTML element
2. Check that theme switcher is working
3. Test theme toggle manually

## 📚 Additional Resources

- **Full Documentation:** `/docs/KSU_ROYAL_THEME.md`
- **Implementation Details:** `/KSU_THEME_IMPLEMENTATION.md`
- **Color System:** `/docs/COLOR_SYSTEM.md`
- **Theming Guide:** `/docs/THEMING_SYSTEM.md`

## 🎉 Ready to Go!

Your SmartSchedule application now has the KSU Royal theme fully integrated. Simply select it from the theme switcher and enjoy the professional, accessible, and brand-aligned interface!

**Questions?** Check the documentation files or review the implementation notes.

---

**Last Updated:** October 1, 2025  
**Version:** 1.0  
**Status:** Production Ready ✅
