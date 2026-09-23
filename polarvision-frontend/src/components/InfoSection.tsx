"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type FeatureSection = {
  id: string;
  badge: string;
  title: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
  accentGlow: string;
};

const SECTIONS: FeatureSection[] = [
  {
    id: "detection",
    badge: "SDG 12 · RESPONSIBLE CONSUMPTION",
    title: "Real-time litter & object detection",
    body: "Point a camera at the ground and PolarVision spots plastic, glass, cans and cigarette butts in real time using an ultra-lightweight YOLO model trained on the TACO dataset.",
    imageSrc: "/1.png",
    imageAlt: "Low-poly lake biome island",
    accentGlow: "from-cyan-500/20 to-blue-600/5",
  },
  {
    id: "risk",
    badge: "SDG 15 · LIFE ON LAND",
    title: "Ecological scoring & fire risk alerts",
    body: "Every detection is matched to its decomposition time and ecological impact. Glass and metal in dry vegetation trigger real-time hazard warnings to prevent devastating wildfires before they spark.",
    imageSrc: "/2.png",
    imageAlt: "Forest floating rock biome",
    accentGlow: "from-emerald-500/20 to-teal-600/5",
  },
  {
    id: "community",
    badge: "SDG 12 & 15 · COLLECTIVE ACTION",
    title: "Community cleanup & terrain restoration",
    body: "Every scan drops a geotagged pin on an interactive shared map. Cleaned zones are validated and updated live, turning everyday walks into measurable ecological restoration.",
    imageSrc: "/3.png",
    imageAlt: "Glacial frozen arctic biome",
    accentGlow: "from-sky-400/25 to-indigo-600/10",
  },
];

export default function InfoSection() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 py-28 space-y-24 sm:space-y-36">
      {/* Üst Başlık */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="text-center max-w-3xl mx-auto"
      >
        <p className="text-xs font-semibold tracking-widest text-cyan-400 uppercase mb-3">
          AI For Melting Worlds
        </p>
        <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-5xl">
          Built to protect vulnerable ecosystems
        </h2>
      </motion.div>

      {/* Alt Alta 3 Büyük Konteyner */}
      <div className="space-y-20 sm:space-y-28">
        {SECTIONS.map((sec, i) => {
          const isEven = i % 2 === 1;

          return (
            <motion.div
              key={sec.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className={`relative overflow-hidden rounded-[2.5rem] border border-cyan-500/20 bg-gradient-to-b from-slate-900/90 via-slate-950/80 to-slate-950 p-8 sm:p-14 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-between gap-12 lg:flex-row ${
                isEven ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Arkadaki Renkli Atmosfer Parıltısı */}
              <div
                className={`pointer-events-none absolute -top-24 ${
                  isEven ? "-left-24" : "-right-24"
                } h-96 w-96 rounded-full bg-gradient-to-br ${
                  sec.accentGlow
                } blur-3xl opacity-50`}
              />

              {/* Metin Alanı */}
              <div className="flex-1 max-w-xl text-left z-10">
                <span className="inline-block px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 mb-5">
                  {sec.badge}
                </span>
                <h3 className="text-2xl sm:text-4xl font-bold text-white mb-5 leading-tight tracking-tight">
                  {sec.title}
                </h3>
                <p className="text-base sm:text-lg leading-relaxed text-slate-300/90 font-light">
                  {sec.body}
                </p>
              </div>

              {/* 3D Floating Biome Ada Alanı */}
              <div className="flex-1 flex justify-center items-center w-full z-10">
                <motion.div
                  animate={{ y: [0, -14, 0] }}
                  transition={{
                    duration: 5 + i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 filter drop-shadow-[0_25px_35px_rgba(0,180,216,0.2)]"
                >
                  <Image
                    src={sec.imageSrc}
                    alt={sec.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-contain select-none"
                    priority={i === 0}
                  />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}