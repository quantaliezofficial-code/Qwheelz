import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DealershipStage {
  id: number;
  image: string;
}

const STAGES: DealershipStage[] = [
  {
    id: 0,
    image: "/showroom_aerial.jpg"
  },
  {
    id: 1,
    image: "/showroom_approach.jpg"
  },
  {
    id: 2,
    image: "/showroom_interior.jpg"
  }
];

export function DealershipPavilionHero() {
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Smooth sequential progression matching the reel fly-through
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev === 2) {
          return 0;
        }
        return prev + 1;
      });
    }, 4200);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const advanceStage = () => {
    setCurrentStage((prev) => (prev + 1) % STAGES.length);
  };

  return (
    <section 
      onClick={advanceStage}
      className="relative w-full h-[100vh] min-h-[640px] flex items-center justify-center overflow-hidden bg-stone-950 text-white select-none cursor-pointer"
      title="Click to glide forward"
    >
      
      {/* 1. CINEMATIC CAMERA FLY-THROUGH INTO LUCKNOW SHOWROOM */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ 
              opacity: 1, 
              scale: 1.0,
              transition: { 
                opacity: { duration: 1.1, ease: [0.25, 0.1, 0.25, 1.0] },
                scale: { duration: 4.8, ease: "easeOut" }
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 1.12,
              transition: { duration: 0.9, ease: [0.4, 0.0, 0.2, 1.0] }
            }}
            className="absolute inset-0"
          >
            <img
              src={STAGES[currentStage].image}
              alt="Luxura Motors Lucknow Showroom Entrance"
              className="w-full h-full object-cover object-center filter brightness-[0.7] contrast-[1.05]"
            />
          </motion.div>
        </AnimatePresence>

        {/* Seamless Luxury Ambient Lighting */}
        <div className="absolute inset-0 bg-stone-950/20 pointer-events-none" />
      </div>

      {/* 2. CENTER VIEWPORT - 100% CLEAN */}
      <div className="relative z-20 flex-1 pointer-events-none" />

    </section>
  );
}

export default DealershipPavilionHero;
