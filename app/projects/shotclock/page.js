"use client";
import { useEffect, useState } from "react";

const ShotClock = () => {
  const [count, setCount] = useState(0);

  // Load / persist to localStorage
  useEffect(() => {
    const saved = Number(window.localStorage.getItem("shotclock_count") || 0);
    if (!Number.isNaN(saved)) setCount(saved);
  }, []);
  useEffect(() => {
    window.localStorage.setItem("shotclock_count", String(count));
  }, [count]);

  const addOne = () => setCount((c) => c + 1);
  const minusOne = () => setCount((c) => (c > 0 ? c - 1 : 0));
  const reset = () => setCount(0);

  const getAdvice = (n) => {
    // Messages scale based on widely used public-health thresholds for “standard drinks”
    // and binge-range counts (neutral phrasing since time/sex/weight vary).
    if (n <= 0)
      return {
        text: "Tap ➕ to start.</br>A shot ≈ 1 standard drink (about 1.5 oz, 40% ABV).",
        level: "ok",
      };
    if (n <= 2)
      return {
        text: "Pace yourself.</br>Sip slow and add water between drinks.",
        level: "ok",
      };
    if (n === 3)
      return {
        text: "Slow down.</br>You’re approaching binge range for many people in ~2 hours.",
        level: "caution",
      };
    if (n === 4)
      return {
        text: "Should you really take another one?</br>This can be binge level for many.",
        level: "warning",
      };
    if (n <= 6)
      return {
        text: "Drink water and think before another one.</br>Impairment rises fast now.",
        level: "warning",
      };
    return {
      text: "Red flag: call it a night.</br>Don’t drive—hydrate, eat, and get a safe ride.",
      level: "danger",
    };
  };

  const { text: adviceText, level } = getAdvice(count);

  return (
    <div className="wrap">
      <header className="header">
        <span className="logo" aria-hidden>
          ⏱
        </span>
        <h1 className="title">ShotClock</h1>
      </header>

      <main className="card">
        {/* Advice / warning line (replaces tagline) */}
        <p
          className={`advice ${level}`}
          role="status"
          aria-live="polite"
          dangerouslySetInnerHTML={{ __html: adviceText }}
        ></p>

        <div className="counterRow">
          <button
            className="circleBtn"
            onClick={minusOne}
            disabled={count === 0}
            aria-label="Subtract one shot"
          >
            ➖
          </button>

          <div className="counter" aria-live="polite">
            <span className="count">{count}</span>
            <span className="label">shots</span>
          </div>

          <button
            className="circleBtn"
            onClick={addOne}
            aria-label="Add one shot"
          >
            ➕
          </button>
        </div>

        <button
          className="btn primary"
          onClick={addOne}
          aria-label="Take a shot"
        >
          🥂 Take a Shot
        </button>

        <button
          className="btn ghost"
          onClick={reset}
          disabled={count === 0}
          aria-label="Reset counter"
        >
          Reset
        </button>
      </main>

      <style jsx>{`
        :global(html, body, #root) {
          height: 100%;
        }

        .wrap {
          min-height: 100vh;
          display: grid;
          grid-template-rows: auto 1fr auto;
          background: radial-gradient(
              1200px 600px at 20% -10%,
              #fff6d6 0%,
              transparent 60%
            ),
            radial-gradient(900px 500px at 100% 0%, #ffe4f1 0%, transparent 50%),
            linear-gradient(180deg, #fff 0%, #f7f7fb 100%);
          padding: clamp(12px, 2.5vw, 24px);
          color: #1e1e28;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
            Inter, Arial;
        }

        .header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo {
          font-size: clamp(20px, 3vw, 28px);
        }

        .title {
          margin: 0;
          font-size: clamp(20px, 3.6vw, 28px);
          font-weight: 800;
          background: linear-gradient(90deg, #ff9d00, #ff5ea7, #7a77ff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .card {
          align-self: center;
          justify-self: center;
          width: min(560px, 100%);
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(8px);
          border-radius: 20px;
          padding: clamp(18px, 5vw, 28px);
          box-shadow: 0 10px 25px rgba(122, 119, 255, 0.12),
            0 4px 12px rgba(0, 0, 0, 0.05);
          text-align: center;
        }

        .advice {
          margin: 4px 0 10px;
          font-size: clamp(12px, 2.4vw, 14px);
          font-weight: 600;
        }
        .advice.ok {
          color: #137333;
        } /* calm green */
        .advice.caution {
          color: #b36b00;
        } /* amber */
        .advice.warning {
          color: #c03500;
        } /* orange-red */
        .advice.danger {
          color: #b00020;
        } /* red */

        .counterRow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          margin: 16px 0 24px;
        }

        .circleBtn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          font-size: 22px;
          font-weight: bold;
          cursor: pointer;
          background: #fff;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
          transition: transform 120ms ease, opacity 160ms ease;
        }

        .circleBtn:active {
          transform: scale(0.95);
        }

        .circleBtn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .counter {
          display: grid;
          place-items: center;
        }

        .count {
          font-weight: 900;
          font-size: clamp(64px, 16vw, 120px);
          line-height: 1;
        }

        .label {
          font-size: clamp(12px, 2.2vw, 14px);
          color: #7f8090;
        }

        .btn {
          border: none;
          cursor: pointer;
          font-weight: 700;
          border-radius: 999px;
          padding: 14px 22px;
          font-size: clamp(16px, 3.8vw, 18px);
          margin-top: 10px;
          width: 100%;
        }

        .primary {
          background: linear-gradient(180deg, #ffb75e, #ff6ea7);
          color: white;
        }

        .ghost {
          background: transparent;
          border: 1px dashed rgba(30, 30, 40, 0.18);
          color: #1e1e28;
        }
      `}</style>
    </div>
  );
};

export default ShotClock;
