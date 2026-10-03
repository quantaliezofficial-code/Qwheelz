import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listingsApi } from "../lib/api/listings";
import type { ListingCreateInput, ListingSearchParams } from "../types";

export function useListingSearch(params: ListingSearchParams) {
  return useQuery({
    queryKey: ["listings", "search", params],
    queryFn: () => listingsApi.search(params),
  });
}

export function useListing(slug: string | undefined) {
  return useQuery({
    queryKey: ["listings", "slug", slug],
    queryFn: () => listingsApi.getBySlug(slug!),
    enabled: !!slug,
  });
}

export function useMyListings() {
  return useQuery({
    queryKey: ["listings", "mine"],
    queryFn: () => listingsApi.mine(),
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ListingCreateInput) => listingsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listings", "mine"] }),
  });
}

export function useUpdateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<ListingCreateInput> }) => listingsApi.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listings"] }),
  });
}

export function useMarkListingSold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => listingsApi.markSold(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listings"] }),
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => listingsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listings", "mine"] }),
  });
}

export function useUploadListingImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file, isCover }: { id: string; file: File; isCover: boolean }) =>
      listingsApi.uploadImage(id, file, isCover),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listings"] }),
  });
}

export function useUploadListingDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file, docType }: { id: string; file: File; docType: string }) =>
      listingsApi.uploadDocument(id, file, docType),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listings"] }),
  });
}

export function useMyFavourites() {
  return useQuery({
    queryKey: ["favourites", "mine"],
    queryFn: () => listingsApi.myFavourites(),
  });
}

export function useToggleFavourite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isFavourited }: { id: string; isFavourited: boolean }) =>
      isFavourited ? listingsApi.unfavourite(id) : listingsApi.favourite(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favourites"] });
      qc.invalidateQueries({ queryKey: ["listings", "search"] });
    },
  });
}

export function usePromoteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => listingsApi.promote(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listings"] }),
  });
}
