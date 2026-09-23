"use client";

import { useRef } from "react";
import FloatingBear from "@/components/FloatingBear";
import InfoSection from "@/components/InfoSection";
import ScanCTA from "@/components/ScanCTA";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative bg-gradient-to-b from-[#5de0e6] via-[#0f4c81] to-[#020617]"
    >
      {/* Scroll ile süzülen tek ayı */}
      <FloatingBear containerRef={containerRef} />

      {/* Portal 1: Hero */}
      <section className="relative z-10 flex h-screen flex-col items-center justify-center px-6 text-center">
        {/* Boyutlar: Mobilde 7xl, orta ekranda 9xl, geniş ekranda devasa boyuta (10xl / 9rem) çıkarıldı */}
        <h1 className="font-bukhari text-7xl tracking-normal text-white drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)] sm:text-9xl lg:text-[9.5rem] leading-none select-none">
          PolarVision
        </h1>
        <p className="mt-6 max-w-xl text-lg text-cyan-100 sm:text-xl">
          AI-powered litter detection for a melting world.
        </p>
        <div className="mt-10 animate-bounce text-white/70">↓ scroll</div>
      </section>

      {/* Portal 2: 3 Büyük Floating Biome Konteyneri */}
      <InfoSection />

      {/* Portal 3: Scanner CTA */}
      <ScanCTA />
    </div>
  );
}