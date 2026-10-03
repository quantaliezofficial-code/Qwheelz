import { useState } from "react";
import { X, HelpCircle, CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";
import { supportApi } from "../lib/api/support";
import type { SupportCategory } from "../types";

const CATEGORIES: { label: string; value: SupportCategory }[] = [
  { label: "Vehicle Listing Inquiry", value: "vehicle" },
  { label: "Appointment / Test Drive", value: "appointment" },
  { label: "Payment & Token Refund", value: "payment" },
  { label: "Report Misleading Info", value: "report" },
  { label: "General Support", value: "general" },
];

export function SupportModal({
  isOpen,
  onClose,
  onSuccess,
  listingId,
  listingTitle,
  appointmentId,
  defaultCategory = "vehicle",
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  listingId?: string;
  listingTitle?: string;
  appointmentId?: string;
  defaultCategory?: SupportCategory;
}) {
  const [category, setCategory] = useState<SupportCategory>(defaultCategory);
  const [subject, setSubject] = useState(
    listingTitle ? `Inquiry regarding ${listingTitle}` : "Customer Support Request"
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !subject.trim()) {
      setError("Please provide both a subject and a message.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await supportApi.createTicket({
        subject: subject.trim(),
        category,
        listing_id: listingId,
        appointment_id: appointmentId,
        message: message.trim(),
      });

      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create support ticket. Please try again.");
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
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>Dedicated Concierge Support</span>
          </div>
          <h2 className="text-xl font-display font-bold">Open Support Ticket</h2>
          {listingTitle && (
            <p className="text-stone-400 text-xs mt-1 truncate">
              Attached Context: {listingTitle}
            </p>
          )}
        </div>

        <div className="p-6">
          {success ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Support Ticket Created!</h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto">
                Your request has been logged with our customer success team. You can view updates and reply to concierge messages directly in your Account Hub.
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SupportCategory)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="Summary of your issue or request"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Message Details
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  placeholder="Describe your question or issue in detail..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-blue-600 focus:bg-white focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-950/20 text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Submitting Ticket..." : "Submit Support Ticket"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
