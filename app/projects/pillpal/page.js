"use client";
import { useEffect, useMemo, useState } from "react";

const APP_NAME = "PillPal";
const STORAGE_KEY = "pillpal-v2";

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function startOfWeek(date, weekStartsOn = 1) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d;
}

const Toggle = ({ id, checked, onChange, label }) => (
  <label className="toggle" htmlFor={id} aria-label={label}>
    <input
      id={id}
      type="checkbox"
      role="switch"
      aria-checked={checked}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span className="track" />
    <span className="knob" />
    <span className="sr">{label}</span>
    <style jsx>{`
      .toggle {
        position: relative;
        display: inline-flex;
        align-items: center;
        width: 56px;
        height: 32px;
        cursor: pointer;
        touch-action: manipulation;
      }
      input {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      .track {
        position: absolute;
        inset: 0;
        background: #eef2ff;
        border: 2px solid #e0e7ff;
        border-radius: 999px;
        transition: background 0.2s, border-color 0.2s;
      }
      .knob {
        position: absolute;
        top: 4px;
        left: 4px;
        width: 24px;
        height: 24px;
        background: #c7d2fe;
        border-radius: 50%;
        transition: transform 0.2s, background 0.2s;
      }
      input:checked + .track {
        background: #dcfce7;
        border-color: #86efac;
      }
      input:checked + .track + .knob {
        transform: translateX(24px);
        background: #4ade80;
      }
      .sr {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `}</style>
  </label>
);

const Page = () => {
  const [data, setData] = useState({});
  const [today] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [data]);

  const weekStart = useMemo(() => startOfWeek(today, 1), [today]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const taken = (dateObj) => Boolean(data[fmtDate(dateObj)]);
  const setTaken = (dateObj, val) =>
    setData((prev) => ({ ...prev, [fmtDate(dateObj)]: val }));

  const resetAll = () => {
    if (confirm("Reset all tracked days? This cannot be undone.")) setData({});
  };

  return (
    <div className="page">
      <header className="header">
        <div className="brand">
          <span className="logo" aria-hidden>
            💊
          </span>
          <div className="titles">
            <h1>{APP_NAME}</h1>
            <p className="sub">Your friendly pal for daily pill tracking.</p>
          </div>
        </div>

        {!taken(today) && (
          <button
            className="primary-btn"
            onClick={() => setTaken(today, true)}
            aria-label="Mark today"
          >
            Mark today
          </button>
        )}
      </header>

      <section className="card">
        <div className="card-title">This week</div>
        <div className="toggles">
          {weekDays.map((d) => {
            const id = `w-${fmtDate(d)}`;
            const label = d.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
            const isToday = fmtDate(d) === fmtDate(today);
            return (
              <div
                className={`toggle-row ${isToday ? "today-row" : ""}`}
                key={id}
              >
                <div className="wday">
                  {label} {isToday && <span className="chip">Today</span>}
                </div>
                <Toggle
                  id={id}
                  checked={taken(d)}
                  onChange={(v) => setTaken(d, v)}
                  label={`Taken on ${label}`}
                />
              </div>
            );
          })}
        </div>
      </section>

      <section className="footer-actions">
        <button className="btn danger" onClick={resetAll}>
          Reset all
        </button>
      </section>

      <style jsx>{`
        :global(html, body, #__next) {
          height: 100%;
        }
        .page {
          min-height: 100%;
          padding: 16px;
          background: linear-gradient(180deg, #f7f9ff, #f2f5ff);
          color: #0f172a;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
            Helvetica, Arial;
          max-width: 400px;
          margin: 0 auto;
        }

        .header {
          display: grid;
          gap: 12px;
          margin-bottom: 12px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo {
          display: inline-grid;
          place-items: center;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          font-size: 22px;
        }
        .titles h1 {
          font-size: 20px;
          margin: 0;
          color: #1e3a8a;
        }
        .sub {
          margin: 2px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .primary-btn {
          width: 100%;
          padding: 12px 14px;
          border-radius: 14px;
          border: 1px solid #c7d2fe;
          background: linear-gradient(180deg, #e0e7ff, #c7d2fe);
          color: #111827;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.18);
        }
        .primary-btn:hover {
          filter: brightness(0.98);
        }
        .primary-btn:active {
          transform: translateY(0.5px);
        }

        .card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 12px;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
          margin-top: 12px;
        }
        .card-title {
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 10px;
        }

        .toggles {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-bottom: 12px;
        }
        .toggle-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border: 1px solid #eef2ff;
          border-radius: 12px;
          background: #fafbff;
        }
        .today-row {
          border-color: #bae6fd;
          background: #f0f9ff;
        }
        .wday {
          font-size: 14px;
          color: #334155;
          font-weight: 700;
        }
        .chip {
          margin-left: 6px;
          font-size: 11px;
          color: #0369a1;
          background: #e0f2fe;
          border: 1px solid #bae6fd;
          padding: 2px 6px;
          border-radius: 999px;
          font-weight: 700;
        }

        .footer-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          flex-wrap: wrap;
        }
        .btn {
          border: 1px solid #e5e7eb;
          background: #fff;
          padding: 8px 12px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
        }
        .btn.danger {
          background: #fee2e2;
          border-color: #fecaca;
          color: var(--color-black);
        }
      `}</style>
    </div>
  );
};

export default Page;
