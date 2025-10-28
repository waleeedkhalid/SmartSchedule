"use client";

import { Button } from "@/components/ui/button";

interface PreferencesTabSwitcherProps {
  targetValue: string;
}

export function PreferencesTabSwitcher({ targetValue }: PreferencesTabSwitcherProps) {
  const handleClick = () => {
    const trigger = document.querySelector(`[value="${targetValue}"]`) as HTMLElement;
    trigger?.click();
  };

  return (
    <Button onClick={handleClick}>
      Go to Preferences
    </Button>
  );
}

