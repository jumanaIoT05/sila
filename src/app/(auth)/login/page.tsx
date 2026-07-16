"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { ErrorState } from "@/components/ui/State";
import { SilaLogo } from "@/components/brand/Logo";

// FR-1: phone entry -> request OTP -> go to verify screen.
export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("0500000000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/request-otp", { phoneNumber: phone });
      router.push(`/verify?phone=${encodeURIComponent(phone)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center gap-6 p-6">
      <div className="flex flex-col items-center text-center">
        <SilaLogo size={64} />
        <p className="mt-3 text-sm text-navy/60">
          All your bank accounts, one smart dashboard.
        </p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Phone number">
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05XXXXXXXX"
            required
          />
        </Field>
        {error && <ErrorState message={error} />}
        <Button type="submit" fullWidth loading={loading}>
          Send OTP
        </Button>
        <p className="text-center text-xs text-navy/50">
          Demo user: <b>0500000000</b> · OTP: <b>123456</b>
        </p>
      </form>
    </div>
  );
}
