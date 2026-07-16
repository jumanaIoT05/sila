import type { ReactNode } from "react";

type Tone = "navy" | "purple" | "pink";

const tones: Record<Tone, string> = {
  navy: "bg-gradient-navy",
  purple: "bg-gradient-purple",
  pink: "bg-gradient-pink",
};

// Gradient hero/stat card from the design reference: big value + caption.
export function StatCard({
  tone = "navy",
  label,
  value,
  caption,
  size = "md",
}: {
  tone?: Tone;
  label: string;
  value: ReactNode;
  caption?: string;
  size?: "lg" | "md";
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-sm ${tones[tone]} ${
        size === "lg" ? "min-h-[170px]" : "min-h-[130px]"
      }`}
    >
      {/* decorative glow */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <p className="text-sm font-medium opacity-90">{label}</p>
      <p className={`mt-6 font-bold ${size === "lg" ? "text-4xl" : "text-2xl"}`}>{value}</p>
      {caption && <p className="mt-1 text-xs opacity-80">{caption}</p>}
    </div>
  );
}

// Small pill statistic (the horizontal chip row under the hero card).
export function StatChip({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-[120px] rounded-xl bg-lavender px-4 py-3">
      <p className="text-base font-bold text-dark-purple">{value}</p>
      <p className="text-xs text-navy/70">{label}</p>
    </div>
  );
}
