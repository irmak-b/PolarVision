"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Scanner from "@/components/Scanner";

const ReportsMap = dynamic(() => import("@/components/ReportsMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] rounded-2xl border border-white/10 bg-neutral-900" />
  ),
});

export default function ScanPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <h1 className="mb-6 text-3xl font-bold">PolarVision Scanner</h1>
      <Scanner onSaved={() => setRefreshKey((k) => k + 1)} />
      <h2 className="mb-4 mt-12 text-2xl font-bold">Cleanup map</h2>
      <ReportsMap refreshKey={refreshKey} />
    </main>
  );
}