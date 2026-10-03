import { useListingSearch } from "../hooks/useListings";
import { VehicleCard } from "./VehicleCard";
import { VehicleCardSkeleton } from "./luxura/Skeleton";
import type { VehicleListing } from "../types";

export function SimilarListings({ brand, currentId }: { brand: string, currentId: string }) {
  const { data, isLoading } = useListingSearch({ brand, limit: 4 });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <VehicleCardSkeleton key={i} />)}
      </div>
    );
  }

  const similar = data?.results.filter((item: VehicleListing) => item.id !== currentId).slice(0, 4) || [];
  if (similar.length === 0) return null;

  return (
    <div>
      <h3 className="text-xl font-bold text-stone-900 mb-6">Similar Vehicles</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {similar.map((item: VehicleListing) => <VehicleCard key={item.id} listing={item} />)}
      </div>
    </div>
  );
}
