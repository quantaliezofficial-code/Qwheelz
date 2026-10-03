import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeftRight, Car, Bike, Zap, Layers } from "lucide-react";
import CoverflowCarousel, { FLEET_SHOWCASE_ITEMS, CoverflowVehicle } from "./CoverflowCarousel";

type CategoryFilter = "All" | "Cars" | "Bikes" | "Electric";

export function CoverflowShowcase() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");

  const filteredItems = FLEET_SHOWCASE_ITEMS.filter((item) => {
    if (activeCategory === "All") return true;
    if (activeCategory === "Cars") return item.category === "Car";
    if (activeCategory === "Bikes") return item.category === "Bike" || item.category === "Scooty";
    if (activeCategory === "Electric") return item.category === "Electric";
    return true;
  });

  return (
    <section
      id="showroom-section"
      className="relative w-full py-14 sm:py-18 bg-white border-b border-blue-100/80 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center flex flex-col items-center">
        {/* Clean text without box or star symbol */}
        <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-blue-900 mb-2">
          Interactive 3D Showroom
        </p>

        {/* Section Heading */}
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Explore Certified Vehicles in Coverflow
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-xl">
          Scroll left to right and right to left to browse verified cars, bikes, and scooties in landscape 3D motion.
        </p>

        {/* Quick Category Switcher */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory("All")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === "All"
                ? "bg-blue-900 text-white shadow-md shadow-blue-950/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            <Layers size={14} />
            <span>All Fleet ({FLEET_SHOWCASE_ITEMS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("Cars")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === "Cars"
                ? "bg-blue-900 text-white shadow-md shadow-blue-950/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            <Car size={14} />
            <span>Cars (Toyota, Skoda, Swift, Baleno, MG)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("Bikes")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === "Bikes"
                ? "bg-blue-900 text-white shadow-md shadow-blue-950/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            <Bike size={14} />
            <span>Bikes & Scooters (Splendor, Apache, KTM, Activa, Jupiter)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("Electric")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === "Electric"
                ? "bg-blue-900 text-white shadow-md shadow-blue-950/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            <Zap size={14} />
            <span>Electric Cars</span>
          </button>
        </div>

        {/* Interaction hints */}
        <div className="mt-4 flex items-center gap-3 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1.5">
            <ArrowLeftRight size={14} className="text-blue-600" />
            Scroll left to right & right to left
          </span>
          <span className="text-slate-300">•</span>
          <span>Click cards or side arrows to navigate</span>
        </div>
      </div>

      {/* Coverflow 3D Carousel Component */}
      <div className="w-full flex items-center justify-center">
        <CoverflowCarousel key={activeCategory} items={filteredItems} autoPlay={false} />
      </div>

      {/* CTA Button below */}
      <div className="mt-8 flex justify-center">
        <Link
          to="/cars"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-950/15 hover:shadow-lg transition-all"
        >
          <span>Browse All Verified Inventory</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}

export default CoverflowShowcase;
