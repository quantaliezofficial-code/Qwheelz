import { useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { Search, ShieldCheck, MessageCircle, Tag } from "lucide-react";

export function Hero() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    navigate(`/cars?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-asphalt">
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: "radial-gradient(circle at 15% 20%, rgba(47,82,224,0.35), transparent 45%), radial-gradient(circle at 85% 75%, rgba(242,80,30,0.25), transparent 45%)",
      }} />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="max-w-2xl">
          <span className="qz-plate mb-5">
            <span className="qz-plate__tab">QZ</span>
            <span className="qz-plate__text">VERIFIED MARKETPLACE</span>
          </span>
          <h1 className="font-display text-4xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
            Buy or sell your next car, <span className="text-ignition-400">without the middleman.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-fog/80">
            Luxura Motors connects verified individual sellers and dealers directly with buyers across India —
            browse real listings, chat directly, and close the deal on your terms.
          </p>

          <form onSubmit={submit} className="qz-card mt-8 flex flex-col gap-2 p-2 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 px-3 py-2">
              <Search size={18} className="shrink-0 text-slate" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Try “SUV automatic under 15 lakh”"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-mist"
              />
            </div>
            <div className="hidden w-px self-stretch bg-fog sm:block" />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="qz-input px-3 py-2 text-sm sm:w-36"
            />
            <button type="submit" className="qz-btn-primary rounded-lg px-6 py-2.5 text-sm font-semibold">
              Search
            </button>
          </form>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-fog/70">
            <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-ignition-400" /> Verified sellers &amp; dealers</span>
            <span className="flex items-center gap-2"><MessageCircle size={16} className="text-ignition-400" /> Chat directly, no agents</span>
            <span className="flex items-center gap-2"><Tag size={16} className="text-ignition-400" /> Transparent, upfront pricing</span>
          </div>
        </div>
      </div>
    </section>
  );
}
