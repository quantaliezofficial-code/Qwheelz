import { useState } from "react";
import { useCompare } from "../context/CompareContext";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
  Settings2,
  Trash2,
  Sparkles,
  Wallet,
  PieChart,
  ShieldCheck,
  Star,
  Fuel,
  Wrench,
} from "lucide-react";
import { formatINR, formatKm, VerifiedPlate } from "../components/ui";

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
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const [highlightDifferences, setHighlightDifferences] = useState(false);

  if (compareList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[#FAFAF9] text-stone-900 px-4">
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6">
          <Settings2 size={40} className="text-stone-300" />
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">Compare Vehicles</h1>
        <p className="text-stone-500 mb-8 text-center">You haven't selected any vehicles to compare yet.</p>
        <Link
          to="/cars"
          className="bg-blue-900 hover:bg-blue-950 text-white font-bold uppercase tracking-wider text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-950/20"
        >
          Browse Premium Collection
        </Link>
      </div>
    );
  }

  // Specifications rows to render
  const specRows = [
    { key: "engine", label: "Engine" },
    { key: "power", label: "Max Power" },
    { key: "torque", label: "Max Torque" },
    { key: "mileage", label: "Claimed Mileage" },
    { key: "drivetrain", label: "Drivetrain" },
    { key: "ground_clearance", label: "Ground Clearance" },
  ];

  const getDiffClass = (values: any[]) => {
    return highlightDifferences && valuesDiffer(values) ? "bg-blue-50/70" : "";
  };

  return (
    <div className="bg-[#FAFAF9] text-stone-900 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              to="/cars"
              className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-blue-700 transition-colors mb-3"
            >
              <ArrowLeft size={14} className="mr-2" /> Back to listings
            </Link>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              Vehicle Comparison Matrix
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setHighlightDifferences(!highlightDifferences)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                highlightDifferences
                  ? "bg-blue-100 border-blue-300 text-blue-900 shadow-xs"
                  : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
            >
              <Sparkles size={14} className={highlightDifferences ? "text-blue-600" : "text-stone-400"} />
              Highlight Differences {highlightDifferences && "ON"}
            </button>
            <button
              onClick={clearCompare}
              className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors px-3 py-2"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="w-1/4 min-w-[200px] p-6 border-b border-r border-stone-200 bg-stone-50 align-bottom">
                  <h3 className="text-lg font-bold text-stone-900">Compare</h3>
                  <p className="text-xs text-stone-500 mt-1">Side by side specifications</p>
                </th>
                {compareList.map((car) => {
                  const image =
                    car.images?.[0]?.url ||
                    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600";
                  return (
                    <th
                      key={car.id}
                      className="w-1/4 min-w-[250px] p-6 border-b border-r last:border-r-0 border-stone-200 align-top relative"
                    >
                      <button
                        onClick={() => removeFromCompare(car.id)}
                        className="absolute top-4 right-4 p-2 bg-white rounded-full shadow border border-stone-100 text-stone-400 hover:text-red-500 transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                      <img src={image} alt={car.title} className="w-full h-40 object-cover rounded-xl mb-4" />
                      <div className="text-[10px] font-bold uppercase tracking-widest text-blue-700 mb-1">
                        {car.year} • {car.brand}
                      </div>
                      <h4 className="text-lg font-extrabold text-stone-900 leading-tight mb-2">
                        <Link to={`/cars/${car.slug}`} className="hover:underline">
                          {car.model}
                        </Link>
                      </h4>
                      <p className="text-xl font-black text-stone-900 mb-4">{formatINR(Number(car.price))}</p>
                      <Link
                        to={`/cars/${car.slug}`}
                        className="block w-full text-center bg-blue-900 text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg hover:bg-blue-950 transition-colors"
                      >
                        View Details
                      </Link>
                    </th>
                  );
                })}
                {compareList.length < 3 &&
                  Array.from({ length: 3 - compareList.length }).map((_, i) => (
                    <th
                      key={`empty-${i}`}
                      className="w-1/4 min-w-[250px] p-6 border-b border-r last:border-r-0 border-stone-200 align-middle text-center bg-stone-50/50"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-white rounded-full border-2 border-dashed border-stone-300 flex items-center justify-center mb-3">
                          <Plus size={20} className="text-stone-300" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Add a vehicle</p>
                      </div>
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {/* Basic Details */}
              <tr className="bg-stone-50">
                <td colSpan={4} className="p-4 font-bold uppercase tracking-widest text-xs text-stone-500 border-b border-stone-200">
                  Basic Information
                </td>
              </tr>
              <tr className={getDiffClass(compareList.map((c) => c.body_type))}>
                <td className="p-4 font-semibold text-stone-700 border-b border-r border-stone-200">Body Type</td>
                {compareList.map((c) => (
                  <td key={c.id} className="p-4 border-b border-r border-stone-200 uppercase font-medium">
                    {c.body_type.replace("_", " ")}
                  </td>
                ))}
                {compareList.length < 3 &&
                  Array.from({ length: 3 - compareList.length }).map((_, i) => (
                    <td key={i} className="border-b border-r border-stone-200"></td>
                  ))}
              </tr>
              <tr className={getDiffClass(compareList.map((c) => c.fuel_type))}>
                <td className="p-4 font-semibold text-stone-700 border-b border-r border-stone-200">Fuel Type</td>
                {compareList.map((c) => (
                  <td key={c.id} className="p-4 border-b border-r border-stone-200 capitalize font-medium">
                    {c.fuel_type}
                  </td>
                ))}
                {compareList.length < 3 &&
                  Array.from({ length: 3 - compareList.length }).map((_, i) => (
                    <td key={i} className="border-b border-r border-stone-200"></td>
                  ))}
              </tr>
              <tr className={getDiffClass(compareList.map((c) => c.transmission))}>
                <td className="p-4 font-semibold text-stone-700 border-b border-r border-stone-200">Transmission</td>
                {compareList.map((c) => (
                  <td key={c.id} className="p-4 border-b border-r border-stone-200 capitalize font-medium">
                    {c.transmission}
                  </td>
                ))}
                {compareList.length < 3 &&
                  Array.from({ length: 3 - compareList.length }).map((_, i) => (
                    <td key={i} className="border-b border-r border-stone-200"></td>
                  ))}
              </tr>
              <tr className={getDiffClass(compareList.map((c) => c.km_driven))}>
                <td className="p-4 font-semibold text-stone-700 border-b border-r border-stone-200">Kilometres Driven</td>
                {compareList.map((c) => (
                  <td key={c.id} className="p-4 border-b border-r border-stone-200 font-medium">
                    {formatKm(c.km_driven)}
                  </td>
                ))}
                {compareList.length < 3 &&
                  Array.from({ length: 3 - compareList.length }).map((_, i) => (
                    <td key={i} className="border-b border-r border-stone-200"></td>
                  ))}
              </tr>
              <tr className={getDiffClass(compareList.map((c) => c.owner_count))}>
                <td className="p-4 font-semibold text-stone-700 border-b border-r border-stone-200">Ownership</td>
                {compareList.map((c) => (
                  <td key={c.id} className="p-4 border-b border-r border-stone-200 font-medium">
                    {c.owner_count} Owner(s)
                  </td>
                ))}
                {compareList.length < 3 &&
                  Array.from({ length: 3 - compareList.length }).map((_, i) => (
                    <td key={i} className="border-b border-r border-stone-200"></td>
                  ))}
              </tr>

              {/* Technical Specifications */}
              <tr className="bg-stone-50">
                <td colSpan={4} className="p-4 font-bold uppercase tracking-widest text-xs text-stone-500 border-b border-stone-200">
                  Technical Specifications
                </td>
              </tr>
              {specRows.map((row) => {
                const values = compareList.map((c: any) => c.specifications?.[row.key] || "");
                return (
                  <tr key={row.key} className={getDiffClass(values)}>
                    <td className="p-4 font-semibold text-stone-700 border-b border-r border-stone-200">{row.label}</td>
                    {compareList.map((c) => {
                      // @ts-ignore
                      const val = c.specifications?.[row.key];
                      return (
                        <td key={c.id} className="p-4 border-b border-r border-stone-200">
                          {val ? (
                            <span className="font-medium text-stone-900">{val}</span>
                          ) : (
                            <Minus size={16} className="text-stone-300" />
                          )}
                        </td>
                      );
                    })}
                    {compareList.length < 3 &&
                      Array.from({ length: 3 - compareList.length }).map((_, i) => (
                        <td key={i} className="border-b border-r border-stone-200"></td>
                      ))}
                  </tr>
                );
              })}

              {/* Finance & Ownership Economics */}
              <tr className="bg-stone-50">
                <td colSpan={4} className="p-4 font-bold uppercase tracking-widest text-xs text-stone-500 border-b border-stone-200 flex items-center gap-2">
                  <Wallet className="w-3.5 h-3.5 text-blue-700" />
                  Finance & Cost of Ownership
                </td>
              </tr>
              <tr className={getDiffClass(compareList.map((c) => Number(c.price)))}>
                <td className="p-4 font-semibold text-stone-700 border-b border-r border-stone-200">
                  Estimated Monthly EMI (5Y @ 9.5%)
                </td>
                {compareList.map((c) => (
                  <td key={c.id} className="p-4 border-b border-r border-stone-200 font-bold text-stone-900">
                    {formatINR(calculateEstimatedEMI(Number(c.price)))} / mo
                  </td>
                ))}
                {compareList.length < 3 &&
                  Array.from({ length: 3 - compareList.length }).map((_, i) => (
                    <td key={i} className="border-b border-r border-stone-200"></td>
                  ))}
              </tr>
              <tr className={getDiffClass(compareList.map((c) => calculateEstimatedMonthlyFuel(c.fuel_type)))}>
                <td className="p-4 font-semibold text-stone-700 border-b border-r border-stone-200">
                  Est. Fuel / Month (1,000 km)
                </td>
                {compareList.map((c) => (
                  <td key={c.id} className="p-4 border-b border-r border-stone-200 font-medium text-stone-800">
                    {formatINR(calculateEstimatedMonthlyFuel(c.fuel_type))} / mo
                  </td>
                ))}
                {compareList.length < 3 &&
                  Array.from({ length: 3 - compareList.length }).map((_, i) => (
                    <td key={i} className="border-b border-r border-stone-200"></td>
                  ))}
              </tr>
              <tr className={getDiffClass(compareList.map((c) => calculateAnnualMaintenance(c.body_type, Number(c.price))))}>
                <td className="p-4 font-semibold text-stone-700 border-b border-r border-stone-200">
                  Est. Annual Maintenance
                </td>
                {compareList.map((c) => (
                  <td key={c.id} className="p-4 border-b border-r border-stone-200 font-medium text-stone-800">
                    {formatINR(calculateAnnualMaintenance(c.body_type, Number(c.price)))} / yr
                  </td>
                ))}
                {compareList.length < 3 &&
                  Array.from({ length: 3 - compareList.length }).map((_, i) => (
                    <td key={i} className="border-b border-r border-stone-200"></td>
                  ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-stone-700 border-b border-r border-stone-200">
                  3-Year Total Running Cost
                </td>
                {compareList.map((c) => {
                  const monthlyFuel = calculateEstimatedMonthlyFuel(c.fuel_type);
                  const yearlyMaint = calculateAnnualMaintenance(c.body_type, Number(c.price));
                  const total3Yr = monthlyFuel * 36 + yearlyMaint * 3;
                  return (
                    <td key={c.id} className="p-4 border-b border-r border-stone-200 font-bold text-stone-900">
                      {formatINR(total3Yr)}
                    </td>
                  );
                })}
                {compareList.length < 3 &&
                  Array.from({ length: 3 - compareList.length }).map((_, i) => (
                    <td key={i} className="border-b border-r border-stone-200"></td>
                  ))}
              </tr>

              {/* Inspection & Certification */}
              <tr className="bg-stone-50">
                <td colSpan={4} className="p-4 font-bold uppercase tracking-widest text-xs text-stone-500 border-b border-stone-200">
                  Inspection & Seller Trust
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-stone-700 border-b border-r border-stone-200">
                  Inspection Certification
                </td>
                {compareList.map((c) => (
                  <td key={c.id} className="p-4 border-b border-r border-stone-200">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      200-Point Inspected
                    </span>
                  </td>
                ))}
                {compareList.length < 3 &&
                  Array.from({ length: 3 - compareList.length }).map((_, i) => (
                    <td key={i} className="border-b border-r border-stone-200"></td>
                  ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-stone-700 border-b border-r border-stone-200">
                  Seller Rating & Verification
                </td>
                {compareList.map((c) => (
                  <td key={c.id} className="p-4 border-b border-r border-stone-200">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-stone-800">
                        {c.seller?.business_name || c.seller?.name || "Verified Seller"}
                      </span>
                      {c.seller?.is_verified && <VerifiedPlate />}
                    </div>
                  </td>
                ))}
                {compareList.length < 3 &&
                  Array.from({ length: 3 - compareList.length }).map((_, i) => (
                    <td key={i} className="border-b border-r border-stone-200"></td>
                  ))}
              </tr>

              {/* Features (intersection) */}
              <tr className="bg-stone-50">
                <td colSpan={4} className="p-4 font-bold uppercase tracking-widest text-xs text-stone-500 border-b border-stone-200">
                  Premium Features
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-stone-700 border-b border-r border-stone-200 align-top">
                  Available Features
                </td>
                {compareList.map((c) => (
                  <td key={c.id} className="p-4 border-b border-r border-stone-200 align-top">
                    {c.features && c.features.length > 0 ? (
                      <ul className="space-y-2">
                        {c.features.map((f) => (
                          <li key={f.id} className="flex items-start text-xs text-stone-700">
                            <Check size={14} className="text-blue-600 mr-2 shrink-0 mt-0.5" /> {f.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-stone-400 text-xs italic">No features listed</span>
                    )}
                  </td>
                ))}
                {compareList.length < 3 &&
                  Array.from({ length: 3 - compareList.length }).map((_, i) => (
                    <td key={i} className="border-b border-r border-stone-200"></td>
                  ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
