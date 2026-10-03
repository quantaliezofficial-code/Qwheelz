import { useCompare } from "../context/CompareContext";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, BarChart2, X } from "lucide-react";

export function CompareTray() {
  const { compareList, removeFromCompare } = useCompare();
  const location = useLocation();

  if (compareList.length === 0 || location.pathname === '/compare') return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom-5">
      <div className="bg-white/95 backdrop-blur-md shadow-2xl shadow-stone-900/20 border border-stone-200 p-2 pl-4 rounded-full flex items-center gap-4">
        <div className="flex items-center gap-2 pr-4 border-r border-stone-200">
          <BarChart2 size={16} className="text-blue-600" />
          <span className="text-sm font-bold text-stone-800">{compareList.length} / 3</span>
        </div>
        
        <div className="flex gap-2">
          {compareList.map(car => (
            <div key={car.id} className="relative group flex items-center bg-stone-100 rounded-full pl-1 pr-3 py-1">
              <img src={car.images?.[0]?.url || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=150"} alt="" className="w-6 h-6 rounded-full object-cover mr-2" />
              <span className="text-xs font-bold text-stone-700 hidden sm:inline-block max-w-[80px] truncate">{car.model}</span>
              <button 
                onClick={() => removeFromCompare(car.id)}
                className="absolute -top-1 -right-1 bg-white border border-stone-200 text-stone-400 hover:text-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {compareList.length < 3 && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full border border-dashed border-stone-300 text-stone-400">
              <span className="text-xs">+</span>
            </div>
          )}
        </div>

        <div className="pl-2">
          <Link to="/compare" className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-blue-950 transition-colors">
            Compare <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
