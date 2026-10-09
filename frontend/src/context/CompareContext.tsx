import React, { createContext, useContext, useState, useEffect } from 'react';
import type { VehicleListing } from '../types';

interface CompareContextType {
  compareList: VehicleListing[];
  addToCompare: (car: VehicleListing) => boolean;
  removeFromCompare: (carId: string) => void;
  clearCompare: () => void;
  isInCompare: (carId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<VehicleListing[]>(() => {
    try {
      const saved = localStorage.getItem("qwheelz_compare") || localStorage.getItem("luxura_compare");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("qwheelz_compare", JSON.stringify(compareList));
  }, [compareList]);

  const isInCompare = (carId: string) => {
    return compareList.some(c => c.id === carId);
  };

  const addToCompare = (car: VehicleListing): boolean => {
    if (compareList.some(c => c.id === car.id)) return true;
    if (compareList.length >= 3) {
      alert("You can compare up to 3 vehicles at a time. Remove one to add this vehicle.");
      return false;
    }
    setCompareList(prev => [...prev, car]);
    return true;
  };

  const removeFromCompare = (carId: string) => {
    setCompareList(prev => prev.filter(c => c.id !== carId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
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
