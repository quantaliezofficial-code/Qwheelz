import { useState } from "react";
import { X, Tag, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";
import { offersApi } from "../lib/api/offers";
import { formatINR } from "./ui";

export function OfferModal({
  isOpen,
  onClose,
  onSuccess,
  listingId,
  listingTitle,
  listingPrice,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
}) {
  const [offerAmount, setOfferAmount] = useState<number>(Math.round(listingPrice * 0.95));
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const discountPercent = Math.round(((listingPrice - offerAmount) / listingPrice) * 100);

  const applyDiscount = (pct: number) => {
    const discounted = Math.round(listingPrice * (1 - pct / 100));
    setOfferAmount(discounted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (offerAmount <= 0) {
      setError("Please enter a valid offer amount.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await offersApi.create({
        listing_id: listingId,
        offer_amount: offerAmount,
        message: message.trim() || undefined,
      });

      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to submit offer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden relative border border-stone-200">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors p-1"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-stone-900 p-6 text-white">
          <div className="flex items-center gap-2 text-sky-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Tag className="w-4 h-4" />
            <span>Price Negotiation</span>
          </div>
          <h2 className="text-xl font-display font-bold">Make an Official Offer</h2>
          <p className="text-stone-400 text-xs mt-1 truncate">
            {listingTitle} • Asking Price: {formatINR(listingPrice)}
          </p>
        </div>

        <div className="p-6">
          {success ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600 border border-blue-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Offer Submitted!</h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto">
                Your offer of <span className="font-semibold text-stone-900">{formatINR(offerAmount)}</span> has been sent to the seller. The seller may accept, counter, or decline your offer. You will be notified in your Account Hub.
              </p>
              <div className="pt-4">
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Quick Discount Presets */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Quick Discount Suggestions
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 5, 8, 10].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => applyDiscount(pct)}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                        discountPercent === pct
                          ? "bg-blue-50 border-blue-600 text-blue-800 shadow-xs"
                          : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      -{pct}% ({formatINR(Math.round(listingPrice * (1 - pct / 100)))})
                    </button>
                  ))}
                </div>
              </div>

              {/* Offer Amount Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Your Offer Amount (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 font-bold">
                    ₹
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={listingPrice * 1.5}
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(Number(e.target.value))}
                    required
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-4 py-3 text-lg font-bold text-stone-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="flex justify-between items-center mt-1.5 text-xs">
                  <span className="text-stone-500">
                    Formatted: <span className="font-semibold text-stone-800">{formatINR(offerAmount)}</span>
                  </span>
                  {discountPercent > 0 ? (
                    <span className="text-blue-700 font-semibold">
                      {discountPercent}% below asking price
                    </span>
                  ) : discountPercent < 0 ? (
                    <span className="text-blue-700 font-semibold">
                      {Math.abs(discountPercent)}% above asking price
                    </span>
                  ) : (
                    <span className="text-stone-500 font-medium">At asking price</span>
                  )}
                </div>
              </div>

              {/* Message to Seller */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Message / Terms for Seller (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  placeholder="e.g., Willing to close immediately with token advance if offer is agreed."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-blue-600 focus:bg-white focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-950/20 text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Submitting Offer..." : `Send Offer (${formatINR(offerAmount)})`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
