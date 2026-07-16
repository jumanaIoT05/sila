"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { getToken } from "@/lib/auth-storage";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { ErrorState } from "@/components/ui/State";
import { SilaLogo } from "@/components/brand/Logo";

// Enter Name — shown after OTP, before the walkthrough. Saves the name to the
// existing user record so it appears on the dashboard greeting and profile.
export default function NamePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) router.replace("/login");
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await api.patch("/profile", { fullName: name.trim() });
      router.push("/welcome");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your name");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center gap-6 p-6">
      <div className="flex flex-col items-center text-center">
        <SilaLogo size={56} />
        <h1 className="mt-4 text-xl font-bold text-navy">What should we call you?</h1>
        <p className="mt-1 text-sm text-navy/60">We&apos;ll personalize your experience.</p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="First name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jumana"
            autoFocus
            required
          />
        </Field>
        {error && <ErrorState message={error} />}
        <Button type="submit" fullWidth loading={loading} disabled={!name.trim()}>
          Continue
        </Button>
      </form>
    </div>
  );
}
