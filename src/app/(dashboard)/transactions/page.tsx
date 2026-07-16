"use client";

import { useMemo, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { Header } from "@/components/layout/Header";
import { SectionTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Input";
import { WalletCard } from "@/components/dashboard/WalletCard";
import { TransactionRow } from "@/components/dashboard/TransactionRow";
import { Loading, ErrorState, Empty } from "@/components/ui/State";
import { CATEGORIZABLE_CATEGORIES } from "@/config/constants";
import type { AccountDTO, TransactionDTO } from "@/types";

interface Lookups {
  categories: Array<{ spendingCategoryId: number; categoryName: string }>;
}

// FR-3/FR-5: Activity — wallet, search + advanced filters, transaction history
// with inline category editing. Filters combine and update the list instantly.
export default function TransactionsPage() {
  const txns = useApi<TransactionDTO[]>("/transactions?limit=500");
  const { data: accounts } = useApi<AccountDTO[]>("/accounts");
  const { data: lookups } = useApi<Lookups>("/lookups");
  const toast = useToast();

  // Filter state
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [bank, setBank] = useState("all");
  const [account, setAccount] = useState("all");
  const [category, setCategory] = useState("all");
  const [cashOnly, setCashOnly] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  const list = txns.data ?? [];

  // Filter option sources
  const banks = useMemo(() => [...new Set(list.map((t) => t.bankName))].sort(), [list]);
  const last4s = useMemo(() => [...new Set(list.map((t) => t.lastFourDigits))].sort(), [list]);
  const categories = useMemo(() => [...new Set(list.map((t) => t.category))].sort(), [list]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return list.filter((t) => {
      if (q) {
        const hay = `${t.category} ${t.transactionType} ${t.bankName} ${t.lastFourDigits} ${t.amount}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (bank !== "all" && t.bankName !== bank) return false;
      if (account !== "all" && t.lastFourDigits !== account) return false;
      if (category !== "all" && t.category !== category) return false;
      if (cashOnly && t.transactionType !== "Cash Withdrawal") return false;
      const d = t.transactionDate.slice(0, 10);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [list, search, bank, account, category, cashOnly, from, to]);

  const pickable = (lookups?.categories ?? []).filter((c) =>
    (CATEGORIZABLE_CATEGORIES as readonly string[]).includes(c.categoryName)
  );

  async function categorize(transactionId: number, spendingCategoryId: number) {
    await api.patch(`/transactions/${transactionId}/category`, { spendingCategoryId });
    setEditingId(null);
    await txns.refetch();
    toast.success("Category Saved");
  }

  function clearFilters() {
    setBank("all");
    setAccount("all");
    setCategory("all");
    setCashOnly(false);
    setFrom("");
    setTo("");
    setSearch("");
  }

  const activeFilters =
    (bank !== "all" ? 1 : 0) +
    (account !== "all" ? 1 : 0) +
    (category !== "all" ? 1 : 0) +
    (cashOnly ? 1 : 0) +
    (from ? 1 : 0) +
    (to ? 1 : 0);

  const total = (accounts ?? []).reduce((s, a) => s + a.currentBalance, 0);

  return (
    <div>
      <Header title="Activity" subtitle="Transactions" />

      {accounts && <WalletCard totalBalance={total} accounts={accounts} />}

      {/* Search + filter toggle */}
      <div className="mb-3 mt-5 flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-light-gray bg-white px-3">
          <span className="text-navy/40">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions…"
            className="w-full bg-transparent py-2.5 text-sm outline-none"
          />
        </div>
        <button
          onClick={() => setShowFilters((s) => !s)}
          aria-label="Advanced filters"
          className={`relative flex h-11 w-11 items-center justify-center rounded-xl border transition active:scale-95 ${
            showFilters || activeFilters > 0
              ? "border-primary bg-primary text-white"
              : "border-light-gray bg-white text-navy"
          }`}
        >
          ⚙️
          {activeFilters > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-primary">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="expand-in mb-4 flex flex-col gap-3 rounded-2xl border border-light-gray bg-white p-4">
          <div className="grid grid-cols-2 gap-3">
            <Select value={bank} onChange={(e) => setBank(e.target.value)}>
              <option value="all">All banks</option>
              {banks.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </Select>
            <Select value={account} onChange={(e) => setAccount(e.target.value)}>
              <option value="all">All accounts</option>
              {last4s.map((l) => (
                <option key={l} value={l}>••{l}</option>
              ))}
            </Select>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
            <label className="flex items-center gap-2 rounded-xl border border-light-gray px-3 text-sm text-navy">
              <input
                type="checkbox"
                checked={cashOnly}
                onChange={(e) => setCashOnly(e.target.checked)}
              />
              Cash only
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-navy/60">
              From
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="mt-1 w-full rounded-xl border border-light-gray bg-white px-3 py-2 text-sm outline-none"
              />
            </label>
            <label className="text-xs text-navy/60">
              To
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="mt-1 w-full rounded-xl border border-light-gray bg-white px-3 py-2 text-sm outline-none"
              />
            </label>
          </div>
          {activeFilters > 0 && (
            <button onClick={clearFilters} className="self-start text-xs font-medium text-primary">
              Clear all filters
            </button>
          )}
        </div>
      )}

      <SectionTitle>Transaction History</SectionTitle>

      {txns.loading && <Loading />}
      {txns.error && <ErrorState message={txns.error} />}
      {txns.data && filtered.length === 0 && (
        <Empty label={list.length === 0 ? "No transactions yet" : "No transactions match your filters"} />
      )}

      <ul className="flex flex-col gap-2">
        {filtered.map((t) => (
          <li key={t.transactionId}>
            <TransactionRow t={t}>
              <button
                onClick={() => setEditingId(editingId === t.transactionId ? null : t.transactionId)}
                aria-label="Edit category"
                className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-navy/40 transition hover:bg-surface active:scale-95"
              >
                ✏️
              </button>
            </TransactionRow>

            {editingId === t.transactionId && (
              <div className="expand-in mt-1 rounded-xl bg-surface p-3">
                <p className="mb-2 text-xs font-medium text-navy/70">Change category</p>
                <div className="flex flex-wrap gap-2">
                  {pickable.map((c) => (
                    <button
                      key={c.spendingCategoryId}
                      onClick={() => categorize(t.transactionId, c.spendingCategoryId)}
                      className={`rounded-full px-3 py-1 text-xs font-medium shadow-sm transition active:scale-95 ${
                        c.categoryName === t.category
                          ? "bg-primary text-white"
                          : "bg-white text-navy hover:bg-primary hover:text-white"
                      }`}
                    >
                      {c.categoryName}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
