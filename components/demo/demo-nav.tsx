'use client';

import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PersonaIndicator } from './persona-switcher';
import { ArrowLeft, Sparkles } from 'lucide-react';

export function DemoNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Demo Badge */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center">
              <Logo size="md" />
            </Link>
            <Badge variant="outline" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
              <Sparkles className="h-3 w-3 mr-1" />
              Demo Mode
            </Badge>
          </div>

          {/* Persona Indicator */}
          <div className="hidden md:flex">
            <PersonaIndicator />
          </div>

          {/* Exit Demo */}
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit Demo
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

