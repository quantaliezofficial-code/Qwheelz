import { apiRequest, setTokens } from "./client";
import type {
  Notification,
  Payment,
  Plan,
  Report,
  Review,
  SellerVerification,
  Subscription,
  User,
} from "../../types";

export const authApi = {
  signup: async (input: { name: string; phone: string; password: string; email?: string }) => {
    const data = await apiRequest<{ access_token: string; refresh_token: string; user: User }>("/auth/signup", {
      method: "POST",
      body: input,
    });
    setTokens({ access_token: data.access_token, refresh_token: data.refresh_token });
    return data.user;
  },

  login: async (loginId: string, password: string) => {
    const data = await apiRequest<{ access_token: string; refresh_token: string; user: User }>("/auth/login", {
      method: "POST",
      body: { login_id: loginId, password },
    });
    setTokens({ access_token: data.access_token, refresh_token: data.refresh_token });
    return data.user;
  },

  logout: async (refreshToken: string) => {
    await apiRequest("/auth/logout", { method: "POST", body: { refresh_token: refreshToken } });
    setTokens(null);
  },

  forgotPassword: (email: string) => apiRequest("/auth/forgot-password", { method: "POST", body: { email } }),

  resetPassword: (token: string, newPassword: string) =>
    apiRequest("/auth/reset-password", { method: "POST", body: { token, new_password: newPassword } }),

  me: () => apiRequest<User>("/users/me"),
};

export const sellerOnboardingApi = {
  submit: (input: {
    participant_type: "individual" | "dealer";
    identification_type: string;
    identification_number: string;
    document_url: string;
    business_name?: string;
    gst_number?: string;
  }) => apiRequest<SellerVerification>("/seller/verification", { method: "POST", body: input }),

  mine: () => apiRequest<SellerVerification | null>("/seller/verification"),
};

export const billingApi = {
  plans: () => apiRequest<Plan[]>("/plans"),
  subscribe: (plan: string) => apiRequest<Payment>("/seller/subscribe", { method: "POST", body: { plan } }),
  mySubscription: () => apiRequest<Subscription | null>("/seller/subscription"),
};

export const reviewsApi = {
  forSeller: (sellerId: string) => apiRequest<Review[]>(`/sellers/${sellerId}/reviews`),
  create: (sellerId: string, rating: number, content: string, listingId?: string) =>
    apiRequest<Review>(`/sellers/${sellerId}/reviews`, {
      method: "POST",
      body: { rating, content, listing_id: listingId },
    }),
};

export const reportsApi = {
  create: (entityType: "listing" | "user", entityId: string, reason: string) =>
    apiRequest<Report>("/reports", { method: "POST", body: { entity_type: entityType, entity_id: entityId, reason } }),
};

export const notificationsApi = {
  list: (unreadOnly = false) => apiRequest<Notification[]>(`/notifications${unreadOnly ? "?unread_only=true" : ""}`),
  unreadCount: () => apiRequest<{ count: number }>("/notifications/unread-count"),
  markRead: (id: string) => apiRequest<void>(`/notifications/${id}/read`, { method: "POST" }),
  markAllRead: () => apiRequest<void>("/notifications/read-all", { method: "POST" }),
};
