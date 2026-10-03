import { apiRequest, buildQuery } from "./client";
import type { Appointment, AppointmentStatus, AppointmentType } from "../../types";

export interface CreateAppointmentInput {
  listing_id: string;
  appointment_type: AppointmentType;
  scheduled_at: string;
  time_slot?: string;
  notes?: string;
}

export const appointmentsApi = {
  create: (input: CreateAppointmentInput) =>
    apiRequest<Appointment>("/appointments", { method: "POST", body: input }),

  list: (params: { status?: AppointmentStatus; listing_id?: string } = {}) =>
    apiRequest<Appointment[]>(`/appointments${buildQuery(params)}`),

  updateStatus: (id: string, status: AppointmentStatus, notes?: string) =>
    apiRequest<Appointment>(`/appointments/${id}/status`, {
      method: "PATCH",
      body: { status, notes },
    }),

  adminList: (params: { status?: AppointmentStatus } = {}) =>
    apiRequest<Appointment[]>(`/admin/appointments${buildQuery(params)}`),
};
