export function IkigaiMark({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden
      className={className}
    >
      <g style={{ isolation: "isolate" }}>
        <circle cx="50" cy="34" r="26" fill="#FDEFB4" style={{ mixBlendMode: "multiply" }} />
        <circle cx="66" cy="50" r="26" fill="#FFD3EA" style={{ mixBlendMode: "multiply" }} />
        <circle cx="50" cy="66" r="26" fill="#CDEBFF" style={{ mixBlendMode: "multiply" }} />
        <circle cx="34" cy="50" r="26" fill="#CDF3D9" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
