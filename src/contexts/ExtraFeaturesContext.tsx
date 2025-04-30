
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ExtraFeaturesContextType {
  selectedFeatures: string[];
  setSelectedFeatures: React.Dispatch<React.SetStateAction<string[]>>;
}

const ExtraFeaturesContext = createContext<ExtraFeaturesContextType | undefined>(undefined);

export function ExtraFeaturesProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage if available
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(() => {
    const saved = localStorage.getItem('selectedExtraFeatures');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage when selectedFeatures changes
  useEffect(() => {
    localStorage.setItem('selectedExtraFeatures', JSON.stringify(selectedFeatures));
  }, [selectedFeatures]);

  return (
    <ExtraFeaturesContext.Provider value={{ selectedFeatures, setSelectedFeatures }}>
      {children}
    </ExtraFeaturesContext.Provider>
  );
}

export function useExtraFeatures() {
  const context = useContext(ExtraFeaturesContext);
  if (context === undefined) {
    throw new Error('useExtraFeatures must be used within an ExtraFeaturesProvider');
  }
  return context;
}
