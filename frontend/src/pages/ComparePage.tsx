import { useState, useMemo, useEffect } from "react";
import { useCompare } from "../context/CompareContext";
import { useListingSearch } from "../hooks/useListings";
import { Link, useSearchParams } from "react-router-dom";
import { listingsApi } from "../lib/api/listings";
import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
  Settings2,
  Trash2,
  Sparkles,
  Wallet,
  ShieldCheck,
  Star,
  Search,
  X,
  MapPin,
  Calendar,
  MessageCircle,
  Phone,
} from "lucide-react";
import { formatINR, formatKm, VerifiedPlate } from "../components/ui";
import { BookingModal } from "../components/luxura/BookingModal";
import { ContactSellerModal } from "../components/ContactSellerModal";
import type { VehicleListing } from "../types";

function calculateEstimatedEMI(price: number): number {
  const loanAmount = price * 0.8;
  const r = 9.5 / 12 / 100;
  const n = 60;
  if (loanAmount <= 0) return 0;
  const emi = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
}

function calculateEstimatedMonthlyFuel(fuelType: string): number {
  const f = fuelType?.toLowerCase() || "petrol";
  const monthlyDistance = 1000;
  if (f === "electric") return monthlyDistance * 1;
  if (f === "diesel") return Math.round((monthlyDistance / 16) * 90);
  if (f === "cng") return Math.round((monthlyDistance / 22) * 75);
  return Math.round((monthlyDistance / 14) * 100);
}

function calculateAnnualMaintenance(bodyType: string, price: number): number {
  if (bodyType?.toLowerCase().includes("suv") || bodyType?.toLowerCase().includes("muv")) {
    return Math.max(15000, Math.round(price * 0.015));
  }
  return Math.max(8000, Math.round(price * 0.012));
}

function valuesDiffer(values: any[]): boolean {
  if (values.length <= 1) return false;
  const first = JSON.stringify(values[0]);
  return values.some((v) => JSON.stringify(v) !== first);
}

export function ComparePage() {
  const { compareList, addToCompare, removeFromCompare, clearCompare } = useCompare();
  const [searchParams] = useSearchParams();

  // Enable highlight differences by default so users immediately see what sets cars apart
  const [highlightDifferences, setHighlightDifferences] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Booking & Contact modal states
  const [bookingCar, setBookingCar] = useState<VehicleListing | null>(null);
  const [contactCar, setContactCar] = useState<VehicleListing | null>(null);

  // Auto-load car from query params (?id= or ?id1= or ?id2=) if not already loaded
  useEffect(() => {
    const ids = [
      searchParams.get("id"),
      searchParams.get("id1"),
      searchParams.get("id2"),
      searchParams.get("id3"),
    ].filter(Boolean) as string[];

    if (ids.length === 0) return;

    ids.forEach(async (id) => {
      const alreadyPresent = compareList.some((c) => c.id === id);
      if (!alreadyPresent) {
        try {
          const car = await listingsApi.getById(id);
          if (car) {
            addToCompare(car);
          }
        } catch (e) {
          console.warn("Failed to auto-load comparison vehicle ID:", id, e);
        }
      }
    });
  }, [searchParams]);

  // Fetch available vehicles to allow selecting and adding
  const { data: listingsData, isLoading: listingsLoading } = useListingSearch({ limit: 40 });

  const availableVehicles = useMemo(() => {
    if (!listingsData?.results) return [];
    return listingsData.results.filter((car) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          car.title.toLowerCase().includes(q) ||
          car.brand.toLowerCase().includes(q) ||
          car.model.toLowerCase().includes(q) ||
          car.city.toLowerCase().includes(q);
        return matchesQuery;
      }
      return true;
    });
  }, [listingsData, searchQuery]);

  const handleSelectCar = (car: VehicleListing) => {
    const success = addToCompare(car);
    if (success && compareList.length + 1 >= 3) {
      setPickerOpen(false);
    }
  };

  // Specifications rows to render
  const specRows = [
    { key: "engine", label: "Engine Capacity" },
    { key: "power", label: "Max Power Output" },
    { key: "torque", label: "Max Torque" },
    { key: "mileage", label: "Claimed Mileage" },
    { key: "drivetrain", label: "Drivetrain" },
    { key: "ground_clearance", label: "Ground Clearance" },
  ];

  const checkIsDiff = (values: any[]) => {
    return highlightDifferences && valuesDiffer(values);
  };

  return (
    <div className="bg-[#FAFAF9] text-stone-900 min-h-screen py-10 sm:py-14 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              to="/cars"
              className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-blue-700 transition-colors mb-3"
            >
              <ArrowLeft size={14} className="mr-2" /> Back to inventory
            </Link>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              Vehicle Comparison Matrix
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Side-by-side specifications, 3-year ownership economics, and inspection records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {compareList.length < 3 && (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-blue-900 text-white hover:bg-blue-950 transition-all shadow-md shadow-blue-950/20 cursor-pointer"
              >
                <Plus size={15} /> Add Vehicle ({compareList.length}/3)
              </button>
            )}

            <button
              type="button"
              onClick={() => setHighlightDifferences(!highlightDifferences)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                highlightDifferences
                  ? "bg-blue-100 border-blue-400 text-blue-950 font-extrabold shadow-xs"
                  : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
            >
              <Sparkles size={14} className={highlightDifferences ? "text-blue-700" : "text-stone-400"} />
              Highlight Differences {highlightDifferences ? "ON" : "OFF"}
            </button>

            {compareList.length > 0 && (
              <button
                type="button"
                onClick={clearCompare}
                className="text-xs font-bold uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors px-3 py-2 cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* EMPTY STATE (When 0 cars are added) */}
        {compareList.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[55vh] bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center shadow-xs">
            <div className="w-18 h-18 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mb-5 border border-blue-100">
              <Settings2 size={36} className="text-blue-700" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-stone-900 mb-2">No Vehicles in Comparison</h2>
            <p className="text-stone-500 mb-8 max-w-md text-sm leading-relaxed">
              Select any 2 or 3 certified pre-owned vehicles to compare price, maintenance costs, technical specs, and verified condition side by side.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="bg-blue-900 hover:bg-blue-950 text-white font-bold uppercase tracking-wider text-xs px-6 py-3.5 rounded-xl transition-all shadow-md shadow-blue-950/20 flex items-center gap-2 cursor-pointer"
              >
                <Plus size={16} /> Choose Vehicles to Compare
              </button>
              <Link
                to="/cars"
                className="bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold uppercase tracking-wider text-xs px-6 py-3.5 rounded-xl transition-all"
              >
                Browse All Cars
              </Link>
            </div>
          </div>
        ) : (
          /* COMPARISON TABLE */
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="w-1/4 min-w-[220px] p-6 border-b border-r border-stone-200 bg-stone-50 align-bottom">
                      <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-900 mb-1">
                        <span>Side-By-Side Matrix</span>
                      </div>
                      <h3 className="text-lg font-bold text-stone-900">Vehicle Comparison</h3>
                      <p className="text-xs text-stone-500 mt-1">Comparing {compareList.length} of 3 vehicle slots</p>
                    </th>

                    {/* Active vehicle headers */}
                    {compareList.map((car) => {
                      const image =
                        car.images?.[0]?.url ||
                        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600";
                      return (
                        <th
                          key={car.id}
                          className="w-1/4 min-w-[260px] p-5 sm:p-6 border-b border-r last:border-r-0 border-stone-200 align-top relative bg-white"
                        >
                          <button
                            type="button"
                            onClick={() => removeFromCompare(car.id)}
                            className="absolute top-4 right-4 p-2 bg-stone-100 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded-full transition-colors cursor-pointer"
                            title="Remove from comparison"
                          >
                            <Trash2 size={15} />
                          </button>

                          <div className="w-full h-44 rounded-xl overflow-hidden bg-stone-100 mb-3 border border-stone-200/80">
                            <img src={image} alt={car.title} className="w-full h-full object-cover" />
                          </div>

                          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-0.5">
                            {car.year} • {car.brand}
                          </div>
                          <h4 className="text-base sm:text-lg font-extrabold text-stone-900 leading-snug mb-1 line-clamp-1">
                            <Link to={`/cars/${car.slug}`} className="hover:text-blue-700 transition-colors">
                              {car.title || car.model}
                            </Link>
                          </h4>

                          <p className="text-xl sm:text-2xl font-black text-stone-900 mb-4">
                            {formatINR(Number(car.price))}
                          </p>

                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => setBookingCar(car)}
                              className="w-full text-center bg-blue-900 text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl hover:bg-blue-950 transition-colors shadow-sm cursor-pointer"
                            >
                              Book @ ₹999 (Refundable)
                            </button>
                            <Link
                              to={`/cars/${car.slug}`}
                              className="w-full text-center bg-stone-100 text-stone-800 text-xs font-bold uppercase tracking-wider py-2 rounded-xl hover:bg-stone-200 transition-colors"
                            >
                              View Inspection
                            </Link>
                          </div>
                        </th>
                      );
                    })}

                    {/* Empty Slots: Clickable to add another vehicle */}
                    {compareList.length < 3 &&
                      Array.from({ length: 3 - compareList.length }).map((_, i) => (
                        <th
                          key={`empty-${i}`}
                          className="w-1/4 min-w-[260px] p-6 border-b border-r last:border-r-0 border-stone-200 align-middle text-center bg-stone-50/40 hover:bg-blue-50/50 transition-all cursor-pointer group"
                          onClick={() => setPickerOpen(true)}
                          title="Click to add another car to comparison"
                        >
                          <div className="flex flex-col items-center justify-center py-10">
                            <div className="w-14 h-14 bg-white rounded-full border-2 border-dashed border-blue-400 group-hover:border-blue-700 flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-all">
                              <Plus size={24} className="text-blue-700" />
                            </div>
                            <p className="text-xs font-extrabold uppercase tracking-wider text-blue-900 group-hover:text-blue-950">
                              + Add Another Vehicle
                            </p>
                            <p className="text-[11px] text-stone-500 mt-1 max-w-[180px]">
                              Click here to pick from certified Indian inventory
                            </p>
                          </div>
                        </th>
                      ))}
                  </tr>
                </thead>

                <tbody className="text-sm">
                  {/* =========================================================================
                      SECTION 1: BASIC VEHICLE SPECS
                      ========================================================================= */}
                  <tr className="bg-stone-100/70">
                    <td
                      colSpan={4}
                      className="p-3.5 font-bold uppercase tracking-wider text-xs text-stone-700 border-b border-stone-200"
                    >
                      1. Core Specifications & History
                    </td>
                  </tr>

                  {/* Body Type */}
                  {(() => {
                    const isDiff = checkIsDiff(compareList.map((c) => c.body_type));
                    return (
                      <tr>
                        <td className={`p-4 font-semibold text-stone-700 border-b border-r border-stone-200 ${isDiff ? "bg-blue-50 text-blue-950 font-bold border-l-4 border-l-blue-600" : ""}`}>
                          <div className="flex items-center justify-between">
                            <span>Body Type</span>
                            {isDiff && <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Different</span>}
                          </div>
                        </td>
                        {compareList.map((c) => (
                          <td key={c.id} className={`p-4 border-b border-r border-stone-200 uppercase font-medium ${isDiff ? "bg-blue-50/40 text-blue-950 font-semibold" : ""}`}>
                            {c.body_type?.replace("_", " ")}
                          </td>
                        ))}
                        {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, i) => (
                          <td key={i} className="border-b border-r border-stone-200 bg-stone-50/20"></td>
                        ))}
                      </tr>
                    );
                  })()}

                  {/* Year */}
                  {(() => {
                    const isDiff = checkIsDiff(compareList.map((c) => c.year));
                    return (
                      <tr>
                        <td className={`p-4 font-semibold text-stone-700 border-b border-r border-stone-200 ${isDiff ? "bg-blue-50 text-blue-950 font-bold border-l-4 border-l-blue-600" : ""}`}>
                          <div className="flex items-center justify-between">
                            <span>Manufacturing Year</span>
                            {isDiff && <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Different</span>}
                          </div>
                        </td>
                        {compareList.map((c) => (
                          <td key={c.id} className={`p-4 border-b border-r border-stone-200 font-medium ${isDiff ? "bg-blue-50/40 text-blue-950 font-semibold" : ""}`}>
                            {c.year}
                          </td>
                        ))}
                        {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, i) => (
                          <td key={i} className="border-b border-r border-stone-200 bg-stone-50/20"></td>
                        ))}
                      </tr>
                    );
                  })()}

                  {/* Fuel Type */}
                  {(() => {
                    const isDiff = checkIsDiff(compareList.map((c) => c.fuel_type));
                    return (
                      <tr>
                        <td className={`p-4 font-semibold text-stone-700 border-b border-r border-stone-200 ${isDiff ? "bg-blue-50 text-blue-950 font-bold border-l-4 border-l-blue-600" : ""}`}>
                          <div className="flex items-center justify-between">
                            <span>Fuel Type</span>
                            {isDiff && <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Different</span>}
                          </div>
                        </td>
                        {compareList.map((c) => (
                          <td key={c.id} className={`p-4 border-b border-r border-stone-200 capitalize font-medium ${isDiff ? "bg-blue-50/40 text-blue-950 font-semibold" : ""}`}>
                            {c.fuel_type}
                          </td>
                        ))}
                        {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, i) => (
                          <td key={i} className="border-b border-r border-stone-200 bg-stone-50/20"></td>
                        ))}
                      </tr>
                    );
                  })()}

                  {/* Transmission */}
                  {(() => {
                    const isDiff = checkIsDiff(compareList.map((c) => c.transmission));
                    return (
                      <tr>
                        <td className={`p-4 font-semibold text-stone-700 border-b border-r border-stone-200 ${isDiff ? "bg-blue-50 text-blue-950 font-bold border-l-4 border-l-blue-600" : ""}`}>
                          <div className="flex items-center justify-between">
                            <span>Transmission</span>
                            {isDiff && <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Different</span>}
                          </div>
                        </td>
                        {compareList.map((c) => (
                          <td key={c.id} className={`p-4 border-b border-r border-stone-200 capitalize font-medium ${isDiff ? "bg-blue-50/40 text-blue-950 font-semibold" : ""}`}>
                            {c.transmission}
                          </td>
                        ))}
                        {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, i) => (
                          <td key={i} className="border-b border-r border-stone-200 bg-stone-50/20"></td>
                        ))}
                      </tr>
                    );
                  })()}

                  {/* Kilometres Driven */}
                  {(() => {
                    const isDiff = checkIsDiff(compareList.map((c) => c.km_driven));
                    return (
                      <tr>
                        <td className={`p-4 font-semibold text-stone-700 border-b border-r border-stone-200 ${isDiff ? "bg-blue-50 text-blue-950 font-bold border-l-4 border-l-blue-600" : ""}`}>
                          <div className="flex items-center justify-between">
                            <span>Kilometres Driven</span>
                            {isDiff && <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Different</span>}
                          </div>
                        </td>
                        {compareList.map((c) => (
                          <td key={c.id} className={`p-4 border-b border-r border-stone-200 font-medium ${isDiff ? "bg-blue-50/40 text-blue-950 font-semibold" : ""}`}>
                            {formatKm(c.km_driven)}
                          </td>
                        ))}
                        {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, i) => (
                          <td key={i} className="border-b border-r border-stone-200 bg-stone-50/20"></td>
                        ))}
                      </tr>
                    );
                  })()}

                  {/* Ownership Count */}
                  {(() => {
                    const isDiff = checkIsDiff(compareList.map((c) => c.owner_count));
                    return (
                      <tr>
                        <td className={`p-4 font-semibold text-stone-700 border-b border-r border-stone-200 ${isDiff ? "bg-blue-50 text-blue-950 font-bold border-l-4 border-l-blue-600" : ""}`}>
                          <div className="flex items-center justify-between">
                            <span>Ownership</span>
                            {isDiff && <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Different</span>}
                          </div>
                        </td>
                        {compareList.map((c) => (
                          <td key={c.id} className={`p-4 border-b border-r border-stone-200 font-medium ${isDiff ? "bg-blue-50/40 text-blue-950 font-semibold" : ""}`}>
                            {c.owner_count === 1 ? "1st Owner (Single Hand)" : `${c.owner_count} Owners`}
                          </td>
                        ))}
                        {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, i) => (
                          <td key={i} className="border-b border-r border-stone-200 bg-stone-50/20"></td>
                        ))}
                      </tr>
                    );
                  })()}

                  {/* Location & RTO */}
                  {(() => {
                    const isDiff = checkIsDiff(compareList.map((c) => c.registration_state || c.city));
                    return (
                      <tr>
                        <td className={`p-4 font-semibold text-stone-700 border-b border-r border-stone-200 ${isDiff ? "bg-blue-50 text-blue-950 font-bold border-l-4 border-l-blue-600" : ""}`}>
                          <div className="flex items-center justify-between">
                            <span>RTO State / Hub</span>
                            {isDiff && <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Different</span>}
                          </div>
                        </td>
                        {compareList.map((c) => (
                          <td key={c.id} className={`p-4 border-b border-r border-stone-200 font-medium ${isDiff ? "bg-blue-50/40 text-blue-950 font-semibold" : ""}`}>
                            {c.registration_state ? `${c.registration_state} RTO` : c.city}
                          </td>
                        ))}
                        {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, i) => (
                          <td key={i} className="border-b border-r border-stone-200 bg-stone-50/20"></td>
                        ))}
                      </tr>
                    );
                  })()}

                  {/* =========================================================================
                      SECTION 2: FINANCE & COST OF OWNERSHIP
                      ========================================================================= */}
                  <tr className="bg-stone-100/70">
                    <td
                      colSpan={4}
                      className="p-3.5 font-bold uppercase tracking-wider text-xs text-stone-700 border-b border-stone-200"
                    >
                      <span className="flex items-center gap-1.5">
                        <Wallet size={14} className="text-blue-700" />
                        2. Pricing & Cost of Ownership Economics
                      </span>
                    </td>
                  </tr>

                  {/* Price */}
                  {(() => {
                    const isDiff = checkIsDiff(compareList.map((c) => Number(c.price)));
                    return (
                      <tr>
                        <td className={`p-4 font-semibold text-stone-700 border-b border-r border-stone-200 ${isDiff ? "bg-blue-50 text-blue-950 font-bold border-l-4 border-l-blue-600" : ""}`}>
                          <div className="flex items-center justify-between">
                            <span>Ex-Showroom Price</span>
                            {isDiff && <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Different</span>}
                          </div>
                        </td>
                        {compareList.map((c) => (
                          <td key={c.id} className={`p-4 border-b border-r border-stone-200 font-black text-stone-900 ${isDiff ? "bg-blue-50/40 text-blue-950" : ""}`}>
                            {formatINR(Number(c.price))}
                          </td>
                        ))}
                        {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, i) => (
                          <td key={i} className="border-b border-r border-stone-200 bg-stone-50/20"></td>
                        ))}
                      </tr>
                    );
                  })()}

                  {/* Estimated EMI */}
                  {(() => {
                    const isDiff = checkIsDiff(compareList.map((c) => calculateEstimatedEMI(Number(c.price))));
                    return (
                      <tr>
                        <td className={`p-4 font-semibold text-stone-700 border-b border-r border-stone-200 ${isDiff ? "bg-blue-50 text-blue-950 font-bold border-l-4 border-l-blue-600" : ""}`}>
                          <div className="flex items-center justify-between">
                            <span>Est. Monthly EMI (5Y @ 9.5%)</span>
                            {isDiff && <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Different</span>}
                          </div>
                        </td>
                        {compareList.map((c) => (
                          <td key={c.id} className={`p-4 border-b border-r border-stone-200 font-bold text-stone-900 ${isDiff ? "bg-blue-50/40 text-blue-950" : ""}`}>
                            {formatINR(calculateEstimatedEMI(Number(c.price)))} / mo
                          </td>
                        ))}
                        {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, i) => (
                          <td key={i} className="border-b border-r border-stone-200 bg-stone-50/20"></td>
                        ))}
                      </tr>
                    );
                  })()}

                  {/* Monthly Fuel Cost */}
                  {(() => {
                    const isDiff = checkIsDiff(compareList.map((c) => calculateEstimatedMonthlyFuel(c.fuel_type)));
                    return (
                      <tr>
                        <td className={`p-4 font-semibold text-stone-700 border-b border-r border-stone-200 ${isDiff ? "bg-blue-50 text-blue-950 font-bold border-l-4 border-l-blue-600" : ""}`}>
                          <div className="flex items-center justify-between">
                            <span>Est. Fuel / Month (1,000 km)</span>
                            {isDiff && <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Different</span>}
                          </div>
                        </td>
                        {compareList.map((c) => (
                          <td key={c.id} className={`p-4 border-b border-r border-stone-200 font-medium ${isDiff ? "bg-blue-50/40 text-blue-950 font-semibold" : ""}`}>
                            {formatINR(calculateEstimatedMonthlyFuel(c.fuel_type))} / mo
                          </td>
                        ))}
                        {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, i) => (
                          <td key={i} className="border-b border-r border-stone-200 bg-stone-50/20"></td>
                        ))}
                      </tr>
                    );
                  })()}

                  {/* Annual Maintenance */}
                  {(() => {
                    const isDiff = checkIsDiff(compareList.map((c) => calculateAnnualMaintenance(c.body_type, Number(c.price))));
                    return (
                      <tr>
                        <td className={`p-4 font-semibold text-stone-700 border-b border-r border-stone-200 ${isDiff ? "bg-blue-50 text-blue-950 font-bold border-l-4 border-l-blue-600" : ""}`}>
                          <div className="flex items-center justify-between">
                            <span>Est. Annual Maintenance</span>
                            {isDiff && <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Different</span>}
                          </div>
                        </td>
                        {compareList.map((c) => (
                          <td key={c.id} className={`p-4 border-b border-r border-stone-200 font-medium ${isDiff ? "bg-blue-50/40 text-blue-950 font-semibold" : ""}`}>
                            {formatINR(calculateAnnualMaintenance(c.body_type, Number(c.price)))} / yr
                          </td>
                        ))}
                        {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, i) => (
                          <td key={i} className="border-b border-r border-stone-200 bg-stone-50/20"></td>
                        ))}
                      </tr>
                    );
                  })()}

                  {/* 3-Year Running Cost */}
                  {(() => {
                    const costs = compareList.map((c) => {
                      const monthlyFuel = calculateEstimatedMonthlyFuel(c.fuel_type);
                      const yearlyMaint = calculateAnnualMaintenance(c.body_type, Number(c.price));
                      return monthlyFuel * 36 + yearlyMaint * 3;
                    });
                    const isDiff = checkIsDiff(costs);
                    return (
                      <tr>
                        <td className={`p-4 font-semibold text-stone-700 border-b border-r border-stone-200 ${isDiff ? "bg-blue-50 text-blue-950 font-bold border-l-4 border-l-blue-600" : ""}`}>
                          <div className="flex items-center justify-between">
                            <span>3-Year Projected Running Cost</span>
                            {isDiff && <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Different</span>}
                          </div>
                        </td>
                        {costs.map((cost, idx) => (
                          <td key={idx} className={`p-4 border-b border-r border-stone-200 font-bold text-stone-900 ${isDiff ? "bg-blue-50/40 text-blue-950" : ""}`}>
                            {formatINR(cost)}
                          </td>
                        ))}
                        {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, i) => (
                          <td key={i} className="border-b border-r border-stone-200 bg-stone-50/20"></td>
                        ))}
                      </tr>
                    );
                  })()}

                  {/* =========================================================================
                      SECTION 3: TECHNICAL SPECIFICATIONS
                      ========================================================================= */}
                  <tr className="bg-stone-100/70">
                    <td
                      colSpan={4}
                      className="p-3.5 font-bold uppercase tracking-wider text-xs text-stone-700 border-b border-stone-200"
                    >
                      3. Technical Specifications
                    </td>
                  </tr>

                  {specRows.map((row) => {
                    const values = compareList.map((c: any) => c.specifications?.[row.key] || "");
                    const isDiff = checkIsDiff(values);
                    return (
                      <tr key={row.key}>
                        <td className={`p-4 font-semibold text-stone-700 border-b border-r border-stone-200 ${isDiff ? "bg-blue-50 text-blue-950 font-bold border-l-4 border-l-blue-600" : ""}`}>
                          <div className="flex items-center justify-between">
                            <span>{row.label}</span>
                            {isDiff && <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Different</span>}
                          </div>
                        </td>
                        {compareList.map((c: any) => {
                          const val = c.specifications?.[row.key];
                          return (
                            <td key={c.id} className={`p-4 border-b border-r border-stone-200 ${isDiff ? "bg-blue-50/40 text-blue-950 font-semibold" : ""}`}>
                              {val ? (
                                <span className="font-medium text-stone-900">{val}</span>
                              ) : (
                                <Minus size={16} className="text-stone-300" />
                              )}
                            </td>
                          );
                        })}
                        {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, i) => (
                          <td key={i} className="border-b border-r border-stone-200 bg-stone-50/20"></td>
                        ))}
                      </tr>
                    );
                  })}

                  {/* =========================================================================
                      SECTION 4: QWHEELZ ASSURANCE & DIRECT VERIFICATION GUARANTEES
                      ========================================================================= */}
                  <tr className="bg-stone-100/70">
                    <td
                      colSpan={4}
                      className="p-3.5 font-bold uppercase tracking-wider text-xs text-stone-700 border-b border-stone-200"
                    >
                      4. Qwheelz Assurance & Inspection Guarantees
                    </td>
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-stone-700 border-b border-r border-stone-200">
                      200-Point Inspection
                    </td>
                    {compareList.map((c) => (
                      <td key={c.id} className="p-4 border-b border-r border-stone-200">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          Passed (Structural & Engine)
                        </span>
                      </td>
                    ))}
                    {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, i) => (
                      <td key={i} className="border-b border-r border-stone-200 bg-stone-50/20"></td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-stone-700 border-b border-r border-stone-200">
                      RTO & Document Transfer
                    </td>
                    {compareList.map((c) => (
                      <td key={c.id} className="p-4 border-b border-r border-stone-200 font-medium text-stone-800">
                        <span className="inline-flex items-center gap-1 text-xs text-blue-900 font-bold">
                          <Check size={14} className="text-blue-600" /> Included & Guaranteed
                        </span>
                      </td>
                    ))}
                    {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, i) => (
                      <td key={i} className="border-b border-r border-stone-200 bg-stone-50/20"></td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-stone-700 border-b border-r border-stone-200">
                      Inspection Center
                    </td>
                    {compareList.map((c) => (
                      <td key={c.id} className="p-4 border-b border-r border-stone-200 text-xs text-stone-600">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-blue-600 shrink-0" />
                          Jankipuram near JB Lawn, Lucknow
                        </span>
                      </td>
                    ))}
                    {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, i) => (
                      <td key={i} className="border-b border-r border-stone-200 bg-stone-50/20"></td>
                    ))}
                  </tr>

                  {/* Action Row at Bottom */}
                  <tr className="bg-stone-50">
                    <td className="p-4 font-bold uppercase tracking-wider text-xs text-stone-500 border-r border-stone-200">
                      Actions
                    </td>
                    {compareList.map((c) => (
                      <td key={c.id} className="p-4 border-r border-stone-200">
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => setBookingCar(c)}
                            className="w-full text-center bg-blue-900 text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl hover:bg-blue-950 transition-colors shadow-sm cursor-pointer"
                          >
                            Buy Now @ ₹999
                          </button>
                          <button
                            type="button"
                            onClick={() => setContactCar(c)}
                            className="w-full text-center bg-white border border-stone-300 text-stone-800 text-xs font-bold uppercase tracking-wider py-2 rounded-xl hover:bg-blue-50 hover:text-blue-900 hover:border-blue-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Phone size={13} className="text-blue-700" />
                            <span>Contact Seller</span>
                          </button>
                        </div>
                      </td>
                    ))}
                    {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, i) => (
                      <td key={i} className="border-r border-stone-200"></td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          VEHICLE SELECTOR MODAL (Add Vehicle to Comparison)
          ========================================================================= */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-stone-900">Add Vehicle to Comparison</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Select a certified vehicle from inventory ({compareList.length}/3 selected)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-stone-100 bg-stone-50/50">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by brand (e.g. Toyota, Tata, Maruti, Creta, Nexon)..."
                  className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none placeholder:text-stone-400"
                  autoFocus
                />
              </div>
            </div>

            {/* List of Available Vehicles */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {listingsLoading ? (
                <div className="py-12 text-center text-sm text-stone-500">
                  <div className="w-8 h-8 border-2 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Loading certified inventory…
                </div>
              ) : availableVehicles.length === 0 ? (
                <div className="py-12 text-center text-sm text-stone-500">
                  No vehicles found matching "{searchQuery}".
                </div>
              ) : (
                availableVehicles.map((car) => {
                  const alreadyAdded = compareList.some((c) => c.id === car.id);
                  const isMax = compareList.length >= 3;
                  const image =
                    car.images?.[0]?.url ||
                    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=300";

                  return (
                    <div
                      key={car.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        alreadyAdded
                          ? "bg-blue-50/50 border-blue-200 opacity-80"
                          : "bg-white border-stone-200 hover:border-blue-400 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={image}
                          alt={car.title}
                          className="w-16 h-14 object-cover rounded-xl border border-stone-200 shrink-0 bg-stone-100"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                              {car.year} • {car.brand}
                            </span>
                            <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-medium capitalize">
                              {car.fuel_type}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-stone-900 line-clamp-1">{car.title}</h4>
                          <p className="text-xs font-black text-stone-900 mt-0.5">
                            {formatINR(Number(car.price))}
                            <span className="text-[11px] font-normal text-stone-500 ml-2">
                              • {formatKm(car.km_driven)}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 pl-3">
                        {alreadyAdded ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-100 text-blue-800 text-xs font-bold uppercase">
                            <Check size={14} /> Added
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={isMax}
                            onClick={() => handleSelectCar(car)}
                            className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                          >
                            + Compare
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
              <span>Comparing {compareList.length} / 3 vehicles max</span>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 font-bold hover:bg-stone-100 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Seller Modal */}
      {contactCar && (
        <ContactSellerModal
          isOpen={!!contactCar}
          onClose={() => setContactCar(null)}
          listing={contactCar}
        />
      )}

      {/* Booking Modal (When user clicks Buy Now @ ₹999 on any compared car) */}
      {bookingCar && (
        <BookingModal
          isOpen={!!bookingCar}
          onClose={() => setBookingCar(null)}
          onSuccess={() => {
            alert(`Vehicle ${bookingCar.title} successfully reserved! You can now contact the seller directly to finalize purchase.`);
            setBookingCar(null);
          }}
          brand={bookingCar.brand}
          model={bookingCar.model}
          listingId={bookingCar.id}
        />
      )}
    </div>
  );
}
