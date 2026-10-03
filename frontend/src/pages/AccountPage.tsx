import { useState } from "react";
import { useAuth } from "../lib/auth";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Shield,
  Car,
  MessageSquare,
  Heart,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  Clock,
  Tag,
  Search,
  HelpCircle,
  Send,
  Trash2,
  ExternalLink,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsApi } from "../lib/api/appointments";
import { offersApi } from "../lib/api/offers";
import { savedSearchesApi } from "../lib/api/savedSearches";
import { supportApi } from "../lib/api/support";
import { SupportModal } from "../components/SupportModal";
import { EmptyState, formatINR, LoadingBlock } from "../components/ui";
import type { Appointment, VehicleOffer, SavedSearch, SupportTicket } from "../types";

export function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<
    "overview" | "appointments" | "offers" | "saved_searches" | "support"
  >("overview");
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  // Queries
  const appointmentsQuery = useQuery({
    queryKey: ["my-appointments"],
    queryFn: () => appointmentsApi.list(),
    enabled: activeTab === "appointments" || activeTab === "overview",
  });

  const offersQuery = useQuery({
    queryKey: ["my-offers"],
    queryFn: () => offersApi.list(),
    enabled: activeTab === "offers" || activeTab === "overview",
  });

  const savedSearchesQuery = useQuery({
    queryKey: ["my-saved-searches"],
    queryFn: () => savedSearchesApi.list(),
    enabled: activeTab === "saved_searches",
  });

  const supportTicketsQuery = useQuery({
    queryKey: ["my-support-tickets"],
    queryFn: () => supportApi.listTickets(),
    enabled: activeTab === "support",
  });

  const selectedTicketQuery = useQuery({
    queryKey: ["support-ticket", selectedTicketId],
    queryFn: () => supportApi.getTicket(selectedTicketId!),
    enabled: !!selectedTicketId,
  });

  // Mutations
  const cancelAppointmentMutation = useMutation({
    mutationFn: (id: string) => appointmentsApi.updateStatus(id, "cancelled"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
    },
  });

  const acceptOfferMutation = useMutation({
    mutationFn: (id: string) => offersApi.accept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-offers"] });
    },
  });

  const rejectOfferMutation = useMutation({
    mutationFn: (id: string) => offersApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-offers"] });
    },
  });

  const deleteSavedSearchMutation = useMutation({
    mutationFn: (id: string) => savedSearchesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-saved-searches"] });
    },
  });

  const sendSupportReplyMutation = useMutation({
    mutationFn: ({ ticketId, content }: { ticketId: string; content: string }) =>
      supportApi.sendMessage(ticketId, content),
    onSuccess: () => {
      setReplyMessage("");
      queryClient.invalidateQueries({ queryKey: ["support-ticket", selectedTicketId] });
      queryClient.invalidateQueries({ queryKey: ["my-support-tickets"] });
    },
  });

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleSignOut = async () => {
    await logout();
    navigate("/");
  };

  const formattedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Member";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
      case "accepted":
      case "resolved":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "requested":
      case "submitted":
      case "open":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "in_progress":
      case "countered":
      case "rescheduled":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "cancelled":
      case "rejected":
      case "closed":
        return "bg-stone-100 text-stone-600 border-stone-200";
      default:
        return "bg-stone-50 text-stone-700 border-stone-200";
    }
  };

  const handleRunSearch = (search: SavedSearch) => {
    const params = new URLSearchParams();
    if (search.filters) {
      Object.entries(search.filters).forEach(([k, v]) => {
        if (v) params.set(k, String(v));
      });
    }
    navigate(`/cars?${params.toString()}`);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Header Profile Banner */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-900 text-white font-bold text-2xl shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-display text-2xl font-bold text-stone-900">{user.name}</h1>
                <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-800">
                  {user.role}
                </span>
                {user.is_verified && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-stone-500">Member since {formattedDate}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/60 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100/80 cursor-pointer"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Contact info grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-stone-100 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
              <Mail size={16} />
            </div>
            <div>
              <p className="text-xs text-stone-400 font-medium">Email Address</p>
              <p className="text-sm font-semibold text-stone-800 truncate">{user.email || "Not provided"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
              <Phone size={16} />
            </div>
            <div>
              <p className="text-xs text-stone-400 font-medium">Phone Number</p>
              <p className="text-sm font-semibold text-stone-800">{user.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
              <Shield size={16} />
            </div>
            <div>
              <p className="text-xs text-stone-400 font-medium">Account Role</p>
              <p className="text-sm font-semibold text-stone-800 capitalize">
                {user.seller_type ? `${user.seller_type} Seller` : `${user.role} Account`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Hub Navigation Tabs */}
      <div className="mt-8 flex gap-1 border-b border-stone-200 overflow-x-auto qz-scroll">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "overview"
              ? "border-blue-900 text-blue-900 bg-white rounded-t-lg"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <User size={15} /> Overview & Shortcuts
        </button>

        <button
          onClick={() => setActiveTab("appointments")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "appointments"
              ? "border-blue-900 text-blue-900 bg-white rounded-t-lg"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Calendar size={15} /> Test Drives & Appointments
        </button>

        <button
          onClick={() => setActiveTab("offers")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "offers"
              ? "border-blue-900 text-blue-900 bg-white rounded-t-lg"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Tag size={15} /> Offers & Negotiations
        </button>

        <button
          onClick={() => setActiveTab("saved_searches")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "saved_searches"
              ? "border-blue-900 text-blue-900 bg-white rounded-t-lg"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Search size={15} /> Saved Searches
        </button>

        <button
          onClick={() => setActiveTab("support")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "support"
              ? "border-blue-900 text-blue-900 bg-white rounded-t-lg"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <HelpCircle size={15} /> Concierge & Support
        </button>
      </div>

      {/* Tab 1: Overview & Shortcuts */}
      {activeTab === "overview" && (
        <div className="mt-8 space-y-8">
          <div>
            <h2 className="font-display text-lg font-bold text-stone-900">Your Workspaces & Shortcuts</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.role === "admin" ? (
                <>
                  <Link
                    to="/admin"
                    className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition-all hover:border-blue-500/40 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                      <Shield size={22} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-stone-900 group-hover:text-blue-700 transition-colors">
                        Admin Console
                      </h3>
                      <p className="mt-1 text-xs text-stone-500">
                        Platform governance, moderation queue, user management, and appointments.
                      </p>
                    </div>
                  </Link>

                  <Link
                    to="/admin"
                    className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition-all hover:border-blue-500/40 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-700 transition-colors group-hover:bg-stone-900 group-hover:text-white">
                      <CheckCircle2 size={22} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-stone-900 group-hover:text-blue-700 transition-colors">
                        Approval & Moderation Queue
                      </h3>
                      <p className="mt-1 text-xs text-stone-500">
                        Review submitted vehicle listings and dealer/private seller identity proofs.
                      </p>
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  {user.role === "seller" && (
                    <Link
                      to="/dashboard"
                      className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition-all hover:border-blue-500/40 hover:shadow-md"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-700 transition-colors group-hover:bg-stone-900 group-hover:text-white">
                        <Car size={22} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-stone-900 group-hover:text-blue-700 transition-colors">
                          Seller Workspace & Calendar
                        </h3>
                        <p className="mt-1 text-xs text-stone-500">
                          Manage active listings, review buyer test drive requests, and negotiate offers.
                        </p>
                      </div>
                    </Link>
                  )}

                  <Link
                    to="/sell"
                    className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition-all hover:border-blue-500/40 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                      <Car size={22} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-700 transition-colors">
                        Sell a Vehicle
                      </h3>
                      <p className="mt-1 text-xs text-stone-500">
                        Create a new structured vehicle listing with RC details and technical specs.
                      </p>
                    </div>
                  </Link>

                  <Link
                    to="/enquiries"
                    className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition-all hover:border-blue-500/40 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                      <MessageSquare size={22} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-stone-900 group-hover:text-blue-700 transition-colors">
                        Inquiries & Shortlist
                      </h3>
                      <p className="mt-1 text-xs text-stone-500">
                        View direct chat conversations with vehicle sellers and bookmarked shortlist cars.
                      </p>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Appointments & Test Drives */}
      {activeTab === "appointments" && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-stone-900">Your Test Drives & Inspections</h2>
              <p className="text-xs text-stone-500">Track and manage upcoming vehicle appointments.</p>
            </div>
            <Link
              to="/cars"
              className="text-xs font-bold uppercase tracking-wider text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              Browse Cars <ChevronRight size={14} />
            </Link>
          </div>

          {appointmentsQuery.isLoading ? (
            <LoadingBlock />
          ) : !appointmentsQuery.data || appointmentsQuery.data.length === 0 ? (
            <EmptyState
              title="No appointments scheduled"
              body="When you book a test drive or inspection on any vehicle listing, it will appear here."
              action={
                <Link
                  to="/cars"
                  className="mt-3 px-5 py-2.5 bg-blue-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md inline-block"
                >
                  Explore Vehicles
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {appointmentsQuery.data.map((appt: Appointment) => (
                <div
                  key={appt.id}
                  className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(
                          appt.status
                        )}`}
                      >
                        {appt.status.replace("_", " ")}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                        {appt.appointment_type === "test_drive" ? "Test Drive" : "Inspection"}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-stone-900">
                      <Link to={`/cars/${appt.listing_slug}`} className="hover:text-blue-700">
                        {appt.listing_title}
                      </Link>
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-blue-600" />
                        {new Date(appt.scheduled_at).toLocaleDateString("en-IN", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {appt.time_slot && (
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-blue-600" />
                          {appt.time_slot}
                        </span>
                      )}
                      <span>Seller: {appt.seller_name}</span>
                    </div>

                    {appt.notes && (
                      <p className="text-xs text-stone-500 bg-stone-50 p-2 rounded-lg border border-stone-100 italic">
                        "{appt.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      to={`/cars/${appt.listing_slug}`}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors"
                    >
                      View Car
                    </Link>
                    {(appt.status === "requested" || appt.status === "confirmed") && (
                      <button
                        onClick={() => cancelAppointmentMutation.mutate(appt.id)}
                        disabled={cancelAppointmentMutation.isPending}
                        className="px-3 py-1.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Offers & Negotiations */}
      {activeTab === "offers" && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-stone-900">Your Vehicle Offers</h2>
              <p className="text-xs text-stone-500">Track and respond to price negotiations with sellers.</p>
            </div>
            <Link
              to="/cars"
              className="text-xs font-bold uppercase tracking-wider text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              Browse Cars <ChevronRight size={14} />
            </Link>
          </div>

          {offersQuery.isLoading ? (
            <LoadingBlock />
          ) : !offersQuery.data || offersQuery.data.length === 0 ? (
            <EmptyState
              title="No offers made yet"
              body="Negotiate directly with verified sellers by making an official price offer on any listing page."
              action={
                <Link
                  to="/cars"
                  className="mt-3 px-5 py-2.5 bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md inline-block"
                >
                  Explore Collection
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {offersQuery.data.map((offer: VehicleOffer) => (
                <div
                  key={offer.id}
                  className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(
                          offer.status
                        )}`}
                      >
                        {offer.status}
                      </span>
                      <span className="text-xs text-stone-400">
                        Submitted {new Date(offer.created_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-stone-900">
                      <Link to={`/cars/${offer.listing_slug}`} className="hover:text-blue-700">
                        {offer.listing_title}
                      </Link>
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <span className="text-stone-500">
                        Asking Price: <span className="font-semibold text-stone-800">{formatINR(Number(offer.listing_price))}</span>
                      </span>
                      <span className="text-stone-500">
                        Your Offer: <span className="font-bold text-emerald-700">{formatINR(Number(offer.offer_amount))}</span>
                      </span>
                      {offer.counter_amount && (
                        <span className="text-stone-500 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Seller Counter Offer:{" "}
                          <span className="font-bold text-amber-900">{formatINR(Number(offer.counter_amount))}</span>
                        </span>
                      )}
                    </div>

                    {offer.message && (
                      <p className="text-xs text-stone-500 bg-stone-50 p-2 rounded-lg border border-stone-100 italic">
                        "{offer.message}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      to={`/cars/${offer.listing_slug}`}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors"
                    >
                      View Car
                    </Link>

                    {offer.status === "countered" && (
                      <>
                        <button
                          onClick={() => acceptOfferMutation.mutate(offer.id)}
                          disabled={acceptOfferMutation.isPending}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                        >
                          Accept Counter
                        </button>
                        <button
                          onClick={() => rejectOfferMutation.mutate(offer.id)}
                          disabled={rejectOfferMutation.isPending}
                          className="px-3 py-1.5 border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Saved Searches */}
      {activeTab === "saved_searches" && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-stone-900">Your Saved Searches & Alerts</h2>
              <p className="text-xs text-stone-500">Quickly re-run custom vehicle filters and check new inventory.</p>
            </div>
            <Link
              to="/cars"
              className="text-xs font-bold uppercase tracking-wider text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              Search Showroom <ChevronRight size={14} />
            </Link>
          </div>

          {savedSearchesQuery.isLoading ? (
            <LoadingBlock />
          ) : !savedSearchesQuery.data || savedSearchesQuery.data.length === 0 ? (
            <EmptyState
              title="No saved searches"
              body="Use the search filters on the Browse page and save your preferred criteria to be notified of matches."
              action={
                <Link
                  to="/cars"
                  className="mt-3 px-5 py-2.5 bg-blue-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md inline-block"
                >
                  Browse Cars
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedSearchesQuery.data.map((search: SavedSearch) => (
                <div
                  key={search.id}
                  className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                        <Search size={16} className="text-blue-600" />
                        {search.name}
                      </h3>
                      <button
                        onClick={() => deleteSavedSearchMutation.mutate(search.id)}
                        disabled={deleteSavedSearchMutation.isPending}
                        className="text-stone-400 hover:text-red-500 transition-colors p-1"
                        title="Delete saved search"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {Object.entries(search.filters || {}).map(([k, v]) => (
                        <span
                          key={k}
                          className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-semibold rounded uppercase tracking-wider"
                        >
                          {k}: {String(v)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[10px] text-stone-400">
                      Saved {new Date(search.created_at).toLocaleDateString("en-IN")}
                    </span>
                    <button
                      onClick={() => handleRunSearch(search)}
                      className="px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Run Search <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Concierge & Support */}
      {activeTab === "support" && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-stone-900">Support & Concierge Assistance</h2>
              <p className="text-xs text-stone-500">Track and reply to inquiries escalated with our team.</p>
            </div>
            <button
              onClick={() => setSupportModalOpen(true)}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> New Ticket
            </button>
          </div>

          {selectedTicketId ? (
            /* Ticket Conversation View */
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <button
                    onClick={() => setSelectedTicketId(null)}
                    className="text-xs font-bold text-blue-700 hover:underline mb-1 cursor-pointer"
                  >
                    ← Back to All Tickets
                  </button>
                  <h3 className="text-xl font-bold text-stone-900">
                    {selectedTicketQuery.data?.subject || "Support Ticket Thread"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(
                        selectedTicketQuery.data?.status || "open"
                      )}`}
                    >
                      {selectedTicketQuery.data?.status}
                    </span>
                    <span className="text-xs text-stone-400 capitalize">
                      Category: {selectedTicketQuery.data?.category}
                    </span>
                    {selectedTicketQuery.data?.listing_title && (
                      <span className="text-xs text-blue-700 font-medium">
                        Vehicle: {selectedTicketQuery.data.listing_title}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto qz-scroll p-2">
                {selectedTicketQuery.isLoading ? (
                  <LoadingBlock />
                ) : (
                  selectedTicketQuery.data?.messages?.map((msg) => {
                    const isStaff = msg.sender_role === "admin";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isStaff ? "items-start" : "items-end"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl p-4 text-sm ${
                            isStaff
                              ? "bg-blue-50 border border-blue-200 text-stone-900"
                              : "bg-stone-900 text-white"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-1 text-[11px] opacity-80">
                            <span className="font-bold">
                              {msg.sender_name} {isStaff ? "(Concierge Team)" : "(You)"}
                            </span>
                            <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reply Box */}
              {selectedTicketQuery.data?.status !== "closed" && (
                <div className="pt-4 border-t border-stone-100 flex gap-2">
                  <textarea
                    rows={2}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply to our concierge team..."
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-sm text-stone-900 focus:border-blue-600 focus:bg-white focus:outline-none resize-none"
                  />
                  <button
                    onClick={() =>
                      sendSupportReplyMutation.mutate({
                        ticketId: selectedTicketId,
                        content: replyMessage.trim(),
                      })
                    }
                    disabled={!replyMessage.trim() || sendSupportReplyMutation.isPending}
                    className="px-5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer shadow-md"
                  >
                    <Send size={14} /> Send
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Ticket List View */
            supportTicketsQuery.isLoading ? (
              <LoadingBlock />
            ) : !supportTicketsQuery.data || supportTicketsQuery.data.length === 0 ? (
              <EmptyState
                title="No support tickets"
                body="Have questions about vehicle transfer, payment escrow, or an inspection report? Open a support ticket."
                action={
                  <button
                    onClick={() => setSupportModalOpen(true)}
                    className="mt-3 px-5 py-2.5 bg-blue-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md inline-block cursor-pointer"
                  >
                    Contact Support
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {supportTicketsQuery.data.map((ticket: SupportTicket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className="bg-white border border-stone-200 hover:border-blue-500/40 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(
                            ticket.status
                          )}`}
                        >
                          {ticket.status}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                          {ticket.category}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-stone-900">{ticket.subject}</h3>

                      {ticket.listing_title && (
                        <p className="text-xs text-blue-700 font-medium">
                          Vehicle: {ticket.listing_title}
                        </p>
                      )}

                      <p className="text-xs text-stone-400">
                        Updated {new Date(ticket.updated_at).toLocaleDateString("en-IN")} •{" "}
                        {ticket.messages?.length || 0} messages
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-blue-700">
                      <span>View Conversation</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* Support Ticket Modal */}
      <SupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["my-support-tickets"] });
        }}
        defaultCategory="general"
      />
    </div>
  );
}
