import { useListingSearch } from "../hooks/useListings";
import { VehicleCard } from "./VehicleCard";
import { VehicleCardSkeleton } from "./luxura/Skeleton";
import { SearchX, Sparkles } from "lucide-react";
import type { ListingSearchParams } from "../types";

export function SimilarCarsFallback({ originalFilters, onClearFilters }: { originalFilters: ListingSearchParams, onClearFilters: () => void }) {
  // To find "similar" cars, we relax the strictest constraints.
  // We remove brand, model, price_min, price_max, and just keep body_type or city.
  const fallbackFilters: ListingSearchParams = {
    ...originalFilters,
    brand: undefined,
    model: undefined,
    price_min: undefined,
    price_max: undefined,
    limit: 6
  };

  const { data, isLoading } = useListingSearch(fallbackFilters);

  return (
    <div className="flex flex-col items-center mt-12 mb-12">
      <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
        <SearchX size={32} className="text-stone-400" />
      </div>
      <h3 className="text-xl font-bold text-stone-900 mb-2">No exact matches found</h3>
      <p className="text-sm text-stone-500 mb-6 text-center max-w-md">
        We couldn't find any vehicles matching your precise criteria.
      </p>
      <button 
        onClick={onClearFilters}
        className="px-6 py-2.5 bg-blue-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow hover:bg-blue-950 transition-colors"
      >
        Clear Filters
      </button>

      {/* Smart Alternatives */}
      <div className="w-full mt-16 text-left">
        <div className="flex items-center gap-2 mb-6 border-b border-stone-200 pb-3">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h4 className="text-sm font-bold uppercase tracking-wide text-stone-900">Smart Alternatives You Might Like</h4>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <VehicleCardSkeleton key={i} />
            ))}
          </div>
        ) : data && data.results.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {data.results.map((listing) => (
              <VehicleCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-500">We couldn't find alternatives for this selection.</p>
        )}
      </div>
    </div>
  );
}
