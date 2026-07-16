"use client";

import { createContext, useCallback, useContext, useState } from "react";

// Lightweight toast system. Toasts auto-dismiss; some carry an inline action
// (e.g. "Undo") and stay a little longer.

type ToastKind = "success" | "info" | "error";
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ActionOptions {
  actionLabel: string;
  onAction: () => void;
  durationMs?: number;
}

interface ToastApi {
  toast: (message: string, kind?: ToastKind) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  // Toast with an inline action button (e.g. Undo). Stays ~5s by default.
  action: (message: string, opts: ActionOptions) => void;
}

const Ctx = createContext<ToastApi | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (t: Omit<Toast, "id">, durationMs: number) => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, ...t }]);
      setTimeout(() => remove(id), durationMs);
      return id;
    },
    [remove]
  );

  const api: ToastApi = {
    toast: (message, kind = "success") => push({ message, kind }, 2800),
    success: (message) => push({ message, kind: "success" }, 2800),
    error: (message) => push({ message, kind: "error" }, 2800),
    action: (message, opts) =>
      push(
        { message, kind: "success", actionLabel: opts.actionLabel, onAction: opts.onAction },
        opts.durationMs ?? 5000
      ),
  };

  return (
    <Ctx.Provider value={api}>
      {children}
      {/* Toast container: centered near the top, above the phone frame */}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 mx-auto flex max-w-md flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`toast-in pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-lg ${
              t.kind === "error" ? "bg-[#8a3b3b]" : t.kind === "info" ? "bg-trust" : "bg-primary"
            }`}
          >
            <span>{t.kind === "error" ? "⚠️" : "✅"}</span>
            <span>{t.message}</span>
            {t.actionLabel && t.onAction && (
              <button
                onClick={() => {
                  t.onAction?.();
                  remove(t.id);
                }}
                className="ml-1 rounded-md bg-white/20 px-2 py-0.5 text-xs font-bold hover:bg-white/30"
              >
                {t.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
