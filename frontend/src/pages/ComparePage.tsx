import { useCompare } from "../context/CompareContext";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Minus, Plus, SearchX, Settings2, ShieldCheck, Trash2 } from "lucide-react";
import { formatINR, formatKm } from "../components/ui";

export function ComparePage() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  if (compareList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[#FAFAF9] text-stone-900 px-4">
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6">
          <Settings2 size={40} className="text-stone-300" />
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">Compare Vehicles</h1>
        <p className="text-stone-500 mb-8 text-center">You haven't selected any vehicles to compare yet.</p>
        <Link to="/cars" className="bg-blue-900 hover:bg-blue-950 text-white font-bold uppercase tracking-wider text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-950/20">
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
    { key: "ground_clearance", label: "Ground Clearance" }
  ];

  return (
    <div className="bg-[#FAFAF9] text-stone-900 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/cars" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-blue-700 transition-colors mb-4">
              <ArrowLeft size={14} className="mr-2" /> Back to listings
            </Link>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">Car Comparison</h1>
          </div>
          <button onClick={clearCompare} className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors">
            Clear All
          </button>
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
                  const image = car.images?.[0]?.url || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600";
                  return (
                    <th key={car.id} className="w-1/4 min-w-[250px] p-6 border-b border-r last:border-r-0 border-stone-200 align-top relative">
                      <button onClick={() => removeFromCompare(car.id)} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow border border-stone-100 text-stone-400 hover:text-red-500 transition-colors" title="Remove">
                        <Trash2 size={16} />
                      </button>
                      <img src={image} alt={car.title} className="w-full h-40 object-cover rounded-xl mb-4" />
                      <div className="text-[10px] font-bold uppercase tracking-widest text-blue-700 mb-1">{car.year} • {car.brand}</div>
                      <h4 className="text-lg font-extrabold text-stone-900 leading-tight mb-2"><Link to={`/cars/${car.slug}`} className="hover:underline">{car.model}</Link></h4>
                      <p className="text-xl font-black text-stone-900 mb-4">{formatINR(Number(car.price))}</p>
                      <Link to={`/cars/${car.slug}`} className="block w-full text-center bg-blue-900 text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg hover:bg-blue-950 transition-colors">
                        View Details
                      </Link>
                    </th>
                  );
                })}
                {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, i) => (
                  <th key={`empty-${i}`} className="w-1/4 min-w-[250px] p-6 border-b border-r last:border-r-0 border-stone-200 align-middle text-center bg-stone-50/50">
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
              <tr className="bg-stone-50"><td colSpan={4} className="p-4 font-bold uppercase tracking-widest text-xs text-stone-500 border-b border-stone-200">Basic Information</td></tr>
              <tr>
                <td className="p-4 font-semibold text-stone-700 border-b border-r border-stone-200">Body Type</td>
                {compareList.map(c => <td key={c.id} className="p-4 border-b border-r border-stone-200 uppercase">{c.body_type.replace('_', ' ')}</td>)}
                {compareList.length < 3 && Array.from({length: 3 - compareList.length}).map((_, i) => <td key={i} className="border-b border-r border-stone-200"></td>)}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-stone-700 border-b border-r border-stone-200">Fuel Type</td>
                {compareList.map(c => <td key={c.id} className="p-4 border-b border-r border-stone-200 capitalize">{c.fuel_type}</td>)}
                {compareList.length < 3 && Array.from({length: 3 - compareList.length}).map((_, i) => <td key={i} className="border-b border-r border-stone-200"></td>)}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-stone-700 border-b border-r border-stone-200">Transmission</td>
                {compareList.map(c => <td key={c.id} className="p-4 border-b border-r border-stone-200 capitalize">{c.transmission}</td>)}
                {compareList.length < 3 && Array.from({length: 3 - compareList.length}).map((_, i) => <td key={i} className="border-b border-r border-stone-200"></td>)}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-stone-700 border-b border-r border-stone-200">Kilometres Driven</td>
                {compareList.map(c => <td key={c.id} className="p-4 border-b border-r border-stone-200">{formatKm(c.km_driven)}</td>)}
                {compareList.length < 3 && Array.from({length: 3 - compareList.length}).map((_, i) => <td key={i} className="border-b border-r border-stone-200"></td>)}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-stone-700 border-b border-r border-stone-200">Ownership</td>
                {compareList.map(c => <td key={c.id} className="p-4 border-b border-r border-stone-200">{c.owner_count} Owner(s)</td>)}
                {compareList.length < 3 && Array.from({length: 3 - compareList.length}).map((_, i) => <td key={i} className="border-b border-r border-stone-200"></td>)}
              </tr>

              {/* Specifications */}
              <tr className="bg-stone-50"><td colSpan={4} className="p-4 font-bold uppercase tracking-widest text-xs text-stone-500 border-b border-stone-200">Technical Specifications</td></tr>
              {specRows.map((row) => (
                <tr key={row.key}>
                  <td className="p-4 font-semibold text-stone-700 border-b border-r border-stone-200">{row.label}</td>
                  {compareList.map(c => {
                    // @ts-ignore (dynamic specs key access)
                    const val = c.specifications?.[row.key];
                    return <td key={c.id} className="p-4 border-b border-r border-stone-200">{val ? <span className="font-medium text-stone-900">{val}</span> : <Minus size={16} className="text-stone-300" />}</td>;
                  })}
                  {compareList.length < 3 && Array.from({length: 3 - compareList.length}).map((_, i) => <td key={i} className="border-b border-r border-stone-200"></td>)}
                </tr>
              ))}

              {/* Features (intersection) */}
              <tr className="bg-stone-50"><td colSpan={4} className="p-4 font-bold uppercase tracking-widest text-xs text-stone-500 border-b border-stone-200">Premium Features</td></tr>
              <tr>
                <td className="p-4 font-semibold text-stone-700 border-b border-r border-stone-200 align-top">Available Features</td>
                {compareList.map(c => (
                  <td key={c.id} className="p-4 border-b border-r border-stone-200 align-top">
                    {c.features && c.features.length > 0 ? (
                      <ul className="space-y-2">
                        {c.features.map(f => (
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
                {compareList.length < 3 && Array.from({length: 3 - compareList.length}).map((_, i) => <td key={i} className="border-b border-r border-stone-200"></td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
