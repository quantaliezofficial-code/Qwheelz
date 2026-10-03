import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, RotateCw, Hand } from 'lucide-react';
import RoundCarousel, { RoundCarouselImage } from './RoundCarousel';

const CAR_SHOWCASE_ITEMS: RoundCarouselImage[] = [
  { src: "/cars/wagonr.jpg", title: "Maruti Suzuki WagonR", price: "₹5.50 Lakh" },
  { src: "/cars/tiago.jpg", title: "Tata Tiago Revotron", price: "₹4.80 Lakh" },
  { src: "/cars/baleno.jpg", title: "Maruti Suzuki Baleno", price: "₹6.90 Lakh" },
  { src: "/hero/toyota_hero.jpg", title: "Toyota Glanza Dual-Jet", price: "₹6.75 Lakh" },
  { src: "/cars/audi.png", title: "Audi A4 Technology", price: "₹28.50 Lakh" },
  { src: "/cars/porsche.png", title: "Porsche 718 Cayman", price: "₹82.00 Lakh" },
  { src: "/cars/mustang.png", title: "Ford Mustang GT V8", price: "₹56.00 Lakh" },
  { src: "/cars/lexus.png", title: "Lexus RX 450h Hybrid", price: "₹64.50 Lakh" },
];

export function RoundCarouselShowcase() {
  return (
    <section id="showroom-section" className="relative w-full py-16 sm:py-20 bg-white border-b border-blue-100/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center flex flex-col items-center">
        {/* Clean text without box or star symbol */}
        <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-blue-900 mb-2">
          Interactive 3D Showroom
        </p>

        {/* Section Heading */}
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Explore Certified Vehicles in 3D Motion
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-xl">
          Drag horizontally or watch the 360° carousel rotate through authentic pre-owned Indian vehicles.
        </p>

        {/* Interaction hints */}
        <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1.5">
            <Hand size={14} className="text-blue-600" />
            Drag to spin carousel
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1.5">
            <RotateCw size={14} className="text-blue-600 animate-spin" style={{ animationDuration: '6s' }} />
            Continuous 3D rotation
          </span>
        </div>
      </div>

      {/* 3D Round Carousel Container */}
      <div className="w-full h-[380px] sm:h-[420px] lg:h-[460px] flex items-center justify-center relative select-none">
        <RoundCarousel
          images={CAR_SHOWCASE_ITEMS}
          imageWidth={340}
          imageHeight={280}
          spacing={3.2}
          speed={5}
          direction="right"
          drag={true}
          sensitivity={5}
          tilt={-6}
          perspective={2800}
          cornerRadius={20}
          background="transparent"
        />
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

export default RoundCarouselShowcase;
