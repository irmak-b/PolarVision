"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function ScanCTA() {
  return (
    <section className="relative z-10 mx-auto max-w-3xl px-6 py-32 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-[2.5rem] border border-cyan-400/30 bg-gradient-to-b from-cyan-950/60 to-slate-950 p-12"
      >
        {/* snowflake decorations */}
        <span className="absolute left-8 top-8 text-2xl opacity-40">❄️</span>
        <span className="absolute right-10 top-14 text-xl opacity-30">❄️</span>
        <span className="absolute bottom-10 left-16 text-lg opacity-30">❄️</span>

        <div className="mb-6 text-5xl">🐻‍❄️</div>
        <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
          Ready to scan?
        </h2>
        <p className="mx-auto mb-8 max-w-md text-slate-300">
          Open your camera, point it at the ground, and let PolarVision find
          what shouldn&apos;t be there.
        </p>

        <Link
          href="/scan"
          className="inline-block rounded-full bg-cyan-400 px-10 py-4 text-lg font-bold text-black transition hover:bg-cyan-300"
        >
          Launch scanner →
        </Link>
      </motion.div>
    </section>
  );
}