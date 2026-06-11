"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

const SWATCHES = [
  "#000000",
  "#ff0055",
  "#7c3aed",
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
];
const RAINBOW_COLORS = ["#ff0055", "#f59e0b", "#22c55e", "#0ea5e9", "#7c3aed"];
const TEXT_COLOR_MAP: Record<string, string> = {
  "#000000": "#ffffff",
  "#ff0055": "#ffffff",
  "#7c3aed": "#ffffff",
  "#0ea5e9": "#ffffff",
  "#22c55e": "#ffffff",
  "#f59e0b": "#000000",
  "#ffffff": "#000000",
};

function getTextColor(bg: string): string {
  return TEXT_COLOR_MAP[bg] ?? "#ffffff";
}

type Screen = "setup" | "banner";
type BgMode = "solid" | "rainbow";

export default function BannerPage() {
  const [screen, setScreen] = useState<Screen>("setup");
  const [message, setMessage] = useState("");
  const [displayMessage, setDisplayMessage] = useState("");
  const [activeBg, setActiveBg] = useState("#000000");
  const [bg, setBg] = useState("#000000");
  const [bgMode, setBgMode] = useState<BgMode>("solid");
  const [strobe, setStrobe] = useState(false);
  const [speed, setSpeed] = useState(2);

  const marqueeTrackRef = useRef<HTMLDivElement>(null);
  const clone1Ref = useRef<HTMLDivElement>(null);
  const clone2Ref = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const cycleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const posRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const speedRef = useRef(speed);
  const cycleIdxRef = useRef(0);
  const strobeOnRef = useRef(false);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const singlePass = useMemo(() => `${displayMessage}     `, [displayMessage]);

  const startAnimation = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    posRef.current = 0;
    lastTimeRef.current = null;

    const animate = (ts: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = ts;
      const dt = ts - lastTimeRef.current;
      lastTimeRef.current = ts;

      const track = marqueeTrackRef.current;
      const el1 = clone1Ref.current;
      if (!track || !el1) return;

      posRef.current -= dt * speedRef.current * 0.06;

      const itemWidth = el1.scrollWidth;
      if (Math.abs(posRef.current) >= itemWidth) {
        posRef.current += itemWidth;
      }

      track.style.transform = `translateX(${posRef.current}px)`;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (screen !== "banner") return;
    startAnimation();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [screen, startAnimation, displayMessage]);

  useEffect(() => {
    if (screen !== "banner") return;
    if (bgMode === "solid" && !strobe) {
      setBg(activeBg);
    }
  }, [activeBg, bgMode, strobe, screen]);

  useEffect(() => {
    if (screen !== "banner") return;
    if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);

    if (bgMode === "rainbow") {
      cycleIntervalRef.current = setInterval(
        () => {
          cycleIdxRef.current =
            (cycleIdxRef.current + 1) % RAINBOW_COLORS.length;
          const next = RAINBOW_COLORS[cycleIdxRef.current];
          setBg(
            strobe ? (strobeOnRef.current ? next : getTextColor(next)) : next,
          );
          strobeOnRef.current = !strobeOnRef.current;
        },
        strobe ? 350 : 800,
      );
    } else if (strobe) {
      const contrast = getTextColor(activeBg);
      cycleIntervalRef.current = setInterval(() => {
        strobeOnRef.current = !strobeOnRef.current;
        setBg(strobeOnRef.current ? contrast : activeBg);
      }, 350);
    }

    return () => {
      if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
    };
  }, [bgMode, strobe, screen, activeBg]);

  const handleGo = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setDisplayMessage(trimmed);
    if (bgMode === "solid" && !strobe) setBg(activeBg);
    setScreen("banner");
  };

  const handleSwatch = (color: string) => {
    setActiveBg(color);
    setBg(color);
    setBgMode("solid");
  };

  const handleRainbow = () => {
    setBgMode("rainbow");
    setBg(RAINBOW_COLORS[0]);
  };

  if (screen === "banner") {
    const textColor =
      bgMode === "rainbow"
        ? getTextColor(RAINBOW_COLORS[cycleIdxRef.current])
        : getTextColor(activeBg);

    return (
      <div
        className="flex h-dvh w-full items-center overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: bg }}
      >
        <button
          onClick={() => setScreen("setup")}
          className="absolute top-5 right-5 z-10 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium"
          style={{
            background: "rgba(0,0,0,0.3)",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          ← Back
        </button>
        <div
          ref={marqueeTrackRef}
          className="flex whitespace-nowrap will-change-transform"
        >
          <div
            ref={clone1Ref}
            className="whitespace-nowrap font-black leading-none"
            style={{
              fontSize: "clamp(3.5rem, 22vw, 9rem)",
              color: textColor,
              paddingRight: "6rem",
            }}
          >
            {singlePass}
          </div>
          <div
            ref={clone2Ref}
            className="whitespace-nowrap font-black leading-none"
            aria-hidden
            style={{
              fontSize: "clamp(3.5rem, 22vw, 9rem)",
              color: textColor,
              paddingRight: "6rem",
            }}
          >
            {singlePass}
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = message.trim().length === 0;

  return (
    <div className="flex justify-center items-start min-h-dvh bg-gray-100">
      <div className="flex flex-col w-full max-w-lg bg-white shadow-sm min-h-dvh">
        <div className="flex flex-col gap-7 px-6 pt-14 pb-8">
          <div>
            <p className="text-3xl font-black text-gray-900 mb-1 tracking-tight">
              🎵 CONCERT BANNER
            </p>
            <p className="text-sm text-gray-400 leading-snug">
              Your voice, but louder. And brighter.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Message
              </label>
              <input
                type="text"
                className="w-full text-base py-3.5 px-4 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Your banner text here"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGo()}
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Background
              </label>
              <div className="flex gap-2.5">
                {SWATCHES.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleSwatch(color)}
                    className="flex-1 aspect-square rounded-xl transition-all"
                    style={{
                      backgroundColor: color,
                      outline:
                        activeBg === color && bgMode === "solid"
                          ? "3px solid #000"
                          : "3px solid transparent",
                      outlineOffset: "2px",
                    }}
                    aria-label={`Set background to ${color}`}
                  />
                ))}
                <button
                  onClick={handleRainbow}
                  className="flex-1 aspect-square rounded-xl transition-all"
                  style={{
                    background:
                      "linear-gradient(135deg, #ff0055, #f59e0b, #22c55e, #0ea5e9, #7c3aed)",
                    outline:
                      bgMode === "rainbow"
                        ? "3px solid #000"
                        : "3px solid transparent",
                    outlineOffset: "2px",
                  }}
                  aria-label="Rainbow background"
                />
              </div>

              <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200">
                <p className="text-sm font-bold text-gray-800">⚡ Strobe</p>
                <button
                  onClick={() => setStrobe((s) => !s)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    strobe ? "bg-black" : "bg-gray-300"
                  }`}
                  aria-label="Toggle strobe"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      strobe ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Scroll speed
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">Slow</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="flex-1 accent-black"
                />
                <span className="text-xs text-gray-400">Fast</span>
              </div>
            </div>

            <button
              onClick={handleGo}
              disabled={isEmpty}
              className={`w-full py-4 text-base font-bold rounded-2xl transition-all mt-2 ${
                isEmpty
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-black text-white active:scale-95"
              }`}
            >
              Start banner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
