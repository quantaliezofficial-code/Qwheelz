"use client";

import React, { useEffect, useRef } from "react";

export interface RoundCarouselImage {
  src: string;
  title?: string;
  price?: string;
}

export interface RoundCarouselProps {
  images?: RoundCarouselImage[];
  imageWidth?: number;
  imageHeight?: number;
  spacing?: number;
  speed?: number;
  direction?: "right" | "left";
  drag?: boolean;
  sensitivity?: number;
  tilt?: number;
  perspective?: number;
  cornerRadius?: number;
  innerDim?: number;
  background?: string;
  style?: React.CSSProperties;
}

const DEFAULT_CAR_IMAGES: RoundCarouselImage[] = [
  { src: "/cars/wagonr.jpg", title: "Maruti Suzuki WagonR", price: "₹5.50 Lakh" },
  { src: "/cars/tiago.jpg", title: "Tata Tiago Revotron", price: "₹4.80 Lakh" },
  { src: "/cars/baleno.jpg", title: "Maruti Suzuki Baleno", price: "₹6.90 Lakh" },
  { src: "/hero/toyota_hero.jpg", title: "Toyota Glanza Dual-Jet", price: "₹6.75 Lakh" },
  { src: "/cars/audi.png", title: "Audi A4 Technology", price: "₹28.50 Lakh" },
  { src: "/cars/porsche.png", title: "Porsche 718 Cayman", price: "₹82.00 Lakh" },
  { src: "/cars/mustang.png", title: "Ford Mustang GT V8", price: "₹56.00 Lakh" },
  { src: "/cars/lexus.png", title: "Lexus RX 450h Hybrid", price: "₹64.50 Lakh" },
];

export default function RoundCarousel({
  images = DEFAULT_CAR_IMAGES,
  imageWidth = 320,
  imageHeight = 260,
  spacing = 3.2,
  speed = 5,
  direction = "right",
  drag = true,
  sensitivity = 5,
  tilt = -6,
  perspective = 2800,
  cornerRadius = 20,
  innerDim = 4,
  background = "transparent",
  style = {},
}: RoundCarouselProps) {
  const items = images.length > 0 ? images : DEFAULT_CAR_IMAGES;
  const count = items.length;

  const ringRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const rotYRef = useRef(0);
  const velRef = useRef(0);
  const lastRef = useRef(0);
  const dragRef = useRef({ active: false, x: 0 });

  const angle = 360 / count;
  const factor = 1 + spacing * 0.15;
  const radius = (imageWidth * factor) / (2 * Math.tan(Math.PI / count));
  const radiusPx = cornerRadius;
  const degPerSec = speed * 6 * (direction === "left" ? -1 : 1);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    const apply = () =>
      (ring.style.transform = `translateZ(${-radius}px) rotateY(${rotYRef.current}deg)`);
    apply();

    const draw = (now: number) => {
      const dt = lastRef.current ? (now - lastRef.current) / 1000 : 0;
      lastRef.current = now;
      const f = Math.min(dt, 0.1);
      const d = dragRef.current;
      if (!d.active) {
        if (Math.abs(velRef.current) > 0.01) {
          rotYRef.current += velRef.current * f;
          velRef.current *= 0.94;
        } else {
          rotYRef.current += degPerSec * f;
        }
      }
      apply();
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [radius, degPerSec, count]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!drag) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = { active: true, x: e.clientX };
    velRef.current = 0;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d.active) return;
    const dx = e.clientX - d.x;
    d.x = e.clientX;
    const k = 0.3 * sensitivity;
    rotYRef.current += dx * k;
    velRef.current = dx * k * 60;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    dragRef.current.active = false;
  };

  const faceBase: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: radiusPx,
    overflow: "hidden",
    backfaceVisibility: "hidden",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div
      style={{
        ...style,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background,
        perspective: `${perspective}px`,
        cursor: drag ? "grab" : "default",
        touchAction: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt}deg)`,
        }}
      >
        <div
          ref={ringRef}
          style={{
            position: "relative",
            width: imageWidth,
            height: imageHeight,
            transformStyle: "preserve-3d",
          }}
        >
          {items.map((img, i) => {
            const src = img?.src;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: `rotateY(${i * angle}deg) translateZ(${radius}px)`,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Front Face */}
                <div
                  style={{
                    ...faceBase,
                    backgroundColor: "#ffffff",
                    backgroundImage: src ? `url(${src})` : undefined,
                    boxShadow: "0 14px 35px -5px rgba(30, 58, 138, 0.18), 0 0 0 1px rgba(226, 232, 240, 0.8)",
                  }}
                >
                  {(img.title || img.price) && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent p-3 pt-6 flex justify-between items-end text-white pointer-events-none">
                      {img.title && <span className="text-xs font-bold truncate pr-1">{img.title}</span>}
                      {img.price && <span className="text-[10px] font-mono font-bold text-sky-300 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-500/30">{img.price}</span>}
                    </div>
                  )}
                </div>

                {/* Back Face */}
                <div
                  style={{
                    ...faceBase,
                    transform: "rotateY(180deg)",
                    backgroundColor: "#f8fafc",
                    backgroundImage: src ? `url(${src})` : undefined,
                    filter: `brightness(${innerDim / 10})`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
