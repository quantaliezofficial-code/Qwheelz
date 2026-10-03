import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, MessageSquare, Plus, Rocket, Upload } from "lucide-react";
import { useMyListings, useMarkListingSold, useUploadListingImage, usePromoteListing } from "../hooks/useListings";
import { useMyEnquiries } from "../hooks/useEnquiries";
import { useMySubscription, usePlans, useSubscribe } from "../hooks/useSeller";
import { useAuth } from "../lib/auth";
import { EmptyState, formatINR, LoadingBlock, StatusBadge } from "../components/ui";
import { EnquiryThread } from "../components/EnquiryThread";

type Tab = "listings" | "enquiries" | "subscription";

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
          <p className="mt-1 text-sm text-slate">Manage your listings, enquiries, and account.</p>
        </div>
        <Link to="/sell" className="qz-btn-primary flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold">
          <Plus size={16} /> Add vehicle
        </Link>
      </div>

      <div className="mb-6 flex gap-1 border-b border-fog">
        {([
          ["listings", "My Listings"],
          ["enquiries", "Enquiries"],
          ["subscription", "Subscription"],
        ] as [Tab, string][]).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === value ? "border-blue-600 text-blue-700" : "border-transparent text-slate hover:text-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "listings" && <ListingsTab />}
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
                    <button onClick={() => promote.mutate(listing.id)} className="rounded-lg border border-ember-200 px-2.5 py-1.5 text-xs font-semibold text-ember-600 hover:bg-ember-50">
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
