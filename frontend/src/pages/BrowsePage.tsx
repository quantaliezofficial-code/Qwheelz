import { useSearchParams } from "react-router-dom";
import { useMemo, useEffect } from "react";
import { useCity } from "../context/CityContext";
import { FiltersSidebar } from "../components/FiltersSidebar";
import { VehicleCard } from "../components/VehicleCard";
import { SimilarCarsFallback } from "../components/SimilarCarsFallback";
import { ErrorNote, LoadingBlock, Pagination } from "../components/ui";
import { VehicleCardSkeleton } from "../components/luxura/Skeleton";
import { useListingSearch } from "../hooks/useListings";
import type { ListingSearchParams } from "../types";
import { SearchX } from "lucide-react";
import { ApiError, apiRequest } from "../lib/api/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

const SORT_OPTIONS: { value: NonNullable<ListingSearchParams["sort"]>; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "year_desc", label: "Year: Newest" },
  { value: "km_asc", label: "Km: Lowest first" },
];

export function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { city } = useCity();
  const [saved, setSaved] = useState(false);

  // Keep search params in sync with global city
  useEffect(() => {
    if (city === "All India") {
      if (searchParams.has("city")) {
        const next = new URLSearchParams(searchParams);
        next.delete("city");
        setSearchParams(next);
      }
    } else {
      if (searchParams.get("city") !== city) {
        const next = new URLSearchParams(searchParams);
        next.set("city", city);
        setSearchParams(next);
      }
    }
  }, [city, searchParams, setSearchParams]);

  const filters: ListingSearchParams = useMemo(() => {
    const obj: Record<string, string> = Object.fromEntries(searchParams.entries());
    const page = parseInt(obj.page || "1", 10);
    return {
      ...obj,
      price_min: obj.price_min ? Number(obj.price_min) : undefined,
      price_max: obj.price_max ? Number(obj.price_max) : undefined,
      year_min: obj.year_min ? Number(obj.year_min) : undefined,
      year_max: obj.year_max ? Number(obj.year_max) : undefined,
      km_max: obj.km_max ? Number(obj.km_max) : undefined,
      owner_count_max: obj.owner_count_max ? Number(obj.owner_count_max) : undefined,
      verified_only: obj.verified_only === "true" ? true : undefined,
      sort: (obj.sort as ListingSearchParams["sort"]) ?? "newest",
      limit: 24,
      offset: (page - 1) * 24,
    } as ListingSearchParams;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const updateFilters = (next: ListingSearchParams) => {
    const params = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        params.set(k, String(v));
      }
    });
    setSearchParams(params);
  };

  const { data, isLoading, error } = useListingSearch(filters);

  const saveSearch = useMutation({
    mutationFn: () => apiRequest("/api/v1/saved-searches", {
      method: "POST",
      body: { name: `Search: ${Object.keys(filters).length > 2 ? 'Filtered' : 'All'}`, filters }
    }),
    onSuccess: () => setSaved(true)
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Browse vehicles</h1>
          <p className="mt-1 text-sm text-slate">{data ? `${data.total} listing${data.total === 1 ? "" : "s"} found` : "Find your next car"}</p>
        </div>
        <button
          onClick={() => saveSearch.mutate()}
          disabled={saveSearch.isPending || saved}
          className={`flex items-center gap-2 text-sm font-medium border px-4 py-2 rounded-full transition-all shadow-sm ${saved ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-stone-200 hover:bg-blue-50/50 hover:border-blue-500 hover:text-blue-700'}`}
        >
          <SearchX className="w-4 h-4 hidden" />
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
          {saved ? "Saved!" : "Save Search"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <FiltersSidebar filters={filters} onChange={updateFilters} />

        <div>
          <div className="mb-4 flex justify-end">
            <select
              value={filters.sort}
              onChange={(e) => updateFilters({ ...filters, sort: e.target.value as ListingSearchParams["sort"] })}
              className="qz-input px-3 py-2 text-sm"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <VehicleCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <ErrorNote message={error instanceof ApiError ? error.message : "Couldn't load listings right now."} />
          ) : data && data.results.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {data.results.map((listing) => (
                <VehicleCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <SimilarCarsFallback 
              originalFilters={filters} 
              onClearFilters={() => {
                const cleared = { sort: filters.sort, city: filters.city };
                updateFilters(cleared);
              }} 
            />
          )}

          {data && data.total > 24 && (
            <Pagination
              currentPage={parseInt(searchParams.get("page") || "1", 10)}
              totalItems={data.total}
              itemsPerPage={24}
              onPageChange={(page) => {
                const params = new URLSearchParams(searchParams);
                if (page > 1) {
                  params.set("page", String(page));
                } else {
                  params.delete("page");
                }
                setSearchParams(params);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
