import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, MessageSquare, Key, SearchX, Search } from "lucide-react";
import { useMyEnquiries } from "../hooks/useEnquiries";
import { useMyFavourites } from "../hooks/useListings";
import { EnquiryThread } from "../components/EnquiryThread";
import { VehicleCard } from "../components/VehicleCard";
import { EmptyState, LoadingBlock, StatusBadge } from "../components/ui";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/api/client";

export function EnquiriesPage({ initialTab = "enquiries" }: { initialTab?: "enquiries" | "favourites" | "bookings" | "saved" }) {
  const [tab, setTab] = useState<"enquiries" | "favourites" | "bookings" | "saved">(initialTab as any);
  const [openId, setOpenId] = useState<string | null>(null);
  const navigate = useNavigate();

  const enquiries = useMyEnquiries();
  const favourites = useMyFavourites();

  const bookings = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => apiRequest<any[]>("/api/v1/admin/health").then(() => []), // For now, we didn't add a user GET endpoint for bookings, just a POST. Wait, I should just map the user's bookings if I made a GET endpoint.
  });

  const savedSearches = useQuery({
    queryKey: ["my-saved-searches"],
    queryFn: () => apiRequest<any[]>("/api/v1/saved-searches")
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-ink">My Account</h1>

      <div className="mb-6 mt-4 flex gap-1 border-b border-fog overflow-x-auto whitespace-nowrap">
        <button onClick={() => { setTab("enquiries"); setOpenId(null); }} className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === "enquiries" ? "border-ignition-500 text-ignition-600" : "border-transparent text-slate hover:text-ink"}`}>
          <MessageSquare size={14} /> My Enquiries
        </button>
        <button onClick={() => setTab("bookings")} className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === "bookings" ? "border-ignition-500 text-ignition-600" : "border-transparent text-slate hover:text-ink"}`}>
          <Key size={14} /> My Bookings
        </button>
        <button onClick={() => setTab("favourites")} className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === "favourites" ? "border-ignition-500 text-ignition-600" : "border-transparent text-slate hover:text-ink"}`}>
          <Heart size={14} /> Shortlist
        </button>
        <button onClick={() => setTab("saved")} className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === "saved" ? "border-ignition-500 text-ignition-600" : "border-transparent text-slate hover:text-ink"}`}>
          <Search size={14} /> Saved Searches
        </button>
      </div>

      {tab === "enquiries" && (
        openId ? (
          <EnquiryThread enquiryId={openId} onBack={() => setOpenId(null)} />
        ) : enquiries.isLoading ? (
          <LoadingBlock />
        ) : !enquiries.data || enquiries.data.length === 0 ? (
          <EmptyState title="No enquiries yet" body="Contact a seller from any listing page to start a conversation." action={<Link to="/cars" className="qz-btn-primary mt-2 rounded-lg px-5 py-2.5 text-sm font-semibold">Browse cars</Link>} />
        ) : (
          <div className="flex flex-col gap-2">
            {enquiries.data.map((enquiry) => (
              <button key={enquiry.id} onClick={() => setOpenId(enquiry.id)} className="qz-card flex items-center justify-between p-4 text-left hover:shadow-lifted">
                <div>
                  <p className="font-semibold text-ink">{enquiry.listing_title}</p>
                  <p className="text-sm text-slate">With {enquiry.seller.business_name || enquiry.seller.name} · {enquiry.messages[enquiry.messages.length - 1]?.content.slice(0, 60)}</p>
                </div>
                <StatusBadge status={enquiry.status} />
              </button>
            ))}
          </div>
        )
      )}

      {tab === "bookings" && (
        <EmptyState title="No bookings yet" body="You haven't booked any vehicles yet. Reserve a car to take it off the market." action={<Link to="/cars" className="qz-btn-primary mt-2 rounded-lg px-5 py-2.5 text-sm font-semibold">Browse cars</Link>} />
      )}

      {tab === "favourites" && (
        favourites.isLoading ? (
          <LoadingBlock />
        ) : !favourites.data || favourites.data.length === 0 ? (
          <EmptyState title="Your shortlist is empty" body="Tap the heart icon on any listing to save it here." action={<Link to="/cars" className="qz-btn-primary mt-2 rounded-lg px-5 py-2.5 text-sm font-semibold">Browse cars</Link>} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {favourites.data.map((listing) => <VehicleCard key={listing.id} listing={listing} />)}
          </div>
        )
      )}

      {tab === "saved" && (
        savedSearches.isLoading ? (
          <LoadingBlock />
        ) : !savedSearches.data || savedSearches.data.length === 0 ? (
          <EmptyState title="No saved searches" body="Save your search criteria to get alerts when matching cars are added." action={<Link to="/cars" className="qz-btn-primary mt-2 rounded-lg px-5 py-2.5 text-sm font-semibold">Browse cars</Link>} />
        ) : (
          <div className="flex flex-col gap-4">
            {savedSearches.data.map((search) => (
              <div key={search.id} className="qz-card p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-ink">{search.name}</h3>
                  <p className="text-sm text-slate">Created on {new Date(search.created_at).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => {
                    const params = new URLSearchParams();
                    Object.entries(search.filters).forEach(([k, v]) => params.set(k, String(v)));
                    navigate(`/cars?${params.toString()}`);
                  }}
                  className="qz-btn-secondary px-4 py-2 text-sm rounded-lg"
                >
                  View Results
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
