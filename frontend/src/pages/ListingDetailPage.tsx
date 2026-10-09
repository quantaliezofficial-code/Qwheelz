import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Calendar, Camera, Flag, Fuel, Gauge, Heart, Palette, Settings2, ShieldCheck, Star, Truck, Users, Activity, Zap, Ruler, Wallet, Check, PieChart, LineChart, Flame, RotateCcw, BarChart2, CheckCircle2, FileText, Lock, Key, Wrench, MapPin, Shield, Tag, HelpCircle
} from "lucide-react";
import { useListing, useToggleFavourite } from "../hooks/useListings";
import { useCreateEnquiry } from "../hooks/useEnquiries";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import { useAuth } from "../lib/auth";
import { EmptyState, ErrorNote, formatINR, formatKm, LoadingBlock, VerifiedPlate } from "../components/ui";
import { Viewer360 } from "../components/luxura/Viewer360";
import { BookingModal } from "../components/luxura/BookingModal";
import { TestDriveModal } from "../components/TestDriveModal";
import { OfferModal } from "../components/OfferModal";
import { SupportModal } from "../components/SupportModal";
import { InspectionReportSection } from "../components/InspectionReportSection";
import { AuthModal } from "../components/AuthModal";
import { SimilarListings } from "../components/SimilarListings";
import { ApiError } from "../lib/api/client";
import { reportsApi } from "../lib/api/auth";

const FUEL_LABELS: Record<string, string> = { petrol: "Petrol", diesel: "Diesel", electric: "Electric", cng: "CNG", hybrid: "Hybrid" };
const TRANSMISSION_LABELS: Record<string, string> = { manual: "Manual", automatic: "Automatic", amt: "AMT", cvt: "CVT" };

const INSURANCE_LABELS: Record<string, string> = {
  comprehensive: "Comprehensive Insurance",
  zero_dep: "Zero Depreciation (B2B)",
  third_party: "Third Party Only",
  expired: "Expired / Needs Renewal",
};

const SERVICE_HISTORY_LABELS: Record<string, string> = {
  full_authorized: "Full Authorized Brand Center History",
  partial_authorized: "Partial Authorized Center Record",
  independent_specialist: "Regular Multi-brand Specialist",
  self_maintained: "Self / Local Garage Maintained",
  not_available: "No Service Records",
};

const ACCIDENT_LABELS: Record<string, string> = {
  clean: "100% Clean / Never in an Accident",
  minor_scratches_repaired: "Minor Bumper / Paint Repair Only",
  panel_replaced: "Minor Panel Replacement",
  structural_repaired: "Major Repair / Structural Work",
};

const HYPOTHECATION_LABELS: Record<string, string> = {
  none: "No Loan (Clear Title)",
  active_loan: "Active Bank Hypothecation",
  noc_available: "Loan Paid Off / NOC Ready",
};

const KEYS_LABELS: Record<string, string> = {
  "2_keys": "2 Original Remote Keys",
  "1_key": "1 Original Key",
  duplicate: "Duplicate / Replaced Key",
};

const TYRE_LABELS: Record<string, string> = {
  new: "Brand New (>90% Tread)",
  good: "Good (60% – 90% Tread)",
  average: "Average (30% – 60% Tread)",
  needs_replacement: "Needs Replacement Soon (<30%)",
};

const CONDITION_LABELS: Record<string, string> = {
  mint: "Mint / Showroom Condition",
  excellent: "Excellent (Very Well Kept)",
  good: "Good (Normal Age Wear)",
  fair: "Fair Condition",
};

export function ListingDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: listing, isLoading, error } = useListing(slug);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toggleFavourite = useToggleFavourite();
  const createEnquiry = useCreateEnquiry();
  const { addViewed } = useRecentlyViewed();

  const [activeImage, setActiveImage] = useState(0);
  const [message, setMessage] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [sent, setSent] = useState(false);
  
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [viewer360Open, setViewer360Open] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [testDriveOpen, setTestDriveOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  // EMI Calculator State
  const [emiTenure, setEmiTenure] = useState(60); // months
  const [emiInterest] = useState(9.5); // % p.a.
  const [emiDownpayment, setEmiDownpayment] = useState(0);

  const emiCalculation = useMemo(() => {
    if (!listing) return { emi: 0, loanAmount: 0 };
    const price = Number(listing.price);
    const downpayment = (emiDownpayment / 100) * price;
    const loanAmount = price - downpayment;
    const r = emiInterest / 12 / 100;
    const n = emiTenure;
    if (loanAmount <= 0) return { emi: 0, loanAmount: 0 };
    const emi = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return { emi: Math.round(emi), loanAmount: Math.round(loanAmount) };
  }, [listing, emiTenure, emiDownpayment, emiInterest]);

  useEffect(() => {
    if (listing) {
      addViewed(listing);
      document.title = `${listing.year} ${listing.brand} ${listing.model} | Qwheelz`;
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", `Buy ${listing.year} ${listing.title} in ${listing.city} for ${formatINR(listing.price)}. Certified by Qwheelz.`);
      }
    }
    // Cleanup title on unmount
    return () => {
      document.title = "Qwheelz | India's Certified Pre-Owned Auto Marketplace";
    };
  }, [listing, addViewed]);

  if (isLoading) return <div className="p-8"><LoadingBlock /></div>;
  if (error) return <div className="p-8"><ErrorNote message={error instanceof Error ? error.message : "An error occurred"} /></div>;
  if (!listing) return <div className="p-8"><EmptyState title="Vehicle not found" body="This listing may have been removed." /></div>;

  const isOwnListing = user?.id === listing.seller.id;
  const isPending = listing.status === "pending_review";
  const images = listing?.images?.length > 0 ? listing.images : [{ id: "fake", url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200", is_cover: true }];

  const handleEnquiry = async () => {
    if (!message.trim()) return;
    try {
      await createEnquiry.mutateAsync({ listingId: listing.id, message });
      setSent(true);
    } catch (e: any) {
      alert(e.message || "Failed to send enquiry");
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    try {
      await reportsApi.create("listing", listing.id, reportReason);
      setReportSent(true);
    } catch (e: any) {
      alert(e.message || "Failed to submit report");
    }
  };

  // TCO Calculations
  const specs: any = (listing as any).specifications || {};
  const numericMileage = listing.fuel_type === "electric" ? Infinity : 15;
  const monthlyDistance = 1000;
  
  let fuelPrice = 100; // petrol default
  if (listing.fuel_type.toLowerCase() === "diesel") fuelPrice = 90;
  else if (listing.fuel_type.toLowerCase() === "cng") fuelPrice = 75;
  else if (listing.fuel_type.toLowerCase() === "electric") fuelPrice = 1;

  const monthlyFuelCost = listing.fuel_type === "electric" ? monthlyDistance * fuelPrice : Math.round((monthlyDistance / numericMileage) * fuelPrice);
  const yearlyMaintenance = listing.body_type.includes("suv") || listing.body_type.includes("muv") ? 15000 : 8000;
  const monthlyMaintenance = Math.round(yearlyMaintenance / 12);
  const totalMonthlyCost = monthlyFuelCost + monthlyMaintenance;

  return (
    <div className="bg-[#FAFAF9] text-stone-900 min-h-screen py-12 font-sans" id="vehicle-details-view">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-6 text-xs text-stone-500 font-mono uppercase tracking-widest">
          <Link to="/cars" className="hover:text-blue-700 transition-colors">Premium Showroom</Link> 
          <span className="mx-2 text-stone-300">/</span> 
          <span className="text-stone-900 font-bold">{listing.title}</span>
        </nav>

        {isPending && (
          <div className="mb-6 rounded-xl bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
            <ShieldCheck className="text-blue-600 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-1">Under Review</h4>
              <p className="text-sm text-blue-800">This vehicle is currently being verified by our curation team. It is only visible to you.</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-[1.5fr_1fr] xl:grid-cols-[2fr_1fr] gap-10">
          
          {/* Main Left Content */}
          <div className="space-y-10">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-800 text-[10px] font-bold uppercase tracking-wider rounded border border-blue-200">
                  {listing.year}
                </span>
                <span className="px-2.5 py-1 bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-wider rounded border border-stone-200">
                  {listing.brand}
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
                {listing.title}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-6 pb-6 border-b border-stone-200">
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-black text-stone-900 tracking-tight">{formatINR(listing.price)}</p>
                  <button onClick={() => navigate(`/compare?id1=${listing.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-wide rounded-md border border-stone-200 hover:bg-stone-200 transition-colors">
                    <BarChart2 className="w-3.5 h-3.5" /> Compare
                  </button>
                </div>
                
                {/* Trust Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {listing.is_featured && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide rounded-md border border-blue-200">
                      <Check className="w-3.5 h-3.5" />
                      Qwheelz Certified
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide rounded-md border border-blue-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    200-Point Inspected
                  </span>
                </div>
              </div>
            </div>
            {/* Gallery */}
            <div className="space-y-4">
              <div className="aspect-[16/9] md:aspect-[2/1] bg-stone-100 rounded-2xl overflow-hidden border border-stone-200 relative group">
                {images.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400">
                    <Camera size={48} className="mb-3 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">No images provided</p>
                  </div>
                ) : (
                  <img src={images[activeImage].url} alt={listing.title} className="h-full w-full object-cover" />
                )}

                {/* 360 Viewer Button */}
                <button
                  onClick={() => setViewer360Open(true)}
                  className="absolute top-4 left-4 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all shadow-xl"
                >
                  <RotateCcw className="w-4 h-4" />
                  360° View
                </button>

                {images.length > 1 && (
                  <div className="absolute bottom-4 left-0 w-full flex justify-center gap-2">
                    {images.map((img, idx) => (
                      <button key={img.id} onClick={() => setActiveImage(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === activeImage ? "bg-blue-900 w-6" : "bg-white/70 hover:bg-white"}`} />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto qz-scroll pb-2">
                  {images.map((img, idx) => (
                    <button key={img.id} onClick={() => setActiveImage(idx)} className={`relative h-20 w-32 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${idx === activeImage ? "border-blue-600 shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`}>
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Core Details */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="rounded bg-stone-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">{listing.year}</span>
                <span className="rounded bg-stone-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-stone-700">{listing.brand}</span>
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">{listing.title}</h1>
              <p className="text-stone-500 mt-2 text-sm font-medium">{listing.city} • {formatKm(listing.km_driven)} • {listing.owner_count}{listing.owner_count === 1 ? 'st' : listing.owner_count === 2 ? 'nd' : 'rd'} Owner</p>
            </div>

            {/* Quick Specs Grid */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-4 border-b border-stone-200 pb-2">Key Specifications</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Spec icon={Calendar} label="Year" value={listing.year.toString()} />
                <Spec icon={Gauge} label="Mileage" value={formatKm(listing.km_driven)} />
                <Spec icon={Fuel} label="Fuel" value={FUEL_LABELS[listing.fuel_type] || listing.fuel_type} />
                <Spec icon={Settings2} label="Transmission" value={TRANSMISSION_LABELS[listing.transmission] || listing.transmission} />
                <Spec icon={Users} label="Owners" value={`${listing.owner_count}`} />
                <Spec icon={Truck} label="Body Type" value={listing.body_type.replace('_', ' ').toUpperCase()} />
              </div>
            </div>

            {/* Detailed Specs (From JSONB) */}
            {Object.keys(specs).length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-4 border-b border-stone-200 pb-2">Technical Details</h3>
                <div className="grid grid-cols-2 gap-4 bg-white border border-stone-200 p-5 rounded-xl">
                  {specs.engine && <DetailRow label="Engine" value={specs.engine} icon={Activity} />}
                  {specs.power && <DetailRow label="Max Power" value={specs.power} icon={Zap} />}
                  {specs.torque && <DetailRow label="Max Torque" value={specs.torque} icon={Settings2} />}
                  {specs.mileage && <DetailRow label="Claimed Mileage" value={specs.mileage} icon={Gauge} />}
                  {specs.drivetrain && <DetailRow label="Drivetrain" value={specs.drivetrain} icon={Truck} />}
                  {specs.ground_clearance && <DetailRow label="Ground Clearance" value={specs.ground_clearance} icon={Ruler} />}
                </div>
              </div>
            )}

            {/* Vehicle Verification, History & RTO (Indian Context) */}
            {(specs.registration_number || specs.public_registration_number || specs.insurance_status || specs.hypothecation_status || specs.service_history || specs.accident_history || specs.tyre_condition || specs.keys_count || specs.overall_condition || specs.rto_city || listing.registration_state) && (
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                      Vehicle History, Condition & RTO
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    Indian Market Specs
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Registration Number / Indian Plate */}
                  {(specs.registration_number || specs.public_registration_number || listing.registration_state) && (
                    <div className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200/70">
                      <div className="p-2 bg-white rounded-lg border border-stone-200 text-stone-700">
                        <FileText className="w-4 h-4 text-blue-700" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 font-medium">Registration Plate</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-sm font-bold tracking-wider text-stone-900 bg-white px-2.5 py-0.5 rounded border border-stone-300">
                            {specs.public_registration_number || specs.registration_number || `${listing.registration_state || "IN"} RTO`}
                          </span>
                          {specs.masked_registration && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-stone-500">
                              <Lock className="w-3 h-3 text-blue-600" /> Masked for privacy
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* RTO Location */}
                  {(specs.rto_city || listing.registration_state || specs.registration_state) && (
                    <div className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200/70">
                      <div className="p-2 bg-white rounded-lg border border-stone-200 text-stone-700">
                        <MapPin className="w-4 h-4 text-blue-700" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 font-medium">RTO & State</p>
                        <p className="text-sm font-bold text-stone-900 mt-0.5">
                          {specs.rto_city ? `${specs.rto_city}, ` : ""}{specs.registration_state || listing.registration_state || listing.city}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Insurance Status */}
                  {specs.insurance_status && (
                    <div className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200/70">
                      <div className="p-2 bg-white rounded-lg border border-stone-200 text-stone-700">
                        <Shield className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 font-medium">Insurance Status</p>
                        <p className="text-sm font-bold text-stone-900 mt-0.5">
                          {INSURANCE_LABELS[specs.insurance_status] || specs.insurance_status}
                          {specs.insurance_expiry ? ` • ${specs.insurance_expiry}` : ""}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Hypothecation / Loan */}
                  {specs.hypothecation_status && (
                    <div className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200/70">
                      <div className="p-2 bg-white rounded-lg border border-stone-200 text-stone-700">
                        <Lock className="w-4 h-4 text-blue-700" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 font-medium">Hypothecation / Loan</p>
                        <p className="text-sm font-bold text-stone-900 mt-0.5">
                          {HYPOTHECATION_LABELS[specs.hypothecation_status] || specs.hypothecation_status}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Service History */}
                  {specs.service_history && (
                    <div className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200/70">
                      <div className="p-2 bg-white rounded-lg border border-stone-200 text-stone-700">
                        <Wrench className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 font-medium">Service History</p>
                        <p className="text-sm font-bold text-stone-900 mt-0.5">
                          {SERVICE_HISTORY_LABELS[specs.service_history] || specs.service_history}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Accident History */}
                  {specs.accident_history && (
                    <div className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200/70">
                      <div className="p-2 bg-white rounded-lg border border-stone-200 text-stone-700">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 font-medium">Accident / Damage History</p>
                        <p className="text-sm font-bold text-stone-900 mt-0.5">
                          {ACCIDENT_LABELS[specs.accident_history] || specs.accident_history}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tyre Condition */}
                  {specs.tyre_condition && (
                    <div className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200/70">
                      <div className="p-2 bg-white rounded-lg border border-stone-200 text-stone-700">
                        <Gauge className="w-4 h-4 text-stone-700" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 font-medium">Tyre Condition</p>
                        <p className="text-sm font-bold text-stone-900 mt-0.5">
                          {TYRE_LABELS[specs.tyre_condition] || specs.tyre_condition}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Keys & Overall Condition */}
                  {(specs.keys_count || specs.overall_condition) && (
                    <div className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200/70">
                      <div className="p-2 bg-white rounded-lg border border-stone-200 text-stone-700">
                        <Key className="w-4 h-4 text-blue-700" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 font-medium">Keys & Overall State</p>
                        <p className="text-sm font-bold text-stone-900 mt-0.5">
                          {[
                            specs.keys_count ? (KEYS_LABELS[specs.keys_count] || specs.keys_count) : null,
                            specs.overall_condition ? (CONDITION_LABELS[specs.overall_condition] || specs.overall_condition) : null,
                          ].filter(Boolean).join(" • ")}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Inspection Location */}
                  {(specs.inspection_locality || listing.address) && (
                    <div className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200/70 md:col-span-2">
                      <div className="p-2 bg-white rounded-lg border border-stone-200 text-stone-700">
                        <MapPin className="w-4 h-4 text-blue-700" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 font-medium">Inspection Availability & Location</p>
                        <p className="text-sm font-semibold text-stone-900 mt-0.5">
                          {specs.inspection_locality || listing.address}, {listing.city} {listing.pincode ? `- ${listing.pincode}` : ""}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 200-Point Inspection Report */}
            <InspectionReportSection specs={specs} brand={listing.brand} model={listing.model} />

            {/* Premium Features */}
            {listing.features.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-4 border-b border-stone-200 pb-2">Premium Features</h3>
                <div className="flex flex-wrap gap-2.5">
                  {listing.features.map((f) => (
                    <span key={f.id} className="rounded bg-stone-100 border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-blue-600" />
                      {f.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Key Highlights */}
            <div className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-4 border-b border-stone-200 pb-2">Key Highlights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-900">Certified Quality</p>
                    <p className="text-xs text-stone-500">Passed 140-point inspection</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-900">Non-Accidental</p>
                    <p className="text-xs text-stone-500">No structural damage</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pros & Considerations */}
            <div className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-4 border-b border-stone-200 pb-2">Pros & Considerations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-3 flex items-center gap-1.5"><CheckCircle2 size={14}/> Pros</p>
                  <ul className="text-sm text-blue-900 space-y-2 list-disc pl-4">
                    <li>Excellent fuel economy for city driving</li>
                    <li>Highly reliable {listing.brand} engine</li>
                    <li>Low maintenance costs</li>
                    <li>Compact footprint, easy to park</li>
                  </ul>
                </div>
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-3 flex items-center gap-1.5"><RotateCcw size={14}/> Considerations</p>
                  <ul className="text-sm text-blue-900 space-y-2 list-disc pl-4">
                    <li>Limited rear legroom</li>
                    <li>Basic infotainment system</li>
                    <li>Firm suspension ride over bumps</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Estimated Ownership Cost */}
            <div className="mt-8 bg-stone-50 border border-stone-200 p-5 rounded-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-4">Estimated Ownership Cost</h3>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex-1">
                  <p className="text-xs text-stone-500 mb-1">Fuel / Month (assuming 1000km)</p>
                  <p className="text-lg font-bold text-stone-900">{formatINR((1000 / 15) * (listing.fuel_type === 'petrol' ? 100 : 90))}</p>
                </div>
                <div className="h-8 w-px bg-stone-200 hidden sm:block"></div>
                <div className="flex-1">
                  <p className="text-xs text-stone-500 mb-1">Yearly Maintenance</p>
                  <p className="text-lg font-bold text-stone-900">{formatINR(Number(listing.price) * 0.015)}</p>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-4 border-b border-stone-200 pb-2">Price Breakdown Estimate</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Ex-Showroom Price (Approx)</span>
                  <span className="font-semibold text-stone-900">{formatINR(Number(listing.price) * 0.85)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">RTO & Registration</span>
                  <span className="font-semibold text-stone-900">{formatINR(Number(listing.price) * 0.10)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Insurance</span>
                  <span className="font-semibold text-stone-900">{formatINR(Number(listing.price) * 0.05)}</span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t border-stone-200 font-bold">
                  <span className="text-stone-900">Total On-Road Price</span>
                  <span className="text-stone-900">{formatINR(Number(listing.price))}</span>
                </div>
              </div>
            </div>

            {listing.description && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-4 border-b border-stone-200 pb-2">Vehicle Overview</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-600 font-light">{listing.description}</p>
              </div>
            )}

            {/* Report Actions */}
            {!user ? (
              <button onClick={() => setAuthOpen(true)} className="mt-8 flex items-center gap-1.5 text-xs font-semibold text-stone-400 hover:text-blue-700 transition-colors cursor-pointer">
                <Flag size={14} /> Report this listing
              </button>
            ) : !isOwnListing ? (
              <button onClick={() => setReportOpen((v) => !v)} className="mt-8 flex items-center gap-1.5 text-xs font-semibold text-stone-400 hover:text-blue-700 transition-colors cursor-pointer">
                <Flag size={14} /> Report this listing
              </button>
            ) : null}
            
            {reportOpen && !reportSent && (
              <div className="mt-3 flex gap-2">
                <input value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="What's wrong with this listing?" className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 text-sm focus:border-blue-600 focus:outline-none" />
                <button onClick={handleReport} className="rounded-lg bg-stone-900 text-white px-4 py-2 text-sm font-bold uppercase tracking-wider shadow-md">Send</button>
              </div>
            )}
            {reportSent && <p className="mt-3 text-xs text-blue-700 font-medium">Thanks - our team will take a look.</p>}
          </div>

          {/* Right Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
            
            {/* Pricing & Booking Card */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1">Buy Now</p>
                  <p className="text-3xl font-bold text-stone-900">{formatINR(Number(listing.price))}</p>
                  <p className="text-xs text-stone-500 font-medium mt-1">Fixed Price • Zero Hidden Charges</p>
                </div>
                {!user ? (
                  <button onClick={() => setAuthOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-400 hover:text-red-500 hover:border-red-500 transition-all shadow-sm cursor-pointer">
                    <Heart size={18} />
                  </button>
                ) : user.role === "buyer" ? (
                  <button onClick={() => toggleFavourite.mutate({ id: listing.id, isFavourited: listing.is_favourited })} className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-400 hover:text-red-500 hover:border-red-500 transition-all shadow-sm cursor-pointer">
                    <Heart size={18} fill={listing.is_favourited ? "#ef4444" : "none"} color={listing.is_favourited ? "#ef4444" : "currentColor"} />
                  </button>
                ) : null}
              </div>

              {/* Seller Info */}
              <div className="py-4 border-b border-stone-100">
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-2">Presented by</p>
                <Link to={`/showroom/${listing.seller.id}`} className="flex items-center justify-between group hover:bg-stone-50 p-2 -mx-2 rounded-lg transition-colors">
                  <div>
                    <p className="text-sm font-bold text-stone-900 group-hover:text-blue-700">{listing.seller.business_name || listing.seller.name}</p>
                    <p className="text-[10px] capitalize text-stone-500 font-medium">{listing.seller.seller_type ?? "seller"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {listing.seller.is_verified && <VerifiedPlate />}
                    {listing.seller.avg_rating && (
                      <span className="flex items-center gap-1 rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-800 shadow-sm">
                        <Star size={10} className="fill-blue-600 text-blue-600" /> {Number(listing.seller.avg_rating).toFixed(1)}
                      </span>
                    )}
                  </div>
                </Link>
                <div className="mt-2 text-xs text-stone-500">
                  <span className="block font-medium">Available at:</span>
                  <span>{listing.city} Showroom</span>
                </div>
              </div>

              {isOwnListing ? (
                <Link to="/dashboard" className="w-full py-3.5 mt-6 bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-xs tracking-wider uppercase rounded-lg border border-stone-200 transition-all text-center block">
                  Manage this listing
                </Link>
              ) : sent ? (
                <p className="mt-6 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800 font-medium">Request sent! A Concierge will contact you shortly.</p>
              ) : (
                <div className="mt-6">
                  {bookingSuccess ? (
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                      <Check className="w-5 h-5 text-blue-600 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-blue-900">Vehicle Reserved</p>
                        <p className="text-xs text-blue-700 mt-1">You have successfully blocked this vehicle. Our team will contact you to finalize the transaction.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 space-y-3">
                      <button
                        onClick={() => setBookingOpen(true)}
                        className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2"
                      >
                        <ShieldCheck className="w-5 h-5" />
                        Block this Car @ ₹999
                      </button>
                      <p className="text-[11px] text-stone-500 text-center flex items-center justify-center gap-1">
                        <Check className="w-3 h-3" /> Fully refundable. Reserve for 48 hours.
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (!user) setAuthOpen(true);
                            else setTestDriveOpen(true);
                          }}
                          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold py-2.5 px-3 rounded-xl transition-all flex justify-center items-center gap-1.5 text-xs uppercase tracking-wider"
                        >
                          <Calendar className="w-3.5 h-3.5 text-blue-700" />
                          Test Drive
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!user) setAuthOpen(true);
                            else setOfferOpen(true);
                          }}
                          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold py-2.5 px-3 rounded-xl transition-all flex justify-center items-center gap-1.5 text-xs uppercase tracking-wider"
                        >
                          <Tag className="w-3.5 h-3.5 text-blue-700" />
                          Make Offer
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">Or Enquire First</p>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Hi, I'm interested in viewing or purchasing this vehicle."
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm focus:border-blue-600 focus:outline-none custom-scrollbar resize-none"
                  />
                  {!user ? (
                    <button
                      onClick={() => setAuthOpen(true)}
                      className="w-full py-3.5 mt-3 bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-xs tracking-wider uppercase rounded-lg shadow-lg shadow-blue-950/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Sign In to Contact Seller</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleEnquiry}
                      disabled={createEnquiry.isPending || !message.trim()}
                      className="w-full py-3.5 mt-3 bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-xs tracking-wider uppercase rounded-lg shadow-lg shadow-stone-950/20 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {createEnquiry.isPending ? "Sending..." : "Contact Concierge"}
                    </button>
                  )}
                  {createEnquiry.isError && (
                    <p className="mt-3 text-xs text-red-600 font-medium">
                      {createEnquiry.error instanceof ApiError ? createEnquiry.error.message : "Couldn't send your message."}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (!user) setAuthOpen(true);
                      else setSupportOpen(true);
                    }}
                    className="w-full mt-3 py-2 text-stone-500 hover:text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-t border-stone-100 pt-3"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
                    Need help? Open support ticket
                  </button>
                </div>
              )}
            </div>

            {/* EMI Calculator Widget */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="w-4 h-4 text-blue-700" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">EMI Calculator</h3>
              </div>
              
              <div className="mb-6 pb-6 border-b border-stone-100 text-center">
                <p className="text-2xl font-black text-stone-900">{formatINR(emiCalculation.emi)}<span className="text-xs text-stone-400 font-medium ml-1">/ month</span></p>
                <p className="text-xs text-stone-500 mt-1">Loan Amount: {formatINR(emiCalculation.loanAmount)}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-bold text-stone-600">Downpayment</label>
                    <span className="text-xs font-bold text-stone-900">{emiDownpayment}%</span>
                  </div>
                  <input type="range" min="0" max="80" step="5" value={emiDownpayment} onChange={(e) => setEmiDownpayment(Number(e.target.value))} className="w-full accent-blue-600" />
                  <p className="text-[10px] text-stone-400 mt-1 text-right">{formatINR((emiDownpayment / 100) * Number(listing.price))}</p>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-bold text-stone-600">Tenure</label>
                    <span className="text-xs font-bold text-stone-900">{emiTenure / 12} Years</span>
                  </div>
                  <div className="flex gap-2">
                    {[12, 24, 36, 48, 60, 72].map((months) => (
                      <button key={months} onClick={() => setEmiTenure(months)} className={`flex-1 py-1.5 text-[10px] font-bold rounded border transition-colors ${emiTenure === months ? "border-blue-600 bg-blue-50 text-blue-700" : "border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300"}`}>
                        {months / 12}Y
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="pt-2">
                  <p className="text-[10px] text-stone-400 leading-relaxed">*Estimated EMI calculated at {emiInterest}% p.a. Final interest rates are subject to credit profile and bank policies.</p>
                </div>
              </div>
            </div>

              {/* Total Cost of Ownership (TCO) Widget */}
              <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">Est. Running Cost</h3>
                  </div>
                </div>

                <div className="mb-6 pb-6 border-b border-stone-100 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black text-stone-900">{formatINR(totalMonthlyCost)}<span className="text-xs text-stone-400 font-medium ml-1">/ mo</span></p>
                    <p className="text-[10px] text-stone-500 mt-1 uppercase tracking-widest font-bold">Total Estimated Cost</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-stone-900">{formatINR(totalMonthlyCost * 12)}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">per year</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                        {listing.fuel_type === "electric" ? <Zap size={12} className="text-blue-600" /> : <Flame size={12} className="text-blue-600" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-800">Fuel & Energy</p>
                        <p className="text-[10px] text-stone-400">{monthlyDistance} km/month</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-stone-900">{formatINR(monthlyFuelCost)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                        <Settings2 size={12} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-800">Maintenance</p>
                        <p className="text-[10px] text-stone-400">Routine service</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-stone-900">{formatINR(monthlyMaintenance)}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-stone-100">
                  <p className="text-[10px] text-stone-400 leading-relaxed">
                    *Estimated using average city mileage ({numericMileage} {listing.fuel_type === 'electric' ? 'km/kWh' : 'kmpl'}) and current fuel prices. Does not include insurance or depreciation.
                  </p>
                </div>
              </div>

            </aside>
        </div>

        {/* Similar Cars Section */}
        <div className="mt-16 border-t border-stone-200 pt-10 pb-8">
          <SimilarListings 
            brand={listing.brand} 
            currentId={listing.id}
          />
        </div>

      </div>

      {authOpen && (
        <AuthModal mode="login" onClose={() => setAuthOpen(false)} onSwitchMode={() => {}} onSuccess={() => setAuthOpen(false)} />
      )}

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onSuccess={() => {
          setBookingOpen(false);
          setBookingSuccess(true);
        }}
        brand={listing.brand}
        model={listing.model}
        listingId={listing.id}
      />

      <Viewer360
        isOpen={viewer360Open}
        onClose={() => setViewer360Open(false)}
        brand={listing.brand}
        model={listing.model}
      />

      <TestDriveModal
        isOpen={testDriveOpen}
        onClose={() => setTestDriveOpen(false)}
        listingId={listing.id}
        listingTitle={listing.title}
        city={listing.city}
      />

      <OfferModal
        isOpen={offerOpen}
        onClose={() => setOfferOpen(false)}
        listingId={listing.id}
        listingTitle={listing.title}
        listingPrice={Number(listing.price)}
      />

      <SupportModal
        isOpen={supportOpen}
        onClose={() => setSupportOpen(false)}
        listingId={listing.id}
        listingTitle={listing.title}
        defaultCategory="vehicle"
      />
    </div>
  );
}

function Spec({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-stone-50 border border-stone-100 px-4 py-3">
      <Icon size={20} className="shrink-0 text-blue-600" />
      <div>
        <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">{label}</p>
        <p className="font-mono text-sm font-bold text-stone-800">{value}</p>
      </div>
    </div>
  );
}

function DetailRow({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center border border-stone-100">
        <Icon size={14} className="text-stone-400" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{label}</p>
        <p className="text-xs font-bold text-stone-800">{value}</p>
      </div>
    </div>
  );
}
