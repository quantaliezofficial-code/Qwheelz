import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, CheckCircle2, Award } from "lucide-react";

export function StaticHeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      // Attempt autoplay, muted & inline ensures strict browser compatibility
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback (poster image remains visible)
      });
    }
  }, []);

  return (
    <section className="relative overflow-hidden bg-white border-b border-blue-100/80 min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex flex-col justify-between">
      {/* 1. CINEMATIC FULL-WIDTH BACKGROUND VIDEO (Subtle, Light, Moving Canvas) */}
      <div 
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none transition-opacity duration-1000 ease-out"
        style={{ opacity: videoLoaded ? 1 : 0.85 }}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          poster="/hero/qwheelz_hero_poster.png"
          className="w-full h-full object-cover object-right lg:object-center filter brightness-[1.14] contrast-[0.92] saturate-[0.80] transform-gpu scale-[1.01]"
        >
          <source src="/dealership_reel_clip.mp4" type="video/mp4" />
        </video>
      </div>

      {/* 2. LIGHT WHITE / NEUTRAL OVERLAY (35-50% light daylight wash) */}
      {/* Base neutral wash */}
      <div className="absolute inset-0 z-1 bg-white/40 pointer-events-none" />

      {/* Directional gradient wash: Stronger white on text-side (left) for 100% dark text legibility, opening up to show cars & showroom on right */}
      <div className="absolute inset-0 z-2 bg-gradient-to-r from-white/95 via-white/85 sm:via-white/75 to-white/40 lg:to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-2 bg-gradient-to-b from-white/60 via-transparent to-white/80 pointer-events-none" />

      {/* 3. HERO CONTENT CONTAINER (Text on the left, cars and showroom weighted to the right) */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-28 lg:pb-20 flex-1 flex flex-col justify-center">
        <div className="max-w-xl lg:max-w-2xl text-left">
          {/* Eyebrow */}
          <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-blue-900 mb-3 sm:mb-4">
            India’s Certified Pre-Owned Automobile Network
          </p>

          {/* Main Headline (Dark text with Qwheelz blue brand accent) */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
            Transform Your Automobile{" "}
            <span className="text-blue-900 block sm:inline">Experience</span>
          </h1>

          {/* Supporting Text (High contrast dark slate/charcoal) */}
          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-700 max-w-xl font-normal leading-relaxed">
            Drive verified Indian vehicles with 200-point inspection certificates, zero hidden fees, and hassle-free doorstep delivery.
          </p>

          {/* Dual CTA Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3.5 sm:gap-4">
            <Link
              to="/cars"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-900 text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-blue-950/15 hover:bg-blue-950 hover:shadow-lg hover:shadow-blue-900/25 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              <span>Explore Inventory</span>
              <ArrowRight className="w-4 h-4 text-sky-300" />
            </Link>
            <Link
              to="/sell"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/95 backdrop-blur-xs text-blue-950 font-bold text-sm tracking-wide border-2 border-blue-200/90 transition-all shadow-xs hover:bg-blue-50/90 hover:border-blue-400 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span>Sell Your Car</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. ASSURANCE TRUST BADGES (Clean frosted strip docked cleanly across the base) */}
      <div className="relative z-10 w-full border-t border-blue-100/70 bg-white/80 backdrop-blur-md py-4 sm:py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-6 text-left">
            <div className="flex items-center gap-3.5 p-2 sm:p-2.5 rounded-xl transition-all">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900">200-Point Inspection</p>
                <p className="text-[11px] text-slate-600 mt-0.5">Thorough structural & engine check</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-2 sm:p-2.5 rounded-xl transition-all">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700 border border-sky-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900">RTO Transfer</p>
                <p className="text-[11px] text-slate-600 mt-0.5">Guaranteed 100% legal paperwork</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-2 sm:p-2.5 rounded-xl transition-all">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900">Doorstep Delivery</p>
                <p className="text-[11px] text-slate-600 mt-0.5">Insured flatbed transit across India</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StaticHeroSection;
