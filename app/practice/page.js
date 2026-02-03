"use client";

import { useEffect, useState } from "react";

// A counter starts automatically when the page loads
// It increments once per second
// There are two buttons: Stop (pauses it) and Reset (sets it back to 0 and keeps running)

const Counter = () => {
  const [count, setCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  function pause() {
    setIsPlaying(false);
  }

  function reset() {
    setCount(0);
    setIsPlaying(true);
  }

  useEffect(() => {
    if (!isPlaying) return;

    const id = setInterval(() => {
      setCount((t) => t + 1);
    }, 1000);

    return () => clearInterval(id);
  }, [isPlaying]);

  return (
    <div>
      {count}
      <button onClick={pause}>Pause</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};

export default Counter;
