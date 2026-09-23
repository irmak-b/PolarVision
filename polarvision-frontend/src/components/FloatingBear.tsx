"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

export default function FloatingBear({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // --- Tek Ayı: Sayfa boyunca akıcı süzülme rotası ---
  // Yatayda kavis çizer (soldan ortaya, sonra hafif sağa/merkeze)
  const bearX = useTransform(
    scrollYProgress,
    [0, 0.35, 0.7, 1],
    ["0vw", "32vw", "24vw", "30vw"]
  );

  // Dikeyde sayfa boyunca derinlere iner
  const bearY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["0vh", "90vh", "220vh"]
  );

  // Su akıntısına göre hafif eğilme/rotasyon
  const bearRotate = useTransform(
    scrollYProgress,
    [0, 0.35, 0.7, 1],
    [-8, 14, -6, 8]
  );

  return (
    <motion.div
      style={{
        x: bearX,
        y: bearY,
        rotate: bearRotate,
      }}
      className="pointer-events-none fixed left-[8%] top-[12%] z-20 w-44 sm:w-60 lg:w-72"
    >
      {/* Suda hafifçe salınım (Idle float) efekti */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: "drop-shadow(0 20px 25px rgba(0,40,70,0.35))" }}
      >
        <Image
          src="/bear.png"
          alt="Floating polar bear"
          width={600}
          height={600}
          priority
          className="h-auto w-full select-none"
        />
      </motion.div>
    </motion.div>
  );
}