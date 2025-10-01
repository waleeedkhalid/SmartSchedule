import { ThemeSwitcher } from "@/components/shared/ThemeSwitcher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ThemeDemo() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">
            SmartSchedule Theme System
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore our three story-driven color palettes and switch between
            themes in real-time
          </p>
        </div>

        {/* Theme Switcher */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ThemeSwitcher />

          {/* Example UI Components */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Example Schedule Card</CardTitle>
                <CardDescription>
                  This card demonstrates how the theme affects UI components
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">SWE 312</span>
                    <Badge>Section 01</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Software Architecture • Monday, Wednesday • 10:00-11:15
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    <Button size="sm">Enroll</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Color Tokens</CardTitle>
                <CardDescription>
                  All shadcn/ui components use these semantic color tokens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="h-12 rounded border-2 border-border bg-background"></div>
                    <span className="text-xs">background</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-12 rounded border-2 border-border bg-card"></div>
                    <span className="text-xs">card</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-12 rounded border-2 border-border bg-primary"></div>
                    <span className="text-xs">primary</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-12 rounded border-2 border-border bg-secondary"></div>
                    <span className="text-xs">secondary</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-12 rounded border-2 border-border bg-accent"></div>
                    <span className="text-xs">accent</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-12 rounded border-2 border-border bg-muted"></div>
                    <span className="text-xs">muted</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Feature Description */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">🎨 Three Themed Palettes</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>
                  <strong>Academic Twilight:</strong> Deep blues and warm ambers
                  for evening study sessions
                </li>
                <li>
                  <strong>Desert Dawn:</strong> Terracotta and sunrise golds for
                  energetic morning work
                </li>
                <li>
                  <strong>Emerald Library:</strong> Forest greens and brass for
                  traditional academic elegance
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                🔧 Technical Implementation
              </h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>
                  CSS classes (`.theme-academic-twilight`, etc.) in
                  `globals.css`
                </li>
                <li>
                  All colors defined in OKLCH format for better perceptual
                  uniformity
                </li>
                <li>Compatible with shadcn/ui&apos;s semantic color system</li>
                <li>Theme preference persisted to localStorage</li>
                <li>Dark mode variants included for each palette</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">📚 Usage</h3>
              <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
                {`import { applyTheme } from "@/lib/colors";

// Apply a theme programmatically
applyTheme("academicTwilight");

// Or use the ThemeSwitcher component
<ThemeSwitcher />`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
