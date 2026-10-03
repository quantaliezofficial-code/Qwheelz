import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, Camera, ShieldCheck, Truck, BarChart2 } from "lucide-react";
import type { VehicleListing } from "../types";
import { formatINR, formatKm } from "./ui";
import { useAuth } from "../lib/auth";
import { useToggleFavourite } from "../hooks/useListings";
import { AuthModal } from "./AuthModal";
import { useCompare } from "../context/CompareContext";

const FUEL_LABELS: Record<string, string> = { petrol: "Petrol", diesel: "Diesel", electric: "Electric", cng: "CNG", hybrid: "Hybrid" };
const TRANSMISSION_LABELS: Record<string, string> = { manual: "Manual", automatic: "Automatic", amt: "AMT", cvt: "CVT" };

export function VehicleCard({ listing }: { listing: VehicleListing }) {
  const { user } = useAuth();
  const toggleFavourite = useToggleFavourite();
  const { compareList, addToCompare, removeFromCompare } = useCompare();
  const [authOpen, setAuthOpen] = useState(false);
  const cover = listing?.images?.find((img) => img.is_cover) ?? listing?.images?.[0];

  const inCompare = compareList.some(c => c.id === listing?.id);
  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) removeFromCompare(listing.id);
    else addToCompare(listing);
  };

  const handleFavourite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      setAuthOpen(true);
      return;
    }
    toggleFavourite.mutate({ id: listing.id, isFavourited: listing.is_favourited });
  };

  const isFavorited = listing.is_favourited;
  
  // Calculate EMI estimate (approximate 9% for 5 years on 80% loan)
  const priceNum = Number(listing.price);
  const loanAmount = priceNum * 0.8;
  const ratePerMonth = 0.09 / 12;
  const emi = loanAmount > 0 
    ? Math.round((loanAmount * ratePerMonth * Math.pow(1 + ratePerMonth, 60)) / (Math.pow(1 + ratePerMonth, 60) - 1))
    : 0;

  return (
    <>
      <Link
        to={`/cars/${listing.slug}`}
        className="group bg-white border border-stone-200 hover:border-blue-500/40 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-lg hover:-translate-y-1"
      >
        {/* Image Stage */}
        <div className="relative h-40 sm:h-44 bg-stone-100 overflow-hidden">
          {cover ? (
              <img
                src={cover.url}
                alt={`${listing.brand} ${listing.model}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.parentElement) {
                    const fallback = document.createElement('div');
                    fallback.className = 'flex h-full items-center justify-center text-stone-300';
                    fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-camera"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>';
                    e.currentTarget.parentElement.appendChild(fallback);
                  }
                }}
              />
          ) : (
             <div className="flex h-full w-full items-center justify-center text-stone-300"><Camera size={32} /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          
          {/* Top Badges on image */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex justify-between items-center z-10">
            <div className="flex items-center gap-1.5">
              {listing.is_featured ? (
                <span className="px-2.5 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-md">
                  Certified
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-stone-700 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
                  Verified
                </span>
              )}
              {listing.registration_state && (
                <span className="px-2 py-0.5 bg-stone-900/80 backdrop-blur-md text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-md border border-white/20">
                  {listing.registration_state} RTO
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleCompare}
                className={`p-2 rounded-full backdrop-blur-md transition-all shadow-md active:scale-90 cursor-pointer border ${inCompare ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700' : 'bg-white/90 hover:bg-white text-stone-700 hover:text-blue-600 border-stone-200'}`}
                title={inCompare ? "Remove from comparison" : "Compare this car"}
              >
                <BarChart2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleFavourite}
                className="p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-red-500 backdrop-blur-md transition-all border border-stone-200 shadow-md active:scale-90 cursor-pointer"
                title={!user ? "Sign in to add to garage" : isFavorited ? "Remove from shortlist" : "Save to shortlist"}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'text-red-500 fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Inspection badge on image bottom */}
          <div className="absolute bottom-3 left-3.5 z-10">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-stone-950/75 backdrop-blur-md px-2 py-0.5 rounded border border-emerald-500/30">
              <ShieldCheck size={12} />
              200-Pt Checked
            </span>
          </div>
        </div>

        {/* Info Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 font-mono tracking-widest uppercase">{listing.brand}</span>
              <span className="text-[10px] bg-stone-100 border border-stone-200 px-2 py-0.5 rounded text-stone-600 uppercase font-semibold">
                {listing.body_type}
              </span>
            </div>
            <h3 className="text-base font-bold text-stone-900 mt-1 line-clamp-1 group-hover:text-blue-800 transition-colors">
              {listing.title}
            </h3>

            {/* Horizontal specs pills */}
            <div className="flex flex-wrap gap-1.5 mt-3 text-stone-600">
              <span className="text-[10px] font-semibold bg-stone-100 px-2 py-0.5 rounded">
                {FUEL_LABELS[listing.fuel_type] || listing.fuel_type}
              </span>
              <span className="text-[10px] font-semibold bg-stone-100 px-2 py-0.5 rounded">
                {TRANSMISSION_LABELS[listing.transmission] || listing.transmission}
              </span>
              <span className="text-[10px] font-semibold bg-stone-100 px-2 py-0.5 rounded">
                {listing.year}
              </span>
              <span className="text-[10px] font-semibold bg-stone-100 px-2 py-0.5 rounded font-mono">
                {formatKm(listing.km_driven)}
              </span>
              <span className="text-[10px] font-semibold bg-stone-100 px-2 py-0.5 rounded flex items-center gap-1 text-stone-600">
                <Truck size={10} className="text-blue-600" />
                Pan-India Delivery
              </span>
            </div>
          </div>

          {/* Pricing & EMI */}
          <div className="border-t border-stone-100 pt-3.5 mt-4 flex justify-between items-end">
            <div>
              <span className="text-stone-400 text-[9px] uppercase font-semibold block">Verified Price</span>
              <p className="text-xl font-black text-stone-950 tracking-tight">{formatINR(listing.price)}</p>
              {emi > 0 && (
                <p className="text-[10px] text-stone-400 mt-0.5">EMI ~<span className="font-semibold text-stone-800">₹{emi.toLocaleString()}/mo</span></p>
              )}
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-blue-700 group-hover:translate-x-0.5 transition-transform inline-block">
                View Inspection &rarr;
              </span>
            </div>
          </div>
        </div>

        {/* Action Grid Footer */}
        <div className="border-t border-stone-100">
          <span className="w-full py-2.5 bg-stone-50 group-hover:bg-blue-900 text-stone-700 group-hover:text-white font-extrabold text-[11px] tracking-wider uppercase transition-all duration-300 flex justify-center items-center">
            Inspect Vehicle
          </span>
        </div>
      </Link>

      {authOpen && (
        <AuthModal
          mode="login"
          onClose={() => setAuthOpen(false)}
          onSwitchMode={() => {}}
        />
      )}
    </>
  );
}
