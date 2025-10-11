"use client";
import React, { useEffect, useRef, useState } from "react";

export default function DebounceThrottleMinimal() {
  // --- Debounce demo ---
  const [debounceDelay, setDebounceDelay] = useState(300);
  const [debounceLeading, setDebounceLeading] = useState(false);
  const [debounceTrailing, setDebounceTrailing] = useState(true);
  const [debounceRaw, setDebounceRaw] = useState("");
  const [debounced, setDebounced] = useState("");
  const debounceTimerRef = useRef(null);

  function onDebounceInput(v) {
    setDebounceRaw(v);
    const callNow = debounceLeading && !debounceTimerRef.current;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    // Always (re)start window; trailing callback fires with latest value
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      if (debounceTrailing) setDebounced(v);
    }, debounceDelay);
    if (callNow) setDebounced(v);
  }

  useEffect(
    () => () =>
      debounceTimerRef.current && clearTimeout(debounceTimerRef.current),
    []
  );

  // --- Throttle demo ---
  const [throttleDelay, setThrottleDelay] = useState(120);
  const [throttleLeading, setThrottleLeading] = useState(true);
  const [throttleTrailing, setThrottleTrailing] = useState(true);
  const [throttleRaw, setThrottleRaw] = useState("");
  const [throttled, setThrottled] = useState("");
  const lastRunRef = useRef(0);
  const trailingTimerRef = useRef(null);
  const lastValRef = useRef("");

  function onThrottleInput(v) {
    setThrottleRaw(v);
    lastValRef.current = v;
    const now = Date.now();

    if (!throttleLeading && lastRunRef.current === 0) {
      // Start window without firing when leading is off
      lastRunRef.current = now;
    }

    const elapsed = now - lastRunRef.current;
    const remaining = throttleDelay - elapsed;

    if (remaining <= 0 || remaining > throttleDelay) {
      // Window passed: either fire immediately (leading on) or schedule trailing
      if (trailingTimerRef.current) {
        clearTimeout(trailingTimerRef.current);
        trailingTimerRef.current = null;
      }
      if (throttleLeading) {
        setThrottled(v);
        lastRunRef.current = now;
      } else if (throttleTrailing) {
        trailingTimerRef.current = setTimeout(() => {
          setThrottled(lastValRef.current);
          lastRunRef.current = Date.now();
          trailingTimerRef.current = null;
        }, throttleDelay);
      }
    } else if (throttleTrailing && !trailingTimerRef.current) {
      // Schedule a trailing call at end of window
      trailingTimerRef.current = setTimeout(() => {
        setThrottled(lastValRef.current);
        lastRunRef.current = Date.now();
        trailingTimerRef.current = null;
      }, remaining);
    }
  }

  useEffect(
    () => () =>
      trailingTimerRef.current && clearTimeout(trailingTimerRef.current),
    []
  );

  return (
    <div className="page">
      <h1>Debounce & Throttle — Minimal Demo</h1>

      <section className="card">
        <h2>Debounce</h2>
        <p className="hint">
          Updates after no typing for <b>{debounceDelay}ms</b>.
        </p>

        <div className="row">
          <label className="check">
            <input
              type="checkbox"
              checked={debounceLeading}
              onChange={(e) => setDebounceLeading(e.target.checked)}
            />
            <span>leading</span>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={debounceTrailing}
              onChange={(e) => setDebounceTrailing(e.target.checked)}
            />
            <span>trailing</span>
          </label>
        </div>

        <label className="label">Type here</label>
        <input
          className="input"
          value={debounceRaw}
          onChange={(e) => onDebounceInput(e.target.value)}
          placeholder="Debounced input..."
        />
        <label className="label">Delay: {debounceDelay}ms</label>
        <input
          className="range"
          type="range"
          min="50"
          max="1000"
          step="10"
          value={debounceDelay}
          onChange={(e) => setDebounceDelay(parseInt(e.target.value, 10))}
        />
        <div className="output">
          <div className="outputTitle">Debounced value</div>
          <div className="outputBox">{debounced}</div>
        </div>
      </section>

      <section className="card">
        <h2>Throttle</h2>
        <p className="hint">
          Updates at most once every <b>{throttleDelay}ms</b>.
        </p>

        <div className="row">
          <label className="check">
            <input
              type="checkbox"
              checked={throttleLeading}
              onChange={(e) => setThrottleLeading(e.target.checked)}
            />
            <span>leading</span>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={throttleTrailing}
              onChange={(e) => setThrottleTrailing(e.target.checked)}
            />
            <span>trailing</span>
          </label>
        </div>

        <label className="label">Throttled input</label>
        <input
          className="input"
          value={throttleRaw}
          onChange={(e) => onThrottleInput(e.target.value)}
          placeholder="Throttled input..."
        />
        <label className="label">Interval: {throttleDelay}ms</label>
        <input
          className="range"
          type="range"
          min="16"
          max="1000"
          step="1"
          value={throttleDelay}
          onChange={(e) => setThrottleDelay(parseInt(e.target.value, 10))}
        />
        <div className="output">
          <div className="outputTitle">Throttled value</div>
          <div className="outputBox">{throttled}</div>
        </div>
      </section>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }
        .page {
          min-height: 100vh;
          padding: 24px;
          background: var(--bg);
          color: var(--text);
        }
        h1 {
          margin: 0 0 16px;
          font-size: 22px;
          color: white;
        }
        h2 {
          margin: 0 0 8px;
          font-size: 18px;
          color: #111111;
        }
        .hint {
          margin: 0 0 12px;
          color: #555555;
        }
        .card {
          background: #fafafa;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 18px;
        }
        .label {
          display: block;
          margin: 8px 0 6px;
          font-weight: 600;
          color: #111111;
        }
        .input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e5e5e5;
          border-radius: 10px;
          background: #ffffff;
          color: #111111;
        }
        .input::placeholder {
          color: #9aa0a6;
        }
        .range {
          width: 100%;
          margin-top: 6px;
        }
        .output {
          margin-top: 12px;
        }
        .outputTitle {
          font-size: 13px;
          color: #555555;
          margin-bottom: 6px;
        }
        .outputBox {
          padding: 10px 12px;
          border: 1px solid #e5e5e5;
          border-radius: 10px;
          background: #ffffff;
          color: #111111;
          min-height: 40px;
          display: flex;
          align-items: center;
        }
        .row {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 8px;
        }
        .check {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #111111;
        }
      `}</style>
    </div>
  );
}
