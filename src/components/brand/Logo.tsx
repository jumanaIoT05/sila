/* eslint-disable @next/next/no-img-element */
// Sila brand mark — the OFFICIAL logo asset, used directly (never recreated).
// Source file: /public/sila-logo.png. Replace that file to update the logo
// everywhere; no code changes are needed.

const BRAND_COLOR = "#14305c";

export function SilaMark({ size = 56, className = "" }: { size?: number; className?: string }) {
  // object-cover + center crops the tall source canvas to the logo band so the
  // official artwork is shown as-is (no editing of the asset itself).
  return (
    <img
      src="/sila-logo.png"
      alt="Sila"
      width={size}
      height={Math.round(size * 0.62)}
      style={{ objectFit: "cover", objectPosition: "center" }}
      className={className}
    />
  );
}

// Full lockup: official mark + "Sila | صِلة" wordmark in the brand color.
export function SilaLogo({ size = 56 }: { size?: number }) {
  return (
    <div className="flex flex-col items-center gap-2" style={{ color: BRAND_COLOR }}>
      <SilaMark size={size} />
      <div className="flex items-center gap-2 text-2xl font-bold">
        <span>Sila</span>
        <span style={{ opacity: 0.3 }}>|</span>
        <span>صِلة</span>
      </div>
    </div>
  );
}
