import { apiRequest, buildQuery } from "./client";
import type { VehicleOffer, OfferStatus } from "../../types";

export interface CreateOfferInput {
  listing_id: string;
  offer_amount: number;
  message?: string;
}

export const offersApi = {
  create: (input: CreateOfferInput) =>
    apiRequest<VehicleOffer>("/offers", { method: "POST", body: input }),

  list: (params: { listing_id?: string; status?: OfferStatus } = {}) =>
    apiRequest<VehicleOffer[]>(`/offers${buildQuery(params)}`),

  accept: (id: string) =>
    apiRequest<VehicleOffer>(`/offers/${id}/accept`, { method: "POST" }),

  reject: (id: string) =>
    apiRequest<VehicleOffer>(`/offers/${id}/reject`, { method: "POST" }),

  counter: (id: string, counter_amount: number, message?: string) =>
    apiRequest<VehicleOffer>(`/offers/${id}/counter`, {
      method: "POST",
      body: { counter_amount, message },
    }),
};
