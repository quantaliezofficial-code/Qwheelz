import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { billingApi, sellerOnboardingApi } from "../lib/api/auth";
import { useAuth } from "../lib/auth";

export function useMyVerification() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["seller-verification", "mine"],
    queryFn: () => sellerOnboardingApi.mine(),
    enabled: !!user,
  });
}

export function useSubmitVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sellerOnboardingApi.submit,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seller-verification"] }),
  });
}

export function usePlans() {
  return useQuery({ queryKey: ["plans"], queryFn: () => billingApi.plans(), staleTime: Infinity });
}

export function useMySubscription() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["subscription", "mine"],
    queryFn: () => billingApi.mySubscription(),
    enabled: user?.role === "seller",
  });
}

export function useSubscribe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (plan: string) => billingApi.subscribe(plan),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscription"] }),
  });
}
