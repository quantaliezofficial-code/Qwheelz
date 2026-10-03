import React, { useState, useEffect } from "react";
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Check } from "lucide-react";
import type { ListingSearchParams } from "../types";

const BODY_TYPES = [
  { value: "hatchback", label: "Hatchback" },
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "muv_mpv", label: "MUV / MPV" },
  { value: "coupe", label: "Coupe" },
  { value: "convertible", label: "Convertible" },
];

const FUEL_TYPES = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "electric", label: "Electric" },
  { value: "cng", label: "CNG" },
  { value: "hybrid", label: "Hybrid" },
];

const TRANSMISSIONS = [
  { value: "manual", label: "Manual" },
  { value: "automatic", label: "Automatic" },
  { value: "amt", label: "AMT" },
  { value: "cvt", label: "CVT" },
];

const YEAR_OPTIONS = [
  { value: 2024, label: "2024 & above" },
  { value: 2022, label: "2022 & above" },
  { value: 2020, label: "2020 & above" },
  { value: 2018, label: "2018 & above" },
  { value: 2016, label: "2016 & above" },
  { value: 2014, label: "2014 & above" },
];

const KM_OPTIONS = [
  { value: 10000, label: "10,000 km or less" },
  { value: 30000, label: "30,000 km or less" },
  { value: 50000, label: "50,000 km or less" },
  { value: 75000, label: "75,000 km or less" },
  { value: 100000, label: "1,00,000 km or less" },
];

const OWNER_OPTIONS = [
  { value: 1, label: "1st Owner" },
  { value: 2, label: "2nd Owner" },
  { value: 3, label: "3rd Owner & above" },
];

const BRANDS_AND_MODELS = [
  {
    brand: "Maruti Suzuki",
    models: ["WagonR", "Swift", "Brezza", "Baleno", "Alto", "Dzire"],
  },
  {
    brand: "Hyundai",
    models: ["i20", "Creta", "Venue", "Verna", "Grand i10"],
  },
  {
    brand: "Tata Motors",
    models: ["Nexon", "Safari", "Punch", "Harrier", "Tiago"],
  },
  {
    brand: "Mahindra",
    models: ["Scorpio", "Thar", "Bolero", "XUV700", "XUV300"],
  },
  {
    brand: "Toyota",
    models: ["Innova Crysta", "Fortuner", "Glanza", "Urban Cruiser"],
  },
  {
    brand: "Renault",
    models: ["Kwid", "Duster", "Kiger", "Triber"],
  },
  {
    brand: "Skoda",
    models: ["Kushaq", "Slavia", "Octavia", "Superb"],
  },
];

interface Props {
  filters: ListingSearchParams;
  onChange: (filters: ListingSearchParams) => void;
}

function FilterSection({ title, children, defaultExpanded = true }: { title: string; children: React.ReactNode, defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <div className="border-b border-stone-200 py-4 first:pt-0 last:border-0">
      <button 
        onClick={() => setExpanded(!expanded)} 
        className="flex w-full items-center justify-between text-left mb-1"
      >
        <h4 className="text-xs font-bold uppercase tracking-wide text-stone-900">{title}</h4>
        {expanded ? <ChevronUp size={14} className="text-stone-400" /> : <ChevronDown size={14} className="text-stone-400" />}
      </button>
      {expanded && <div className="mt-3 animate-in fade-in slide-in-from-top-1">{children}</div>}
    </div>
  );
}

function ChipGroup({ options, value, onSelect }: { options: { value: string | number; label: string }[]; value: string | number | undefined; onSelect: (v: any) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onSelect(isSelected ? undefined : opt.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              isSelected 
                ? "border-blue-600 bg-blue-50 text-blue-800 shadow-sm" 
                : "border-stone-200 bg-white text-stone-600 hover:border-blue-300 hover:bg-stone-50"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function BrandModelFilter({ filters, set }: { filters: ListingSearchParams; set: (p: Partial<ListingSearchParams>) => void }) {
  const [expandedBrand, setExpandedBrand] = useState<string | null>(filters.brand || null);

  const toggleBrand = (brandName: string) => {
    if (expandedBrand === brandName) {
      setExpandedBrand(null);
    } else {
      setExpandedBrand(brandName);
    }
  };

  const selectBrand = (brandName: string) => {
    if (filters.brand === brandName) {
      set({ brand: undefined, model: undefined });
    } else {
      set({ brand: brandName, model: undefined });
    }
  };

  const selectModel = (modelName: string, brandName: string) => {
    if (filters.model === modelName) {
      set({ model: undefined });
    } else {
      set({ brand: brandName, model: modelName });
    }
  };

  return (
    <div className="space-y-2">
      {BRANDS_AND_MODELS.map((b) => {
        const isBrandSelected = filters.brand === b.brand;
        const isExpanded = expandedBrand === b.brand;
        
        return (
          <div key={b.brand} className="border border-stone-200 rounded-lg overflow-hidden">
            <div className={`flex items-center justify-between px-3 py-2 transition-colors ${isBrandSelected ? 'bg-blue-50' : 'bg-white hover:bg-stone-50'}`}>
              <button 
                className="flex items-center gap-2 flex-1 text-left"
                onClick={() => selectBrand(b.brand)}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${isBrandSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-stone-300'}`}>
                  {isBrandSelected && <Check size={12} />}
                </div>
                <span className={`text-sm ${isBrandSelected ? 'font-bold text-blue-900' : 'font-medium text-stone-700'}`}>{b.brand}</span>
              </button>
              
              <button onClick={() => toggleBrand(b.brand)} className="p-1 text-stone-400 hover:text-stone-700">
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {isExpanded && (
              <div className="bg-stone-50 px-3 py-2 border-t border-stone-200 space-y-1">
                {b.models.map((m) => {
                  const isModelSelected = filters.model === m;
                  return (
                    <button
                      key={m}
                      onClick={() => selectModel(m, b.brand)}
                      className="flex items-center gap-2 w-full text-left pl-6 py-1.5"
                    >
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isModelSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-stone-300 bg-white'}`}>
                        {isModelSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <span className={`text-xs ${isModelSelected ? 'font-bold text-blue-900' : 'text-stone-600 hover:text-stone-900'}`}>{m}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FiltersBody({ filters, onChange }: Props) {
  const set = (patch: Partial<ListingSearchParams>) => onChange({ ...filters, ...patch });

  return (
    <div>
      <FilterSection title="Brand & Model">
        <BrandModelFilter filters={filters} set={set} />
      </FilterSection>

      <FilterSection title="Budget (Max Price)">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center text-xs font-bold text-stone-900">
            <span>₹0</span>
            <span>{filters.price_max ? `Up to ₹${(filters.price_max / 100000).toFixed(1)} Lakh` : 'Any'}</span>
          </div>
          <input 
            type="range" 
            min="100000" 
            max="20000000" 
            step="100000"
            value={filters.price_max || 20000000} 
            onChange={(e) => set({ price_max: Number(e.target.value) === 20000000 ? undefined : Number(e.target.value) })} 
            className="w-full accent-blue-600"
          />
          <div className="flex items-center gap-2 mt-2">
            <input 
              type="number" 
              placeholder="Min (₹)" 
              value={filters.price_min ?? ""} 
              onChange={(e) => set({ price_min: e.target.value ? Number(e.target.value) : undefined })} 
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none" 
            />
            <span className="text-stone-400 font-medium">–</span>
            <input 
              type="number" 
              placeholder="Max (₹)" 
              value={filters.price_max ?? ""} 
              onChange={(e) => set({ price_max: e.target.value ? Number(e.target.value) : undefined })} 
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none" 
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Manufacturing Year">
        <ChipGroup 
          options={YEAR_OPTIONS} 
          value={filters.year_min} 
          onSelect={(v) => set({ year_min: v as number })} 
        />
      </FilterSection>

      <FilterSection title="Kilometres Driven">
        <ChipGroup 
          options={KM_OPTIONS} 
          value={filters.km_max} 
          onSelect={(v) => set({ km_max: v as number })} 
        />
      </FilterSection>

      <FilterSection title="Body Type">
        <ChipGroup 
          options={BODY_TYPES} 
          value={filters.body_type} 
          onSelect={(v) => set({ body_type: v as ListingSearchParams["body_type"] })} 
        />
      </FilterSection>

      <FilterSection title="Fuel Type">
        <ChipGroup 
          options={FUEL_TYPES} 
          value={filters.fuel_type} 
          onSelect={(v) => set({ fuel_type: v as ListingSearchParams["fuel_type"] })} 
        />
      </FilterSection>

      <FilterSection title="Transmission">
        <ChipGroup 
          options={TRANSMISSIONS} 
          value={filters.transmission} 
          onSelect={(v) => set({ transmission: v as ListingSearchParams["transmission"] })} 
        />
      </FilterSection>

      <FilterSection title="Ownership">
        <ChipGroup 
          options={OWNER_OPTIONS} 
          value={filters.owner_count_max} 
          onSelect={(v) => set({ owner_count_max: v as number })} 
        />
      </FilterSection>
    </div>
  );
}

export function FiltersSidebar(props: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<ListingSearchParams>(props.filters);
  const activeCount = Object.values(localFilters).filter((v) => v !== undefined && v !== "" && v !== "newest" && v !== props.filters.city).length;

  useEffect(() => {
    setLocalFilters(props.filters);
  }, [props.filters]);

  const handleApply = () => {
    props.onChange(localFilters);
    setMobileOpen(false);
  };

  const handleClear = () => {
    const cleared = { sort: props.filters.sort, city: props.filters.city };
    setLocalFilters(cleared);
    props.onChange(cleared);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 shrink-0">
        <div className="bg-white border border-stone-200 rounded-xl sticky top-24 max-h-[calc(100vh-7rem)] overflow-hidden flex flex-col shadow-sm">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-blue-700" />
              <h3 className="font-bold text-stone-900 tracking-wide uppercase text-sm">Filters</h3>
            </div>
            {activeCount > 0 && (
              <button onClick={handleClear} className="text-xs font-bold text-stone-500 hover:text-blue-700 uppercase tracking-widest transition-colors">
                Reset
              </button>
            )}
          </div>
          
          <div className="p-5 overflow-y-auto qz-scroll flex-1">
            <FiltersBody filters={localFilters} onChange={setLocalFilters} />
          </div>
          
          <div className="p-4 border-t border-stone-100 bg-white">
            <button 
              onClick={handleApply} 
              className="w-full rounded-lg bg-blue-900 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md hover:bg-blue-950 transition-all flex items-center justify-center gap-2"
            >
              Apply Filters {activeCount > 0 && <span className="bg-white text-blue-900 text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{activeCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Trigger */}
      <button 
        onClick={() => setMobileOpen(true)} 
        className="bg-white border border-stone-200 shadow-sm rounded-lg mb-4 flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold uppercase tracking-wider text-stone-800 lg:hidden"
      >
        <SlidersHorizontal size={16} className="text-blue-600" /> 
        Filters {activeCount > 0 && <span className="bg-stone-100 text-stone-800 rounded-full px-2 py-0.5 ml-1">{activeCount}</span>}
      </button>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] flex lg:hidden">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setMobileOpen(false)} />
          <div className="relative ml-auto flex h-full w-full max-w-[85%] flex-col bg-white shadow-2xl animate-in slide-in-from-right">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-blue-700" />
                <h3 className="font-bold text-stone-900 tracking-wide uppercase text-sm">Filters</h3>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-stone-400 hover:text-stone-900 transition-colors p-1 bg-white rounded-full shadow-sm">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto qz-scroll flex-1">
              <FiltersBody filters={localFilters} onChange={setLocalFilters} />
            </div>
            
            <div className="p-4 border-t border-stone-100 bg-white grid grid-cols-2 gap-3">
              <button 
                onClick={handleClear} 
                className="rounded-lg border border-stone-200 bg-stone-50 py-3 text-sm font-bold uppercase tracking-wider text-stone-600 hover:bg-stone-100 transition-all"
              >
                Reset
              </button>
              <button 
                onClick={handleApply} 
                className="rounded-lg bg-blue-900 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md hover:bg-blue-950 transition-all"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
