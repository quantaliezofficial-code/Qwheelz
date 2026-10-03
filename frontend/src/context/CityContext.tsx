import React, { createContext, useContext, useState, useEffect } from 'react';

export const INDIAN_CITIES = [
  "All India",
  "Delhi NCR",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Lucknow",
  "Ahmedabad",
  "Jaipur",
  "Chandigarh",
  "Kanpur"
];

interface CityContextType {
  city: string;
  setCity: (city: string) => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [city, setCityState] = useState<string>("All India");

  useEffect(() => {
    const savedCity = localStorage.getItem("luxura_city");
    if (savedCity && INDIAN_CITIES.includes(savedCity)) {
      setCityState(savedCity);
    }
  }, []);

  const setCity = (newCity: string) => {
    setCityState(newCity);
    localStorage.setItem("luxura_city", newCity);
  };

  return (
    <CityContext.Provider value={{ city, setCity }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
}
