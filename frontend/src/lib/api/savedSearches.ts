import { apiRequest } from "./client";
import type { SavedSearch } from "../../types";

export const savedSearchesApi = {
  list: () => apiRequest<SavedSearch[]>("/saved-searches"),
  create: (name: string, filters: Record<string, any>) =>
    apiRequest<SavedSearch>("/saved-searches", { method: "POST", body: { name, filters } }),
  delete: (id: string) =>
    apiRequest<void>(`/saved-searches/${id}`, { method: "DELETE" }),
};
