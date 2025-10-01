"use client";

import { ColorPaletteShowcase } from "@/components/shared/ColorPaletteShowcase";
import { PageContainer } from "@/components/shared";

export default function ColorSystemPage() {
  return (
    <PageContainer
      title="Color System"
      description="Story-driven color palettes for SmartSchedule"
    >
      <ColorPaletteShowcase />
    </PageContainer>
  );
}
