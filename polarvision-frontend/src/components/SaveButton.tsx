"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

type Props = {
  result: {
    count: number;
    risk_score: number;
    fire_alert: "high" | "possible" | null;
    detections: { label_tr: string }[];
  } | null;
  onSaved?: () => void;
};

export default function SaveButton({ result, onSaved }: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!result) return null;

  const save = () => {
    setBusy(true);
    setMsg(null);

    if (!navigator.geolocation) {
      setMsg("The browser does not support location services..");
      setBusy(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const labels = Array.from(
            new Set(result.detections.map((d) => d.label_tr))
          );
          const resp = await fetch(`${API}/reports`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              labels,
              risk_score: result.risk_score,
              fire_alert: result.fire_alert,
            }),
          });
          if (!resp.ok) throw new Error();
          setMsg("Haritaya eklendi ✓");
          onSaved?.();
        } catch {
          setMsg("Failed to save. Is the backend running?");
        } finally {
          setBusy(false);
        }
      },
      () => {
        setMsg("Location permission denied.");
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div>
      <button
        onClick={save}
        disabled={busy}
        className="w-full rounded-xl bg-emerald-400 px-4 py-2 font-semibold text-black hover:bg-emerald-300 disabled:opacity-50"
      >
        {busy
          ? "Getting location..."
          : result.count > 0
          ? "📍 Save this location to the map"
          : "🛡️ Save as a clean area"}
      </button>
      {msg && <p className="mt-2 text-sm text-neutral-300">{msg}</p>}
    </div>
  );
}