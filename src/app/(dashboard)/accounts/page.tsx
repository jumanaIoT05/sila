"use client";

import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Loading, ErrorState, Empty } from "@/components/ui/State";
import { sar } from "@/lib/format";
import type { AccountDTO } from "@/types";

// FR-2/FR-4: linked accounts — balance, last-4, bank; adjust balance; remove.
export default function AccountsPage() {
  const { data, loading, error, refetch } = useApi<AccountDTO[]>("/accounts");
  const toast = useToast();

  const [editing, setEditing] = useState<AccountDTO | null>(null);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<AccountDTO | null>(null);
  const [menuId, setMenuId] = useState<number | null>(null);

  const total = (data ?? []).reduce((s, a) => s + a.currentBalance, 0);

  async function save() {
    if (!editing) return;
    setBusy(true);
    try {
      await api.patch(`/accounts/${editing.accountId}/balance`, { currentBalance: Number(value) });
      setEditing(null);
      await refetch();
      toast.success("Balance Updated");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirmRemove) return;
    await api.delete(`/accounts/${confirmRemove.accountId}`);
    setConfirmRemove(null);
    await refetch();
    toast.success("Account Removed");
  }

  return (
    <div>
      <Header title="Accounts" subtitle="Linked banks" />

      {/* Total across linked accounts */}
      <div className="mb-5 rounded-2xl bg-gradient-navy p-5 text-white shadow-sm">
        <p className="text-sm opacity-80">Total across {data?.length ?? 0} account(s)</p>
        <p className="mt-1 text-3xl font-bold">{sar(total)}</p>
      </div>

      {loading && <Loading />}
      {error && <ErrorState message={error} />}
      {data && data.length === 0 && <Empty label="No linked accounts" />}

      <div className="flex flex-col gap-3">
        {data?.map((a) => (
          <div key={a.accountId} className="relative rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-xl">
                  🏦
                </span>
                <div>
                  <p className="font-semibold text-navy">{a.bankName}</p>
                  <p className="text-xs text-navy/50">
                    ••{a.lastFourDigits} · {a.isManuallyAdded ? "Manually added" : "From SMS"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <p className="text-lg font-bold text-navy">{sar(a.currentBalance)}</p>
                <button
                  onClick={() => setMenuId(menuId === a.accountId ? null : a.accountId)}
                  aria-label="Account options"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-navy/40 hover:bg-surface"
                >
                  ⋮
                </button>
              </div>
            </div>

            {menuId === a.accountId && (
              <div className="absolute right-2 top-14 z-10 flex flex-col rounded-lg border border-light-gray bg-white text-sm shadow-md">
                <button
                  onClick={() => {
                    setMenuId(null);
                    setEditing(a);
                    setValue(String(a.currentBalance));
                  }}
                  className="px-4 py-2 text-left hover:bg-surface"
                >
                  Adjust balance
                </button>
                <button
                  onClick={() => { setMenuId(null); setConfirmRemove(a); }}
                  className="px-4 py-2 text-left text-[#8a3b3b] hover:bg-surface"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-navy/50">
        Removing an account stops future tracking but keeps your history.
      </p>

      {/* Adjust balance modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`Adjust ${editing?.bankName ?? ""} ••${editing?.lastFourDigits ?? ""}`}
      >
        <Input
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="New balance"
        />
        <Button onClick={save} loading={busy} disabled={!value} className="mt-3" fullWidth>
          Save balance
        </Button>
      </Modal>

      <ConfirmDialog
        open={!!confirmRemove}
        title="Remove account?"
        message={`Remove ${confirmRemove?.bankName} ••${confirmRemove?.lastFourDigits}? This stops future SMS tracking but keeps all past transactions and analytics.`}
        confirmLabel="Remove"
        danger
        onConfirm={remove}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  );
}
