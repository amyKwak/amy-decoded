"use client";

import { useState } from "react";

export function UnlockForm({ next }: { next: string }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || pending) return;
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        // A full load, so the proxy sees the new cookie.
        window.location.assign(next);
        return;
      }
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Something went wrong. Please try again.");
    } catch {
      setError("Unable to reach the server. Check your connection and try again.");
    }
    setPending(false);
  }

  return (
    <form
      onSubmit={submit}
      className="bg-surface border-border-soft tablet:p-6 flex w-full flex-col gap-2.5 rounded-[14px] border p-4.5 text-left"
    >
      <label
        htmlFor="gate-password"
        className="text-muted font-mono text-[11px] tracking-[0.14em] uppercase"
      >
        Password
      </label>
      <div
        className={`flex items-center rounded-[10px] border-[1.5px] bg-white focus-within:ring-2 focus-within:ring-offset-1 ${
          error
            ? "border-moody-coral-ink focus-within:ring-moody-coral-ink/30"
            : "border-border-btn focus-within:ring-ink/15"
        }`}
      >
        <input
          id="gate-password"
          type={show ? "text" : "password"}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          placeholder="Enter password"
          autoComplete="current-password"
          autoFocus
          aria-invalid={Boolean(error)}
          aria-describedby="gate-message"
          className="text-ink placeholder:text-faint h-12 min-w-0 flex-1 bg-transparent px-3.5 text-base outline-none"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="text-subtle hover:text-ink flex h-12 w-12 items-center justify-center"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            {show ? (
              <>
                <path d="M3 3l18 18" />
                <path d="M10.6 5.1A10 10 0 0 1 12 5c6 0 9.5 7 9.5 7a17 17 0 0 1-3.1 4M6.6 6.6A17 17 0 0 0 2.5 12S6 19 12 19a9.6 9.6 0 0 0 5.4-1.6" />
                <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
              </>
            ) : (
              <>
                <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                <circle cx="12" cy="12" r="3" />
              </>
            )}
          </svg>
        </button>
      </div>

      <div id="gate-message" aria-live="polite" className="min-h-5 text-[13.5px] leading-snug">
        {error ? (
          <span className="text-moody-coral-ink inline-flex items-center gap-1.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16.5v.01" />
            </svg>
            {error}
          </span>
        ) : (
          <span className="text-subtle">Access is remembered on this device for 30 days.</span>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-ink text-ivory flex h-12 items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-opacity disabled:opacity-60"
      >
        {pending ? "Checking…" : "Unlock"}
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </form>
  );
}
