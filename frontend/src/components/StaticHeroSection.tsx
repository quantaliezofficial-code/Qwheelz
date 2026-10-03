import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ShieldCheck, CheckCircle2, Sparkles, Award } from "lucide-react";

export function StaticHeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-blue-100/80">
      {/* Top Header Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Subhead without box or star symbol */}
        <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-blue-900 mb-4 sm:mb-5">
          India’s Certified Pre-Owned Automobile Network
        </p>

        {/* Main Headline with Dark Blue Highlight */}
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl leading-[1.12]">
          Transform your <span className="text-blue-900 font-black">Automobile Experience</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
          Drive verified Indian vehicles with 200-point inspection certificates, zero hidden fees, and hassle-free doorstep delivery.
        </p>

        {/* Dual CTA Buttons in Dark Blue & Blue Theme */}
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
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-blue-950 font-bold text-sm tracking-wide border-2 border-blue-200 transition-all shadow-xs hover:bg-blue-50/80 hover:border-blue-400 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span>Sell Your Car</span>
          </Link>
        </div>
      </div>

      {/* Toyota Glanza Car Showcase Across Whole Page Without Margins */}
      <div className="relative w-full mt-6 sm:mt-10 px-0 mx-0 overflow-hidden flex justify-center">
        <img
          src="/hero/toyota_hero.jpg"
          alt="Certified Pre-Owned Toyota Glanza in Studio"
          className="w-full h-auto max-h-[640px] xl:max-h-[720px] object-cover sm:object-contain object-center"
          loading="eager"
        />
      </div>

      {/* Core Assurance Badges below car in Blue Palette */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white border border-blue-100/80 shadow-xs transition-all hover:border-blue-300">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">200-Point Inspection</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Thorough structural & engine check</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white border border-blue-100/80 shadow-xs transition-all hover:border-blue-300">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">RTO Transfer</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Guaranteed 100% legal paperwork</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white border border-blue-100/80 shadow-xs transition-all hover:border-blue-300">
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
