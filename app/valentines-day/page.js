"use client";
import React, { useEffect, useMemo, useState } from "react";

/**
 * Valentine Scavenger Hunt (React + styled-jsx)
 * ------------------------------------------------
 * - Single-file app you can paste into a Next.js page (recommended) or adapt to CRA.
 * - No Tailwind. All styling uses styled-jsx.
 *
 * Quick customize:
 * 1) Update PLACES in `HUNT_CONFIG` (names + addresses/notes).
 * 2) Replace `PHOTO_CLUE_IMAGE_URL` with your photo URL (or import).
 * 3) Edit the clue/puzzle copy in the step renderers.
 */
const HUNT_CONFIG = {
  boyfriendName: "Babe",
  // At least 5 places to go (these are placeholders; swap for real spots):
  places: {
    place1: {
      label: "Place #1",
      name: "The Kitchen",
      note: "(Hide the first note by the mugs / coffee.)",
    },
    place2: {
      label: "Place #2",
      name: "Our Coffee Spot",
      note: "(A barista-friendly envelope under your name.)",
    },
    place3: {
      label: "Place #3",
      name: "City Park Gazebo",
      note: "(Tape a clue under the bench slat.)",
    },
    place4: {
      label: "Place #4",
      name: "Bookstore — Art Section",
      note: "(Inside a book with a bookmark.)",
    },
    place5: {
      label: "Place #5",
      name: "Home — Living Room",
      note: "(Final surprise: candles + your gift.)",
    },
  },
};

const PHOTO_CLUE_IMAGE_URL =
  "https://images.unsplash.com/photo-1520962922320-2038eebab146?auto=format&fit=crop&w=1400&q=70"; // TODO: replace with your own photo

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

/**
 * Mini-game: Memory Match (small, quick, but satisfying)
 * - Flip cards, match pairs.
 * - When all pairs matched, reveals a code word.
 */
function MemoryMatch({ onSolved }) {
  const symbols = useMemo(() => ["♥", "★", "✿", "☕", "🎨", "♫"], []);
  const [deck, setDeck] = useState(() => shuffle([...symbols, ...symbols]));
  const [flipped, setFlipped] = useState([]); // indexes
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    if (matched.size === deck.length) {
      onSolved?.();
    }
  }, [matched, deck.length, onSolved]);

  function reset() {
    setDeck(shuffle([...symbols, ...symbols]));
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
  }

  function clickCard(i) {
    if (matched.has(i)) return;
    if (flipped.includes(i)) return;
    if (flipped.length === 2) return;

    const nextFlipped = [...flipped, i];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = nextFlipped;
      const isMatch = deck[a] === deck[b];
      window.setTimeout(() => {
        if (isMatch) {
          setMatched((prev) => {
            const n = new Set(prev);
            n.add(a);
            n.add(b);
            return n;
          });
        }
        setFlipped([]);
      }, 650);
    }
  }

  return (
    <div className="mm">
      <div className="mmTop">
        <div>
          <Pill>Mini-game</Pill>
          <h3>Memory Match</h3>
          <p className="sub">
            Match all pairs to unlock the next clue. Try to finish in{" "}
            <b>8 moves</b>.
          </p>
        </div>
        <div className="stats">
          <div>
            <div className="label">Moves</div>
            <div className="value">{moves}</div>
          </div>
          <Button variant="ghost" onClick={reset}>
            Reset
          </Button>
        </div>
      </div>

      <div className="grid" role="grid" aria-label="memory match">
        {deck.map((sym, i) => {
          const isUp = flipped.includes(i) || matched.has(i);
          return (
            <button
              key={i}
              className={`cardBtn ${isUp ? "up" : "down"}`}
              onClick={() => clickCard(i)}
              aria-label={isUp ? `card ${sym}` : "card"}
            >
              <span className="face">{isUp ? sym : "?"}</span>
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .mm h3 {
          margin: 10px 0 6px;
          font-size: 20px;
          color: #7a1834;
        }
        .sub {
          margin: 0;
          color: rgba(122, 24, 52, 0.78);
        }
        .mmTop {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 12px;
        }
        .stats {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .label {
          font-size: 12px;
          color: rgba(122, 24, 52, 0.7);
          font-weight: 800;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }
        .value {
          font-size: 18px;
          font-weight: 900;
          color: #7a1834;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 10px;
          margin-top: 10px;
        }
        .cardBtn {
          border: 1px solid rgba(122, 24, 52, 0.18);
          border-radius: 16px;
          padding: 0;
          height: 68px;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 10px 18px rgba(0, 0, 0, 0.06);
          transition: transform 120ms ease;
        }
        .cardBtn:active {
          transform: translateY(1px);
        }
        .cardBtn.up {
          background: rgba(255, 77, 125, 0.12);
        }
        .face {
          display: grid;
          place-items: center;
          height: 100%;
          font-size: 26px;
          font-weight: 900;
          color: #7a1834;
        }
        @media (max-width: 640px) {
          .grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ValentineScavengerHuntApp() {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(() => ({
    starryInput: "",
    starryCorrect: false,
    finishedPuzzleYes: false,
    finishedPuzzleNo: false,

    photoGuess: "",

    caesarGuess: "",

    memorySolved: false,

    logicGuess: "",

    finalCode: "",
  }));

  const totalSteps = 8;
  const place = HUNT_CONFIG.places;

  function next() {
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
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
      // also reset follow-ups if they change the answer
      setField("finishedPuzzleYes", false);
      setField("finishedPuzzleNo", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starryIsCorrect]);

  const canNextFromStarry =
    progress.starryCorrect &&
    progress.finishedPuzzleYes &&
    !progress.finishedPuzzleNo;

  const caesarTarget = "bookstore"; // where you want him to go
  const caesarSolved = normalizeAnswer(progress.caesarGuess) === caesarTarget;

  const photoSolved = normalizeAnswer(progress.photoGuess) === "coffee";

  const logicSolved = normalizeAnswer(progress.logicGuess) === "gazebo";

  const finalSolved = normalizeAnswer(progress.finalCode) === "forever";

  return (
    <div className="page">
      <FloatingHearts />

      <div className="topbar">
        <div className="left">
          <div className="title">Valentine Hunt</div>
          <div className="subtitle">For {HUNT_CONFIG.boyfriendName}</div>
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
                I planned a mini <b>Amazing Race</b>-style adventure for you.
                You’ll solve puzzles, crack clues, and travel to at least{" "}
                <b>five places</b>. Each stop gives you what you need for the
                next.
              </p>
              <HeartDivider />
              <ul className="bullets">
                <li>Bring your phone.</li>
                <li>Don’t overthink, but do think. 😈</li>
                <li>
                  If you get stuck, you get <b>one hint</b>… but it costs a
                  kiss.
                </li>
              </ul>
              <div className="actions">
                <Button onClick={next}>Click Here to Begin</Button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <Pill>Clue 1</Pill>
              <h2>Warm-up: Find the first envelope</h2>
              <p className="lead">
                Start where mornings begin and tiny rituals live.
                <br />
                <b>Rule:</b> You’re not allowed to open any drawers.
              </p>

              <div className="clueBox">
                <div className="clueTitle">Where to go</div>
                <div className="clueText">
                  Head to <b>{place.place1.name}</b> {place.place1.note}
                </div>
                <div className="fine">
                  (Replace this filler with your real hiding instructions.)
                </div>
              </div>

              <HeartDivider />
              <p className="hint">
                Optional hint: Think “mug”, “beans”, “sweetener”…
              </p>

              <div className="actions between">
                <Button variant="secondary" onClick={back}>
                  Back
                </Button>
                <Button onClick={next}>I Found It →</Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <Pill>Puzzle 1</Pill>
              <h2>Answer the secret phrase</h2>
              <p className="lead">
                In the envelope you found, imagine there’s a tiny puzzle (like a
                mini jigsaw, a maze, or a word search). When you finish it, it
                reveals a two-word answer.
              </p>

              <div className="clueBox">
                <div className="clueTitle">Enter the answer</div>
                <div className="row">
                  <Input
                    value={progress.starryInput}
                    onChange={(v) => setField("starryInput", v)}
                    placeholder='Type the answer here (example: "Starry Night")'
                  />
                </div>
                <div className="status">
                  {progress.starryCorrect ? (
                    <span className="ok">Correct 💘</span>
                  ) : progress.starryInput.trim().length > 0 ? (
                    <span className="bad">Not quite… try again.</span>
                  ) : (
                    <span className="muted">
                      (Answer is “Starry Night”) — keep this for now.
                    </span>
                  )}
                </div>
              </div>

              {progress.starryCorrect && (
                <>
                  <HeartDivider />
                  <div className="clueBox">
                    <div className="clueTitle">Did you finish the puzzle?</div>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={progress.finishedPuzzleYes}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setField("finishedPuzzleYes", checked);
                          if (checked) setField("finishedPuzzleNo", false);
                        }}
                      />
                      Yes, I finished it.
                    </label>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={progress.finishedPuzzleNo}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setField("finishedPuzzleNo", checked);
                          if (checked) setField("finishedPuzzleYes", false);
                        }}
                      />
                      No, not yet.
                    </label>

                    <div className="status">
                      {progress.finishedPuzzleNo && (
                        <span className="bad">
                          You must finish the puzzle first 😤
                        </span>
                      )}
                      {progress.finishedPuzzleYes &&
                        !progress.finishedPuzzleNo && (
                          <span className="ok">
                            Perfect. You may proceed 😌
                          </span>
                        )}
                    </div>
                  </div>

                  <div className="actions between">
                    <Button variant="secondary" onClick={back}>
                      Back
                    </Button>
                    <Button onClick={next} disabled={!canNextFromStarry}>
                      Next →
                    </Button>
                  </div>
                </>
              )}

              {!progress.starryCorrect && (
                <div className="actions between">
                  <Button variant="secondary" onClick={back}>
                    Back
                  </Button>
                  <Button
                    onClick={() => setField("starryInput", "Starry Night")}
                  >
                    Auto-fill (testing)
                  </Button>
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <Pill>Clue 2</Pill>
              <h2>Photo clue: Where is this?</h2>
              <p className="lead">
                Study the picture. You’re looking for a place that matches
                it—and at that place, you’ll find the next hidden note.
              </p>

              <div className="photoWrap">
                <img src={PHOTO_CLUE_IMAGE_URL} alt="Clue location" />
                <div className="photoCaption">
                  <div className="capTitle">Your task</div>
                  <div className="capText">
                    Figure out where this is. When you arrive, look for
                    something that smells amazing.
                  </div>
                </div>
              </div>

              <HeartDivider />
              <div className="clueBox">
                <div className="clueTitle">
                  Type the keyword when you’re there
                </div>
                <p className="fine">
                  (For now, the correct keyword is <b>coffee</b>.)
                </p>
                <div className="row">
                  <Input
                    value={progress.photoGuess}
                    onChange={(v) => setField("photoGuess", v)}
                    placeholder='Type the keyword (example: "coffee")'
                  />
                </div>
                <div className="status">
                  {progress.photoGuess.trim().length === 0 ? (
                    <span className="muted">
                      Enter the keyword to unlock Next.
                    </span>
                  ) : photoSolved ? (
                    <span className="ok">Nice. I knew you’d get it ☕</span>
                  ) : (
                    <span className="bad">Nope. Look closer 👀</span>
                  )}
                </div>
              </div>

              <div className="actions between">
                <Button variant="secondary" onClick={back}>
                  Back
                </Button>
                <Button onClick={next} disabled={!photoSolved}>
                  Next →
                </Button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <Pill>Puzzle 2</Pill>
              <h2>Crack the cipher</h2>
              <p className="lead">
                Amazing Race vibes: decode the message to learn your next
                destination.
              </p>

              <div className="clueBox">
                <div className="clueTitle">Cipher text</div>
                <div className="mono">EPPWTXZK — IWK UJMM ZMKXK — QJH!</div>
                <div className="fine">
                  Hint: It’s a Caesar shift. Try shifting letters{" "}
                  <b>back by 8</b>.
                </div>
              </div>

              <HeartDivider />
              <div className="clueBox">
                <div className="clueTitle">
                  Enter the decoded destination keyword
                </div>
                <p className="fine">
                  (Correct keyword currently: <b>{caesarTarget}</b>)
                </p>
                <div className="row">
                  <Input
                    value={progress.caesarGuess}
                    onChange={(v) => setField("caesarGuess", v)}
                    placeholder="destination keyword"
                  />
                </div>
                <div className="status">
                  {progress.caesarGuess.trim().length === 0 ? (
                    <span className="muted">Decode it to continue.</span>
                  ) : caesarSolved ? (
                    <span className="ok">Yes! Off you go 📚</span>
                  ) : (
                    <span className="bad">
                      Not yet… shift letters back by 8.
                    </span>
                  )}
                </div>
              </div>

              <div className="clueBox">
                <div className="clueTitle">Where to go</div>
                <div className="clueText">
                  Head to <b>{place.place4.name}</b> {place.place4.note}
                </div>
              </div>

              <div className="actions between">
                <Button variant="secondary" onClick={back}>
                  Back
                </Button>
                <Button onClick={next} disabled={!caesarSolved}>
                  Next →
                </Button>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <Pill>Game</Pill>
              <h2>Earn the next clue</h2>
              <p className="lead">
                Complete the mini-game to unlock a code word. That code word
                will be written on the next hidden note.
              </p>

              <MemoryMatch
                onSolved={() => {
                  setField("memorySolved", true);
                }}
              />

              <HeartDivider />
              <div className="clueBox">
                <div className="clueTitle">Unlocked code word</div>
                {progress.memorySolved ? (
                  <div className="bigWord">ROSE</div>
                ) : (
                  <div className="muted">
                    Solve the game to reveal the word.
                  </div>
                )}
                <div className="fine">
                  Hide a note at <b>{place.place3.name}</b> that contains the
                  word “ROSE”.
                </div>
              </div>

              <div className="clueBox">
                <div className="clueTitle">Where to go next</div>
                <div className="clueText">
                  Go to <b>{place.place3.name}</b> {place.place3.note}
                </div>
              </div>

              <div className="actions between">
                <Button variant="secondary" onClick={back}>
                  Back
                </Button>
                <Button onClick={next} disabled={!progress.memorySolved}>
                  Next →
                </Button>
              </div>
            </>
          )}

          {step === 6 && (
            <>
              <Pill>Puzzle 3</Pill>
              <h2>Logic riddle (mind games)</h2>
              <p className="lead">
                Your next destination is described by a riddle. Solve it to
                unlock “Next”.
              </p>

              <div className="clueBox">
                <div className="clueTitle">Riddle</div>
                <p className="lead" style={{ marginTop: 10 }}>
                  I have a roof but no walls.
                  <br />
                  I’m outdoors but built for waiting.
                  <br />
                  On calm days, I’m a stage.
                  <br />
                  On windy days, I’m a whisper.
                  <br />
                  <b>What am I?</b>
                </p>
                <div className="fine">
                  Answer with a single keyword (example: “gazebo”).
                </div>
              </div>

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
                    <span className="muted">Type your guess.</span>
                  ) : logicSolved ? (
                    <span className="ok">Correct. Go claim your clue 🗝️</span>
                  ) : (
                    <span className="bad">Not quite. Read line 1 again…</span>
                  )}
                </div>
              </div>

              <div className="clueBox">
                <div className="clueTitle">Where to go</div>
                <div className="clueText">
                  Head to <b>{place.place3.name}</b> if you haven’t already,
                  then onward to <b>{place.place2.name}</b>.
                  <div className="fine" style={{ marginTop: 6 }}>
                    (Pro move: At the gazebo note, include an instruction like
                    “Order a drink with *our* initials.”)
                  </div>
                </div>
              </div>

              <div className="actions between">
                <Button variant="secondary" onClick={back}>
                  Back
                </Button>
                <Button onClick={next} disabled={!logicSolved}>
                  Next →
                </Button>
              </div>
            </>
          )}

          {step === 7 && (
            <>
              <Pill>Finale</Pill>
              <h2>Bring it home 💞</h2>
              <p className="lead">
                The final clue should be waiting at <b>{place.place2.name}</b>.
                It contains a final code word. Enter it below to unlock the
                ending.
              </p>

              <div className="clueBox">
                <div className="clueTitle">Final code word</div>
                <p className="fine">
                  Set the code word on your printed note. Right now it’s{" "}
                  <b>FOREVER</b>.
                </p>
                <div className="row">
                  <Input
                    value={progress.finalCode}
                    onChange={(v) => setField("finalCode", v)}
                    placeholder="final code"
                  />
                </div>
                <div className="status">
                  {progress.finalCode.trim().length === 0 ? (
                    <span className="muted">Enter the code to finish.</span>
                  ) : finalSolved ? (
                    <span className="ok">
                      Unlocked. Go to the finish line 🏁
                    </span>
                  ) : (
                    <span className="bad">Nope. Check the note again.</span>
                  )}
                </div>
              </div>

              {finalSolved && (
                <>
                  <HeartDivider />
                  <div className="clueBox">
                    <div className="clueTitle">Finish line</div>
                    <div className="clueText">
                      Go to <b>{place.place5.name}</b> {place.place5.note}
                    </div>
                    <div className="fine" style={{ marginTop: 10 }}>
                      Ending idea: candles + playlist + a small gift + a
                      handwritten note that says:
                      <br />
                      “You just won my favorite race: the one where I get you.”
                    </div>
                  </div>
                </>
              )}

              <div className="actions between">
                <Button variant="secondary" onClick={back}>
                  Back
                </Button>
                <Button
                  onClick={() => {
                    // Simple “restart” if you want to re-run
                    setStep(0);
                    setProgress({
                      starryInput: "",
                      starryCorrect: false,
                      finishedPuzzleYes: false,
                      finishedPuzzleNo: false,
                      photoGuess: "",
                      caesarGuess: "",
                      memorySolved: false,
                      logicGuess: "",
                      finalCode: "",
                    });
                  }}
                  variant="secondary"
                >
                  Restart
                </Button>
              </div>
            </>
          )}
        </Card>

        <div className="footer">
          <small>
            Tip: For real-world play, hide printed notes/QR codes at each
            location. Make each note include the next step’s “keyword” so he
            can’t skip ahead.
          </small>
        </div>
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

        .photoWrap {
          margin-top: 14px;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(122, 24, 52, 0.12);
          background: rgba(255, 255, 255, 0.7);
        }
        .photoWrap img {
          display: block;
          width: 100%;
          height: 320px;
          object-fit: cover;
        }
        .photoCaption {
          padding: 12px 14px;
        }
        .capTitle {
          font-weight: 950;
          color: #7a1834;
        }
        .capText {
          color: rgba(58, 11, 26, 0.78);
          margin-top: 6px;
          line-height: 1.4;
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

        .hint {
          margin: 0;
          color: rgba(58, 11, 26, 0.68);
        }

        .footer {
          width: 100%;
          max-width: 820px;
          margin-top: 14px;
          padding: 0 4px;
          color: rgba(58, 11, 26, 0.55);
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
