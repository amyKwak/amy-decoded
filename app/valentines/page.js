"use client";
import React, { useEffect, useMemo, useState } from "react";

// Utility
function normalizeAnswer(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function HeartDivider() {
  return (
    <div className="divider" aria-hidden>
      <span>♥</span>
      <span>♥</span>
      <span>♥</span>
      <style jsx>{`
        .divider {
          display: flex;
          gap: 10px;
          justify-content: center;
          opacity: 0.85;
          margin: 16px 0;
          font-size: 18px;
        }
      `}</style>
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="card">
      {children}
      <style jsx>{`
        .card {
          width: 100%;
          max-width: 820px;
          border-radius: 22px;
          padding: 22px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          box-shadow: 0 18px 60px rgba(0, 0, 0, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.55);
        }
      `}</style>
    </div>
  );
}

function Button({ children, onClick, disabled, variant = "primary" }) {
  return (
    <button className={`btn ${variant}`} onClick={onClick} disabled={disabled}>
      {children}
      <style jsx>{`
        .btn {
          border: none;
          cursor: pointer;
          padding: 12px 16px;
          border-radius: 14px;
          font-weight: 700;
          letter-spacing: 0.2px;
          font-size: 15px;
          transition:
            transform 120ms ease,
            opacity 120ms ease;
        }
        .btn:active {
          transform: translateY(1px);
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .primary {
          background: linear-gradient(135deg, #ff4d7d, #ff9bb3);
          color: white;
          box-shadow: 0 10px 25px rgba(255, 77, 125, 0.28);
        }
        .secondary {
          background: rgba(255, 255, 255, 0.9);
          color: #8a2040;
          border: 1px solid rgba(138, 32, 64, 0.15);
        }
        .ghost {
          background: transparent;
          color: #8a2040;
          border: 1px dashed rgba(138, 32, 64, 0.35);
        }
      `}</style>
    </button>
  );
}

function Input({ value, onChange, placeholder }) {
  return (
    <input
      className="input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete="off"
      spellCheck={false}
      style={{
        width: "100%",
        padding: "14px 18px",
        fontSize: "1.15rem",
        borderRadius: "14px",
        border: "2px solid #f2c2d1",
        outline: "none",
        background: "#fff9fb",
        color: "#333",
        boxShadow: "0 4px 12px rgba(255, 105, 135, 0.15)",
      }}
    />
  );
}

function Pill({ children }) {
  return (
    <span className="pill">
      {children}
      <style jsx>{`
        .pill {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.35px;
          text-transform: uppercase;
          background: rgba(255, 77, 125, 0.12);
          color: #8a2040;
          border: 1px solid rgba(255, 77, 125, 0.18);
        }
      `}</style>
    </span>
  );
}

export default function ValentineScavengerHuntApp() {
  const [startedAt, setStartedAt] = useState(null);
  const [finishedAt, setFinishedAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(() => ({
    starryInput: "",
    starryCorrect: false,

    sudokuAnswer: "",

    logicGuess: "",

    crosswordGuess: "",

    finalCode: "",
  }));

  const totalSteps = 11;

  function next() {
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }
  function start() {
    setStartedAt(Date.now());
    next();
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }
  function finish() {
    const finalMs = Date.now() - startedAt;
    setElapsed(finalMs);
    setFinishedAt(finalMs);
  }

  function setField(key, value) {
    setProgress((p) => ({ ...p, [key]: value }));
  }

  // Derived checks
  const starryIsCorrect = useMemo(
    () => normalizeAnswer(progress.starryInput) === "starry night",
    [progress.starryInput],
  );

  useEffect(() => {
    if (starryIsCorrect && !progress.starryCorrect) {
      setField("starryCorrect", true);
    }
    if (!starryIsCorrect && progress.starryCorrect) {
      setField("starryCorrect", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starryIsCorrect]);

  // timer
  useEffect(() => {
    if (!startedAt) return;
    if (finishedAt !== null) return;

    const id = setInterval(() => {
      setElapsed(Date.now() - startedAt);
    }, 1000);

    return () => clearInterval(id);
  }, [startedAt, finishedAt]);

  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  const sudokuAnswer = "251978364";
  const sudokuSolved = normalizeAnswer(progress.sudokuAnswer) === sudokuAnswer;

  const logicSolved = normalizeAnswer(progress.logicGuess) === "gazebo";

  const crosswordSolved = normalizeAnswer(progress.crosswordGuess) === "";

  return (
    <div className="page">
      <FloatingHearts />

      <div className="topbar">
        <div className="left">
          {startedAt ? (
            <div className="timer">⏱ {formatTime(elapsed)}</div>
          ) : (
            <>
              <div className="title">Valentine Hunt</div>
              <div className="subtitle">For BB</div>
            </>
          )}
        </div>
        <div className="right">
          <Pill>
            Step {step + 1} / {totalSteps}
          </Pill>
        </div>
      </div>

      <div className="wrap">
        <Card>
          {step === 0 && (
            <>
              <Pill>Happy Valentine’s Day</Pill>
              <h1>❤️ Scavenger Hunt ❤️</h1>
              <p className="lead">
                I planned a mini Amazing Race–style adventure just for you.
                <br />
                You’ll follow clues, solve challenges, and move from place to
                place around us.
                <br />
                At every location, you’ll complete a challenge and earn a little
                gift before moving on.
              </p>
              <HeartDivider />
              <ul className="bullets">
                <li>Keep this page open so your timer keeps running.</li>
                <li>
                  All gifts will be wrapped in{" "}
                  <b>
                    <span style={{ color: "red" }}>red</span>
                  </b>
                  .
                </li>
                <li>
                  Finish as fast as you can — any time you have left in the hour
                  will be rewarded with a massage. 💆‍♂️💋
                </li>
              </ul>
              <div className="actions">
                <Button onClick={start}>Click Here to Begin</Button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <Pill>Route Info</Pill>
              <h2>Head to the Next Location</h2>
              <p className="lead">
                Go where you’re closer to the sky than the street,
                <br />
                and the noise below fades under your feet.
                <br />
                <br />
                Find the place made for slow time and quiet views,
                <br />
                where the best seat is simply the one you choose.
                <br />
                <br />
                When you’re closer to the sky than your own front door,
                <br />
                you’ve found the spot you’re looking for.
                <br />
                <br />
              </p>
              ❤️ When you’ve found the clue and your gift, tap <b>Next </b>
              to continue.
              <div className="actions between">
                <Button onClick={next}>Next →</Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <Pill>Roadblock</Pill>
              <h2>Can you reveal the picture hiding inside the pieces?</h2>
              <p className="lead">
                You <b>must</b> complete the puzzle to unlock the correct
                answer.
              </p>

              <div className="clueBox">
                <div className="clueTitle">
                  What is this puzzle an image of?
                </div>
                <div className="row">
                  <Input
                    value={progress.starryInput}
                    onChange={(v) => setField("starryInput", v)}
                    placeholder="Type the answer here"
                  />
                </div>
                <div className="status">
                  {progress.starryCorrect ? (
                    <span className="ok">Correct 💘</span>
                  ) : progress.starryInput.trim().length > 0 ? (
                    <span className="bad">Not quite… try again.</span>
                  ) : (
                    <span className="muted"></span>
                  )}
                </div>
              </div>

              <div className="actions between">
                <Button variant="secondary" onClick={back}>
                  Back
                </Button>
                <Button onClick={next} disabled={false}>
                  {/* FIX to disabled={!progress.starryCorrect} */}
                  Next →
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <Pill>Route Info</Pill>
              <h2>Head to the Next Location</h2>
              <p className="lead">
                Go to the place where distance disappears,
                <br />
                without a call, a text, or a voice in your ears.
                <br />
                <br />
                Where names become numbers and time stands still,
                <br />
                until a small door opens by someone’s will.
                <br />
                <br />
                Find the spot where messages finally land,
                <br />
                after crossing the world hand to hand.
                <br />
                <br />
              </p>
              ❤️ When you’ve found the clue and your gift, tap <b>Next </b>
              to continue.
              <div className="actions between">
                <Button variant="secondary" onClick={back}>
                  Back
                </Button>
                <Button onClick={next} disabled={false}>
                  Next →
                </Button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <Pill>Roadblock</Pill>
              <h2>Can you solve my kind of chaos?</h2>
              <p className="lead">Solve the Sudoku.</p>

              <HeartDivider />
              <div className="clueBox">
                <div className="clueTitle">Enter the last row of numbers</div>
                <div className="row">
                  <Input
                    value={progress.sudokuAnswer}
                    onChange={(v) => setField("sudokuAnswer", v)}
                    placeholder="Type the answer here"
                  />
                </div>
                <div className="status">
                  {progress.sudokuAnswer.trim().length === 0 ? (
                    <span className="muted"></span>
                  ) : sudokuSolved ? (
                    <span className="ok">Yes! Off you go 🏃</span>
                  ) : (
                    <span className="bad">Not yet…</span>
                  )}
                </div>
              </div>

              <div className="actions between">
                <Button variant="secondary" onClick={back}>
                  Back
                </Button>
                <Button onClick={next} disabled={false}>
                  {/* FIX: changed disabled to !sudokuSolved */}
                  Next →
                </Button>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <Pill>Route Info</Pill>
              <h2>Head to the Next Location</h2>
              <p className="lead">
                Riddle about next location
                <br />
                <br />
              </p>
              ❤️ When you’ve found the clue and your gift, tap <b>Next </b>
              to continue.
              <div className="actions between">
                <Button variant="secondary" onClick={back}>
                  Back
                </Button>
                <Button onClick={next}>Next →</Button>
              </div>
            </>
          )}

          {step === 6 && (
            <>
              <Pill>Roadblock</Pill>
              <h2>Intro</h2>
              <p className="lead">What to do</p>

              <div className="clueBox">
                <div className="clueTitle">Your answer</div>
                <div className="row">
                  <Input
                    value={progress.logicGuess}
                    onChange={(v) => setField("logicGuess", v)}
                    placeholder="keyword"
                  />
                </div>
                <div className="status">
                  {progress.logicGuess.trim().length === 0 ? (
                    <span className="muted"></span>
                  ) : logicSolved ? (
                    <span className="ok">Correct. Go claim your clue 🗝️</span>
                  ) : (
                    <span className="bad">Not quite. Read line 1 again…</span>
                  )}
                </div>
              </div>

              <div className="actions between">
                <Button variant="secondary" onClick={back}>
                  Back
                </Button>
                <Button onClick={next} disabled={false}>
                  {/* FIX: disabled = !logicSolved */}
                  Next →
                </Button>
              </div>
            </>
          )}

          {step === 7 && (
            <>
              <Pill>Route Info</Pill>
              <h2>Head to the Next Location</h2>
              <p className="lead">
                Riddle
                <br />
                <br />
              </p>
              ❤️ When you’ve found the clue and your gift, tap <b>Next </b>
              to continue.
              <div className="actions between">
                <Button variant="secondary" onClick={back}>
                  Back
                </Button>
                <Button onClick={next} disabled={false}>
                  Next →
                </Button>
              </div>
            </>
          )}

          {step === 8 && (
            <>
              <Pill>Roadblock</Pill>
              <h2>Can you take a moment to remember?</h2>
              <p className="lead">
                Fill in the crossword by writing the <b>city</b> where each
                photo was taken.
              </p>

              <div className="clueBox">
                <div className="clueTitle">Enter the letters in red</div>
                <div className="row">
                  <Input
                    value={progress.crosswordGuess}
                    onChange={(v) => setField("crosswordGuess", v)}
                  />
                </div>
                <div className="status">
                  {progress.crosswordGuess.trim().length === 0 ? (
                    <span className="muted"></span>
                  ) : crosswordSolved ? (
                    <span className="ok">Good memory!</span>
                  ) : (
                    <span className="bad">Nope. Try again.</span>
                  )}
                </div>
              </div>

              <div className="actions between">
                <Button variant="secondary" onClick={back}>
                  Back
                </Button>
                <Button onClick={next} disabled={false}>
                  {/* FIX to disabled={!progress.crosswordSolved} */}
                  Next →
                </Button>
              </div>
            </>
          )}

          {step === 9 && (
            <>
              <Pill>Pit Stop</Pill>
              <h2>Race to the finish line!</h2>
              <p className="lead">
                <b>DON'T CLICK NEXT.</b>
                <br />
                <br />
                Bring it back <b>home</b>.
                <br />
                Ring the doorbell and trade your phone for your final challenge.
                <br />
              </p>

              <div className="actions between">
                <Button variant="secondary" onClick={back}>
                  Back
                </Button>
                <Button onClick={next} disabled={false}>
                  {/* FIX to disabled={!progress.crosswordSolved} */}
                  Next →
                </Button>
              </div>
            </>
          )}

          {step === 10 && (
            <div className="finish">
              {finishedAt === null ? (
                <div className="finish">
                  <Button onClick={finish} disabled={false}>
                    Finish
                  </Button>
                </div>
              ) : (
                <div className="finishTime">
                  🏁 Finish time: <strong>{formatTime(finishedAt)}</strong> 🏁
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family:
            ui-sans-serif,
            system-ui,
            -apple-system,
            Segoe UI,
            Roboto,
            Arial,
            "Apple Color Emoji",
            "Segoe UI Emoji";
          background:
            radial-gradient(
              circle at 20% 10%,
              #ffd3df 0%,
              rgba(255, 211, 223, 0) 40%
            ),
            radial-gradient(
              circle at 90% 30%,
              #ffe6ef 0%,
              rgba(255, 230, 239, 0) 45%
            ),
            radial-gradient(
              circle at 40% 90%,
              #ffd9e6 0%,
              rgba(255, 217, 230, 0) 55%
            ),
            linear-gradient(180deg, #fff6f8, #fff);
          color: #3a0b1a;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .topbar {
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 18px;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.55);
          border-bottom: 1px solid rgba(122, 24, 52, 0.08);
        }

        .timer {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .title {
          font-weight: 950;
          letter-spacing: 0.2px;
        }
        .subtitle {
          font-size: 12px;
          font-weight: 700;
          color: rgba(58, 11, 26, 0.65);
          margin-top: 2px;
        }

        .wrap {
          padding: 26px 16px 30px;
          display: grid;
          place-items: center;
        }

        h1 {
          margin: 10px 0 8px;
          font-size: 36px;
          line-height: 1.05;
          color: #7a1834;
        }
        h2 {
          margin: 10px 0 6px;
          font-size: 26px;
          color: #7a1834;
        }

        .lead {
          margin: 0;
          color: rgba(58, 11, 26, 0.75);
          font-size: 16px;
          line-height: 1.5;
        }

        .bullets {
          margin: 10px 0 0;
          padding-left: 18px;
          color: rgba(58, 11, 26, 0.78);
        }
        .bullets li {
          margin: 6px 0;
        }

        .actions {
          margin-top: 18px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .between {
          justify-content: space-between;
        }

        .clueBox {
          margin-top: 14px;
          border-radius: 18px;
          border: 1px solid rgba(122, 24, 52, 0.12);
          background: rgba(255, 255, 255, 0.75);
          padding: 14px;
        }
        .clueTitle {
          font-weight: 900;
          letter-spacing: 0.2px;
          color: #7a1834;
          margin-bottom: 8px;
        }
        .clueText {
          color: rgba(58, 11, 26, 0.82);
          line-height: 1.45;
        }

        .fine {
          font-size: 12px;
          color: rgba(58, 11, 26, 0.6);
          margin-top: 8px;
          line-height: 1.35;
        }

        .row {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .input {
          width: 100%;
          padding: 12px 12px;
          border-radius: 14px;
          border: 1px solid rgba(122, 24, 52, 0.18);
          outline: none;
          font-weight: 700;
          color: #3a0b1a;
          background: rgba(255, 255, 255, 0.92);
        }
        .input:focus {
          border-color: rgba(255, 77, 125, 0.75);
          box-shadow: 0 0 0 4px rgba(255, 77, 125, 0.12);
        }

        .status {
          margin-top: 10px;
          font-weight: 800;
        }
        .ok {
          color: #0f7a3a;
        }
        .bad {
          color: #b11b3f;
        }
        .muted {
          color: rgba(58, 11, 26, 0.55);
          font-weight: 700;
        }

        .check {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-top: 10px;
          font-weight: 800;
          color: rgba(58, 11, 26, 0.78);
        }
        .check input {
          width: 18px;
          height: 18px;
          accent-color: #ff4d7d;
        }

        .mono {
          font-family:
            ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
          background: rgba(58, 11, 26, 0.05);
          padding: 12px;
          border-radius: 14px;
          border: 1px dashed rgba(122, 24, 52, 0.2);
          letter-spacing: 1px;
          font-weight: 900;
          color: #7a1834;
        }

        .bigWord {
          font-size: 34px;
          font-weight: 950;
          letter-spacing: 2px;
          color: #7a1834;
          text-align: center;
          padding: 12px 0 2px;
        }

        .finish {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .finishTime {
          font-size: 3rem;
        }

        @media (max-width: 640px) {
          h1 {
            font-size: 30px;
          }
          h2 {
            font-size: 22px;
          }
        }
      `}</style>
    </div>
  );
}

function FloatingHearts() {
  // lightweight decorative background
  const hearts = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 10 + Math.random() * 22,
        duration: 8 + Math.random() * 10,
        delay: Math.random() * 4,
        opacity: 0.12 + Math.random() * 0.18,
      })),
    [],
  );

  return (
    <div className="floatLayer" aria-hidden>
      {hearts.map((h) => (
        <span
          key={h.id}
          className="heart"
          style={{
            left: `${h.left}%`,
            top: `${h.top}%`,
            fontSize: `${h.size}px`,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
            opacity: h.opacity,
          }}
        >
          ♥
        </span>
      ))}

      <style jsx>{`
        .floatLayer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .heart {
          position: absolute;
          color: #ff4d7d;
          filter: blur(0px);
          animation-name: drift;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        @keyframes drift {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          50% {
            transform: translate(16px, -22px) rotate(10deg);
          }
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}
