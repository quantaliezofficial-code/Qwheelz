import React, { useState } from "react";
import { X, Phone, MessageCircle, Send, CheckCircle2, User, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { VehicleListing } from "../types";
import { formatINR } from "./ui";
import { useCreateEnquiry } from "../hooks/useEnquiries";
import { useAuth } from "../lib/auth";
import { AuthModal } from "./AuthModal";

interface ContactSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: VehicleListing;
}

export function ContactSellerModal({ isOpen, onClose, listing }: ContactSellerModalProps) {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [message, setMessage] = useState(
    `Hello, I am interested in your ${listing.year} ${listing.brand} ${listing.model} listed on Qwheelz. Is it available for inspection / test drive?`
  );
  const [sent, setSent] = useState(false);
  const createEnquiry = useCreateEnquiry();

  if (!isOpen) return null;

  const sellerName = listing.seller?.business_name || listing.seller?.name || "Verified Vehicle Owner";
  const sellerPhone = listing.seller?.phone || "+919839012345";
  const cleanPhone = sellerPhone.replace(/[^0-9]/g, "");
  const waUrl = `https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}?text=${encodeURIComponent(
    `Hello ${sellerName}, I am interested in your ${listing.year} ${listing.brand} ${listing.model} (${formatINR(Number(listing.price))}) on Qwheelz. Is it still available?`
  )}`;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!user) {
      setAuthOpen(true);
      return;
    }
    try {
      await createEnquiry.mutateAsync({ listingId: listing.id, message: message.trim() });
      setSent(true);
    } catch (err: any) {
      alert(err?.message || "Failed to send message to seller.");
    }
  };

  const image = listing.images?.[0]?.url || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600";

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden relative border border-stone-200 font-sans">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full transition-colors cursor-pointer z-10"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          {/* Modal Header */}
          <div className="bg-blue-900 text-white p-6 sm:p-7">
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-300 bg-blue-950/60 px-2.5 py-1 rounded-full border border-sky-400/30">
              Direct Contact
            </span>
            <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
              Contact Vehicle Seller
            </h2>
            <p className="text-xs text-blue-200 mt-1">
              Connect directly with the owner without broker mediation or hidden commission.
            </p>
          </div>

          <div className="p-6 sm:p-7 space-y-5">
            {/* Vehicle Mini Summary */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
              <img
                src={image}
                alt={listing.title}
                className="w-16 h-14 object-cover rounded-xl bg-stone-200 shrink-0 border border-stone-200"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  {listing.year} • {listing.brand}
                </p>
                <h4 className="text-sm font-black text-stone-900 truncate">{listing.title}</h4>
                <p className="text-sm font-extrabold text-stone-900 mt-0.5">
                  {formatINR(Number(listing.price))}
                  <span className="text-xs font-normal text-stone-500 ml-2">• {listing.city}</span>
                </p>
              </div>
            </div>

            {/* Seller Identity Card */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {sellerName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-stone-900">{sellerName}</p>
                    <span className="text-[9px] bg-blue-100 text-blue-800 font-extrabold uppercase px-1.5 py-0.5 rounded">
                      {listing.seller?.seller_type === "dealer" ? "Dealer" : "Individual Owner"}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={11} className="text-blue-700" />
                    <span>{listing.city || "Lucknow"}</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-blue-700 font-semibold">Direct Phone Verified</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Calling & WhatsApp Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={`tel:${sellerPhone}`}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm"
              >
                <Phone size={14} className="text-sky-300" />
                <span>Call Seller</span>
              </a>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-950 font-extrabold text-xs uppercase tracking-wider transition-all border border-blue-200 shadow-sm"
              >
                <MessageCircle size={14} className="text-blue-700" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* In-App Direct Message to Seller */}
            {sent ? (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-1">
                <CheckCircle2 size={24} className="text-blue-700 mx-auto" />
                <h4 className="text-sm font-bold text-blue-950">Message Sent to Seller!</h4>
                <p className="text-xs text-blue-800">
                  The seller will receive your message in their inquiries inbox and can reply directly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-2.5 pt-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Send Direct Message to Seller
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-blue-600 resize-none placeholder:text-stone-400"
                  placeholder="Type your message to the vehicle seller..."
                />
                <button
                  type="submit"
                  disabled={createEnquiry.isPending || !message.trim()}
                  className="w-full py-3 bg-blue-900 hover:bg-blue-950 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Send size={13} className="text-sky-300" />
                  <span>{createEnquiry.isPending ? "Sending…" : "Send Message to Seller"}</span>
                </button>
              </form>
            )}

            {/* View Full Vehicle Inspection Link */}
            <div className="pt-2 text-center border-t border-stone-100">
              <Link
                to={`/cars/${listing.slug}`}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 hover:text-blue-900 transition-colors"
              >
                <span>Inspect Full 200-Pt Vehicle Report</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>

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
