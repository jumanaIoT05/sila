"use client";

import { useState } from "react";
import { SilaMark } from "@/components/brand/Logo";

// First-time walkthrough (3 screens) shown once after onboarding, the first
// time the user reaches the Dashboard. The "seen" flag is persisted by the
// caller so it never appears again unless the app is reset/reinstalled.
const STEPS = [
  { emoji: "👋", title: "Welcome to Sila", body: "We'll help you understand your spending across all your bank accounts." },
  { emoji: "✨", title: "AI Insights", body: "Receive personalized recommendations based on your financial behavior." },
  { emoji: "🎉", title: "You're Ready!", body: "Let's start managing your finances." },
];

export function Walkthrough({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const last = step === STEPS.length - 1;
  const s = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary p-6 text-white">
      <div className="sheet-scrim flex w-full max-w-sm flex-col items-center text-center">
        <SilaMark size={72} className="mb-8 text-white/90" />

        <div key={step} className="toast-in flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl">
            {s.emoji}
          </div>
          <h2 className="text-2xl font-bold">{s.title}</h2>
          <p className="mt-2 max-w-xs text-sm text-white/70">{s.body}</p>
        </div>

        {/* dots */}
        <div className="my-8 flex gap-2">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all ${i === step ? "w-6 bg-gold" : "w-2 bg-white/30"}`}
            />
          ))}
        </div>

        <button
          onClick={() => (last ? onDone() : setStep((x) => x + 1))}
          className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-primary transition active:scale-95"
        >
          {last ? "Get started" : "Next"}
        </button>
        {!last && (
          <button onClick={onDone} className="mt-3 text-sm text-white/60">
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
