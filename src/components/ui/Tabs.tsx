"use client";

// Segmented filter control (matches the design reference: All / Days / Monthly…).
export function Tabs({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
            value === opt ? "bg-navy text-white" : "bg-lavender text-navy"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
