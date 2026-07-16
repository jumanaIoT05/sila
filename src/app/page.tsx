"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth-storage";

// Entry: route to dashboard if authenticated, else to login.
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace(getToken() ? "/dashboard" : "/login");
  }, [router]);
  return <div className="p-10 text-center text-navy">Loading Sila…</div>;
}
