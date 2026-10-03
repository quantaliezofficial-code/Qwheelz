import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enquiriesApi } from "../lib/api/enquiries";

export function useMyEnquiries() {
  return useQuery({
    queryKey: ["enquiries", "mine"],
    queryFn: () => enquiriesApi.mine(),
    refetchInterval: 15_000,
  });
}

export function useEnquiry(id: string | undefined) {
  return useQuery({
    queryKey: ["enquiries", id],
    queryFn: () => enquiriesApi.get(id!),
    enabled: !!id,
    refetchInterval: 5_000,
  });
}

export function useCreateEnquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId, message }: { listingId: string; message: string }) =>
      enquiriesApi.create(listingId, message),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["enquiries"] }),
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => enquiriesApi.sendMessage(id, content),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["enquiries", variables.id] });
      qc.invalidateQueries({ queryKey: ["enquiries", "mine"] });
    },
  });
}

export function useCloseEnquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => enquiriesApi.close(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["enquiries"] }),
  });
}
