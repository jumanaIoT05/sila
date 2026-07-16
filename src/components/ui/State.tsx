// Shared loading / error / empty states.

// Shimmer skeleton loader — used app-wide while data loads.
export function Loading({ label }: { label?: string }) {
  return (
    <div className="py-2">
      <div className="skeleton mb-3 h-28 w-full" />
      <div className="skeleton mb-3 h-20 w-full" />
      <div className="skeleton h-20 w-full" />
      {label && <p className="mt-4 text-center text-sm text-navy/40">{label}</p>}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">⚠️ {message}</div>
  );
}

export function Empty({ label }: { label: string }) {
  return <div className="py-8 text-center text-sm text-gray-400">{label}</div>;
}
