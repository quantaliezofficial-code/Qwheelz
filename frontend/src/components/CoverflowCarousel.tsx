import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface CoverflowVehicle {
  id: string;
  name: string;
  brand: string;
  category: "Car" | "Bike" | "Scooty" | "Electric";
  subtitle: string;
  price: string;
  image: string;
  badge: string;
  link: string;
}

export const FLEET_SHOWCASE_ITEMS: CoverflowVehicle[] = [
  {
    id: "toyota-glanza",
    name: "Toyota Glanza Dual-Jet",
    brand: "Toyota",
    category: "Car",
    subtitle: "G Variant AMT • 2023 • Lucknow",
    price: "₹6.75 Lakh",
    image: "/cars/toyota_glanza.jpg",
    badge: "Toyota Certified",
    link: "/cars?brand=Toyota",
  },
  {
    id: "skoda-slavia",
    name: "Skoda Slavia 1.0 TSI",
    brand: "Skoda",
    category: "Car",
    subtitle: "Ambition AT • 2023 • Delhi NCR",
    price: "₹10.80 Lakh",
    image: "/cars/skoda_slavia.jpg",
    badge: "Skoda Approved",
    link: "/cars",
  },
  {
    id: "maruti-swift",
    name: "Maruti Suzuki Swift",
    brand: "Swift",
    category: "Car",
    subtitle: "ZXI DualTone AMT • 2022 • Kanpur",
    price: "₹6.20 Lakh",
    image: "/cars/swift.jpg",
    badge: "Popular Hatchback",
    link: "/cars?brand=Maruti%20Suzuki",
  },
  {
    id: "maruti-baleno",
    name: "Maruti Suzuki Baleno",
    brand: "Suzuki",
    category: "Car",
    subtitle: "Alpha 1.2 DualJet • 2022 • Lucknow",
    price: "₹6.90 Lakh",
    image: "/cars/baleno.jpg",
    badge: "200-Pt Verified",
    link: "/cars?brand=Maruti%20Suzuki",
  },
  {
    id: "mg-hector",
    name: "Morris Garages (MG) Hector",
    brand: "Morris Garages",
    category: "Car",
    subtitle: "Sharp Pro 2.0 Turbo Diesel • 2022 • Delhi",
    price: "₹16.50 Lakh",
    image: "/cars/mg_hector.jpg",
    badge: "Morris Garages",
    link: "/cars",
  },
  {
    id: "tata-nexon-ev",
    name: "Tata Nexon EV Prime",
    brand: "Electric Cars",
    category: "Electric",
    subtitle: "XZ+ Lux 30.2 kWh Battery • 2022 • Lucknow",
    price: "₹13.40 Lakh",
    image: "/cars/nexon_ev.jpg",
    badge: "Certified Electric EV",
    link: "/cars?fuel=Electric",
  },
  {
    id: "hero-splendor",
    name: "Hero Splendor Plus i3S",
    brand: "Hero",
    category: "Bike",
    subtitle: "100cc All-Black Edition • 2023 • Lucknow",
    price: "₹52,000",
    image: "/cars/splendor.jpg",
    badge: "Certified Bike",
    link: "/cars",
  },
  {
    id: "tvs-apache",
    name: "TVS Apache RTR 160 4V",
    brand: "TVS",
    category: "Bike",
    subtitle: "Racing Edition Dual Disc ABS • 2022 • Kanpur",
    price: "₹92,000",
    image: "/cars/apache.jpg",
    badge: "Sport Motorcycle",
    link: "/cars",
  },
  {
    id: "ktm-duke",
    name: "KTM 390 Duke ABS",
    brand: "KTM",
    category: "Bike",
    subtitle: "BS6 Quickshifter+ • 2022 • Lucknow",
    price: "₹1.95 Lakh",
    image: "/cars/ktm_duke.jpg",
    badge: "Performance Bike",
    link: "/cars",
  },
  {
    id: "honda-activa",
    name: "Honda Scooty Activa 6G",
    brand: "Honda",
    category: "Scooty",
    subtitle: "DLX Smart Key H-Smart • 2023 • Lucknow",
    price: "₹64,000",
    image: "/cars/honda_activa.jpg",
    badge: "Verified Scooty",
    link: "/cars",
  },
  {
    id: "tvs-jupiter",
    name: "TVS Jupiter 125",
    brand: "TVS",
    category: "Scooty",
    subtitle: "Disc SmartXonnect Bluetooth • 2023 • Kanpur",
    price: "₹68,000",
    image: "/cars/tvs_jupiter.jpg",
    badge: "Family Scooter",
    link: "/cars",
  },
];

export interface CoverflowCarouselProps {
  items?: CoverflowVehicle[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

export function CoverflowCarousel({
  items = FLEET_SHOWCASE_ITEMS,
  autoPlay = false,
  autoPlayInterval = 4500,
  className = "",
}: CoverflowCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const total = items.length;

  const next = useCallback(() => {
    setActiveIndex((curr) => (curr + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setActiveIndex((curr) => (curr - 1 + total) % total);
  }, [total]);

  const goTo = useCallback((idx: number) => {
    setActiveIndex(idx);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prev]);

  // Autoplay
  useEffect(() => {
    if (!autoPlay || isHovered) return;
    const interval = setInterval(next, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isHovered, next]);

  // Compute non-overlapping spacing
  const getCardTransform = (index: number) => {
    let diff = index - activeIndex;

    // Wrap around for infinite reel feel
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    const absDiff = Math.abs(diff);

    // Completely off-screen for distant items
    if (absDiff > 2) {
      return {
        x: diff > 0 ? 800 : -800,
        scale: 0.65,
        opacity: 0,
        rotateY: diff > 0 ? -15 : 15,
        zIndex: 0,
        pointerEvents: "none" as const,
      };
    }

    if (diff === 0) {
      return {
        x: 0,
        scale: 1,
        opacity: 1,
        rotateY: 0,
        zIndex: 25,
        pointerEvents: "auto" as const,
      };
    }

    const direction = diff > 0 ? 1 : -1;
    // Generous offset so neighbor cards sit cleanly on left and right without overlapping
    // In desktop: card is ~560px wide (half-width 280px). An offset of ~450px ensures no overlap!
    const xOffset = direction * (absDiff === 1 ? 460 : 780);
    const scale = absDiff === 1 ? 0.85 : 0.7;
    const opacity = absDiff === 1 ? 0.85 : 0.35;
    const rotateY = direction * -12; // Gentle, natural angle without distortion

    return {
      x: xOffset,
      scale,
      opacity,
      rotateY,
      zIndex: 20 - absDiff * 5,
      pointerEvents: "auto" as const,
    };
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full select-none py-4 ${className}`}
      style={{ perspective: "1400px" }}
    >
      {/* 3D Stage Container */}
      <div className="relative w-full h-[380px] sm:h-[440px] lg:h-[480px] flex items-center justify-center overflow-hidden sm:overflow-visible">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={prev}
          aria-label="Previous Slide"
          className="absolute left-2 sm:left-4 lg:left-8 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-slate-800 shadow-xl border border-slate-200/90 hover:bg-blue-50 hover:text-blue-900 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 text-slate-700" />
        </button>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={next}
          aria-label="Next Slide"
          className="absolute right-2 sm:right-4 lg:right-8 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-slate-800 shadow-xl border border-slate-200/90 hover:bg-blue-50 hover:text-blue-900 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
        >
          <ChevronRight className="w-6 h-6 text-slate-700" />
        </button>

        {/* Cards Stack */}
        <div className="relative w-[320px] sm:w-[480px] lg:w-[600px] h-[260px] sm:h-[340px] lg:h-[390px] flex items-center justify-center">
          {items.map((item, index) => {
            const transform = getCardTransform(index);
            const isCenter = index === activeIndex;

            return (
              <motion.div
                key={item.id}
                animate={{
                  x: transform.x,
                  scale: transform.scale,
                  opacity: transform.opacity,
                  rotateY: transform.rotateY,
                  zIndex: transform.zIndex,
                }}
                transition={{
                  type: "spring",
                  stiffness: 240,
                  damping: 24,
                  mass: 0.85,
                }}
                drag={isCenter ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={(_e, info) => {
                  if (info.offset.x > 40 || info.velocity.x > 250) {
                    prev();
                  } else if (info.offset.x < -40 || info.velocity.x < -250) {
                    next();
                  }
                }}
                onClick={() => {
                  if (!isCenter) goTo(index);
                }}
                className={`absolute inset-0 cursor-pointer rounded-2xl sm:rounded-3xl overflow-hidden bg-white shadow-xl transition-shadow ${
                  isCenter
                    ? "ring-2 ring-blue-600/25 shadow-2xl shadow-blue-950/15 cursor-grab active:cursor-grabbing"
                    : "border border-slate-200/70 hover:opacity-95"
                }`}
                style={{
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Full Uncut Landscape Photo Container */}
                <div className="relative w-full h-full bg-[#f8fafc] flex items-center justify-center overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover object-center select-none"
                    draggable={false}
                  />

                  {/* Gentle gradient for legibility without obscuring vehicle */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent pointer-events-none" />

                  {/* Top Assurance Badge */}
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white/95 text-blue-950 backdrop-blur-md shadow-sm border border-slate-200/80">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>{item.badge}</span>
                    </span>
                    <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-900/90 text-white backdrop-blur-md">
                      {item.category}
                    </span>
                  </div>

                  {/* Bottom Info Bar */}
                  <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 text-white flex flex-col justify-end">
                    <div className="flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-sky-300 block mb-0.5">
                          {item.brand}
                        </span>
                        <h3 className="font-display text-base sm:text-xl lg:text-2xl font-black text-white truncate drop-shadow-sm">
                          {item.name}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-slate-300 font-medium truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>

                      {/* Price Pill */}
                      <div className="shrink-0 text-right">
                        <span className="block text-sm sm:text-lg lg:text-xl font-mono font-black text-sky-300 bg-blue-950/85 px-3 py-1 rounded-xl border border-blue-400/30 shadow-inner">
                          {item.price}
                        </span>
                      </div>
                    </div>

                    {/* View Button when Center Card */}
                    {isCenter && (
                      <div className="mt-2.5 pt-2.5 border-t border-white/15 flex items-center justify-between">
                        <span className="text-[10px] sm:text-xs text-blue-200 font-medium">
                          Swipe or use arrows to view fleet
                        </span>
                        <Link
                          to={item.link}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 rounded-xl transition-all shadow-md hover:shadow-lg"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>Explore Listing</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Pagination Indicator Dots */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all rounded-full ${
              i === activeIndex
                ? "w-8 h-2.5 bg-blue-900 shadow-sm"
                : "w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default CoverflowCarousel;
