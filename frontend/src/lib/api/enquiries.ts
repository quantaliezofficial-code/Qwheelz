import { apiRequest } from "./client";
import type { Enquiry, EnquiryMessage } from "../../types";

export const enquiriesApi = {
  create: (listingId: string, message: string) =>
    apiRequest<Enquiry>(`/listings/${listingId}/enquiries`, { method: "POST", body: { message } }),

  mine: () => apiRequest<Enquiry[]>("/enquiries"),

  get: (id: string) => apiRequest<Enquiry>(`/enquiries/${id}`),

  sendMessage: (id: string, content: string) =>
    apiRequest<EnquiryMessage>(`/enquiries/${id}/messages`, { method: "POST", body: { content } }),

  close: (id: string) => apiRequest<Enquiry>(`/enquiries/${id}/close`, { method: "POST" }),
};
