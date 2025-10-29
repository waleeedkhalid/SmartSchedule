'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DemoRole, mockUserProfiles } from './mock-data';

interface DemoContextType {
  currentPersona: DemoRole;
  setPersona: (persona: DemoRole) => void;
  currentUser: typeof mockUserProfiles[DemoRole];
  isDemo: boolean;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [currentPersona, setCurrentPersona] = useState<DemoRole>('scheduling');

  const setPersona = (persona: DemoRole) => {
    setCurrentPersona(persona);
  };

  const currentUser = mockUserProfiles[currentPersona];

  return (
    <DemoContext.Provider
      value={{
        currentPersona,
        setPersona,
        currentUser,
        isDemo: true,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoContext() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemoContext must be used within a DemoProvider');
  }
  return context;
}

// Hook to check if we're in demo mode (useful for components)
export function useIsDemo() {
  try {
    const context = useContext(DemoContext);
    return context?.isDemo ?? false;
  } catch {
    return false;
  }
}

