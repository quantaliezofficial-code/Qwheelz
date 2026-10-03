import React, { createContext, useContext, useState, useEffect } from 'react';
import type { VehicleListing } from '../types';

interface CompareContextType {
  compareList: VehicleListing[];
  addToCompare: (car: VehicleListing) => void;
  removeFromCompare: (carId: string) => void;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<VehicleListing[]>(() => {
    try {
      const saved = localStorage.getItem("luxura_compare");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("luxura_compare", JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = (car: VehicleListing) => {
    if (compareList.find(c => c.id === car.id)) return;
    if (compareList.length >= 3) {
      alert("You can compare up to 3 cars at a time.");
      return;
    }
    setCompareList([...compareList, car]);
  };

  const removeFromCompare = (carId: string) => {
    setCompareList(compareList.filter(c => c.id !== carId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
