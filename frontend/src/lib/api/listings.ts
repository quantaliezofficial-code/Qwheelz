import { apiRequest, buildQuery } from "./client";
import type {
  ListingCreateInput,
  ListingSearchParams,
  ListingSearchResult,
  SellerListingRow,
  VehicleListing,
} from "../../types";

export const listingsApi = {
  search: (params: ListingSearchParams) =>
    apiRequest<ListingSearchResult>(`/listings${buildQuery(params as Record<string, unknown>)}`),

  getBySlug: (slug: string) => apiRequest<VehicleListing>(`/listings/slug/${slug}`),

  getById: (id: string) => apiRequest<VehicleListing>(`/listings/${id}`),

  mine: () => apiRequest<SellerListingRow[]>("/listings/mine"),

  create: (input: ListingCreateInput) =>
    apiRequest<VehicleListing>("/listings", { method: "POST", body: input }),

  update: (id: string, patch: Partial<ListingCreateInput>) =>
    apiRequest<VehicleListing>(`/listings/${id}`, { method: "PATCH", body: patch }),

  remove: (id: string) => apiRequest<void>(`/listings/${id}`, { method: "DELETE" }),

  markSold: (id: string) => apiRequest<VehicleListing>(`/listings/${id}/mark-sold`, { method: "POST" }),

  uploadImage: (id: string, file: File, isCover: boolean) => {
    const form = new FormData();
    form.append("file", file);
    return apiRequest<VehicleListing>(`/listings/${id}/images?is_cover=${isCover}`, {
      method: "POST",
      body: form,
      isForm: true,
    });
  },

  uploadDocument: (id: string, file: File, docType: string) => {
    const form = new FormData();
    form.append("file", file);
    return apiRequest<VehicleListing>(`/listings/${id}/documents?doc_type=${docType}`, {
      method: "POST",
      body: form,
      isForm: true,
    });
  },

  favourite: (id: string) => apiRequest<void>(`/listings/${id}/favourite`, { method: "POST" }),
  unfavourite: (id: string) => apiRequest<void>(`/listings/${id}/favourite`, { method: "DELETE" }),
  myFavourites: () => apiRequest<VehicleListing[]>("/me/favourites"),

  promote: (id: string) => apiRequest(`/listings/${id}/promote`, { method: "POST" }),
};
