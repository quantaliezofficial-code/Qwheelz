import { apiRequest, buildQuery } from "./client";
import type { SupportTicket, SupportMessage, SupportTicketStatus, SupportCategory } from "../../types";

export interface CreateTicketInput {
  subject: string;
  category: SupportCategory;
  listing_id?: string;
  appointment_id?: string;
  message: string;
}

export const supportApi = {
  createTicket: (input: CreateTicketInput) =>
    apiRequest<SupportTicket>("/support/tickets", { method: "POST", body: input }),

  listTickets: (params: { status?: SupportTicketStatus } = {}) =>
    apiRequest<SupportTicket[]>(`/support/tickets${buildQuery(params)}`),

  getTicket: (id: string) =>
    apiRequest<SupportTicket>(`/support/tickets/${id}`),

  sendMessage: (ticketId: string, content: string) =>
    apiRequest<SupportMessage>(`/support/tickets/${ticketId}/messages`, {
      method: "POST",
      body: { content },
    }),

  updateStatus: (ticketId: string, status: SupportTicketStatus) =>
    apiRequest<SupportTicket>(`/support/tickets/${ticketId}/status`, {
      method: "PATCH",
      body: { status },
    }),
};
