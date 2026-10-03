import { apiRequest, buildQuery } from "./client";
import type {
  AuditLogEntry,
  Enquiry,
  Overview,
  Payment,
  Report,
  Review,
  SellerVerification,
  Subscription,
  User,
  VehicleListing,
} from "../../types";

export const adminApi = {
  overview: () => apiRequest<Overview>("/admin/overview"),

  users: (params: { role?: string; q?: string } = {}) =>
    apiRequest<User[]>(`/admin/users${buildQuery(params)}`),
  suspendUser: (id: string, reason: string) =>
    apiRequest<User>(`/admin/users/${id}/suspend`, { method: "POST", body: { reason } }),
  reactivateUser: (id: string) => apiRequest<User>(`/admin/users/${id}/reactivate`, { method: "POST" }),

  listings: (status?: string) => apiRequest<VehicleListing[]>(`/admin/listings${buildQuery({ status })}`),
  approveListing: (id: string) => apiRequest<VehicleListing>(`/admin/listings/${id}/approve`, { method: "POST" }),
  rejectListing: (id: string, reason: string) =>
    apiRequest<VehicleListing>(`/admin/listings/${id}/reject`, { method: "POST", body: { reason } }),
  suspendListing: (id: string, reason: string) =>
    apiRequest<VehicleListing>(`/admin/listings/${id}/suspend`, { method: "POST", body: { reason } }),
  reactivateListing: (id: string) => apiRequest<VehicleListing>(`/admin/listings/${id}/reactivate`, { method: "POST" }),
  featureListing: (id: string, featured: boolean) =>
    apiRequest<VehicleListing>(`/admin/listings/${id}/feature`, { method: "POST", body: { featured } }),

  verifications: (status?: string) =>
    apiRequest<SellerVerification[]>(`/admin/seller-verifications${buildQuery({ status })}`),
  approveVerification: (id: string) =>
    apiRequest<SellerVerification>(`/admin/seller-verifications/${id}/approve`, { method: "POST" }),
  rejectVerification: (id: string, reason: string) =>
    apiRequest<SellerVerification>(`/admin/seller-verifications/${id}/reject`, { method: "POST", body: { reason } }),

  enquiries: (status?: string) => apiRequest<Enquiry[]>(`/admin/enquiries${buildQuery({ status })}`),

  payments: (status?: string) => apiRequest<Payment[]>(`/admin/payments${buildQuery({ status })}`),
  confirmPayment: (id: string) => apiRequest<Payment>(`/admin/payments/${id}/confirm`, { method: "POST" }),
  subscriptions: (status?: string) => apiRequest<Subscription[]>(`/admin/subscriptions${buildQuery({ status })}`),

  reports: (status?: string) => apiRequest<Report[]>(`/admin/reports${buildQuery({ status })}`),
  resolveReport: (id: string, outcome: "resolved" | "dismissed") =>
    apiRequest<Report>(`/admin/reports/${id}/resolve`, { method: "POST", body: { outcome } }),

  reviews: () => apiRequest<Review[]>("/admin/reviews"),
  deleteReview: (id: string) => apiRequest<void>(`/admin/reviews/${id}`, { method: "DELETE" }),

  auditLog: (entityType?: string) => apiRequest<AuditLogEntry[]>(`/admin/audit-log${buildQuery({ entity_type: entityType })}`),
};
