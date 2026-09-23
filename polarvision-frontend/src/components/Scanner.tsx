"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import SaveButton from "./SaveButton";

const API = process.env.NEXT_PUBLIC_API_URL;
const SEND_WIDTH = 640; // width of the transmitted frame (small = fast)
const INTERVAL_MS = 250; // ~4 frames/sec

type Risk = "low" | "medium" | "high" | "critical";

type Detection = {
  label: string;
  label_tr: string;
  confidence: number;
  bbox: [number, number, number, number];
  years: string;
  risk: Risk;
  score: number;
  fire: string;
  alert: string;
  action: string;
};

type Result = {
  width: number;
  height: number;
  count: number;
  risk_score: number;
  fire_alert: "high" | "possible" | null;
  detections: Detection[];
};

const RISK_COLOR: Record<Risk, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22d3ee",
};

export default function Scanner({ onSaved }: { onSaved?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLCanvasElement | null>(null);
  const busyRef = useRef(false);

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Kutuları video üzerindeki şeffaf canvas'a çizer
  const draw = useCallback((res: Result | null) => {
    const canvas = overlayRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!res) return;

    const s = canvas.width / res.width;
    for (const d of res.detections) {
      const [x1, y1, x2, y2] = d.bbox.map((v) => v * s);
      const color = RISK_COLOR[d.risk] ?? "#22d3ee";
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      const text = `${d.label_tr} ${(d.confidence * 100).toFixed(0)}%`;
      ctx.font = "600 14px sans-serif";
      const w = ctx.measureText(text).width + 10;
      const ty = Math.max(0, y1 - 22);
      ctx.fillStyle = color;
      ctx.fillRect(x1, ty, w, 22);
      ctx.fillStyle = "#000";
      ctx.fillText(text, x1 + 5, ty + 16);
    }
  }, []);

  // Captures a frame from the video and sends it to the backend
  const sendFrame = useCallback(async () => {
    const video = videoRef.current;
    if (!video || busyRef.current || video.videoWidth === 0) return;
    busyRef.current = true;
    try {
      const scale = Math.min(1, SEND_WIDTH / video.videoWidth);
      const w = Math.round(video.videoWidth * scale);
      const h = Math.round(video.videoHeight * scale);

      const frame = (frameRef.current ??= document.createElement("canvas"));
      frame.width = w;
      frame.height = h;
      frame.getContext("2d")!.drawImage(video, 0, 0, w, h);

      const blob = await new Promise<Blob | null>((r) =>
        frame.toBlob(r, "image/jpeg", 0.7)
      );
      if (!blob) return;

      const form = new FormData();
      form.append("file", blob, "frame.jpg");
      const resp = await fetch(`${API}/detect`, { method: "POST", body: form });
      if (!resp.ok) throw new Error(`API ${resp.status}`);

      const data: Result = await resp.json();
      setError(null);
      setResult(data);
      draw(data);
    } catch {
      setError("Could not connect to the backend. Is uvicorn running?");
    } finally {
      busyRef.current = false;
    }
  }, [draw]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(sendFrame, INTERVAL_MS);
    return () => clearInterval(id);
  }, [running, sendFrame]);

  useEffect(() => {
    const video = videoRef.current;
    return () =>
      (video?.srcObject as MediaStream | null)
        ?.getTracks()
        .forEach((t) => t.stop());
  }, []);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      setRunning(true);
    } catch {
      setError("Could not access the camera. Did you grant permission?");
    }
  };

  const stop = () => {
    const video = videoRef.current;
    (video?.srcObject as MediaStream | null)
      ?.getTracks()
      .forEach((t) => t.stop());
    if (video) video.srcObject = null;
    setRunning(false);
    setResult(null);
    draw(null);
  };

  return (
    <div className="relative">
      {/* Sol Üst: Ana Sayfaya Dönüş Oku */}
      <div className="mb-6 flex items-center">
        <Link
          href="/"
          onClick={stop}
          className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-md transition-all hover:border-cyan-400/40 hover:bg-cyan-950/40 hover:text-cyan-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 transition-transform group-hover:-translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Sol: kamera + kutular */}
        <div>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
            <video
              ref={videoRef}
              playsInline
              muted
              className="block h-auto w-full"
            />
            <canvas
              ref={overlayRef}
              className="pointer-events-none absolute inset-0 h-full w-full"
            />
            {!running && (
              <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
                Camera is off. Click "Turn on the Camera" to start scanning.
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3">
            {!running ? (
              <button
                onClick={start}
                className="rounded-full bg-cyan-400 px-6 py-2 font-semibold text-black hover:bg-cyan-300"
              >
                Turn on the Camera
              </button>
            ) : (
              <button
                onClick={stop}
                className="rounded-full bg-white/10 px-6 py-2 font-semibold hover:bg-white/20"
              >
                Stop
              </button>
            )}
            {error && <span className="text-sm text-red-400">{error}</span>}
          </div>
        </div>

        {/* Sağ: risk paneli */}
        <aside className="space-y-4">
          {running && <SaveButton result={result} onSaved={onSaved} />}
          {result?.fire_alert === "high" && (
            <div className="rounded-xl border border-red-500 bg-red-500/15 p-4">
              <p className="font-bold text-red-400">🔥 Forest fire risk!</p>
              <p className="text-sm text-red-200">
                A waste item that could trigger a forest fire has been detected.
              </p>
            </div>
          )}
          {result?.fire_alert === "possible" && (
            <div className="rounded-xl border border-amber-500 bg-amber-500/15 p-4">
              <p className="font-bold text-amber-400">⚠️ Possible forest fire risk</p>
              <p className="text-sm text-amber-200">
                The detected bottle could potentially cause a forest fire due to the lens effect.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-neutral-900 p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-neutral-400">Ecological risk score</span>
              <span className="text-3xl font-bold">{result?.risk_score ?? 0}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-red-500 transition-all"
                style={{ width: `${result?.risk_score ?? 0}%` }}
              />
            </div>
          </div>

          {result?.detections.map((d, i) => (
            <div
              key={i}
              className="rounded-xl border bg-neutral-900 p-4"
              style={{ borderColor: RISK_COLOR[d.risk] }}
            >
              <div className="flex justify-between">
                <span className="font-semibold">{d.label_tr}</span>
                <span className="text-sm text-neutral-400">
                  {(d.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-300">
                Decomposition time: <b>{d.years}</b> {d.years.toLowerCase().includes("year") || d.years.toLowerCase().includes("month") ? "" : "years"}
              </p>
              <p className="mt-1 text-sm text-neutral-400">{d.alert}</p>
              <p className="mt-1 text-sm text-cyan-300">→ {d.action}</p>
            </div>
          ))}

          {running && result?.count === 0 && (
            <p className="text-sm text-neutral-500">No waste detected yet.</p>
          )}
        </aside>
      </div>
    </div>
  );
}