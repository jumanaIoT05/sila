"use client";

import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { Header } from "@/components/layout/Header";
import { SectionTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Loading, ErrorState, Empty } from "@/components/ui/State";
import { categoryIcon, categoryColor } from "@/lib/categoryColors";
import { CATEGORIZABLE_CATEGORIES } from "@/config/constants";
import { sar } from "@/lib/format";
import type { BudgetDTO, GoalDTO, GoalsOverviewDTO } from "@/types";

// FR-10 + FR-12: Smart Budgets and Financial Goals, switched via a toggle.
export default function BudgetPage() {
  const [tab, setTab] = useState<"budgets" | "goals">("budgets");
  return (
    <div>
      <Header title="Budget" subtitle="Budgets & goals" />

      <div className="mb-5 flex rounded-full bg-surface p-1">
        {(["budgets", "goals"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full py-2 text-sm font-semibold capitalize transition ${
              tab === t ? "bg-primary text-white shadow-sm" : "text-navy/60"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "budgets" ? <BudgetsTab /> : <GoalsTab />}
    </div>
  );
}

// ==================== BUDGETS ====================

interface Lookups {
  categories: Array<{ spendingCategoryId: number; categoryName: string }>;
}

function BudgetsTab() {
  const { data, loading, error, refetch } = useApi<BudgetDTO[]>("/budgets");
  const { data: lookups } = useApi<Lookups>("/lookups");
  const toast = useToast();

  const [form, setForm] = useState<{ open: boolean; editing: BudgetDTO | null }>({
    open: false,
    editing: null,
  });
  const [catId, setCatId] = useState<number | "">("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [menuId, setMenuId] = useState<number | null>(null);
  const [confirmDel, setConfirmDel] = useState<BudgetDTO | null>(null);
  const [suggesting, setSuggesting] = useState(false);

  const pickable = (lookups?.categories ?? []).filter((c) =>
    (CATEGORIZABLE_CATEGORIES as readonly string[]).includes(c.categoryName)
  );

  function openCreate() {
    setForm({ open: true, editing: null });
    setCatId("");
    setAmount("");
  }
  function openEdit(b: BudgetDTO) {
    setMenuId(null);
    setForm({ open: true, editing: b });
    setAmount(String(b.recommendedAmount));
  }

  async function save() {
    setSaving(true);
    try {
      if (form.editing) {
        await api.patch(`/budgets/${form.editing.budgetId}`, { recommendedAmount: Number(amount) });
        toast.success("Budget Updated");
      } else {
        await api.post("/budgets", {
          spendingCategoryId: Number(catId),
          recommendedAmount: Number(amount),
        });
        toast.success("Budget Created");
      }
      setForm({ open: false, editing: null });
      await refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirmDel) return;
    await api.delete(`/budgets/${confirmDel.budgetId}`);
    setConfirmDel(null);
    await refetch();
    toast.success("Budget Deleted");
  }

  async function suggest() {
    setSuggesting(true);
    try {
      await api.post("/budgets/suggest");
      await refetch();
      toast.success("Budgets Updated");
    } finally {
      setSuggesting(false);
    }
  }

  return (
    <div>
      {loading && <Loading />}
      {error && <ErrorState message={error} />}
      {data && data.length === 0 && <Empty label="No budgets yet — add one or auto-suggest" />}

      {/* 2-up budget cards */}
      <div className="grid grid-cols-2 gap-3">
        {data?.map((b) => {
          const pct = b.recommendedAmount > 0
            ? Math.min(100, (b.actualSpending / b.recommendedAmount) * 100)
            : 0;
          return (
            <div key={b.budgetId} className="relative rounded-2xl bg-white p-4 shadow-sm">
              <button
                onClick={() => setMenuId(menuId === b.budgetId ? null : b.budgetId)}
                aria-label="Budget options"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg text-navy/40 hover:bg-surface"
              >
                ⋮
              </button>
              {menuId === b.budgetId && (
                <div className="absolute right-2 top-9 z-10 flex flex-col rounded-lg border border-light-gray bg-white text-sm shadow-md">
                  <button onClick={() => openEdit(b)} className="px-4 py-2 text-left hover:bg-surface">
                    Edit
                  </button>
                  <button
                    onClick={() => { setMenuId(null); setConfirmDel(b); }}
                    className="px-4 py-2 text-left text-[#8a3b3b] hover:bg-surface"
                  >
                    Delete
                  </button>
                </div>
              )}

              <div
                className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl text-xl"
                style={{ backgroundColor: `${categoryColor(b.category)}22` }}
              >
                {categoryIcon(b.category)}
              </div>
              <p className="font-semibold text-navy">{b.category}</p>
              <p className="text-xs text-navy/50">
                {sar(b.actualSpending)} / {sar(b.recommendedAmount)}
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-light-gray">
                <div
                  className={`h-full rounded-full ${b.overBudget ? "bg-[#8a3b3b]" : "bg-primary"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className={`mt-1 text-[11px] ${b.overBudget ? "text-[#8a3b3b]" : "text-navy/50"}`}>
                {b.overBudget ? `Over by ${sar(Math.abs(b.remaining))}` : `${sar(b.remaining)} left`}
              </p>
            </div>
          );
        })}
      </div>

      <button
        onClick={openCreate}
        className="mt-4 w-full rounded-2xl border border-dashed border-primary/40 bg-white py-3 text-sm font-semibold text-primary transition active:scale-[0.99]"
      >
        Add new Budget ＋
      </button>

      {/* AI help card */}
      <div className="mt-5 rounded-2xl border border-light-gray bg-white p-4">
        <p className="text-sm font-semibold text-navy">Need help creating a budget?</p>
        <p className="mt-1 text-xs text-navy/60">
          Based on your previous activity, AI will suggest a suitable budget for you.
        </p>
        <Button onClick={suggest} loading={suggesting} variant="secondary" className="mt-3">
          ✨ Regenerate
        </Button>
      </div>

      {/* Create / edit modal */}
      <Modal
        open={form.open}
        onClose={() => setForm({ open: false, editing: null })}
        title={form.editing ? `Edit ${form.editing.category} budget` : "New budget"}
      >
        <div className="flex flex-col gap-3">
          {!form.editing && (
            <Field label="Category">
              <Select value={catId} onChange={(e) => setCatId(Number(e.target.value))}>
                <option value="">Select a category…</option>
                {pickable.map((c) => (
                  <option key={c.spendingCategoryId} value={c.spendingCategoryId}>
                    {c.categoryName}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <Field label="Monthly limit (SAR)">
            <Input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </Field>
          <Button
            onClick={save}
            loading={saving}
            disabled={!amount || (!form.editing && !catId)}
          >
            {form.editing ? "Save changes" : "Create budget"}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDel}
        title="Delete budget?"
        message={`Remove the ${confirmDel?.category} budget? This won't affect your transactions.`}
        confirmLabel="Delete"
        danger
        onConfirm={remove}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  );
}

// ==================== GOALS ====================

type Mode = "saving_driven" | "deadline_driven";

function GoalsTab() {
  const { data, loading, error, refetch } = useApi<GoalsOverviewDTO>("/goals");
  const toast = useToast();

  const [form, setForm] = useState<{ open: boolean; editing: GoalDTO | null }>({
    open: false,
    editing: null,
  });
  const [goalType, setGoalType] = useState("");
  const [target, setTarget] = useState("");
  const [mode, setMode] = useState<Mode>("saving_driven");
  const [monthly, setMonthly] = useState("");
  const [months, setMonths] = useState("");
  const [saving, setSaving] = useState(false);

  const [menuId, setMenuId] = useState<number | null>(null);
  const [confirmDel, setConfirmDel] = useState<GoalDTO | null>(null);
  const [allocateFor, setAllocateFor] = useState<GoalDTO | null>(null);
  const [allocAmount, setAllocAmount] = useState("");

  function openCreate() {
    setForm({ open: true, editing: null });
    setGoalType(""); setTarget(""); setMode("saving_driven"); setMonthly(""); setMonths("");
  }
  function openEdit(g: GoalDTO) {
    setMenuId(null);
    setForm({ open: true, editing: g });
    setGoalType(g.goalType);
    setTarget(String(g.targetAmount));
    setMode(g.calculationMode as Mode);
    setMonthly(String(g.monthlySavingAmount));
    setMonths(String(g.estimatedMonths));
  }

  async function save() {
    setSaving(true);
    try {
      const body = {
        goalType,
        targetAmount: Number(target),
        calculationMode: mode,
        ...(mode === "saving_driven"
          ? { monthlySavingAmount: Number(monthly) }
          : { deadlineMonths: Number(months) }),
      };
      if (form.editing) {
        await api.patch(`/goals/${form.editing.goalId}`, body);
        toast.success("Goal Updated");
      } else {
        await api.post("/goals", body);
        toast.success("Goal Created");
      }
      setForm({ open: false, editing: null });
      await refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirmDel) return;
    await api.delete(`/goals/${confirmDel.goalId}`);
    setConfirmDel(null);
    await refetch();
    toast.success("Goal Deleted");
  }

  async function allocate() {
    if (!allocateFor) return;
    try {
      await api.post(`/goals/${allocateFor.goalId}/allocate`, { amount: Number(allocAmount) });
      setAllocateFor(null);
      setAllocAmount("");
      await refetch();
      toast.success("Allocated to Goal");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <SectionTitle>Your Goals</SectionTitle>
        <Button onClick={openCreate} className="!px-4 !py-2 text-xs">
          ＋ New Goal
        </Button>
      </div>

      {/* Over-allocation smart warning */}
      {data?.overAllocated && (
        <div className="mb-4 rounded-2xl border border-gold/50 bg-gold/10 p-3 text-sm text-navy/80">
          ⚠️ Your recent spending may affect the amount you allocated to your goals.
        </div>
      )}

      {loading && <Loading />}
      {error && <ErrorState message={error} />}
      {data && data.goals.length === 0 && <Empty label="No goals yet — create your first goal" />}

      <div className="flex flex-col gap-3">
        {data?.goals.map((g) => (
          <div key={g.goalId} className="relative rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="min-w-0 pr-3">
                <p className="font-semibold text-navy">{g.goalType}</p>
                <p className="text-xs text-navy/50">
                  Saved {sar(g.savedAmount)} of {sar(g.targetAmount)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold text-primary">{Math.round(g.progressPercent)}%</span>
                <button
                  onClick={() => setMenuId(menuId === g.goalId ? null : g.goalId)}
                  aria-label="Goal options"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-navy/40 hover:bg-surface"
                >
                  ⋮
                </button>
              </div>
            </div>

            {menuId === g.goalId && (
              <div className="absolute right-2 top-11 z-10 flex flex-col rounded-lg border border-light-gray bg-white text-sm shadow-md">
                <button onClick={() => openEdit(g)} className="px-4 py-2 text-left hover:bg-surface">
                  Edit
                </button>
                <button
                  onClick={() => { setMenuId(null); setConfirmDel(g); }}
                  className="px-4 py-2 text-left text-[#8a3b3b] hover:bg-surface"
                >
                  Delete
                </button>
              </div>
            )}

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-light-gray">
              <div
                className="h-full rounded-full bg-gradient-navy"
                style={{ width: `${g.progressPercent}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-medium text-navy/60">
                  {g.calculationMode.replace("_", "-")}
                </span>
                <span className="text-xs text-navy/50">Saving {sar(g.monthlySavingAmount)}/mo</span>
              </div>
              <button
                onClick={() => { setAllocateFor(g); setAllocAmount(""); }}
                className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white transition active:scale-95"
              >
                Allocate
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / edit goal modal */}
      <Modal
        open={form.open}
        onClose={() => setForm({ open: false, editing: null })}
        title={form.editing ? "Edit goal" : "New goal"}
      >
        <div className="flex flex-col gap-3">
          <Field label="Goal (free text)">
            <Input value={goalType} onChange={(e) => setGoalType(e.target.value)} placeholder="e.g. Trip to Japan" />
          </Field>
          <Field label="Target amount (SAR)">
            <Input inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} />
          </Field>
          <Field label="Calculation mode">
            <Select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
              <option value="saving_driven">Saving-driven (I&apos;ll save X / month)</option>
              <option value="deadline_driven">Deadline-driven (I want it in N months)</option>
            </Select>
          </Field>
          {mode === "saving_driven" ? (
            <Field label="Monthly saving (SAR)">
              <Input inputMode="decimal" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
            </Field>
          ) : (
            <Field label="Deadline (months)">
              <Input inputMode="numeric" value={months} onChange={(e) => setMonths(e.target.value)} />
            </Field>
          )}
          <Button
            onClick={save}
            loading={saving}
            disabled={!goalType || !target || (mode === "saving_driven" ? !monthly : !months)}
          >
            {form.editing ? "Save changes" : "Create goal"}
          </Button>
        </div>
      </Modal>

      {/* Allocate modal */}
      <Modal open={!!allocateFor} onClose={() => setAllocateFor(null)} title={`Allocate to ${allocateFor?.goalType ?? ""}`}>
        <p className="mb-3 text-xs text-navy/60">
          Allocating is a budgeting choice — it doesn&apos;t move or lock any real money.
        </p>
        <Field label="Amount (SAR, use a minus to de-allocate)">
          <Input inputMode="decimal" value={allocAmount} onChange={(e) => setAllocAmount(e.target.value)} placeholder="0.00" />
        </Field>
        <Button onClick={allocate} disabled={!allocAmount} className="mt-3" fullWidth>
          Allocate
        </Button>
      </Modal>

      <ConfirmDialog
        open={!!confirmDel}
        title="Delete goal?"
        message={`Remove "${confirmDel?.goalType}"? This can't be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={remove}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  );
}
