"use client";
import { useEffect, useMemo, useState, useRef } from "react";

function CountdownTimer({ initialTime = 20000 }) {
  const [remaining, setRemaining] = useState(initialTime); // ms - sanitize
  const [isPaused, setIsPaused] = useState(true);
  const [isDone, setIsDone] = useState(false);

  const intervalRef = useRef(null);
  const targetRef = useRef(null);

  useEffect(() => {
    setIsPaused(true);
    cancelCountdown();
    setRemaining(initialTime);
    targetRef.current = null;
  }, [initialTime]);

  function formatMMSS(ms) {
    const s = Math.floor(ms / 1000);
    const mm = String(Math.max(0, Math.floor(s / 60))).padStart(2, "0");
    const ss = String(Math.max(0, Math.floor(s % 60))).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  function countdown() {
    intervalRef.current = setInterval(() => {
      if (!targetRef.current) return;
      const msLeft = targetRef.current - Date.now();
      setRemaining(msLeft);
      if (msLeft <= 0) {
        clearInterval(intervalRef.current);
        setIsPaused(true);
        setIsDone(true);
      }
    }, 200);
  }

  function cancelCountdown() {
    if (!intervalRef.current) return;
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  function handlePlay() {
    if (!isPaused || remaining <= 0) return;
    setIsPaused(false);
    targetRef.current = Date.now() + remaining;
    countdown();
  }

  function handlePause() {
    if (isPaused) return;
    setIsPaused(true);
    targetRef.current = null;
    cancelCountdown();
  }

  function handleReset() {
    setIsPaused(true);
    setIsDone(false);
    setRemaining(initialTime);
    targetRef.current = null;
    cancelCountdown();
  }

  useEffect(() => cancelCountdown, []);

  return (
    <div>
      {isDone && <div>Times up!</div>}
      <h1>Time remaining: {formatMMSS(remaining)}</h1>
      <div>
        <button onClick={isPaused ? handlePlay : handlePause}>
          {isPaused ? "Play" : "Pause"}
        </button>
        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
}

export default CountdownTimer;
