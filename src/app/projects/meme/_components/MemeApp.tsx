"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  MAX_IMAGE_SIDE,
  VIBES,
  wrapLines,
  type Caption,
  type Vibe,
} from "@/lib/meme/captions";

// ---- Shared styles ----

const display = "font-(family-name:--font-anton) uppercase";
const focusRing =
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-meme-pink";
const press =
  "transition-[translate,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_1px_0_var(--color-meme-ink)] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-y-0";
const bigBtn = `inline-flex h-15 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[16px] border-3 border-meme-ink px-6 text-lg font-extrabold shadow-[0_5px_0_var(--color-meme-ink)] ${press} ${focusRing}`;
const smallBtn = `inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-full border-[2.5px] border-meme-ink bg-white px-4 text-[15px] font-extrabold shadow-[0_3px_0_var(--color-meme-ink)] ${press} ${focusRing}`;
const label =
  "block text-[13px] font-extrabold uppercase tracking-[0.12em] text-meme-muted";
const screen =
  "relative mx-auto flex w-full max-w-120 flex-1 flex-col px-5 pt-5 pb-5 tablet:pt-10";

type Photo = { dataUrl: string; width: number; height: number };
type Phase = "pick" | "loading" | "edit";

const noopSubscribe = () => () => {};

export function MemeApp() {
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  if (!hydrated) return null;
  return <Memer />;
}

function Memer() {
  const [phase, setPhase] = useState<Phase>("pick");
  const [vibe, setVibe] = useState<Vibe>("Any");
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [picked, setPicked] = useState(0);
  const [text, setText] = useState<Caption>({ top: "", bottom: "" });
  const [error, setError] = useState<string | null>(null);
  const [more, setMore] = useState(false);
  // Every caption shown for this photo, so "More captions" gives new ones.
  const shown = useRef<Caption[]>([]);

  const ask = async (p: Photo, chosenVibe: Vibe): Promise<Caption[]> => {
    const res = await fetch("/api/meme/caption", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: p.dataUrl,
        vibe: chosenVibe,
        avoid: shown.current,
      }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !Array.isArray(data?.captions)) {
      throw new Error(data?.error ?? "Couldn't write captions just now.");
    }
    shown.current = [...shown.current, ...data.captions].slice(-12);
    return data.captions;
  };

  const usePhoto = async (file: File) => {
    setError(null);
    let p: Photo;
    try {
      p = await shrinkPhoto(file);
    } catch {
      setError("Couldn't open that photo. Try a JPEG or PNG.");
      return;
    }
    setPhoto(p);
    shown.current = [];
    setPhase("loading");
    try {
      const next = await ask(p, vibe);
      setCaptions(next);
      setPicked(0);
      setText(next[0]);
      setPhase("edit");
    } catch (err) {
      setError(friendly(err));
      setPhase("pick");
    }
  };

  const moreCaptions = async () => {
    if (!photo || more) return;
    setMore(true);
    setError(null);
    try {
      const next = await ask(photo, vibe);
      setCaptions(next);
      setPicked(0);
      setText(next[0]);
    } catch (err) {
      setError(friendly(err));
    } finally {
      setMore(false);
    }
  };

  if (phase === "pick") {
    return (
      <Pick vibe={vibe} error={error} onVibe={setVibe} onPhoto={usePhoto} />
    );
  }
  if (phase === "loading" && photo) {
    return <Loading photo={photo} />;
  }
  if (!photo) return null;
  return (
    <Edit
      photo={photo}
      captions={captions}
      picked={picked}
      text={text}
      loadingMore={more}
      error={error}
      onPick={(i) => {
        setPicked(i);
        setText(captions[i]);
      }}
      onText={setText}
      onMore={moreCaptions}
      onNewPhoto={() => {
        setError(null);
        setPhase("pick");
      }}
    />
  );
}

function friendly(err: unknown) {
  return err instanceof Error && err.message !== "Failed to fetch"
    ? err.message
    : "Couldn't reach the meme machine. Check your connection.";
}

// ---- Pick a photo ----

function Pick({
  vibe,
  error,
  onVibe,
  onPhoto,
}: {
  vibe: Vibe;
  error: string | null;
  onVibe: (v: Vibe) => void;
  onPhoto: (file: File) => void;
}) {
  return (
    <main className={screen}>
      {/* Fills the space above the controls, so the logo sits centered in it. */}
      <div className="flex flex-1 flex-col items-center justify-center pt-2 text-center">
        <Logo className="h-24 w-24 animate-[noggin-bob_2.6s_ease-in-out_infinite] [@media(max-height:620px)]:h-16 [@media(max-height:620px)]:w-16" />
        <h1
          className={`${display} mt-3 -rotate-2 text-[60px] leading-none [@media(max-height:620px)]:text-5xl`}
        >
          Meme <span className="text-meme-pink">This!</span>
        </h1>
        <p className="text-meme-muted mt-3 max-w-72 text-[17px] leading-snug text-balance">
          Snap or upload a photo. Claude writes the joke.
        </p>
      </div>

      {/* min-w-0: a fieldset otherwise grows to fit its contents. The chips
          wrap so every vibe is visible without scrolling. */}
      <fieldset className="mt-6 min-w-0">
        <legend className={`${label} mb-2`}>Pick a vibe</legend>
        <div className="flex flex-wrap gap-2">
          {VIBES.map((v) => (
            <label
              key={v}
              className={`has-focus-visible:outline-meme-pink flex h-10 shrink-0 cursor-pointer items-center rounded-full border-[2.5px] px-4 text-[15px] font-extrabold transition has-focus-visible:outline-3 ${
                v === vibe
                  ? "border-meme-ink bg-meme-yellow"
                  : "border-meme-line bg-white"
              }`}
            >
              <input
                type="radio"
                name="meme-vibe"
                className="sr-only"
                checked={v === vibe}
                onChange={() => onVibe(v)}
              />
              {v}
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <p
          role="alert"
          className="bg-meme-pink/12 border-meme-pink/40 mt-4 rounded-2xl border-2 px-4 py-3 text-[15px] font-semibold text-[#a3123f]"
        >
          {error}
        </p>
      )}

      {/* One button: phones offer the camera or the photo library. */}
      <label
        className={`${bigBtn} bg-meme-pink has-focus-visible:outline-meme-ink mt-5 text-white has-focus-visible:outline-3 has-focus-visible:outline-offset-3`}
      >
        <CameraIcon className="h-6 w-6" />
        Take or pick a photo
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) onPhoto(file);
          }}
        />
      </label>
      <p className="text-meme-muted mt-2.5 text-center text-[13px]">
        Your photo is only used to write captions. Nothing is saved.
      </p>
    </main>
  );
}

function Loading({ photo }: { photo: Photo }) {
  return (
    <main className={`${screen} items-center justify-center text-center`}>
      <div className="relative w-full max-w-80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.dataUrl}
          alt="Your photo"
          className="border-meme-ink w-full rounded-2xl border-3 opacity-60 shadow-[0_5px_0_var(--color-meme-ink)]"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Logo className="h-20 w-20 animate-[noggin-bob_1s_ease-in-out_infinite]" />
        </div>
      </div>
      <p role="status" className={`${display} mt-6 text-[32px] leading-none`}>
        Cooking up captions…
      </p>
      <p className="text-meme-muted mt-2 text-[15px]">
        Claude is looking at your photo
      </p>
    </main>
  );
}

// ---- Make the meme ----

function Edit({
  photo,
  captions,
  picked,
  text,
  loadingMore,
  error,
  onPick,
  onText,
  onMore,
  onNewPhoto,
}: {
  photo: Photo;
  captions: Caption[];
  picked: number;
  text: Caption;
  loadingMore: boolean;
  error: string | null;
  onPick: (i: number) => void;
  onText: (c: Caption) => void;
  onMore: () => void;
  onNewPhoto: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  // Redraw the meme whenever the photo or the words change.
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let cancelled = false;
    // A newer redraw cancels this one, so a slow draw can't paint old words.
    void drawMeme(el, photo, text, () => cancelled);
    return () => {
      cancelled = true;
    };
  }, [photo, text]);

  const share = async () => {
    const el = canvas.current;
    if (!el) return;
    const blob = await new Promise<Blob | null>((r) =>
      el.toBlob(r, "image/jpeg", 0.92),
    );
    if (!blob) return;
    const file = new File([blob], "meme.jpg", { type: "image/jpeg" });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        // Just the image: no title or text, so it shares like a photo.
        await navigator.share({ files: [file] });
        return;
      }
    } catch (err) {
      // Closing the share sheet isn't an error worth showing.
      if (err instanceof DOMException && err.name === "AbortError") return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meme.jpg";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setSaved("Saved to your downloads");
    setTimeout(() => setSaved(null), 2500);
  };

  return (
    <main className={`${screen} pb-0!`}>
      <div className="flex items-center justify-between">
        <button type="button" className={smallBtn} onClick={onNewPhoto}>
          <Icon d="M15 5l-7 7 7 7" size={16} />
          New photo
        </button>
        <p className={`${display} -rotate-2 text-2xl`}>
          Meme <span className="text-meme-pink">This!</span>
        </p>
      </div>

      <canvas
        ref={canvas}
        role="img"
        aria-label={`Meme: ${[text.top, text.bottom].filter(Boolean).join(" / ")}`}
        className="border-meme-ink mx-auto mt-4 block max-h-[52dvh] w-auto max-w-full rounded-2xl border-3 bg-black shadow-[0_5px_0_var(--color-meme-ink)]"
        style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
      />

      <div className="mt-5 flex items-center justify-between">
        <h2 className={label}>Pick a caption</h2>
        <button
          type="button"
          className={`${smallBtn} h-9! px-3! text-sm!`}
          onClick={onMore}
          disabled={loadingMore}
        >
          <Icon
            d="M4 12a8 8 0 0114-5.3M20 4v5h-5M20 12a8 8 0 01-14 5.3M4 20v-5h5"
            size={14}
          />
          {loadingMore ? "Thinking…" : "More captions"}
        </button>
      </div>

      <div
        className="mt-2.5 flex flex-col gap-2"
        role="radiogroup"
        aria-label="Captions"
      >
        {captions.map((c, i) => (
          <button
            key={`${c.top}-${c.bottom}-${i}`}
            type="button"
            role="radio"
            aria-checked={i === picked}
            onClick={() => onPick(i)}
            className={`rounded-2xl border-[2.5px] px-4 py-2.5 text-left transition ${focusRing} ${
              i === picked
                ? "border-meme-ink bg-meme-lime shadow-[0_3px_0_var(--color-meme-ink)]"
                : "border-meme-line bg-white"
            } ${loadingMore ? "opacity-50" : ""}`}
          >
            {c.top && (
              <span className={`${display} block text-[17px] leading-tight`}>
                {c.top}
              </span>
            )}
            <span className={`${display} block text-[17px] leading-tight`}>
              {c.bottom}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <p
          role="alert"
          className="bg-meme-pink/12 border-meme-pink/40 mt-3 rounded-2xl border-2 px-4 py-3 text-[15px] font-semibold text-[#a3123f]"
        >
          {error}
        </p>
      )}

      <button
        type="button"
        aria-expanded={editing}
        className={`text-meme-muted hover:text-meme-ink mt-3 flex h-10 items-center gap-1.5 self-start text-[15px] font-bold ${focusRing}`}
        onClick={() => setEditing((e) => !e)}
      >
        <Icon d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" size={16} />
        {editing ? "Done editing" : "Edit the text"}
      </button>
      {editing && (
        <div className="flex flex-col gap-2.5">
          {(["top", "bottom"] as const).map((line) => (
            <div key={line}>
              <label htmlFor={`meme-${line}`} className={`${label} mb-1.5`}>
                {line === "top" ? "Top text" : "Bottom text"}
              </label>
              <input
                id={`meme-${line}`}
                className="border-meme-line focus:border-meme-ink h-12 w-full rounded-[14px] border-[2.5px] bg-white px-4 text-base font-semibold outline-none"
                value={text[line]}
                maxLength={80}
                autoComplete="off"
                onChange={(e) => onText({ ...text, [line]: e.target.value })}
              />
            </div>
          ))}
        </div>
      )}

      {/* Stays in reach at the bottom of the screen. */}
      <div className="from-meme-bg via-meme-bg sticky bottom-0 -mx-5 mt-auto bg-gradient-to-t via-80% px-5 pt-4 pb-5">
        <button
          type="button"
          className={`${bigBtn} bg-meme-pink text-white`}
          onClick={share}
        >
          <Icon
            d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 002 2h10a2 2 0 002-2v-5"
            size={20}
          />
          Share or save
        </button>
        <p
          role="status"
          className="text-meme-muted mt-2 h-4 text-center text-[13px] font-semibold"
        >
          {saved}
        </p>
      </div>
    </main>
  );
}

// ---- Drawing ----

/**
 * Shrinks a photo on the phone before sending it: smaller photos upload
 * faster and cost less for Claude to look at, with no loss for a meme.
 */
async function shrinkPhoto(file: File): Promise<Photo> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(
      1,
      MAX_IMAGE_SIDE / Math.max(img.naturalWidth, img.naturalHeight),
    );
    const width = Math.round(img.naturalWidth * scale);
    const height = Math.round(img.naturalHeight * scale);
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    c.getContext("2d")!.drawImage(img, 0, 0, width, height);
    return { dataUrl: c.toDataURL("image/jpeg", 0.85), width, height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * The page's meme font, by the name the canvas needs. CSS variables pass down
 * to child elements, so the canvas can read it from its own styles.
 */
function memeFont(el: Element): string {
  const family = getComputedStyle(el).getPropertyValue("--font-anton").trim();
  return family || "Impact, 'Arial Black', sans-serif";
}

/** Draws the photo with classic meme text: white, black outline, all caps. */
async function drawMeme(
  canvas: HTMLCanvasElement,
  photo: Photo,
  text: Caption,
  cancelled: () => boolean,
) {
  const img = await loadImage(photo.dataUrl);
  const font = memeFont(canvas);
  // The canvas can't use a web font until it has loaded.
  await document.fonts.load(`64px ${font}`).catch(() => {});
  if (cancelled()) return;

  canvas.width = photo.width;
  canvas.height = photo.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, photo.width, photo.height);

  const W = photo.width;
  const H = photo.height;
  const maxWidth = W * 0.92;
  const margin = H * 0.03;

  const block = (raw: string, where: "top" | "bottom") => {
    const words = raw.trim().toUpperCase();
    if (!words) return;
    // Start big, then shrink until it fits: at most 3 lines, within the
    // width, and no taller than 40% of the photo so top and bottom never meet.
    let size = Math.min(W * 0.11, H * 0.16);
    let lines: string[] = [];
    for (; size > Math.min(W, H) * 0.045; size *= 0.92) {
      ctx.font = `${size}px ${font}`;
      lines = wrapLines(words, maxWidth, (s) => ctx.measureText(s).width);
      const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
      const tall = lines.length * size * 1.08;
      if (lines.length <= 3 && widest <= maxWidth && tall <= H * 0.4) break;
    }
    const lineHeight = size * 1.08;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(2, size * 0.14);
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#fff";
    const startY =
      where === "top" ? margin : H - margin - lines.length * lineHeight;
    lines.forEach((line, i) => {
      const y = startY + i * lineHeight;
      ctx.strokeText(line, W / 2, y);
      ctx.fillText(line, W / 2, y);
    });
  };

  block(text.top, "top");
  block(text.bottom, "bottom");
}

// ---- Pieces ----

/** A laughing face: the app's mascot. */
function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle
        cx="24"
        cy="24"
        r="20"
        strokeWidth="2.5"
        className="fill-meme-yellow stroke-meme-ink"
      />
      <path
        d="M14 19q3-4 6 0M28 19q3-4 6 0"
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="stroke-meme-ink"
      />
      <path
        d="M13 26h22q-1 11-11 11t-11-11z"
        strokeWidth="2.5"
        strokeLinejoin="round"
        className="fill-meme-ink stroke-meme-ink"
      />
      <path d="M17 32q7 4 14 0" className="fill-meme-pink" />
      <path
        d="M9 15l-3-2M39 15l3-2"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="stroke-meme-pink"
      />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

function Icon({ d, size = 22 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="stroke-current"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
