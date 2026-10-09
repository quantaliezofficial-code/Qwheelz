import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ShieldCheck, CheckCircle2, Award } from "lucide-react";

export function StaticHeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = () => {
      const promise = video.play();
      if (promise !== undefined) {
        promise.catch(() => {
          // Handled gracefully; will auto-resume on first interaction or tab focus
        });
      }
    };

    playVideo();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        playVideo();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("touchstart", playVideo, { once: true });
    window.addEventListener("scroll", playVideo, { once: true });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-white pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20 border-b border-blue-100/80 min-h-[540px] sm:min-h-[580px] lg:min-h-[640px] flex flex-col justify-between font-sans">
      {/* =========================================================================
          LAYER 1: REAL CONTINUOUS PLAYING AUTOMOTIVE VIDEO BACKGROUND (Pure Wide Motion)
          - 100% Indian Cars & Qwheelz Dealership
          - Full 1080p Wide Framing (NO Aggressive Digital Zoom, No Crop)
          - Zero Ghost Text, Zero Screenshots, Zero Watermarks
          - Non-blocking pointer events
          ========================================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-center sm:object-[center_35%] filter brightness-[1.12] contrast-[0.94] saturate-[0.88]"
        >
          <source src="/hero_automotive_loop.mp4" type="video/mp4" />
        </video>
      </div>

      {/* =========================================================================
          LAYER 2: LIGHT NEUTRAL / WHITE OVERLAY (rgba(255, 255, 255, 0.40))
          - Soft daylight wash so dark text is 100% crisp & readable
          - Does NOT hide vehicles or dealership
          ========================================================================= */}
      <div className="absolute inset-0 z-[1] bg-white/40 pointer-events-none" />

      {/* Directional gradient wash for high contrast text readability on all viewports */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-white/95 via-white/80 to-white/30 sm:to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-white/60 via-transparent to-white/70 pointer-events-none" />

      {/* =========================================================================
          LAYER 3: HERO CONTENT CONTAINER (Dark Typography & Blue Brand Accents)
          ========================================================================= */}
      <div className="relative z-[2] max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center">
        <div className="max-w-2xl text-left">
          {/* Eyebrow */}
          <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-blue-900 mb-3 sm:mb-4 font-sans">
            India’s Certified Pre-Owned Automobile Network
          </p>

          {/* Main Headline (Dark Navy / Charcoal Text with Qwheelz Blue Highlight) */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] font-sans">
            Transform Your Automobile{" "}
            <span className="text-blue-900 font-black block sm:inline">Experience</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-700 max-w-xl font-normal leading-relaxed font-sans">
            Drive verified Indian vehicles with 200-point inspection certificates, zero hidden fees, and hassle-free doorstep delivery.
          </p>

          {/* Dual CTA Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3.5 sm:gap-4 font-sans">
            <Link
              to="/cars"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-900 text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-blue-950/15 hover:bg-blue-950 hover:shadow-lg hover:shadow-blue-900/25 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              <span>Explore Inventory</span>
              <ArrowUpRight className="w-4 h-4 text-sky-300" />
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

      {/* =========================================================================
          LAYER 4: CORE ASSURANCE BADGES (Clean Frosted Strip Docked Across the Base)
          ========================================================================= */}
      <div className="relative z-[2] w-full mt-10 sm:mt-14 pt-4 sm:pt-6 border-t border-blue-100/70 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-6 text-left font-sans">
            <div className="flex items-center gap-3.5 p-2 sm:p-2.5 rounded-xl transition-all">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 font-sans">200-Point Inspection</p>
                <p className="text-[11px] text-slate-600 mt-0.5 font-sans">Thorough structural & engine check</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-2 sm:p-2.5 rounded-xl transition-all">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700 border border-sky-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 font-sans">RTO Transfer</p>
                <p className="text-[11px] text-slate-600 mt-0.5 font-sans">Guaranteed 100% legal paperwork</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-2 sm:p-2.5 rounded-xl transition-all">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 font-sans">Doorstep Delivery</p>
                <p className="text-[11px] text-slate-600 mt-0.5 font-sans">Insured flatbed transit across India</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StaticHeroSection;
