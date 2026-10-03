import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../lib/api/admin";

export function useAdminOverview() {
  return useQuery({ queryKey: ["admin", "overview"], queryFn: () => adminApi.overview(), refetchInterval: 20_000 });
}

export function useAdminUsers(params: { role?: string; q?: string } = {}) {
  return useQuery({ queryKey: ["admin", "users", params], queryFn: () => adminApi.users(params) });
}

export function useAdminListings(status?: string) {
  return useQuery({ queryKey: ["admin", "listings", status], queryFn: () => adminApi.listings(status) });
}

export function useAdminVerifications(status?: string) {
  return useQuery({ queryKey: ["admin", "verifications", status], queryFn: () => adminApi.verifications(status) });
}

export function useAdminEnquiries(status?: string) {
  return useQuery({ queryKey: ["admin", "enquiries", status], queryFn: () => adminApi.enquiries(status) });
}

export function useAdminPayments(status?: string) {
  return useQuery({ queryKey: ["admin", "payments", status], queryFn: () => adminApi.payments(status) });
}

export function useAdminSubscriptions(status?: string) {
  return useQuery({ queryKey: ["admin", "subscriptions", status], queryFn: () => adminApi.subscriptions(status) });
}

export function useAdminReports(status?: string) {
  return useQuery({ queryKey: ["admin", "reports", status], queryFn: () => adminApi.reports(status) });
}

export function useAdminReviews() {
  return useQuery({ queryKey: ["admin", "reviews"], queryFn: () => adminApi.reviews() });
}

export function useAdminAuditLog(entityType?: string) {
  return useQuery({ queryKey: ["admin", "audit-log", entityType], queryFn: () => adminApi.auditLog(entityType) });
}

function useAdminAction<TArgs extends unknown[]>(fn: (...args: TArgs) => Promise<unknown>, invalidateKey: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: TArgs) => fn(...args),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", invalidateKey] }),
  });
}

export function useAdminActions() {
  return {
    suspendUser: useAdminAction<[string, string]>((id, reason) => adminApi.suspendUser(id, reason), "users"),
    reactivateUser: useAdminAction<[string]>((id) => adminApi.reactivateUser(id), "users"),
    approveListing: useAdminAction<[string]>((id) => adminApi.approveListing(id), "listings"),
    rejectListing: useAdminAction<[string, string]>((id, reason) => adminApi.rejectListing(id, reason), "listings"),
    suspendListing: useAdminAction<[string, string]>((id, reason) => adminApi.suspendListing(id, reason), "listings"),
    reactivateListing: useAdminAction<[string]>((id) => adminApi.reactivateListing(id), "listings"),
    featureListing: useAdminAction<[string, boolean]>((id, featured) => adminApi.featureListing(id, featured), "listings"),
    approveVerification: useAdminAction<[string]>((id) => adminApi.approveVerification(id), "verifications"),
    rejectVerification: useAdminAction<[string, string]>((id, reason) => adminApi.rejectVerification(id, reason), "verifications"),
    confirmPayment: useAdminAction<[string]>((id) => adminApi.confirmPayment(id), "payments"),
    resolveReport: useAdminAction<[string, "resolved" | "dismissed"]>((id, outcome) => adminApi.resolveReport(id, outcome), "reports"),
    deleteReview: useAdminAction<[string]>((id) => adminApi.deleteReview(id), "reviews"),
  };
}
