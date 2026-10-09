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
    <section className="relative overflow-hidden bg-white pt-16 pb-16 sm:pt-24 sm:pb-24 lg:pt-28 lg:pb-28 border-b border-stone-200/90 min-h-[500px] sm:min-h-[540px] lg:min-h-[600px] flex flex-col justify-center font-sans shadow-xs">
      {/* =========================================================================
          LAYER 1: REAL CONTINUOUS CINEMATIC AUTOMOTIVE VIDEO BACKGROUND
          - Hardware-accelerated direct playback (Zero CSS filter overhead for buttery 60fps)
          - Monotonically forward camera motion (No jump backs, no hangs, no freeze glitches)
          - Pre-graded with bright daylight tones and gentle automotive contrast
          ========================================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-center sm:object-[center_35%]"
        >
          <source src="/hero_automotive_loop.mp4" type="video/mp4" />
        </video>
      </div>

      {/* =========================================================================
          LAYER 2: LIGHT NEUTRAL / WHITE OVERLAYS
          - Soft daylight wash so dark text is 100% crisp & readable
          - Does NOT hide vehicles or dealership
          ========================================================================= */}
      <div className="absolute inset-0 z-[1] bg-white/40 pointer-events-none" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-white/95 via-white/80 to-white/30 sm:to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-white/60 via-transparent to-white/70 pointer-events-none" />

      {/* =========================================================================
          LAYER 3: HERO CONTENT CONTAINER (Dark Typography & Blue Brand Accents)
          ========================================================================= */}
      <div className="relative z-[2] max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
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
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-900 text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-blue-950/15 hover:bg-blue-950 hover:shadow-lg hover:shadow-blue-900/25 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 cursor-pointer"
            >
              <span>Explore Inventory</span>
              <ArrowUpRight className="w-4 h-4 text-sky-300" />
            </Link>
            <Link
              to="/sell"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/95 backdrop-blur-xs text-blue-950 font-bold text-sm tracking-wide border-2 border-blue-200/90 transition-all shadow-xs hover:bg-blue-50/90 hover:border-blue-400 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
            >
              <span>Sell Your Car</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * HeroAssuranceStrip:
 * Positioned comfortably BELOW where the video margin and border ends.
 * Showcases 200-Point Inspection, RTO Transfer, and Doorstep Delivery in an elevated card.
 */
export function HeroAssuranceStrip() {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 mb-8 sm:mb-12 font-sans">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-7">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-stone-100">
          {/* 200-Point Inspection */}
          <div className="flex items-start gap-4 pt-3 md:pt-0 md:pr-4 first:pt-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shadow-xs">
              <ShieldCheck className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight font-sans">
                200-Point Inspection
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-sans">
                Comprehensive structural, engine, transmission, suspension & electrical diagnostic check verified before listing.
              </p>
            </div>
          </div>

          {/* Guaranteed RTO Transfer */}
          <div className="flex items-start gap-4 pt-5 md:pt-0 md:px-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shadow-xs">
              <CheckCircle2 className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight font-sans">
                Guaranteed RTO Transfer
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-sans">
                100% legal documentation & official RC transfer managed in Lucknow. Delivered to you with zero RTO visits required.
              </p>
            </div>
          </div>

          {/* Insured Doorstep Delivery */}
          <div className="flex items-start gap-4 pt-5 md:pt-0 md:pl-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shadow-xs">
              <Award className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight font-sans">
                Insured Doorstep Delivery
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-sans">
                Insured covered flatbed transit straight from our Jankipuram hub near JB Lawn to your home anywhere in India.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StaticHeroSection;
