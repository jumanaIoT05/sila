"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api-client";
import { setSession } from "@/lib/auth-storage";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { ErrorState } from "@/components/ui/State";
import { SilaLogo } from "@/components/brand/Logo";

interface VerifyResult {
  token: string;
  userId: number;
  isNewUser: boolean;
}

function VerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const phone = params.get("phone") ?? "";
  const [code, setCode] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Countdown for the Resend OTP button.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<VerifyResult>("/auth/verify-otp", { phoneNumber: phone, code });
      setSession(res.token, phone);
      router.replace(res.isNewUser ? "/banks" : "/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (cooldown > 0) return;
    try {
      await api.post("/auth/request-otp", { phoneNumber: phone });
      setCooldown(30);
      toast.success("OTP Resent");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not resend OTP");
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center gap-6 p-6">
      <div className="flex flex-col items-center text-center">
        <SilaLogo size={56} />
        <h1 className="mt-4 text-xl font-bold text-navy">Verify your number</h1>
        <p className="mt-1 text-sm text-navy/60">
          Enter the OTP sent to <b>{phone}</b>
        </p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="OTP code">
          <Input
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            required
          />
        </Field>
        {error && <ErrorState message={error} />}
        <Button type="submit" fullWidth loading={loading}>
          Verify &amp; continue
        </Button>
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0}
          className="text-center text-sm font-medium text-primary disabled:text-navy/40"
        >
          {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Didn't get it? Resend OTP"}
        </button>
      </form>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading…</div>}>
      <VerifyInner />
    </Suspense>
  );
}
