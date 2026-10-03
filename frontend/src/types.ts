// Field names deliberately mirror the backend's JSON keys (snake_case)
// rather than being remapped to camelCase — the API response shape *is*
// the type here, so there's one source of truth to keep in sync instead
// of a parallel adapter layer translating every field on every response.

export type UserRole = "buyer" | "seller" | "admin";
export type SellerType = "individual" | "dealer";

export interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: UserRole;
  seller_type: SellerType | null;
  business_name: string | null;
  avg_rating: string | null;
  rating_count: number;
  is_verified: boolean;
  created_at: string;
}

export type BodyType = "hatchback" | "sedan" | "suv" | "muv_mpv" | "coupe" | "convertible" | "pickup_truck" | "van" | "other";
export type FuelType = "petrol" | "diesel" | "electric" | "cng" | "hybrid";
export type Transmission = "manual" | "automatic" | "amt" | "cvt";
export type ListingStatus = "draft" | "pending_review" | "active" | "sold" | "suspended";
export type DocType = "rc_registration" | "insurance" | "puc" | "other";

export interface VehicleImage {
  id: string;
  url: string;
  is_cover: boolean;
  sort_order: number;
}

export interface VehicleDocument {
  id: string;
  url: string;
  doc_type: DocType;
}

export interface VehicleFeature {
  id: string;
  name: string;
}

export interface VehicleListing {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  brand: string;
  model: string;
  variant: string | null;
  year: number;
  body_type: BodyType;
  fuel_type: FuelType;
  transmission: Transmission;
  km_driven: number;
  owner_count: number;
  color: string | null;
  seating_capacity: number | null;
  registration_state: string | null;
  price: string;
  address: string | null;
  city: string;
  state: string | null;
  pincode: string | null;
  status: ListingStatus;
  rejection_reason: string | null;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  seller: User;
  images: VehicleImage[];
  documents: VehicleDocument[];
  features: VehicleFeature[];
  is_favourited: boolean;
  specifications?: Record<string, any>;
}

export interface ListingSearchResult {
  results: VehicleListing[];
  total: number;
  limit: number;
  offset: number;
}

export interface SellerListingRow {
  listing: VehicleListing;
  enquiry_count: number;
}

export type EnquiryStatus = "new" | "seller_responded" | "closed";

export interface EnquiryMessage {
  id: string;
  sender_id: string;
  content: string;
  attachment_url: string | null;
  created_at: string;
  read_at: string | null;
}

export interface Enquiry {
  id: string;
  listing_id: string;
  listing_title: string;
  status: EnquiryStatus;
  created_at: string;
  updated_at: string;
  buyer: User;
  seller: User;
  messages: EnquiryMessage[];
}

export type VerificationStatus = "pending" | "approved" | "rejected";

export interface SellerVerification {
  id: string;
  seller_type: SellerType;
  status: VerificationStatus;
  rejection_reason: string | null;
  business_name: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export type PlanId = "individual_free" | "individual_premium" | "dealer_basic" | "dealer_pro" | "dealer_enterprise";

export interface Plan {
  id: PlanId;
  label: string;
  audience: "individual" | "dealer";
  price_inr: number | null;
  billing_period: "one_time" | "monthly";
  features: string[];
}

export interface Subscription {
  id: string;
  plan: PlanId;
  status: "active" | "expired" | "cancelled";
  current_period_end: string | null;
}

export interface Payment {
  id: string;
  purpose: "subscription" | "featured_listing";
  amount: string;
  status: "initiated" | "success" | "failed" | "refunded";
  created_at: string;
  confirmed_at: string | null;
}

export interface Review {
  id: string;
  rating: number;
  content: string;
  created_at: string;
  buyer: User;
}

export interface Report {
  id: string;
  entity_type: "listing" | "user";
  entity_id: string;
  reason: string;
  status: "open" | "resolved" | "dismissed";
  created_at: string;
  reporter: User;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  extra_data: Record<string, unknown> | null;
  created_at: string;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  read_at: string | null;
  created_at: string;
}

export interface Overview {
  total_users: number;
  active_sellers: number;
  active_dealers: number;
  listings_active: number;
  listings_pending_review: number;
  listings_sold: number;
  total_enquiries: number;
  pending_seller_verifications: number;
  open_reports: number;
  active_subscriptions: number;
  revenue_total_inr: number;
}

export interface ListingSearchParams {
  city?: string;
  brand?: string;
  model?: string;
  body_type?: BodyType;
  fuel_type?: FuelType;
  transmission?: Transmission;
  seller_type?: SellerType;
  verified_only?: boolean;
  price_min?: number;
  price_max?: number;
  year_min?: number;
  year_max?: number;
  km_max?: number;
  owner_count_max?: number;
  color?: string;
  q?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "year_desc" | "km_asc";
  limit?: number;
  offset?: number;
}

export interface ListingCreateInput {
  title: string;
  description?: string;
  brand: string;
  model: string;
  variant?: string;
  year: number;
  body_type: BodyType;
  fuel_type: FuelType;
  transmission: Transmission;
  km_driven: number;
  owner_count?: number;
  color?: string;
  seating_capacity?: number;
  registration_state?: string;
  specifications?: Record<string, any>;
  price: number;
  address?: string;
  city: string;
  state?: string;
  pincode?: string;
  features?: string[];
}

export type AppointmentStatus = "requested" | "confirmed" | "rescheduled" | "cancelled" | "completed" | "no_show";
export type AppointmentType = "test_drive" | "inspection";

export interface Appointment {
  id: string;
  listing_id: string;
  listing_title: string;
  listing_slug: string;
  buyer_id: string;
  buyer_name: string;
  buyer_phone: string;
  seller_id: string;
  seller_name: string;
  seller_phone: string;
  appointment_type: AppointmentType;
  scheduled_at: string;
  time_slot: string | null;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type OfferStatus = "submitted" | "countered" | "accepted" | "rejected" | "expired";

export interface VehicleOffer {
  id: string;
  listing_id: string;
  listing_title: string;
  listing_slug: string;
  listing_price: string;
  buyer_id: string;
  buyer_name: string;
  seller_id: string;
  seller_name: string;
  offer_amount: string;
  counter_amount: string | null;
  status: OfferStatus;
  message: string | null;
  created_at: string;
  updated_at: string;
}

export type SupportCategory = "general" | "vehicle" | "appointment" | "payment" | "report";
export type SupportTicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  content: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string | null;
  subject: string;
  category: SupportCategory;
  listing_id: string | null;
  listing_title: string | null;
  appointment_id: string | null;
  status: SupportTicketStatus;
  created_at: string;
  updated_at: string;
  messages: SupportMessage[];
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, any>;
  created_at: string;
}
