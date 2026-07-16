"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useApi } from "@/hooks/useApi";
import { usePreferences } from "@/components/prefs/PreferencesProvider";
import { clearSession } from "@/lib/auth-storage";
import { Header } from "@/components/layout/Header";
import { SectionTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { SilaLogo } from "@/components/brand/Logo";
import { Loading, ErrorState } from "@/components/ui/State";
import type { ProfileDTO } from "@/types";

// Consolidated Settings screen: Account · Appearance · Accessibility ·
// Language · Demo Mode · Support · About · Logout.
export default function ProfilePage() {
  const router = useRouter();
  const { data, loading, error } = useApi<ProfileDTO>("/profile");
  const { theme, setTheme } = usePreferences();
  const [about, setAbout] = useState(false);

  const displayName = data?.fullName || "Sila User";
  const initials = displayName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  function logout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <div>
      <Header title="Profile" subtitle="Settings & preferences" />

      {loading && <Loading />}
      {error && <ErrorState message={error} />}

      {/* Identity */}
      <div className="mb-5 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-navy text-lg font-bold text-white">
          {initials}
        </div>
        <div>
          <p className="text-lg font-bold text-navy">{displayName}</p>
          <p className="text-sm text-navy/60">{data?.phoneNumber}</p>
        </div>
      </div>

      {/* Account */}
      <Section title="Account">
        <Row label="Full name" value={displayName} />
        <Divider />
        <Row label="Phone number" value={data?.phoneNumber ?? "—"} />
      </Section>

      {/* Appearance (functional) */}
      <Section title="Appearance">
        <div className="flex items-center justify-between p-4">
          <span className="font-medium text-navy">🎨 Theme</span>
          <Segmented
            options={[
              { key: "light", label: "Light" },
              { key: "dark", label: "Dark" },
            ]}
            value={theme}
            onChange={(v) => setTheme(v as "light" | "dark")}
          />
        </div>
      </Section>

      {/* Accessibility (placeholder) */}
      <Section title="Accessibility">
        <PlaceholderRow icon="🔠" label="Text size" />
        <Divider />
        <PlaceholderRow icon="👁️" label="Screen reader" />
      </Section>

      {/* Language (placeholder) */}
      <Section title="Language">
        <PlaceholderRow icon="🌐" label="English / العربية" />
      </Section>

      {/* Demo Mode */}
      <SectionTitle>Presentation</SectionTitle>
      <Link
        href="/demo"
        className="mb-5 flex items-center justify-between rounded-2xl border border-gold/40 bg-gold/10 p-4 transition active:scale-[0.99]"
      >
        <span className="flex items-center gap-3">
          <span className="text-xl">🎬</span>
          <span>
            <span className="block font-semibold text-navy">Demo Mode</span>
            <span className="block text-xs text-navy/60">Run presentation scenarios</span>
          </span>
        </span>
        <span className="text-navy/40">›</span>
      </Link>

      {/* Support */}
      <Section title="Support">
        <PlaceholderRow icon="🎧" label="Customer support" />
        <Divider />
        <button
          onClick={() => setAbout(true)}
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <span className="font-medium text-navy">ℹ️ About Sila</span>
          <span className="text-navy/40">›</span>
        </button>
      </Section>

      <button
        onClick={logout}
        className="mb-2 w-full rounded-xl bg-[#8a3b3b]/10 px-5 py-3 text-sm font-semibold text-[#8a3b3b] transition active:scale-[0.99]"
      >
        ⏻ Log out
      </button>

      {/* About modal */}
      <Modal open={about} onClose={() => setAbout(false)} title="About Sila">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <SilaLogo size={56} />
          <p className="text-sm text-navy/70">
            AI-powered personal finance — all your bank accounts, one smart dashboard.
          </p>
          <p className="text-xs text-navy/40">Version 0.1.0 · MVP</p>
        </div>
      </Modal>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <SectionTitle>{title}</SectionTitle>
      <div className="mb-5 overflow-hidden rounded-2xl bg-white shadow-sm">{children}</div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-4">
      <span className="text-navy/60">{label}</span>
      <span className="font-medium text-navy">{value}</span>
    </div>
  );
}

function PlaceholderRow({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center justify-between p-4">
      <span className="font-medium text-navy">
        {icon} {label}
      </span>
      <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-navy/50">
        Coming soon
      </span>
    </div>
  );
}

function Divider() {
  return <div className="mx-4 h-px bg-light-gray" />;
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: Array<{ key: string; label: string }>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1 rounded-full bg-surface p-1">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            value === o.key ? "bg-primary text-white" : "text-navy"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
