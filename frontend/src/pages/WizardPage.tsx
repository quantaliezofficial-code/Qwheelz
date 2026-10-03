import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Car, Zap, Coffee, Tent, Shield, Gauge, Briefcase, Heart, Check, Fuel, ArrowLeft } from "lucide-react";

type WizardData = {
  price_max?: number;
  body_type?: string;
  fuel_type?: string;
  km_max?: number;
};

export function WizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>({});

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => Math.max(1, s - 1));

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (data.price_max) params.set("price_max", String(data.price_max));
    if (data.body_type) params.set("body_type", data.body_type);
    if (data.fuel_type) params.set("fuel_type", data.fuel_type);
    if (data.km_max) params.set("km_max", String(data.km_max));
    navigate(`/cars?${params.toString()}`);
  };

  return (
    <div className="bg-[#FAFAF9] text-stone-900 min-h-screen font-sans flex flex-col">
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 sm:py-20 flex flex-col justify-center">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6 shadow-sm">
            <Sparkles size={32} />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-stone-900 tracking-tight mb-4">
            Help Me Choose
          </h1>
          <p className="text-lg text-stone-500 max-w-xl mx-auto">
            Answer a few quick questions, and we'll match you with the perfect vehicles for your lifestyle.
          </p>
        </div>

        {/* Progress */}
        <div className="max-w-2xl mx-auto w-full mb-12 flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-stone-200 -z-10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }} />
          </div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${step >= i ? 'bg-blue-600 text-white shadow-md' : 'bg-stone-100 text-stone-400 border-2 border-stone-200'}`}>
              {step > i ? <Check size={14} /> : i}
            </div>
          ))}
        </div>

        {/* Steps Container */}
        <div className="max-w-3xl mx-auto w-full bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden">
          <div className="p-8 sm:p-12 relative min-h-[400px] flex flex-col">
            
            {step === 1 && (
              <div className="animate-in slide-in-from-right-8 duration-500 flex-1 flex flex-col">
                <h2 className="text-2xl font-bold text-stone-900 mb-2">What is your budget?</h2>
                <p className="text-sm text-stone-500 mb-8">Select the maximum price you are comfortable with.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Under ₹5 Lakh", value: 500000, icon: Coffee },
                    { label: "Under ₹10 Lakh", value: 1000000, icon: Briefcase },
                    { label: "Under ₹20 Lakh", value: 2000000, icon: Shield },
                    { label: "₹20+ Lakh (Premium)", value: 5000000, icon: Zap },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setData({...data, price_max: opt.value}); handleNext(); }}
                      className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${data.price_max === opt.value ? 'border-blue-600 bg-blue-50' : 'border-stone-100 bg-white hover:border-blue-200 hover:bg-stone-50'}`}
                    >
                      <div className={`p-3 rounded-full ${data.price_max === opt.value ? 'bg-blue-100 text-blue-600' : 'bg-stone-100 text-stone-500'}`}>
                        <opt.icon size={24} />
                      </div>
                      <span className="font-bold text-stone-800 text-lg">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in slide-in-from-right-8 duration-500 flex-1 flex flex-col">
                <h2 className="text-2xl font-bold text-stone-900 mb-2">How will you primarily use the car?</h2>
                <p className="text-sm text-stone-500 mb-8">This helps us recommend the perfect body type for your needs.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "City Commute", desc: "Easy to park, great mileage", value: "hatchback", icon: Car },
                    { label: "Family Trips", desc: "Spacious and comfortable", value: "suv", icon: Heart },
                    { label: "Executive / Status", desc: "Elegant and professional", value: "sedan", icon: Briefcase },
                    { label: "Weekend Adventures", desc: "Tough and capable", value: "suv", icon: Tent },
                  ].map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => { setData({...data, body_type: opt.value}); handleNext(); }}
                      className={`flex flex-col p-5 rounded-2xl border-2 transition-all text-left ${data.body_type === opt.value ? 'border-blue-600 bg-blue-50' : 'border-stone-100 bg-white hover:border-blue-200 hover:bg-stone-50'}`}
                    >
                      <div className="flex items-center gap-4 mb-2">
                        <div className={`p-2.5 rounded-full ${data.body_type === opt.value ? 'bg-blue-100 text-blue-600' : 'bg-stone-100 text-stone-500'}`}>
                          <opt.icon size={20} />
                        </div>
                        <span className="font-bold text-stone-800 text-lg">{opt.label}</span>
                      </div>
                      <p className="text-sm text-stone-500 ml-[52px]">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in slide-in-from-right-8 duration-500 flex-1 flex flex-col">
                <h2 className="text-2xl font-bold text-stone-900 mb-2">Preferred fuel type?</h2>
                <p className="text-sm text-stone-500 mb-8">Choose based on your daily running and charging access.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Petrol", value: "petrol", icon: Fuel },
                    { label: "Diesel", value: "diesel", icon: Gauge },
                    { label: "Electric (EV)", value: "electric", icon: Zap },
                    { label: "No Preference", value: "", icon: Sparkles },
                  ].map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => { setData({...data, fuel_type: opt.value || undefined}); handleNext(); }}
                      className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${data.fuel_type === (opt.value || undefined) ? 'border-blue-600 bg-blue-50' : 'border-stone-100 bg-white hover:border-blue-200 hover:bg-stone-50'}`}
                    >
                      <div className={`p-3 rounded-full ${data.fuel_type === (opt.value || undefined) ? 'bg-blue-100 text-blue-600' : 'bg-stone-100 text-stone-500'}`}>
                        <opt.icon size={24} />
                      </div>
                      <span className="font-bold text-stone-800 text-lg">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="animate-in slide-in-from-right-8 duration-500 flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                  <Sparkles size={48} />
                </div>
                <h2 className="text-3xl font-black text-stone-900 mb-4">You're all set!</h2>
                <p className="text-stone-500 max-w-md mx-auto mb-10">
                  We've curated a personalized list of vehicles that perfectly match your lifestyle, budget, and preferences.
                </p>
                <button
                  onClick={buildQuery}
                  className="bg-blue-900 hover:bg-blue-950 text-white font-bold uppercase tracking-wider text-sm px-8 py-4 rounded-xl shadow-xl transition-transform hover:-translate-y-1 flex items-center gap-3"
                >
                  Show My Matches <ArrowRight size={18} />
                </button>
              </div>
            )}

          </div>
          
          {/* Footer controls */}
          {step > 1 && step < 4 && (
            <div className="px-8 py-4 bg-stone-50 border-t border-stone-100 flex justify-between">
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-stone-900 transition-colors"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button 
                onClick={handleNext}
                className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Skip <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
