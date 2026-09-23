"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API = process.env.NEXT_PUBLIC_API_URL;
const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_KEY;

type Status = "fire" | "waste" | "clean";

type Report = {
  id: string;
  lat: number;
  lng: number;
  labels: string[];
  risk_score: number;
  fire_alert: string | null;
  status: Status;
  created_at: string;
  cleaned_at: string | null;
  cleaned_by?: string | null;
};

const STYLE: Record<Status, { color: string; icon: string; text: string }> = {
  fire: { color: "#ef4444", icon: "⚠️", text: "Fire risk" },
  waste: { color: "#eab308", icon: "🗑️", text: "Waste detected" },
  clean: { color: "#22c55e", icon: "🛡️", text: "Clean" },
};

const CLEAN_OPTIONS: { method: string; label: string }[] = [
  { method: "self", label: "I cleaned it myself" },
  { method: "volunteers", label: "Notified a volunteer cleanup team" },
  { method: "municipality", label: "Reported to the municipality" },
];

const CLEAN_LABEL: Record<string, string> = {
  self: "Cleaned by user",
  volunteers: "Volunteer team notified",
  municipality: "Reported to municipality",
};

function makeIcon(status: Status) {
  const s = STYLE[status];
  return L.divIcon({
    className: "",
    html: `<div style="width:36px;height:36px;border-radius:50%;background:${s.color};display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid #fff;box-shadow:0 0 12px ${s.color}">${s.icon}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

// Fits the map to show all pins whenever the pin count changes
function FitBounds({ reports }: { reports: Report[] }) {
  const map = useMap();
  const lastCount = useRef(0);

  useEffect(() => {
    if (reports.length === 0 || reports.length === lastCount.current) return;
    lastCount.current = reports.length;
    const bounds = L.latLngBounds(
      reports.map((r) => [r.lat, r.lng] as [number, number])
    );
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
  }, [reports, map]);

  return null;
}

// Small inline menu shown inside a popup to record how a spot was cleaned
function CleanMenu({
  reportId,
  onDone,
}: {
  reportId: string;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const clean = async (method: string) => {
    setBusy(true);
    try {
      await fetch(`${API}/reports/${reportId}/clean`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      });
      onDone();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          marginTop: 8,
          padding: "4px 10px",
          borderRadius: 8,
          background: "#22c55e",
          fontWeight: 600,
          border: "none",
        }}
      >
        ✅ Clean
      </button>
    );
  }

  return (
    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
      {CLEAN_OPTIONS.map((opt) => (
        <button
          key={opt.method}
          disabled={busy}
          onClick={() => clean(opt.method)}
          style={{
            padding: "4px 8px",
            borderRadius: 6,
            background: "#1f2937",
            color: "#fff",
            fontSize: 12,
            textAlign: "left",
            border: "1px solid #374151",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function ReportsMap({ refreshKey = 0 }: { refreshKey?: number }) {
  const [reports, setReports] = useState<Report[]>([]);

  const load = useCallback(async () => {
    try {
      const resp = await fetch(`${API}/reports`);
      setReports(await resp.json());
    } catch {
      /* backend offline: leave the map empty */
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return (
    <div className="relative">
      <div className="h-[480px] w-full overflow-hidden rounded-2xl border border-white/10">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url={`https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`}
            subdomains="abcd"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <FitBounds reports={reports} />
          {reports.map((r) => (
            <Marker key={r.id} position={[r.lat, r.lng]} icon={makeIcon(r.status)}>
              <Popup>
                <div style={{ minWidth: 170 }}>
                  <b>{STYLE[r.status].text}</b>
                  <div>{r.labels.length ? r.labels.join(", ") : "No waste found"}</div>
                  <div>Risk score: {r.risk_score}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                  {r.status === "clean" && r.cleaned_by && (
                    <div style={{ fontSize: 12, marginTop: 4, color: "#22c55e" }}>
                      {CLEAN_LABEL[r.cleaned_by] ?? "Cleaned"}
                    </div>
                  )}
                  {r.status !== "clean" && (
                    <CleanMenu reportId={r.id} onDone={load} />
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral-300">
        {(Object.keys(STYLE) as Status[]).map((k) => (
          <span key={k}>
            {STYLE[k].icon} {STYLE[k].text}
          </span>
        ))}
      </div>
    </div>
  );
}