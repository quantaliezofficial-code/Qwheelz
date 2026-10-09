import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Star, 
  BadgeCheck, 
  MapPin, 
  Phone, 
  MessageCircle, 
  ArrowRight
} from 'lucide-react';
import { StaticHeroSection, HeroAssuranceStrip } from '../components/StaticHeroSection';
import { CoverflowShowcase } from '../components/CoverflowShowcase';
import { FlowingMenu } from '../components/FlowingMenu';

const CAR_TYPES_FLOWING_ITEMS = [
  { 
    link: '/cars?fuel=Electric', 
    text: 'Electric & Hybrid', 
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=600&h=400&fit=crop&auto=format' 
  },
  { 
    link: '/cars?body_type=sedan', 
    text: 'Executive Sedans', 
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=600&h=400&fit=crop&auto=format' 
  },
  { 
    link: '/cars?body_type=suv', 
    text: 'All-Terrain SUVs', 
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=600&h=400&fit=crop&auto=format' 
  },
  { 
    link: '/cars?body_type=hatchback', 
    text: 'Urban Hatchbacks', 
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=600&h=400&fit=crop&auto=format' 
  },
  { 
    link: '/cars?body_type=muv', 
    text: 'Luxury Family MPVs', 
    image: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=600&h=400&fit=crop&auto=format' 
  }
];

const TOP_INDIAN_BRANDS = [
  { name: 'Maruti Suzuki', models: 'WagonR, Swift, Baleno', logo: '/brands/marutisuzuki.png' },
  { name: 'Tata Motors', models: 'Tiago, Nexon, Punch', logo: '/brands/tatamotors.png' },
  { name: 'Hyundai', models: 'i20, Grand i10, Creta', logo: '/brands/hyundai.png' },
  { name: 'Mahindra', models: 'Bolero, Scorpio, XUV300', logo: '/brands/mahindra.png' },
  { name: 'Kia', models: 'Seltos, Sonet, Careens', logo: '/brands/kia.png' },
  { name: 'Toyota', models: 'Glanza, Urban Cruiser', logo: '/brands/toyota.png' },
  { name: 'Honda', models: 'Amaze, City, Elevate', logo: '/brands/honda.png' },
  { name: 'Renault', models: 'Kwid, Kiger, Triber', logo: '/brands/renault.png' },
];

const THREE_STEPS = [
  {
    step: "01",
    title: "Select & Inspect Digitally",
    description: "Browse 40+ high-res pictures, 360 interior walkarounds, and download the authenticated 200-point inspection certificate.",
  },
  {
    step: "02",
    title: "Lucknow Test Drive or Video Call",
    description: "Visit our Lucknow Flagship showroom in Jankipuram, near JB Lawn, or schedule a live 1-on-1 HD video tour with our technical specialist.",
  },
  {
    step: "03",
    title: "Doorstep Delivery Across India",
    description: "Car delivered directly to your doorstep on an insured covered flatbed carrier anywhere in India with completed RTO RC transfer.",
  },
];

const TESTIMONIALS = [
  {
    name: "Vikramaditya Roy",
    location: "Lucknow, Uttar Pradesh",
    role: "Mahindra Thar 4x4 Owner",
    tag: "Verified Buyer • Lucknow Flagship Delivery",
    rating: 5,
    comment: "The 200-point inspection report was 100% accurate down to the brake pads and ECU scan. No meter rollback, no hidden broker charges. The delivery experience was as premium as buying brand new.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150"
  },
  {
    name: "Dr. Arvind Iyer",
    location: "Kanpur, Uttar Pradesh",
    role: "Toyota Fortuner Legender Buyer",
    tag: "Verified Buyer • RTO Transfer",
    rating: 5,
    comment: "Finding a single-owner Fortuner in pristine condition without accident history is tough in the open market. Qwheelz verified the service records and handed over the transferred RC within 10 days.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
  },
  {
    name: "Ananya Deshmukh",
    location: "Delhi NCR",
    role: "Tata Safari Dark Edition Buyer",
    tag: "Verified Client • Doorstep Flatbed Transit",
    rating: 5,
    comment: "I took a live video inspection of the Safari from Delhi, approved the condition, and it was delivered on a closed flatbed straight to my home. Clean paperwork and transparent pricing!",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
  },
];

import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import { VehicleCard } from "../components/VehicleCard";
import { useAuth } from "../lib/auth";
import { Navigate } from "react-router-dom";

export function HomePage() {
  const { user } = useAuth();
  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  const { viewed } = useRecentlyViewed();
  
  return (
    <div className="bg-[#FAFAF9] text-stone-900 overflow-hidden font-sans min-h-screen selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. STATIC HERO SECTION WITH CINEMATIC AUTOMOTIVE VIDEO BACKGROUND */}
      <StaticHeroSection />

      {/* 2. CORE ASSURANCE DETAILS (Positioned comfortably below the video margin & border) */}
      <HeroAssuranceStrip />

      {/* 3. INTERACTIVE 3D COVERFLOW SHOWCASE */}
      <CoverflowShowcase />

      {/* RECENTLY VIEWED CARS */}
      {Array.isArray(viewed) && viewed.length > 0 && (
        <section className="bg-stone-50 border-b border-stone-200 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-black tracking-tight text-stone-900 mb-6 uppercase">Recently Viewed</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {viewed.slice(0, 4).map((car) => (
                <VehicleCard key={car.id} listing={car} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. THE SEAMLESS 3-STEP JOURNEY (HOW BUYING WORKS) */}
      <section className="py-16 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-blue-700 font-sans text-xs uppercase tracking-widest font-bold block mb-1">
              Transparent Experience
            </span>
            <h2 className="text-xl sm:text-2xl font-sans font-black tracking-tight text-stone-950 uppercase">
              How Buying a Certified Car Works
            </h2>
            <p className="text-stone-500 text-xs mt-2 font-light">
              From online inspection to Lucknow test drives and doorstep flatbed delivery — seamless, transparent, and completely stress-free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {THREE_STEPS.map((stepItem, idx) => (
              <div 
                key={idx}
                className="bg-stone-50 border border-stone-200/80 rounded-2xl p-6 relative flex flex-col justify-between"
              >
                <div>
                  <span className="text-2xl sm:text-3xl font-sans font-black text-blue-600/25 block mb-3">
                    {stepItem.step}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 mb-2">
                    {stepItem.title}
                  </h3>
                  <p className="text-xs text-stone-600 font-light leading-relaxed">
                    {stepItem.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3.5. LIFESTYLE DISCOVERY WIZARD (HELP ME CHOOSE) */}
      <section className="bg-stone-50 border-b border-stone-200 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-sans font-black tracking-tight text-stone-900 mb-4">
            Not sure which car is right for you?
          </h2>
          <p className="text-sm text-stone-500 max-w-xl mx-auto mb-8 leading-relaxed">
            Answer 4 simple questions about your budget, daily usage, and preferences. Our intelligent matching engine will instantly recommend the perfect vehicles for your lifestyle.
          </p>
          <Link 
            to="/wizard"
            className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-950 text-white font-bold uppercase tracking-wider text-xs px-8 py-4 rounded-xl shadow-lg shadow-blue-950/20 transition-transform hover:-translate-y-0.5"
          >
            Help Me Choose <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* 4. POPULAR AUTOMAKERS IN INDIA (DIRECT BRAND TILES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-10">
          <span className="text-stone-500 font-sans text-xs uppercase tracking-widest font-bold">
            Certified Automakers
          </span>
          <h2 className="text-xl sm:text-2xl font-sans font-bold tracking-tight text-stone-900 mt-1 uppercase">
            Browse Trusted Indian & Luxury Brands
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TOP_INDIAN_BRANDS.map((brand, idx) => (
            <Link
              key={idx}
              to={`/cars?brand=${encodeURIComponent(brand.name)}`}
              className="bg-white border border-stone-200 hover:border-blue-500/60 rounded-2xl p-4 text-center group transition-all duration-300 shadow-xs hover:shadow-md flex flex-col items-center justify-between cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden bg-white p-2 mb-3 border border-stone-200 group-hover:scale-105 transition-transform flex items-center justify-center">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-xs font-bold text-stone-900 group-hover:text-blue-700 transition-colors">
                {brand.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* 4.5. VEHICLE CATEGORIES FLOWING MENU */}
      <section className="bg-white py-16 sm:py-20 border-y border-stone-200 text-stone-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-900 mb-2 font-sans">
              Curated Fleet By Category
            </p>
            <h2 className="text-2xl sm:text-4xl font-sans font-black tracking-tight text-stone-900 uppercase">
              Explore By Vehicle Type
            </h2>
          </div>
          <p className="text-stone-500 text-xs sm:text-sm max-w-md font-light leading-relaxed">
            Hover over any category to preview authentic vehicle types and jump directly to certified listings across India.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative w-full h-[460px] sm:h-[520px] rounded-3xl overflow-hidden border border-stone-200 shadow-sm bg-white">
            <FlowingMenu
              items={CAR_TYPES_FLOWING_ITEMS}
              speed={15}
              bgColor="#ffffff"
              textColor="#1c1917"
              marqueeBgColor="#0f172a"
              marqueeTextColor="#ffffff"
              borderColor="#e7e5e4"
            />
          </div>
        </div>
      </section>

      {/* 5. REAL INDIAN CUSTOMER STORIES */}
      <section className="bg-stone-50 py-16 border-y border-stone-200 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-stone-500 font-sans text-xs uppercase tracking-widest font-bold">
              Verified Buyers
            </span>
            <h2 className="text-xl sm:text-2xl font-sans font-black tracking-tight text-stone-900 mt-1 uppercase">
              Real Ownership Stories from Across India
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="bg-white border border-stone-200/80 rounded-2xl p-6 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center space-x-1 text-blue-600 mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                       <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed font-light italic">
                    "{t.comment}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-stone-200" />
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">{t.name}</h4>
                      <p className="text-[10px] text-stone-500">{t.role}</p>
                      <p className="text-[9px] text-stone-400 font-medium">{t.location}</p>
                    </div>
                  </div>
                  <span className="p-1.5 rounded-full bg-blue-50 text-blue-600">
                    <BadgeCheck size={16} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. DIRECT LUCKNOW FLAGSHIP CONCIERGE & WHATSAPP SUPPORT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-white text-stone-900 rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
          
          <div className="space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-sans uppercase font-bold">
              <MapPin size={12} />
              <span>Visit Our Showroom &bull; Lucknow, UP</span>
            </div>
            <h3 className="text-lg sm:text-xl font-sans font-semibold tracking-tight text-stone-900">
              Have questions about a car? Talk directly to our local team.
            </h3>
            <p className="text-stone-500 text-xs font-light max-w-xl">
              Qwheelz Experience Center, Jankipuram, near JB Lawn, Lucknow, Uttar Pradesh - 226021. Speak with our certified vehicle specialists or get a live video walkaround of any car on your phone.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <a
              href="https://wa.me/919839012345"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <MessageCircle size={15} />
              <span>WhatsApp Concierge</span>
            </a>

            <a
              href="tel:+915224008888"
              className="w-full sm:w-auto px-6 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all border border-stone-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone size={14} />
              <span>Call +91 522 400 8888</span>
            </a>
          </div>

        </div>
      </section>

    </div>
  );
}
