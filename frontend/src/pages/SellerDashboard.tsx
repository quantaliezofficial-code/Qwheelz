import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, MessageSquare, Plus, Rocket, Upload, Calendar, Tag, Check, CheckCircle2, X, Clock, AlertCircle, Phone, MessageCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMyListings, useMarkListingSold, useUploadListingImage, usePromoteListing } from "../hooks/useListings";
import { useMyEnquiries } from "../hooks/useEnquiries";
import { useMySubscription, usePlans, useSubscribe } from "../hooks/useSeller";
import { appointmentsApi } from "../lib/api/appointments";
import { offersApi } from "../lib/api/offers";
import type { Appointment, AppointmentStatus, VehicleOffer, OfferStatus } from "../types";
import { useAuth } from "../lib/auth";
import { EmptyState, formatINR, LoadingBlock, StatusBadge } from "../components/ui";
import { EnquiryThread } from "../components/EnquiryThread";

type Tab = "listings" | "appointments" | "offers" | "enquiries" | "subscription";

export function SellerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("listings");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            {user?.seller_type === "dealer" ? "Dealer Dashboard" : "Seller Dashboard"}
          </h1>
          <p className="mt-1 text-sm text-slate">Manage your vehicle listings, test drives, offers, and buyer enquiries.</p>
        </div>
        <Link to="/sell" className="qz-btn-primary flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold">
          <Plus size={16} /> Add vehicle
        </Link>
      </div>

      {/* Direct Buyer Connection Notice for Sellers */}
      <div className="mb-6 p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-900 text-white font-black text-xs flex items-center justify-center shrink-0">
            QZ
          </div>
          <div>
            <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider">Direct Buyer Connection Active</h3>
            <p className="text-xs text-blue-900/80 mt-0.5">
              Buyers can contact you directly via Call, WhatsApp, and in-app messages. Manage appointments, direct offers, and reservation tokens below with 0% brokerage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:+919839012345"
            className="px-3.5 py-2 rounded-xl bg-white border border-blue-200 text-blue-900 font-bold text-xs hover:bg-blue-50 transition-colors flex items-center gap-1.5"
          >
            <Phone size={13} className="text-blue-700" />
            <span>Support Helpline</span>
          </a>
          <a
            href="https://wa.me/919839012345?text=Hello%20Qwheelz%20Support,%20I%20am%20a%20seller%20and%20need%20assistance%20with%20my%20vehicle%20listing."
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-950 transition-colors flex items-center gap-1.5"
          >
            <MessageCircle size={13} />
            <span>WhatsApp Support</span>
          </a>
        </div>
      </div>

      <div className="mb-6 flex gap-1 border-b border-fog overflow-x-auto qz-scroll">
        {([
          ["listings", "My Listings"],
          ["appointments", "Test Drives & Appointments"],
          ["offers", "Offers & Negotiations"],
          ["enquiries", "Leads CRM"],
          ["subscription", "Subscription"],
        ] as [Tab, string][]).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`border-b-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors ${tab === value ? "border-blue-600 text-blue-700 font-bold" : "border-transparent text-slate hover:text-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "listings" && <ListingsTab />}
      {tab === "appointments" && <AppointmentsSellerTab />}
      {tab === "offers" && <OffersSellerTab />}
      {tab === "enquiries" && <EnquiriesTab />}
      {tab === "subscription" && <SubscriptionTab />}
    </div>
  );
}

function ListingsTab() {
  const { data, isLoading } = useMyListings();
  const markSold = useMarkListingSold();
  const uploadImage = useUploadListingImage();
  const promote = usePromoteListing();
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  if (isLoading) return <LoadingBlock />;
  if (!data || data.length === 0) {
    return <EmptyState title="No listings yet" body="Post your first vehicle to start getting enquiries." action={<Link to="/sell" className="qz-btn-primary mt-2 rounded-lg px-5 py-2.5 text-sm font-semibold">Add vehicle</Link>} />;
  }

  const handleUpload = async (listingId: string, files: FileList) => {
    setUploadingFor(listingId);
    try {
      // Upload first image as cover, rest as normal images
      for (let i = 0; i < files.length; i++) {
        await uploadImage.mutateAsync({ id: listingId, file: files[i], isCover: i === 0 });
      }
    } finally {
      setUploadingFor(null);
    }
  };

  return (
    <div className="qz-card overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-fog text-xs uppercase tracking-wide text-slate">
            <th className="px-4 py-3">Vehicle</th>
            <th className="px-4 py-3"><Eye size={13} className="inline" /> Views</th>
            <th className="px-4 py-3"><MessageSquare size={13} className="inline" /> Enquiries</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(({ listing, enquiry_count }) => (
            <tr key={listing.id} className="border-b border-fog last:border-0">
              <td className="px-4 py-3">
                <Link to={`/cars/${listing.slug}`} className="font-semibold text-ink hover:text-ignition-600">{listing.title}</Link>
                <p className="text-xs text-slate">{formatINR(listing.price)}</p>
              </td>
              <td className="qz-mono px-4 py-3">{listing.view_count}</td>
              <td className="qz-mono px-4 py-3">{enquiry_count}</td>
              <td className="px-4 py-3"><StatusBadge status={listing.status} /></td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <label className="cursor-pointer rounded-lg border border-fog px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-paper">
                    <Upload size={12} className="mr-1 inline" /> {uploadingFor === listing.id ? "Uploading…" : "Photos"}
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files?.length && handleUpload(listing.id, e.target.files)} />
                  </label>
                  {listing.status === "active" && !listing.is_featured && (
                    <button onClick={() => promote.mutate(listing.id)} className="rounded-lg border border-blue-200 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50">
                      <Rocket size={12} className="mr-1 inline" /> Feature
                    </button>
                  )}
                  {(listing.status === "active" || listing.status === "pending_review") && (
                    <button onClick={() => markSold.mutate(listing.id)} className="rounded-lg border border-fog px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-paper">
                      Mark sold
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EnquiriesTab() {
  const { data, isLoading } = useMyEnquiries();
  const [openId, setOpenId] = useState<string | null>(null);

  if (isLoading) return <LoadingBlock />;
  if (!data || data.length === 0) return <EmptyState title="No leads yet" body="When a buyer contacts you, their enquiry will appear here in your CRM pipeline." />;

  if (openId) return <EnquiryThread enquiryId={openId} onBack={() => setOpenId(null)} />;

  const newLeads = data.filter(e => e.status === 'new');
  const inProgress = data.filter(e => e.status === 'seller_responded');
  const closed = data.filter(e => e.status === 'closed');

  const KanbanColumn = ({ title, count, items, colorClass }: { title: string, count: number, items: typeof data, colorClass: string }) => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="font-bold text-stone-900 uppercase text-xs tracking-widest">{title}</h3>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${colorClass}`}>{count}</span>
      </div>
      <div className="flex-1 bg-stone-50/50 rounded-2xl p-3 border border-stone-100 flex flex-col gap-3 min-h-[400px]">
        {items.length === 0 ? (
          <div className="text-center py-12 text-stone-400 text-sm font-medium border-2 border-dashed border-stone-200 rounded-xl">
            No leads
          </div>
        ) : (
          items.map((enquiry) => (
            <button key={enquiry.id} onClick={() => setOpenId(enquiry.id)} className="bg-white border border-stone-200 hover:border-blue-400 rounded-xl p-4 text-left shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-2">
                <p className="font-bold text-stone-900 group-hover:text-blue-700 transition-colors line-clamp-1">{enquiry.listing_title}</p>
                <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-600">
                  {enquiry.buyer.name.charAt(0).toUpperCase()}
                </div>
                <p className="text-xs font-medium text-stone-600">{enquiry.buyer.name}</p>
              </div>
              <p className="text-xs text-stone-500 bg-stone-50 p-2 rounded-lg line-clamp-2 border border-stone-100">
                "{enquiry.messages[enquiry.messages.length - 1]?.content}"
              </p>
              <div className="mt-3 flex justify-between items-center text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                <span>{enquiry.messages.length} Message{enquiry.messages.length !== 1 ? 's' : ''}</span>
                <span>{new Date(enquiry.updated_at).toLocaleDateString()}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 gap-6 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="w-[85vw] sm:w-[320px] shrink-0 snap-center md:w-auto md:flex-1">
        <KanbanColumn title="New Leads" count={newLeads.length} items={newLeads} colorClass="bg-sky-100 text-sky-800" />
      </div>
      <div className="w-[85vw] sm:w-[320px] shrink-0 snap-center md:w-auto md:flex-1">
        <KanbanColumn title="In Negotiation" count={inProgress.length} items={inProgress} colorClass="bg-blue-100 text-blue-800" />
      </div>
      <div className="w-[85vw] sm:w-[320px] shrink-0 snap-center md:w-auto md:flex-1">
        <KanbanColumn title="Closed" count={closed.length} items={closed} colorClass="bg-stone-200 text-stone-700" />
      </div>
    </div>
  );
}

function SubscriptionTab() {
  const { user } = useAuth();
  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: subscription } = useMySubscription();
  const subscribe = useSubscribe();
  const [justSubscribed, setJustSubscribed] = useState<string | null>(null);

  if (plansLoading) return <LoadingBlock />;

  const relevant = plans?.filter((p) => p.audience === (user?.seller_type ?? "individual"));

  return (
    <div>
      {subscription && (
        <div className="qz-card mb-6 flex items-center justify-between p-4">
          <div>
            <p className="text-xs text-slate">Current plan</p>
            <p className="font-display font-semibold capitalize text-ink">{subscription.plan.replace(/_/g, " ")}</p>
          </div>
          <StatusBadge status={subscription.status} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {relevant?.map((plan) => (
          <div key={plan.id} className="qz-card flex flex-col p-5">
            <h3 className="font-display text-lg font-bold text-ink">{plan.label}</h3>
            <p className="mt-1 font-display text-2xl font-bold text-ignition-600">
              {plan.price_inr === null ? "Contact sales" : plan.price_inr === 0 ? "Free" : `${formatINR(plan.price_inr)}${plan.billing_period === "monthly" ? "/mo" : ""}`}
            </p>
            <ul className="mt-3 flex flex-1 flex-col gap-1.5 text-sm text-slate">
              {plan.features.map((f) => <li key={f}>• {f}</li>)}
            </ul>
            {plan.price_inr !== null && plan.price_inr > 0 && (
              <button
                onClick={async () => { await subscribe.mutateAsync(plan.id); setJustSubscribed(plan.id); }}
                disabled={subscribe.isPending}
                className="qz-btn-secondary mt-4 rounded-lg py-2 text-sm font-semibold disabled:opacity-60"
              >
                {subscribe.isPending ? "Processing…" : "Choose plan"}
              </button>
            )}
            {justSubscribed === plan.id && <p className="mt-2 text-xs text-signal-600">Payment initiated — our team will confirm it shortly.</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function AppointmentsSellerTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["seller-appointments"],
    queryFn: () => appointmentsApi.list(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: AppointmentStatus; notes?: string }) =>
      appointmentsApi.updateStatus(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-appointments"] });
    },
  });

  if (isLoading) return <LoadingBlock />;

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No test drives or appointments yet"
        body="When interested buyers book a test drive or inspection on your vehicles, their appointment requests will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display text-lg font-bold text-ink">Upcoming Buyer Appointments</h2>
        <span className="text-xs text-slate">{data.length} appointment(s)</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {data.map((appt: Appointment) => (
          <div
            key={appt.id}
            className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                    appt.status === "confirmed"
                      ? "bg-blue-50 text-blue-800 border-blue-200"
                      : appt.status === "requested"
                      ? "bg-blue-50 text-blue-800 border-blue-200"
                      : appt.status === "completed"
                      ? "bg-stone-100 text-stone-700 border-stone-200"
                      : "bg-slate-100 text-slate-800 border-slate-200"
                  }`}
                >
                  {appt.status.replace("_", " ")}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate bg-stone-100 px-2 py-0.5 rounded">
                  {appt.appointment_type === "test_drive" ? "Test Drive" : "Inspection"}
                </span>
              </div>

              <h3 className="font-bold text-base text-ink">
                <Link to={`/cars/${appt.listing_slug}`} className="hover:text-blue-700">
                  {appt.listing_title}
                </Link>
              </h3>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate">
                <span className="font-semibold text-ink">
                  Buyer: {appt.buyer_name} ({appt.buyer_phone})
                </span>
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
              </div>

              {appt.notes && (
                <p className="text-xs text-slate bg-stone-50 p-2 rounded-lg border border-stone-100 italic">
                  "{appt.notes}"
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {appt.status === "requested" && (
                <>
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: appt.id, status: "confirmed" })}
                    disabled={updateStatusMutation.isPending}
                    className="px-3.5 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: appt.id, status: "cancelled" })}
                    disabled={updateStatusMutation.isPending}
                    className="px-3.5 py-2 border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Decline
                  </button>
                </>
              )}

              {appt.status === "confirmed" && (
                <>
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: appt.id, status: "completed" })}
                    disabled={updateStatusMutation.isPending}
                    className="px-3.5 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Mark Done
                  </button>
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: appt.id, status: "cancelled" })}
                    disabled={updateStatusMutation.isPending}
                    className="px-3.5 py-2 border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OffersSellerTab() {
  const queryClient = useQueryClient();
  const [counteringOfferId, setCounteringOfferId] = useState<string | null>(null);
  const [counterAmount, setCounterAmount] = useState<number>(0);
  const [counterMessage, setCounterMessage] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["seller-offers"],
    queryFn: () => offersApi.list(),
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => offersApi.accept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-offers"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => offersApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-offers"] });
    },
  });

  const counterMutation = useMutation({
    mutationFn: ({ id, amount, msg }: { id: string; amount: number; msg?: string }) =>
      offersApi.counter(id, amount, msg),
    onSuccess: () => {
      setCounteringOfferId(null);
      queryClient.invalidateQueries({ queryKey: ["seller-offers"] });
    },
  });

  if (isLoading) return <LoadingBlock />;

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No price offers received yet"
        body="When potential buyers make offers on your vehicles below the asking price, they will appear here for negotiation."
      />
    );
  }

  const handleStartCounter = (offer: VehicleOffer) => {
    setCounteringOfferId(offer.id);
    setCounterAmount(Math.round((Number(offer.listing_price) + Number(offer.offer_amount)) / 2));
    setCounterMessage("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display text-lg font-bold text-ink">Price Offers & Negotiations</h2>
        <span className="text-xs text-slate">{data.length} offer(s)</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {data.map((offer: VehicleOffer) => {
          const discountPct = Math.round(
            ((Number(offer.listing_price) - Number(offer.offer_amount)) / Number(offer.listing_price)) * 100
          );

          return (
            <div
              key={offer.id}
              className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                        offer.status === "accepted"
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : offer.status === "submitted"
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : offer.status === "countered"
                          ? "bg-slate-100 text-slate-800 border-slate-200"
                          : "bg-stone-100 text-stone-700 border-stone-200"
                      }`}
                    >
                      {offer.status}
                    </span>
                    <span className="text-xs text-slate">
                      Received {new Date(offer.created_at).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-ink">
                    <Link to={`/cars/${offer.listing_slug}`} className="hover:text-blue-700">
                      {offer.listing_title}
                    </Link>
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate">
                    <span>Buyer: <strong className="text-ink">{offer.buyer_name}</strong></span>
                    <span>Asking Price: <strong>{formatINR(Number(offer.listing_price))}</strong></span>
                    <span className="text-blue-700 font-bold">
                      Offered: {formatINR(Number(offer.offer_amount))} ({discountPct}% discount)
                    </span>
                    {offer.counter_amount && (
                      <span className="text-blue-800 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Countered at: {formatINR(Number(offer.counter_amount))}
                      </span>
                    )}
                  </div>

                  {offer.message && (
                    <p className="text-xs text-slate bg-stone-50 p-2 rounded-lg border border-stone-100 italic">
                      "{offer.message}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {offer.status === "submitted" && (
                    <>
                      <button
                        onClick={() => acceptMutation.mutate(offer.id)}
                        disabled={acceptMutation.isPending}
                        className="px-3.5 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStartCounter(offer)}
                        className="px-3.5 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Counter
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate(offer.id)}
                        disabled={rejectMutation.isPending}
                        className="px-3.5 py-2 border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Inline Counter Form */}
              {counteringOfferId === offer.id && (
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
                    Make Counter Offer to {offer.buyer_name}
                  </h4>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={counterAmount}
                        onChange={(e) => setCounterAmount(Number(e.target.value))}
                        className="w-full bg-white border border-stone-200 rounded-lg pl-7 pr-3 py-2 text-sm font-bold text-ink focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Optional message to buyer"
                      value={counterMessage}
                      onChange={(e) => setCounterMessage(e.target.value)}
                      className="w-full sm:w-1/2 bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs text-ink focus:border-blue-600 focus:outline-none"
                    />
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() =>
                          counterMutation.mutate({
                            id: offer.id,
                            amount: counterAmount,
                            msg: counterMessage.trim() || undefined,
                          })
                        }
                        disabled={counterAmount <= 0 || counterMutation.isPending}
                        className="flex-1 sm:flex-initial px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Send Counter
                      </button>
                      <button
                        onClick={() => setCounteringOfferId(null)}
                        className="px-3 py-2 text-xs text-slate hover:text-ink cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
