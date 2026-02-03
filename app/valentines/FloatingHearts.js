import { useEffect, useMemo, useState } from "react";

function FloatingHearts() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hearts = useMemo(() => {
    if (!mounted) return [];
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 10 + Math.random() * 22,
      duration: 8 + Math.random() * 10,
      delay: Math.random() * 4,
      opacity: 0.12 + Math.random() * 0.18,
    }));
  }, [mounted]);

  if (!mounted) return null;

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

export default FloatingHearts;
