"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { getToken } from "@/lib/auth-storage";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";
import { Loading, ErrorState } from "@/components/ui/State";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";

interface Detected {
  bankId: number;
  bankName: string;
  lastFourDigits: string;
}
interface AccountRow extends Detected {
  currentBalance: string;
  isManuallyAdded: boolean;
}
interface Lookups {
  banks: Array<{ bankId: number; bankName: string }>;
}

// FR-2.3-2.5: show SMS-detected accounts, allow manual add, enter balance once.
export default function DetectPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AccountRow[]>([]);
  const [banks, setBanks] = useState<Lookups["banks"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    const bankIds: number[] = JSON.parse(
      sessionStorage.getItem("sila_onboarding_banks") ?? "[]"
    );
    (async () => {
      try {
        const [detected, lookups] = await Promise.all([
          api.post<Detected[]>("/onboarding/detect", { bankIds }),
          api.get<Lookups>("/lookups"),
        ]);
        setBanks(lookups.banks);
        setRows(
          detected.map((d) => ({ ...d, currentBalance: "", isManuallyAdded: false }))
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Detection failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  function setBalance(i: number, val: string) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, currentBalance: val } : row)));
  }

  function addManual() {
    const first = banks[0];
    if (!first) return;
    setRows((r) => [
      ...r,
      {
        bankId: first.bankId,
        bankName: first.bankName,
        lastFourDigits: "",
        currentBalance: "",
        isManuallyAdded: true,
      },
    ]);
  }

  function updateManual(i: number, patch: Partial<AccountRow>) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }

  async function confirm() {
    setSaving(true);
    setError(null);
    try {
      await api.post("/onboarding/confirm", {
        accounts: rows.map((r) => ({
          bankId: r.bankId,
          lastFourDigits: r.lastFourDigits,
          currentBalance: Number(r.currentBalance || 0),
          isManuallyAdded: r.isManuallyAdded,
        })),
      });
      sessionStorage.removeItem("sila_onboarding_banks");
      router.replace("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save accounts");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading label="Analyzing your SMS messages…" />;

  return (
    <div className="min-h-screen p-6">
      <OnboardingHeader
        step={2}
        total={2}
        title="Confirm your accounts"
        subtitle="We detected these from your bank SMS. Enter each current balance once."
      />

      {error && <div className="mb-4"><ErrorState message={error} /></div>}

      <div className="mt-6 flex flex-col gap-4">
        {rows.map((row, i) => (
          <div key={i} className="rounded-2xl border border-light-gray bg-white p-4">
            {row.isManuallyAdded ? (
              <div className="flex flex-col gap-3">
                <Field label="Bank">
                  <Select
                    value={row.bankId}
                    onChange={(e) => updateManual(i, { bankId: Number(e.target.value) })}
                  >
                    {banks.map((b) => (
                      <option key={b.bankId} value={b.bankId}>
                        {b.bankName}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Last 4 digits">
                  <Input
                    value={row.lastFourDigits}
                    maxLength={4}
                    onChange={(e) => updateManual(i, { lastFourDigits: e.target.value })}
                    placeholder="1234"
                  />
                </Field>
              </div>
            ) : (
              <p className="font-semibold text-navy">
                {row.bankName} ••{row.lastFourDigits}
              </p>
            )}
            <div className="mt-3">
              <Field label="Current balance (SAR)">
                <Input
                  inputMode="decimal"
                  value={row.currentBalance}
                  onChange={(e) => setBalance(i, e.target.value)}
                  placeholder="0.00"
                />
              </Field>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addManual} className="mt-4 text-sm font-medium text-dark-purple">
        + Add an account manually
      </button>

      <div className="mt-8">
        <Button fullWidth loading={saving} disabled={rows.length === 0} onClick={confirm}>
          Finish setup
        </Button>
      </div>
    </div>
  );
}
