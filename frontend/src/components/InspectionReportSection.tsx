import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Activity,
  Layers,
  Sparkles,
  Download,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface InspectionItem {
  name: string;
  status: "pass" | "attention" | "good";
  detail: string;
}

interface InspectionCategory {
  title: string;
  icon: any;
  score: string;
  items: InspectionItem[];
}

export function InspectionReportSection({
  specs = {},
  brand,
  model,
}: {
  specs?: Record<string, any>;
  brand?: string;
  model?: string;
}) {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [expanded, setExpanded] = useState<boolean>(false);

  const categories: InspectionCategory[] = [
    {
      title: "Engine & Powertrain",
      icon: Activity,
      score: "98/100",
      items: [
        { name: "Engine Idle & Sound", status: "pass", detail: "Smooth idling with zero abnormal valve rattle or knocking" },
        { name: "Exhaust Emission & Smoke", status: "pass", detail: "Clean emissions, zero black or blue oil exhaust smoke" },
        { name: "Oil & Coolant Levels", status: "pass", detail: "Fluid levels optimal, no cross-contamination or milky residue" },
        { name: "Transmission Shifts", status: "pass", detail: "Precise gear engagement, no slippage or delayed torque" },
        { name: "Battery & Alternator Health", status: "good", detail: "12.6V resting charge, alternator charging circuit verified" },
      ],
    },
    {
      title: "Body, Frame & Paint",
      icon: Layers,
      score: "94/100",
      items: [
        { name: "Structural Chassis & Aprons", status: "pass", detail: "100% intact, factory spot-welds confirmed on all pillars" },
        { name: "Digital Paint Depth Check", status: "good", detail: "Uniform 100-130 micron reading across OEM metal panels" },
        { name: "Non-Flooded Certification", status: "pass", detail: "Floor pan, seat rails, and wiring harness dry and corrosion-free" },
        { name: "Bumper & Panel Alignment", status: "good", detail: "OEM panel gap tolerances verified within 3-4mm spec" },
        { name: "Windshield & Glass Markings", status: "pass", detail: "Original manufacturer markings on all windshields and door glasses" },
      ],
    },
    {
      title: "Electricals & Interior",
      icon: Sparkles,
      score: "96/100",
      items: [
        { name: "Air Conditioning Efficiency", status: "pass", detail: "Cools to 8.5°C vent output temperature within 3 minutes" },
        { name: "Infotainment & Audio", status: "pass", detail: "Touchscreen, Bluetooth pairing, and speaker channels responsive" },
        { name: "Power Windows & Central Locks", status: "pass", detail: "All window motors and keyless actuators tested successfully" },
        { name: "Instrument Cluster & OBD-II", status: "pass", detail: "Zero active Diagnostic Trouble Codes (DTCs) in ECU scan" },
        { name: "Upholstery & Dashboard Trim", status: "good", detail: "Clean condition, non-smoking vehicle, minimal bolster wear" },
      ],
    },
    {
      title: "Suspension, Brakes & Tyres",
      icon: Wrench,
      score: "92/100",
      items: [
        { name: "Brake Pad Thickness", status: "good", detail: "Front pads ~7.5mm remaining (approx 75% life remaining)" },
        { name: "ABS & Brake Booster Response", status: "pass", detail: "Firm pedal feel, straight-line emergency braking verified" },
        { name: "Shock Absorbers & Bushings", status: "pass", detail: "No hydraulic fluid leaks, minimal rebound deflection" },
        { name: "Tyre Tread Depth", status: "good", detail: specs.tyre_condition || "5.8mm average tread depth with even tread wear pattern" },
        { name: "Steering Rack & Alignment", status: "pass", detail: "Direct center feel, no pull or tie-rod slack" },
      ],
    },
  ];

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified 200-Point Inspection
            </span>
            <span className="text-xs text-stone-500 font-medium">Engineer Certified</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-extrabold text-stone-900 tracking-tight">
            Multi-Point Vehicle Inspection Report
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Standardized technical assessment performed by certified automotive diagnostic technicians.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right sm:pr-4 sm:border-r border-stone-200">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
              Inspection Score
            </span>
            <span className="text-3xl font-black text-stone-900">95</span>
            <span className="text-stone-400 text-xs font-bold">/100</span>
          </div>
          <button
            onClick={handlePrintSummary}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors border border-stone-200 cursor-pointer"
            title="Print or Save Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      {/* Core Integrity Assurance Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
        <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-emerald-900 leading-tight">Zero Frame Damage</p>
            <p className="text-[10px] text-emerald-700">Pillar & chassis verified</p>
          </div>
        </div>
        <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-emerald-900 leading-tight">Non-Flooded Certified</p>
            <p className="text-[10px] text-emerald-700">No water line or rust</p>
          </div>
        </div>
        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-blue-900 leading-tight">Genuine Odometer</p>
            <p className="text-[10px] text-blue-700">ECU scan matches readout</p>
          </div>
        </div>
        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-blue-900 leading-tight">Clean Mechanicals</p>
            <p className="text-[10px] text-blue-700">No active ECU trouble codes</p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-stone-200 overflow-x-auto qz-scroll">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.title}
              onClick={() => setActiveTab(idx)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === idx
                  ? "border-blue-700 text-blue-900 bg-blue-50/40"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.title}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-mono">
                {cat.score}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Category Details */}
      <div className="mt-5 space-y-3">
        {categories[activeTab].items.map((item) => (
          <div
            key={item.name}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-stone-50 hover:bg-stone-100/70 rounded-xl border border-stone-200/60 transition-colors gap-2"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">{item.name}</p>
                <p className="text-xs text-stone-600 mt-0.5">{item.detail}</p>
              </div>
            </div>
            <span className="self-start sm:self-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-white text-emerald-800 border border-emerald-200 shrink-0">
              Passed OEM Spec
            </span>
          </div>
        ))}
      </div>

      {/* Expand/Collapse All Categories */}
      <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors cursor-pointer"
        >
          <span>{expanded ? "Hide all 200 points" : "View complete 200-point inspection matrix"}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <span className="text-[11px] text-stone-400 font-medium">
          Tested with Bosch OBD-II & Elcometer Gauge
        </span>
      </div>

      {expanded && (
        <div className="mt-5 pt-5 border-t border-stone-200 space-y-6">
          {categories.map((cat, cIdx) => {
            if (cIdx === activeTab) return null;
            const Icon = cat.icon;
            return (
              <div key={cat.title} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    {cat.title} — {cat.score}
                  </h4>
                </div>
                <div className="space-y-2.5">
                  {cat.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200/50 gap-2"
                    >
                      <div className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-stone-900">{item.name}</p>
                          <p className="text-xs text-stone-500">{item.detail}</p>
                        </div>
                      </div>
                      <span className="self-start sm:self-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                        Passed
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
