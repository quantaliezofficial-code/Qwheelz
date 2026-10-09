import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft, 
  Gauge, 
  Users, 
  Zap, 
  Fuel, 
  Eye, 
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface ShowcaseCar {
  id: string;
  brand: string;
  model: string;
  category: string;
  tagline: string;
  pricePerDay: string;
  sellingPrice: string;
  cutoutImage: string;
  specs: {
    range: string;
    seats: string;
    topSpeed: string;
    power: string;
    transmission: string;
    engine: string;
    acceleration: string;
  };
  gallery: {
    title: string;
    subtitle: string;
    image: string;
  }[];
}

export const SHOWCASE_CARS: ShowcaseCar[] = [
  {
    id: 'maruti-wagonr',
    brand: 'MARUTI SUZUKI',
    model: 'WAGON R',
    category: 'HATCHBACKS',
    tagline: 'The Smart Urban Family Car',
    pricePerDay: '₹1,500/day',
    sellingPrice: '₹5.50 Lakh',
    cutoutImage: '/cars/wagonr.png',
    specs: {
      range: '24 KMPL',
      seats: '5 SEATS',
      topSpeed: '150 KM/H',
      power: '66 HP',
      transmission: '5-Speed Manual / AGS',
      engine: '1.0L K-Series',
      acceleration: '14.5s 0-100'
    },
    gallery: [
      {
        title: 'Spacious Cabin',
        subtitle: 'Tall-boy Design for Headroom',
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600'
      },
      {
        title: 'SmartPlay Studio',
        subtitle: '7-inch Touchscreen Infotainment',
        image: 'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&q=80&w=600'
      },
      {
        title: 'Instrument Cluster',
        subtitle: 'Modern Digital-Analog Display',
        image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=600'
      },
      {
        title: 'Boot Space',
        subtitle: '341L Best-in-class luggage capacity',
        image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=600'
      }
    ]
  },
  {
    id: 'tata-tiago',
    brand: 'TATA',
    model: 'TIAGO',
    category: 'HATCHBACKS',
    tagline: 'Seriously Fun, Seriously Safe',
    pricePerDay: '₹1,600/day',
    sellingPrice: '₹4.80 Lakh',
    cutoutImage: '/cars/tiago.png',
    specs: {
      range: '20 KMPL',
      seats: '5 SEATS',
      topSpeed: '150 KM/H',
      power: '84 HP',
      transmission: '5-Speed Manual',
      engine: '1.2L Revotron',
      acceleration: '13.8s 0-100'
    },
    gallery: [
      {
        title: 'Premium Interior',
        subtitle: 'Dual-tone dashboard',
        image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=600'
      },
      {
        title: 'Harman Audio',
        subtitle: '8-Speaker Surround System',
        image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=600'
      },
      {
        title: 'Digital Cluster',
        subtitle: 'Advanced Driver Info',
        image: 'https://images.unsplash.com/photo-1562591188-1a5203a1106e?auto=format&fit=crop&q=80&w=600'
      },
      {
        title: 'Comfort Seats',
        subtitle: 'Premium Fabric Upholstery',
        image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600'
      }
    ]
  },
  {
    id: 'maruti-baleno',
    brand: 'MARUTI SUZUKI',
    model: 'BALENO',
    category: 'HATCHBACKS',
    tagline: 'Premium Hatchback Excellence',
    pricePerDay: '₹2,000/day',
    sellingPrice: '₹7.20 Lakh',
    cutoutImage: '/cars/baleno.png',
    specs: {
      range: '22 KMPL',
      seats: '5 SEATS',
      topSpeed: '160 KM/H',
      power: '88 HP',
      transmission: '5-Speed Manual / AMT',
      engine: '1.2L DualJet VVT',
      acceleration: '12.5s 0-100'
    },
    gallery: [
      {
        title: 'HUD Display',
        subtitle: 'Head-up Display Screen',
        image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=600'
      },
      {
        title: '360 Camera',
        subtitle: 'Surround View Monitor',
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600'
      },
      {
        title: 'SmartPlay Pro+',
        subtitle: '9-inch HD Touchscreen',
        image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=600'
      },
      {
        title: 'Plush Seating',
        subtitle: 'Deep Bolstered Seats',
        image: 'https://images.unsplash.com/photo-1554744512-d6c603f27c54?auto=format&fit=crop&q=80&w=600'
      }
    ]
  },
  {
    id: 'hero-splendor',
    brand: 'HERO',
    model: 'SPLENDOR+',
    category: 'BIKES & SCOOTERS',
    tagline: 'The Reliable Indian Commuter',
    pricePerDay: '₹300/day',
    sellingPrice: '₹75,000',
    cutoutImage: '/cars/splendor.png',
    specs: {
      range: '70 KMPL',
      seats: '2 SEATS',
      topSpeed: '87 KM/H',
      power: '8 HP',
      transmission: '4-Speed Constant Mesh',
      engine: '97.2cc Air Cooled',
      acceleration: 'N/A'
    },
    gallery: [
      {
        title: 'Classic Dial',
        subtitle: 'Analog Speedometer',
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=600'
      },
      {
        title: 'Alloy Wheels',
        subtitle: 'Durable 5-Spoke Design',
        image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&q=80&w=600'
      },
      {
        title: 'Engine Block',
        subtitle: 'Reliable 97cc Motor',
        image: 'https://images.unsplash.com/photo-1615172282427-9a57ef2d142e?auto=format&fit=crop&q=80&w=600'
      },
      {
        title: 'Long Seat',
        subtitle: 'Comfortable Commuting',
        image: 'https://images.unsplash.com/photo-1471440671318-55bdbb772f93?auto=format&fit=crop&q=80&w=600'
      }
    ]
  },
  {
    id: 'tvs-apache',
    brand: 'TVS',
    model: 'APACHE RTR 160',
    category: 'BIKES & SCOOTERS',
    tagline: 'Racing DNA Unleashed',
    pricePerDay: '₹600/day',
    sellingPrice: '₹1.20 Lakh',
    cutoutImage: '/cars/apache.png',
    specs: {
      range: '45 KMPL',
      seats: '2 SEATS',
      topSpeed: '114 KM/H',
      power: '16 HP',
      transmission: '5-Speed Manual',
      engine: '159.7cc 4-Valve',
      acceleration: '4.8s 0-60'
    },
    gallery: [
      {
        title: 'Digital Display',
        subtitle: 'SmartXonnect Bluetooth',
        image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=600'
      },
      {
        title: 'LED Headlamp',
        subtitle: 'Aggressive DRL Design',
        image: 'https://images.unsplash.com/photo-1615172282427-9a57ef2d142e?auto=format&fit=crop&q=80&w=600'
      },
      {
        title: 'Racing Exhaust',
        subtitle: 'Throaty Exhaust Note',
        image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&q=80&w=600'
      },
      {
        title: 'Petal Discs',
        subtitle: 'Super-Moto ABS',
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=600'
      }
    ]
  },
  {
    id: 'yamaha-fzs',
    brand: 'YAMAHA',
    model: 'FZ-S FI',
    category: 'BIKES & SCOOTERS',
    tagline: 'Lord of the Streets',
    pricePerDay: '₹650/day',
    sellingPrice: '₹1.35 Lakh',
    cutoutImage: '/cars/yamaha.png',
    specs: {
      range: '45 KMPL',
      seats: '2 SEATS',
      topSpeed: '110 KM/H',
      power: '12.4 HP',
      transmission: '5-Speed Manual',
      engine: '149cc Fuel Injected',
      acceleration: '5.2s 0-60'
    },
    gallery: [
      {
        title: 'Muscular Tank',
        subtitle: 'Aggressive Streetfighter Look',
        image: 'https://images.unsplash.com/photo-1591147053073-196fc9fcf0fc?auto=format&fit=crop&q=80&w=600'
      },
      {
        title: 'LED Headlight',
        subtitle: 'Excellent Night Visibility',
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=600'
      },
      {
        title: 'Fat Rear Tyre',
        subtitle: '140mm Wide Radial',
        image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&q=80&w=600'
      },
      {
        title: 'LCD Console',
        subtitle: 'Negative LCD Display',
        image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=600'
      }
    ]
  }
];

export function ArcarHeroShowcase() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const currentCar = SHOWCASE_CARS[currentIndex];

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === SHOWCASE_CARS.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? SHOWCASE_CARS.length - 1 : prev - 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !isDetailsOpen) handleNext();
      if (e.key === 'ArrowLeft' && !isDetailsOpen) handlePrev();
      if (e.key === 'Escape' && isDetailsOpen) setIsDetailsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDetailsOpen]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.94
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 260, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.94,
      transition: {
        x: { type: 'spring', stiffness: 260, damping: 30 },
        opacity: { duration: 0.3 }
      }
    })
  };

  const textVariants = {
    enter: (dir: number) => ({
      y: dir > 0 ? 40 : -40,
      opacity: 0
    }),
    center: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    },
    exit: (dir: number) => ({
      y: dir > 0 ? -40 : 40,
      opacity: 0,
      transition: { duration: 0.3 }
    })
  };

  return (
    <div className="relative w-full min-h-[720px] lg:min-h-[840px] bg-gradient-to-b from-[#F3F4F7] via-[#EBEEF2] to-[#E2E6EC] text-slate-800 overflow-hidden select-none flex flex-col justify-between py-6 sm:py-8 px-4 sm:px-8 lg:px-14 border-b border-slate-300/60 shadow-inner">
      
      {/* Subtle Studio Glow Backlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[360px] bg-white/70 blur-[120px] rounded-full pointer-events-none" />

      {/* TOP HEADER NAVIGATION (Matching the video) */}
      <div className="relative z-40 w-full max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo or Back Button in Details Mode */}
        <div className="flex items-center gap-3">
          {isDetailsOpen ? (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={() => setIsDetailsOpen(false)}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-950 bg-white/80 hover:bg-white px-3 py-1.5 rounded-full border border-slate-300 shadow-sm transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Showcase</span>
            </motion.button>
          ) : (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/logo-wide.png" alt="QWheelz" className="h-8 w-auto object-contain" />
            </div>
          )}
        </div>

        {/* Center Categories */}
        {!isDetailsOpen && (
          <nav className="hidden md:flex items-center gap-1.5 bg-white/60 backdrop-blur-md p-1 rounded-full border border-slate-200/80 shadow-xs">
            {['ALL', 'CARS', 'SEDANS', 'BIKES'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  if (cat === 'CARS') navigate('/cars?body_type=hatchback');
                  else if (cat === 'SEDANS') navigate('/cars?body_type=sedan');
                  else if (cat === 'BIKES') navigate('/cars?body_type=bike');
                  else navigate('/cars');
                }}
                className={`px-4 py-1.5 text-[11px] font-bold tracking-wider rounded-full transition-all cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>
        )}

        {/* Right User / Inventory Link */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/cars')}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer mr-2"
          >
            <span>All Vehicles</span>
          </button>
          
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <div className="w-5 h-5 rounded-full bg-blue-500/30 flex items-center justify-center text-[10px] font-bold text-blue-300">
              Q
            </div>
            <span>MY ACCOUNT</span>
          </button>
        </div>
      </div>

      {/* MAIN SHOWCASE STAGE */}
      <div className="relative z-20 flex-1 flex flex-col justify-center items-center my-4 sm:my-6 max-w-7xl mx-auto w-full">

        {/* REMOVED GIANT BACKGROUND TYPOGRAPHY per user request */}

        {/* FOREGROUND CAR CUTOUT WITH CONTACT SHADOW (Layer 2) */}
        <div className="relative z-20 w-full flex items-center justify-center px-4">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentCar.id + '-car'}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag={!isDetailsOpen ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={(_, info) => {
                if (info.offset.x < -40) handleNext();
                else if (info.offset.x > 40) handlePrev();
              }}
              className="relative flex flex-col items-center justify-center w-full max-w-4xl cursor-grab active:cursor-grabbing"
            >
              {/* Car Image with scale/position shift in Details mode */}
              <motion.div
                animate={{
                  scale: isDetailsOpen ? 0.7 : 1,
                  y: isDetailsOpen ? -35 : 0
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="relative w-full max-w-[340px] sm:max-w-[550px] md:max-w-[700px] lg:max-w-[840px] cursor-pointer"
                onClick={() => !isDetailsOpen && setIsDetailsOpen(true)}
              >
                <img
                  src={currentCar.cutoutImage}
                  alt={`${currentCar.brand} ${currentCar.model}`}
                  className="w-full h-auto object-contain filter drop-shadow-2xl hover:brightness-105 transition-all"
                  draggable={false}
                />

                {/* Ground Ambient Contact Shadow */}
                <div 
                  className="absolute -bottom-4 sm:-bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-6 sm:h-9 bg-slate-900/40 blur-lg sm:blur-xl rounded-full pointer-events-none"
                  style={{
                    transform: isDetailsOpen ? 'scale(0.7) translateY(-25px)' : 'scale(1)'
                  }}
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* SLIDER NAVIGATION ARROWS (< and >) */}
          {!isDetailsOpen && (
            <>
              <button
                onClick={handlePrev}
                aria-label="Previous vehicle"
                className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-white/70 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-300/80 shadow-md backdrop-blur-sm transition-all cursor-pointer active:scale-90"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <button
                onClick={handleNext}
                aria-label="Next vehicle"
                className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-white/70 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-300/80 shadow-md backdrop-blur-sm transition-all cursor-pointer active:scale-90"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}

          {/* RIGHT SPECS COLUMN (Revealed when Details Mode is Active - exactly as in the Reel!) */}
          <AnimatePresence>
            {isDetailsOpen && (
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 sm:right-4 lg:right-10 top-6 sm:top-10 z-30 flex flex-col gap-4 bg-white/85 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-lg text-right max-w-[170px] sm:max-w-[200px]"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block border-b border-slate-200 pb-1">
                  SPECIFICATIONS
                </span>

                {/* Spec 1: Range */}
                <div className="flex items-center justify-end gap-2.5">
                  <div>
                    <div className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                      {currentCar.specs.range}
                    </div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      Full Tank Range
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Fuel className="w-4 h-4" />
                  </div>
                </div>

                {/* Spec 2: Seats */}
                <div className="flex items-center justify-end gap-2.5">
                  <div>
                    <div className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                      {currentCar.specs.seats}
                    </div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      Seating Capacity
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                </div>

                {/* Spec 3: Top Speed */}
                <div className="flex items-center justify-end gap-2.5">
                  <div>
                    <div className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                      {currentCar.specs.topSpeed}
                    </div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      Top Speed
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Gauge className="w-4 h-4" />
                  </div>
                </div>

                {/* Spec 4: Power */}
                <div className="flex items-center justify-end gap-2.5">
                  <div>
                    <div className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                      {currentCar.specs.power}
                    </div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      Peak Horsepower
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM DETAILS VIEW: "TAKE A LOOK" GALLERY (From the video at 00:04-00:06) */}
        <AnimatePresence>
          {isDetailsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-5xl mx-auto mt-2 sm:mt-4 z-30"
            >
              <div className="flex items-center justify-between mb-2.5 px-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black tracking-widest text-slate-800 uppercase">
                    TAKE A LOOK
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                    • High-Definition Interior Craftsmanship
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-700">
                  Ex-Showroom: <span className="text-blue-700 font-black">{currentCar.sellingPrice}</span>
                </div>
              </div>

              {/* 4 Gallery Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
                {currentCar.gallery.map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.03, y: -2 }}
                    className="relative aspect-[16/10] rounded-xl overflow-hidden shadow-md border border-white/60 bg-slate-200 group cursor-pointer"
                  >
                    <img
                      src={currentCar.cutoutImage}
                      alt={item.title}
                      className="w-full h-full object-contain p-2 group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-2.5 text-white">
                      <span className="text-xs font-bold leading-tight">{item.title}</span>
                      <span className="text-[9px] text-slate-300 truncate">{item.subtitle}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Call to Action Button Row in Details Mode */}
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  onClick={() => navigate(`/cars?brand=${currentCar.brand}&model=${currentCar.model}`)}
                  className="px-6 py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-md tracking-wider uppercase transition-all cursor-pointer hover:shadow-lg active:scale-95 flex items-center gap-2"
                >
                  <span>Book Test Drive / Enquire</span>
                  <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                </button>
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 shadow-sm transition-all cursor-pointer"
                >
                  Close View
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DEFAULT HERO ACTION BUTTONS (Interactive Car Controls & Verified Pricing) */}
        {!isDetailsOpen && (
          <div className="relative z-30 flex flex-col items-center gap-3 mt-2 sm:mt-3">
            
            {/* Certified Price & Inspection Tag */}
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-mono uppercase font-bold text-slate-500 tracking-wider">Certified Price:</span>
              <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">{currentCar.sellingPrice}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-300">
                200-Pt Verified
              </span>
            </div>

            {/* Buy / Enquire & Details Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/cars?brand=${currentCar.brand}&model=${currentCar.model}`)}
                className="px-7 sm:px-9 py-2.5 sm:py-3 rounded-full bg-[#1E293B] hover:bg-slate-950 text-white font-bold text-xs sm:text-sm tracking-wider uppercase shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <span>Buy / Enquire</span>
              </button>

              <button
                onClick={() => setIsDetailsOpen(true)}
                className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-white/80 hover:bg-white text-slate-800 font-bold text-xs sm:text-sm tracking-wider uppercase border border-slate-300/80 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <Eye className="w-4 h-4 text-slate-600" />
                <span>Details</span>
              </button>
            </div>

            {/* DOTS PAGINATION (Matching the video at the bottom) */}
            <div className="flex items-center gap-2 mt-1">
              {SHOWCASE_CARS.map((car, idx) => (
                <button
                  key={car.id}
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  aria-label={`Select ${car.brand} ${car.model}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx 
                      ? 'w-6 bg-slate-900' 
                      : 'w-2 bg-slate-400 hover:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
export default ArcarHeroShowcase;
