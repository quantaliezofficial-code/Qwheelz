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
          // Autoplay policy fallback: will resume on visibility or first interaction
        });
      }
    };

    playVideo();

    // Auto-resume if browser throttled in background or on visibility change
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
    <section className="relative overflow-hidden bg-white pt-12 pb-14 sm:pt-16 sm:pb-18 border-b border-blue-100/80">
      {/* =========================================================================
          LAYER 1: REAL CONTINUOUS PLAYING AUTOMOTIVE VIDEO BACKGROUND (Pure Motion)
          - 100% Indian Cars & Qwheelz Dealership
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
          className="w-full h-full object-cover object-center filter brightness-[1.14] contrast-[0.92] saturate-[0.85]"
        >
          <source src="/hero_automotive_loop.mp4" type="video/mp4" />
        </video>
      </div>

      {/* =========================================================================
          LAYER 2: LIGHT NEUTRAL / WHITE OVERLAY (rgba(255, 255, 255, 0.45))
          - Soft daylight wash so dark text is 100% crisp & readable
          - Subtle rather than attention-grabbing
          - Does NOT hide vehicles or dealership
          ========================================================================= */}
      <div className="absolute inset-0 z-[1] bg-white/45 pointer-events-none" />

      {/* Subtle directional gradient to give top headline high contrast while keeping motion alive */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-white/60 via-transparent to-white/70 pointer-events-none" />

      {/* =========================================================================
          LAYER 3: HERO CONTENT CONTAINER (Dark Typography & Blue Brand Accents)
          ========================================================================= */}
      <div className="relative z-[2] max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Eyebrow */}
        <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-blue-900 mb-4 sm:mb-5">
          India’s Certified Pre-Owned Automobile Network
        </p>

        {/* Main Headline (Dark Navy / Charcoal Text with Qwheelz Blue Highlight) */}
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl leading-[1.12]">
          Transform your{" "}
          <span className="text-blue-900 font-black">Automobile Experience</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-base sm:text-lg text-slate-700 max-w-2xl font-normal leading-relaxed">
          Drive verified Indian vehicles with 200-point inspection certificates, zero hidden fees, and hassle-free doorstep delivery.
        </p>

        {/* Dual CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
          <Link
            to="/cars"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-900 text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-blue-950/15 hover:bg-blue-950 hover:shadow-lg hover:shadow-blue-900/25 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            <span>Explore Inventory</span>
            <ArrowUpRight className="w-4 h-4 text-sky-300" />
          </Link>
          <Link
            to="/sell"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/95 backdrop-blur-xs text-blue-950 font-bold text-sm tracking-wide border-2 border-blue-200 transition-all shadow-xs hover:bg-blue-50/80 hover:border-blue-400 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span>Sell Your Car</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          LAYER 4: RESTORED ORIGINAL GREY CAR (Toyota Glanza Studio Showcase)
          - Restored in front of background video layer
          - Positioned exactly below hero content and buttons
          - mix-blend-multiply eliminates white box and blends turntable shadow seamlessly
          ========================================================================= */}
      <div className="relative z-[2] w-full mt-6 sm:mt-8 px-0 mx-0 overflow-hidden flex justify-center">
        <img
          src="/hero/toyota_hero.jpg"
          alt="Certified Pre-Owned Toyota Glanza in Studio"
          className="w-full h-auto max-h-[520px] sm:max-h-[600px] xl:max-h-[680px] object-cover sm:object-contain object-center mix-blend-multiply transition-transform duration-500 hover:scale-[1.01]"
          loading="eager"
        />
      </div>

      {/* =========================================================================
          LAYER 5: CORE ASSURANCE BADGES (200-Point Inspection, RTO Transfer, Delivery)
          ========================================================================= */}
      <div className="relative z-[2] max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white/90 backdrop-blur-md border border-blue-100/90 shadow-xs transition-all hover:border-blue-300 hover:shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">200-Point Inspection</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Thorough structural & engine check</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white/90 backdrop-blur-md border border-blue-100/90 shadow-xs transition-all hover:border-blue-300 hover:shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">RTO Transfer</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Guaranteed 100% legal paperwork</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white/90 backdrop-blur-md border border-blue-100/90 shadow-xs transition-all hover:border-blue-300 hover:shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Doorstep Delivery</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Insured flatbed transit across India</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StaticHeroSection;
