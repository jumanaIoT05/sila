"use client";

import { Modal } from "./Modal";
import { Button } from "./Button";

// Confirmation dialog for destructive/irreversible actions (delete, remove).
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,
  onConfirm,
  onCancel,
  loading = false,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="mb-5 text-sm text-navy/70">{message}</p>
      <div className="flex gap-3">
        <Button variant="secondary" fullWidth onClick={onCancel}>
          Cancel
        </Button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`w-full rounded-xl px-5 py-3 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-50 ${
            danger ? "bg-[#8a3b3b]" : "bg-primary"
          }`}
        >
          {loading ? "Please wait…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
