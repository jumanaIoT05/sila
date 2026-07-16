"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { getToken } from "@/lib/auth-storage";
import { Button } from "@/components/ui/Button";
import { Loading, ErrorState } from "@/components/ui/State";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";

interface Lookups {
  banks: Array<{ bankId: number; bankName: string }>;
}

// FR-2.1: select the banks you use.
export default function BanksPage() {
  const router = useRouter();
  const { data, loading, error } = useApi<Lookups>("/lookups");
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    if (!getToken()) router.replace("/login");
  }, [router]);

  function toggle(id: number) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function next() {
    sessionStorage.setItem("sila_onboarding_banks", JSON.stringify(selected));
    router.push("/detect");
  }

  return (
    <div className="min-h-screen p-6">
      <OnboardingHeader
        step={1}
        total={2}
        title="Select your banks"
        subtitle="We'll analyze your bank SMS to detect accounts. Pick the banks you use."
      />

      <div className="flex flex-col gap-3">
        {loading && <Loading />}
        {error && <ErrorState message={error} />}
        {data?.banks.map((b) => {
          const active = selected.includes(b.bankId);
          return (
            <button
              key={b.bankId}
              onClick={() => toggle(b.bankId)}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                active ? "border-navy bg-lavender" : "border-light-gray bg-white"
              }`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-navy text-sm font-bold text-white">
                {b.bankName.slice(0, 2).toUpperCase()}
              </span>
              <span className="flex-1 font-medium text-navy">{b.bankName}</span>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  active ? "bg-navy text-white" : "border border-light-gray text-transparent"
                }`}
              >
                ✓
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-navy/50">
        🔒 Only the last 4 digits of each account are ever stored.
      </p>

      <div className="mt-6">
        <Button fullWidth disabled={selected.length === 0} onClick={next}>
          Grant SMS access &amp; detect accounts
        </Button>
      </div>
    </div>
  );
}
