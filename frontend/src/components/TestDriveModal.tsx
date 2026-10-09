import { useState } from "react";
import { X, Calendar, Clock, Car, CheckCircle2, AlertCircle } from "lucide-react";
import { appointmentsApi } from "../lib/api/appointments";
import type { AppointmentType } from "../types";

const TIME_SLOTS = [
  "10:00 AM - 12:00 PM",
  "12:00 PM - 02:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM",
];

export function TestDriveModal({
  isOpen,
  onClose,
  onSuccess,
  listingId,
  listingTitle,
  city,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  listingId: string;
  listingTitle: string;
  city?: string;
}) {
  const [appointmentType, setAppointmentType] = useState<AppointmentType>("test_drive");
  const today = new Date().toISOString().split("T")[0];
  const [scheduledDate, setScheduledDate] = useState(today);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const scheduledAt = new Date(`${scheduledDate}T10:00:00Z`).toISOString();
      await appointmentsApi.create({
        listing_id: listingId,
        appointment_type: appointmentType,
        scheduled_at: scheduledAt,
        time_slot: timeSlot,
        notes: notes.trim() || undefined,
      });

      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to schedule appointment. Please try again.");
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
            <Car className="w-4 h-4" />
            <span>Appointment Request</span>
          </div>
          <h2 className="text-xl font-display font-bold">Schedule Test Drive or Inspection</h2>
          <p className="text-stone-400 text-xs mt-1 truncate">
            {listingTitle} {city ? `• ${city}` : ""}
          </p>
        </div>

        <div className="p-6">
          {success ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600 border border-blue-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Appointment Requested!</h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto">
                Your request for a {appointmentType === "test_drive" ? "Test Drive" : "Vehicle Inspection"} on{" "}
                <span className="font-semibold text-stone-900">{scheduledDate}</span> ({timeSlot}) has been sent to the seller. You can monitor the confirmation in your Account Hub.
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Appointment Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAppointmentType("test_drive")}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                      appointmentType === "test_drive"
                        ? "bg-blue-50 border-blue-600 text-blue-900 shadow-xs"
                        : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    <Car className="w-4 h-4" />
                    Test Drive
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppointmentType("inspection")}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                      appointmentType === "inspection"
                        ? "bg-blue-50 border-blue-600 text-blue-900 shadow-xs"
                        : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    Physical Inspection
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Preferred Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={today}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Time Slot
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                        timeSlot === slot
                          ? "bg-blue-900 text-white border-blue-900 shadow-xs"
                          : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      <Clock className="w-3 h-3 inline mr-1" />
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Notes / Special Requests (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g., Please bring the service record book or let me know if an evening slot works."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-blue-600 focus:bg-white focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-950/20 text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Scheduling..." : "Confirm Appointment Request"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
