import { useState, useEffect, useCallback } from "react";
import type { VehicleListing } from "../types";

const STORAGE_KEY = "qz_recently_viewed";
const MAX_ITEMS = 6;

export function useRecentlyViewed() {
  const [viewed, setViewed] = useState<VehicleListing[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const validCars = parsed.filter(car => car && typeof car === 'object' && car.id && Array.isArray(car.images));
          if (validCars.length > 0) {
            setViewed(validCars);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        // ignore parse error
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const addViewed = useCallback((listing: VehicleListing) => {
    setViewed((prev) => {
      // Remove if already exists
      const filtered = prev.filter((item) => item.id !== listing.id);
      // Add to front
      const next = [listing, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { viewed, addViewed };
}
