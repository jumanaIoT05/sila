// Sila brand mark — an interlocking "connection" loop (صِلة = connection/link),
// recreated as an inline SVG until an official asset is supplied.

export function SilaMark({ size = 56, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={(size * 5) / 8}
      viewBox="0 0 160 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M55 50c0-16 13-29 29-29 20 0 33 16 46 24 8 5 8 15 0 20-13 8-26 24-46 24-16 0-29-13-29-29z"
        stroke="currentColor"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M105 50c0 16-13 29-29 29-20 0-33-16-46-24-8-5-8-15 0-20 13-8 26-24 46-24 16 0 29 13 29 29z"
        stroke="currentColor"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.55"
      />
    </svg>
  );
}

// Full lockup: mark + "Sila | صِلة" wordmark.
export function SilaLogo({ size = 56 }: { size?: number }) {
  return (
    <div className="flex flex-col items-center gap-2 text-navy">
      <SilaMark size={size} />
      <div className="flex items-center gap-2 text-2xl font-bold">
        <span>Sila</span>
        <span className="text-navy/30">|</span>
        <span>صِلة</span>
      </div>
    </div>
  );
}
