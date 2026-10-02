'use client';

import React, { createContext, useContext } from 'react';

interface UniverseContextType {
  // Shared context type
}

const UniverseContext = createContext<UniverseContextType | null>(null);

export function useUniverse() {
  return useContext(UniverseContext);
}

export function LandingUniverse({ children }: { children: React.ReactNode }) {
  return (
    <UniverseContext.Provider value={{}}>
      <div className="landing-universe-wrapper">
        {children}
      </div>
    </UniverseContext.Provider>
  );
}
