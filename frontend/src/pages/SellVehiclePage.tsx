import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Camera, Car, FileText, CheckCircle2, Lock, Eye, EyeOff, Wrench, Key, MapPin, Sparkles, AlertCircle, Info } from "lucide-react";
import { useAuth } from "../lib/auth";
import { useCreateListing } from "../hooks/useListings";
import { useMyVerification, useSubmitVerification } from "../hooks/useSeller";
import { ApiError } from "../lib/api/client";
import { ErrorNote, LoadingBlock } from "../components/ui";
import { AuthModal } from "../components/AuthModal";
import type { BodyType, FuelType, Transmission } from "../types";

const BODY_TYPES: BodyType[] = ["hatchback", "sedan", "suv", "muv_mpv", "coupe", "convertible", "pickup_truck", "van", "other"];
const FUEL_TYPES: FuelType[] = ["petrol", "diesel", "electric", "cng", "hybrid"];
const TRANSMISSIONS: Transmission[] = ["manual", "automatic", "amt", "cvt"];

const INDIAN_STATES = [
  "Delhi (NCR)", "Maharashtra", "Uttar Pradesh", "Karnataka", "Haryana",
  "Tamil Nadu", "Telangana", "Gujarat", "Rajasthan", "Punjab",
  "West Bengal", "Kerala", "Madhya Pradesh", "Andhra Pradesh", "Bihar",
  "Chandigarh", "Goa", "Himachal Pradesh", "Jharkhand", "Odisha",
  "Uttarakhand", "Puducherry", "Other State / UT"
];

const INSURANCE_STATUS_OPTIONS = [
  { value: "comprehensive", label: "Comprehensive Insurance" },
  { value: "zero_dep", label: "Zero Depreciation (Bumper to Bumper)" },
  { value: "third_party", label: "Third Party Only" },
  { value: "expired", label: "Expired / Needs Renewal" },
];

const SERVICE_HISTORY_OPTIONS = [
  { value: "full_authorized", label: "Full Authorized Brand Center History" },
  { value: "partial_authorized", label: "Partial Authorized Center Record" },
  { value: "independent_specialist", label: "Regular Multi-brand / Independent Garage" },
  { value: "self_maintained", label: "Self / Local Garage Maintained" },
  { value: "not_available", label: "No Service Records" },
];

const ACCIDENT_HISTORY_OPTIONS = [
  { value: "clean", label: "100% Clean / Never in an Accident" },
  { value: "minor_scratches_repaired", label: "Minor Bumper / Cosmetic Paintwork Only" },
  { value: "panel_replaced", label: "Minor Panel Replacement (Fender/Door)" },
  { value: "structural_repaired", label: "Major Repair / Structural Work" },
];

const HYPOTHECATION_OPTIONS = [
  { value: "none", label: "No Loan / Clear Title" },
  { value: "active_loan", label: "Active Bank Loan (Hypothecated)" },
  { value: "noc_available", label: "Loan Paid Off / Bank NOC Ready" },
];

const KEYS_OPTIONS = [
  { value: "2_keys", label: "2 Original Remote Keys" },
  { value: "1_key", label: "1 Original Key" },
  { value: "duplicate", label: "Duplicate / Replaced Key" },
];

const TYRE_OPTIONS = [
  { value: "new", label: "Brand New (>90% Tread)" },
  { value: "good", label: "Good (60% – 90% Tread Remaining)" },
  { value: "average", label: "Average (30% – 60% Tread Remaining)" },
  { value: "needs_replacement", label: "Needs Replacement Soon (<30% Tread)" },
];

const OVERALL_CONDITION_OPTIONS = [
  { value: "mint", label: "Mint / Showroom Condition" },
  { value: "excellent", label: "Excellent (Very Well Maintained)" },
  { value: "good", label: "Good (Normal Age-Appropriate Wear)" },
  { value: "fair", label: "Fair (Needs Minor Work)" },
];

function getMaskedRegNumber(reg: string) {
  const clean = reg.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (clean.length < 5) return reg.toUpperCase();
  const stateCode = clean.slice(0, 2);
  const rtoNum = clean.slice(2, 4);
  const lastTwo = clean.slice(-2);
  return `${stateCode} ${rtoNum} ** **${lastTwo}`;
}

export function SellVehiclePage() {
  const { user, isLoading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  if (isLoading) return <LoadingBlock />;

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-ink">Sign in to list your vehicle</h1>
        <p className="mt-2 text-sm text-slate">Create a free account to post your car for sale.</p>
        <button onClick={() => setAuthOpen(true)} className="qz-btn-primary mt-6 rounded-lg px-6 py-2.5 text-sm font-semibold">Sign up / Log in</button>
        {authOpen && <AuthModal mode="signup" onClose={() => setAuthOpen(false)} onSwitchMode={() => {}} />}
      </div>
    );
  }

  if (user.role === "buyer") return <BecomeASellerFlow />;

  return <ListingForm />;
}

function BecomeASellerFlow() {
  const { data: verification, isLoading } = useMyVerification();
  const submit = useSubmitVerification();
  const [sellerType, setSellerType] = useState<"individual" | "dealer">("individual");
  const [idType, setIdType] = useState("Aadhaar");
  const [idNumber, setIdNumber] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <LoadingBlock />;

  if (verification?.status === "pending") {
    return (
      <StatusMessage
        title="Your verification is under review"
        body="Our team typically reviews new sellers within a couple of business days. We'll notify you once it's approved."
      />
    );
  }

  const submitForm = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await submit.mutateAsync({
        participant_type: sellerType,
        identification_type: idType,
        identification_number: idNumber,
        document_url: documentUrl || "https://example.com/placeholder-id-document.pdf",
        business_name: sellerType === "dealer" ? businessName : undefined,
        gst_number: sellerType === "dealer" ? gstNumber : undefined,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't submit your verification. Please try again.");
    }
  };

  if (submit.isSuccess) {
    return <StatusMessage title="Verification submitted" body="We'll review your details and notify you once you're approved to list vehicles." />;
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ignition-100 text-ignition-600"><ShieldCheck size={22} /></span>
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Become a verified seller</h1>
          <p className="text-sm text-slate">Trust matters — verify once, then list as many vehicles as you like.</p>
        </div>
      </div>

      {verification?.status === "rejected" && (
        <div className="mb-4 rounded-lg border border-ember-200 bg-ember-50 px-4 py-3 text-sm text-ember-700">
          Your previous application needs changes: {verification.rejection_reason}
        </div>
      )}

      <form onSubmit={submitForm} className="qz-card flex flex-col gap-4 p-6">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate">I'm selling as</label>
          <div className="flex gap-2">
            {(["individual", "dealer"] as const).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setSellerType(t)}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold capitalize ${sellerType === t ? "border-ignition-500 bg-ignition-500 text-white" : "border-fog text-ink"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">ID type</label>
            <select value={idType} onChange={(e) => setIdType(e.target.value)} className="qz-input w-full px-3 py-2 text-sm">
              <option>Aadhaar</option>
              <option>PAN</option>
              <option>Driving Licence</option>
              <option>Passport</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">ID number</label>
            <input required value={idNumber} onChange={(e) => setIdNumber(e.target.value)} className="qz-input w-full px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate">Upload ID Photo (Aadhaar / PAN)</label>
          <div className="relative mt-1 flex justify-center rounded-xl border-2 border-dashed border-stone-300 px-6 py-6 overflow-hidden bg-stone-50 hover:bg-stone-100 transition-colors">
            <div className="text-center">
              <Camera className="mx-auto h-8 w-8 text-stone-400" aria-hidden="true" />
              <div className="mt-2 flex text-xs text-stone-600 justify-center">
                <label className="relative cursor-pointer rounded-md font-semibold text-blue-600 focus-within:outline-none hover:text-blue-700">
                  <span>Upload a file</span>
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setDocumentUrl(URL.createObjectURL(e.target.files[0]));
                    }
                  }} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-[10px] text-stone-500 mt-1 max-w-[200px] mx-auto break-words">
                {documentUrl && documentUrl.startsWith('blob:') ? "File selected ✓" : "PNG, JPG up to 5MB"}
              </p>
            </div>
          </div>
        </div>

        {sellerType === "dealer" && (
          <>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Business / dealership name</label>
              <input required value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="qz-input w-full px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">GST number (optional)</label>
              <input value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} className="qz-input w-full px-3 py-2 text-sm" />
            </div>
          </>
        )}

        {error && <ErrorNote message={error} />}

        <button type="submit" disabled={submit.isPending} className="qz-btn-primary rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60">
          {submit.isPending ? "Submitting…" : "Submit for verification"}
        </button>
      </form>
    </div>
  );
}

function StatusMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ignition-100 text-ignition-600"><ShieldCheck size={26} /></span>
      <h1 className="font-display text-xl font-bold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-slate">{body}</p>
    </div>
  );
}

function ListingForm() {
  const navigate = useNavigate();
  const createListing = useCreateListing();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    brand: "",
    model: "",
    variant: "",
    year: new Date().getFullYear(),
    body_type: "suv" as BodyType,
    fuel_type: "petrol" as FuelType,
    transmission: "automatic" as Transmission,
    km_driven: 25000,
    owner_count: 1,
    color: "",
    price: 0,
    
    // Indian used car structured fields
    registration_number: "",
    mask_registration: true,
    registration_state: "Uttar Pradesh",
    rto_city: "",
    insurance_status: "comprehensive",
    insurance_expiry: "",
    hypothecation_status: "none",
    overall_condition: "excellent",
    service_history: "full_authorized",
    accident_history: "clean",
    tyre_condition: "good",
    keys_count: "2_keys",
    
    // Location & Inspection
    city: "Lucknow Hub (Pan-India)",
    inspection_locality: "",
    pincode: "",
    
    // Features & Description
    featuresText: "",
    description: "",
  });

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const handleAutoTitle = () => {
    const parts = [form.year, form.brand, form.model, form.variant].filter(Boolean);
    if (parts.length > 0) {
      set({ title: parts.join(" ") });
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const maskedReg = form.mask_registration && form.registration_number
        ? getMaskedRegNumber(form.registration_number)
        : form.registration_number.toUpperCase().trim();

      const specifications: Record<string, any> = {
        registration_number: form.registration_number.toUpperCase().trim(),
        masked_registration: form.mask_registration,
        public_registration_number: maskedReg,
        registration_state: form.registration_state,
        rto_city: form.rto_city.trim(),
        insurance_status: form.insurance_status,
        insurance_expiry: form.insurance_expiry.trim(),
        hypothecation_status: form.hypothecation_status,
        overall_condition: form.overall_condition,
        service_history: form.service_history,
        accident_history: form.accident_history,
        tyre_condition: form.tyre_condition,
        keys_count: form.keys_count,
        inspection_locality: form.inspection_locality.trim(),
      };

      const listing = await createListing.mutateAsync({
        title: form.title,
        description: form.description ? form.description.trim() : undefined,
        brand: form.brand,
        model: form.model,
        variant: form.variant || undefined,
        year: form.year,
        body_type: form.body_type,
        fuel_type: form.fuel_type,
        transmission: form.transmission,
        km_driven: form.km_driven,
        owner_count: form.owner_count,
        color: form.color || undefined,
        price: form.price,
        city: form.city,
        state: form.registration_state || undefined,
        registration_state: form.registration_state || undefined,
        address: form.inspection_locality || undefined,
        pincode: form.pincode || undefined,
        features: form.featuresText ? form.featuresText.split(",").map((f) => f.trim()).filter(Boolean) : [],
        specifications,
      });

      navigate(`/cars/${listing.slug}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't post your listing. Please check the form and try again.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Sell Your Vehicle</h1>
        <p className="mt-1 text-sm text-slate">
          Provide structured Indian marketplace details to help verified buyers inspect, evaluate, and purchase your car faster.
        </p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-6">
        {/* Section 1: Vehicle Identity & Pricing */}
        <div className="qz-card p-6">
          <div className="mb-4 flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-blue-600" />
              <h2 className="font-display text-base font-bold text-stone-900">1. Vehicle Identity & Price</h2>
            </div>
            {(!form.title || form.title.length < 3) && (
              <button
                type="button"
                onClick={handleAutoTitle}
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors"
              >
                Auto-generate Title
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <Field label="Listing Title" hint="What buyers see first">
              <input
                required
                value={form.title}
                onChange={(e) => set({ title: e.target.value })}
                placeholder="e.g. 2022 Hyundai Creta SX(O) Automatic"
                className="qz-input w-full px-3 py-2 text-sm"
              />
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Brand / Make">
                <input
                  required
                  value={form.brand}
                  onChange={(e) => set({ brand: e.target.value })}
                  placeholder="e.g. Hyundai, Honda, BMW"
                  className="qz-input w-full px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Model">
                <input
                  required
                  value={form.model}
                  onChange={(e) => set({ model: e.target.value })}
                  placeholder="e.g. Creta, City, 3 Series"
                  className="qz-input w-full px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Variant / Trim (Optional)">
                <input
                  value={form.variant}
                  onChange={(e) => set({ variant: e.target.value })}
                  placeholder="e.g. SX(O), ZX, Luxury Line"
                  className="qz-input w-full px-3 py-2 text-sm"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Manufacturing / Registration Year">
                <input
                  required
                  type="number"
                  min={1990}
                  max={new Date().getFullYear() + 1}
                  value={form.year}
                  onChange={(e) => set({ year: Number(e.target.value) })}
                  className="qz-input w-full px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Asking Price (₹ INR)">
                <input
                  required
                  type="number"
                  min={10000}
                  step={5000}
                  value={form.price || ""}
                  onChange={(e) => set({ price: Number(e.target.value) })}
                  placeholder="e.g. 1450000"
                  className="qz-input w-full px-3 py-2 text-sm font-semibold text-stone-900"
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Section 2: Technical Specifications */}
        <div className="qz-card p-6">
          <div className="mb-4 flex items-center gap-2 pb-3 border-b border-stone-100">
            <Wrench className="h-5 w-5 text-blue-600" />
            <h2 className="font-display text-base font-bold text-stone-900">2. Technical & Driving Specs</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Body Type">
              <select
                value={form.body_type}
                onChange={(e) => set({ body_type: e.target.value as BodyType })}
                className="qz-input w-full px-3 py-2 text-sm capitalize"
              >
                {BODY_TYPES.map((b) => (
                  <option key={b} value={b}>{b.replace("_", "/")}</option>
                ))}
              </select>
            </Field>

            <Field label="Fuel Type">
              <select
                value={form.fuel_type}
                onChange={(e) => set({ fuel_type: e.target.value as FuelType })}
                className="qz-input w-full px-3 py-2 text-sm capitalize"
              >
                {FUEL_TYPES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </Field>

            <Field label="Transmission">
              <select
                value={form.transmission}
                onChange={(e) => set({ transmission: e.target.value as Transmission })}
                className="qz-input w-full px-3 py-2 text-sm uppercase"
              >
                {TRANSMISSIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-4">
            <Field label="Kilometers Driven (Km)">
              <input
                required
                type="number"
                min={0}
                value={form.km_driven}
                onChange={(e) => set({ km_driven: Number(e.target.value) })}
                className="qz-input w-full px-3 py-2 text-sm"
              />
            </Field>

            <Field label="Number of Previous Owners">
              <select
                value={form.owner_count}
                onChange={(e) => set({ owner_count: Number(e.target.value) })}
                className="qz-input w-full px-3 py-2 text-sm"
              >
                <option value={1}>1st Owner (Single Handed)</option>
                <option value={2}>2nd Owner</option>
                <option value={3}>3rd Owner</option>
                <option value={4}>4th+ Owner</option>
              </select>
            </Field>

            <Field label="Exterior Color">
              <input
                value={form.color}
                onChange={(e) => set({ color: e.target.value })}
                placeholder="e.g. Polar White, Phantom Black"
                className="qz-input w-full px-3 py-2 text-sm"
              />
            </Field>
          </div>
        </div>

        {/* Section 3: Registration & RTO (Indian Marketplace Standards) */}
        <div className="qz-card p-6">
          <div className="mb-4 flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="font-display text-base font-bold text-stone-900">3. Registration & RTO Details (India)</h2>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              High Trust Field
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Registration Number" hint="e.g. DL 01 AB 1234, UP 32 AZ 5678">
                <input
                  required
                  value={form.registration_number}
                  onChange={(e) => set({ registration_number: e.target.value.toUpperCase() })}
                  placeholder="e.g. UP 32 AB 1234"
                  className="qz-input w-full px-3 py-2 text-sm font-mono tracking-wider uppercase font-semibold text-stone-900"
                />
              </Field>

              <Field label="Registration / RTO State">
                <select
                  value={form.registration_state}
                  onChange={(e) => set({ registration_state: e.target.value })}
                  className="qz-input w-full px-3 py-2 text-sm"
                >
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="RTO Office / District" hint="e.g. Lucknow (UP-32), South Delhi (DL-03), Mumbai West (MH-02)">
                <input
                  value={form.rto_city}
                  onChange={(e) => set({ rto_city: e.target.value })}
                  placeholder="e.g. Lucknow RTO (UP-32)"
                  className="qz-input w-full px-3 py-2 text-sm"
                />
              </Field>

              {/* Privacy Masking Toggle */}
              <div className="flex flex-col justify-end">
                <label className="flex items-start gap-3 p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.mask_registration}
                    onChange={(e) => set({ mask_registration: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-stone-900 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-700" />
                      Mask plate number on public listing (Recommended)
                    </span>
                    <p className="text-stone-600 mt-0.5">
                      Protects your vehicle from spam & scrapers. Serious buyers will verify full details during inspection.
                    </p>
                    {form.mask_registration && form.registration_number && (
                      <p className="mt-1 font-mono font-bold text-blue-800 bg-white/80 px-2 py-0.5 rounded border border-blue-200 inline-block">
                        Public preview: {getMaskedRegNumber(form.registration_number)}
                      </p>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Insurance & Financial Status */}
        <div className="qz-card p-6">
          <div className="mb-4 flex items-center gap-2 pb-3 border-b border-stone-100">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <h2 className="font-display text-base font-bold text-stone-900">4. Insurance & Financial Status</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Insurance Status">
              <select
                value={form.insurance_status}
                onChange={(e) => set({ insurance_status: e.target.value })}
                className="qz-input w-full px-3 py-2 text-sm"
              >
                {INSURANCE_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Insurance Expiry (Month / Year)" hint="e.g. November 2026 or Valid till 11/26">
              <input
                value={form.insurance_expiry}
                onChange={(e) => set({ insurance_expiry: e.target.value })}
                placeholder="e.g. Dec 2026"
                className="qz-input w-full px-3 py-2 text-sm"
              />
            </Field>

            <Field label="Existing Loan / Hypothecation">
              <select
                value={form.hypothecation_status}
                onChange={(e) => set({ hypothecation_status: e.target.value })}
                className="qz-input w-full px-3 py-2 text-sm"
              >
                {HYPOTHECATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* Section 5: Vehicle Condition & History */}
        <div className="qz-card p-6">
          <div className="mb-4 flex items-center gap-2 pb-3 border-b border-stone-100">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            <h2 className="font-display text-base font-bold text-stone-900">5. Vehicle Condition & History</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Overall Vehicle Condition">
              <select
                value={form.overall_condition}
                onChange={(e) => set({ overall_condition: e.target.value })}
                className="qz-input w-full px-3 py-2 text-sm"
              >
                {OVERALL_CONDITION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Service History Track Record">
              <select
                value={form.service_history}
                onChange={(e) => set({ service_history: e.target.value })}
                className="qz-input w-full px-3 py-2 text-sm"
              >
                {SERVICE_HISTORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Accident / Major Repair History">
              <select
                value={form.accident_history}
                onChange={(e) => set({ accident_history: e.target.value })}
                className="qz-input w-full px-3 py-2 text-sm"
              >
                {ACCIDENT_HISTORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Tyre Condition">
              <select
                value={form.tyre_condition}
                onChange={(e) => set({ tyre_condition: e.target.value })}
                className="qz-input w-full px-3 py-2 text-sm"
              >
                {TYRE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
            <Field label="Number of Keys">
              <select
                value={form.keys_count}
                onChange={(e) => set({ keys_count: e.target.value })}
                className="qz-input w-full px-3 py-2 text-sm"
              >
                {KEYS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* Section 6: Contact & Inspection Location */}
        <div className="qz-card p-6">
          <div className="mb-4 flex items-center gap-2 pb-3 border-b border-stone-100">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h2 className="font-display text-base font-bold text-stone-900">6. Location & Inspection Availability</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="City / Dispatch Hub">
              <input
                required
                value={form.city}
                onChange={(e) => set({ city: e.target.value })}
                placeholder="e.g. Lucknow Hub (Pan-India), Delhi NCR"
                className="qz-input w-full px-3 py-2 text-sm"
              />
            </Field>

            <Field label="Inspection Locality / Landmark" hint="Where buyers can inspect the vehicle">
              <input
                value={form.inspection_locality}
                onChange={(e) => set({ inspection_locality: e.target.value })}
                placeholder="e.g. Gomti Nagar, Phase 2"
                className="qz-input w-full px-3 py-2 text-sm"
              />
            </Field>

            <Field label="Pincode (Optional)">
              <input
                value={form.pincode}
                onChange={(e) => set({ pincode: e.target.value })}
                placeholder="e.g. 226010"
                className="qz-input w-full px-3 py-2 text-sm"
              />
            </Field>
          </div>
        </div>

        {/* Section 7: Features & Optional Description */}
        <div className="qz-card p-6">
          <div className="mb-4 flex items-center gap-2 pb-3 border-b border-stone-100">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h2 className="font-display text-base font-bold text-stone-900">7. Features & Description</h2>
          </div>

          <div className="flex flex-col gap-4">
            <Field label="Key Features (comma-separated)">
              <input
                value={form.featuresText}
                onChange={(e) => set({ featuresText: e.target.value })}
                placeholder="Sunroof, Ventilated Seats, 360 Camera, Wireless CarPlay, Alloy Wheels"
                className="qz-input w-full px-3 py-2 text-sm"
              />
            </Field>

            <Field label="Description (Optional)" hint="You can leave this blank, or add custom notes about modifications or maintenance.">
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => set({ description: e.target.value })}
                placeholder="Optional: Mention any recent service, new battery, ceramic coating, or warranty package..."
                className="qz-input w-full px-3 py-2 text-sm"
              />
            </Field>
          </div>
        </div>

        {error && <ErrorNote message={error} />}

        <div className="flex flex-col gap-3">
          <p className="text-xs text-stone-500">
            You can upload high-resolution photos and RC inspection documents from your dashboard after posting.
          </p>

          <button
            type="submit"
            disabled={createListing.isPending}
            className="qz-btn-primary rounded-xl py-3 text-base font-bold shadow-md hover:shadow-lg disabled:opacity-60 transition-all cursor-pointer"
          >
            {createListing.isPending ? "Submitting Listing…" : "Post Vehicle for Review"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <label className="block text-xs font-semibold text-stone-700">{label}</label>
        {hint && <span className="text-[11px] text-stone-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
