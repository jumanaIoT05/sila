"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth-storage";
import { Walkthrough } from "@/components/onboarding/Walkthrough";
import { Welcome } from "@/components/dashboard/Welcome";

const WALKTHROUGH_KEY = "sila_walkthrough_seen";

// Onboarding step shown after Enter Name: the first-time walkthrough (once),
// then the "Get Started" card that leads into bank selection.
export default function WelcomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setShowWalkthrough(!localStorage.getItem(WALKTHROUGH_KEY));
    setReady(true);
  }, [router]);

  function finishWalkthrough() {
    localStorage.setItem(WALKTHROUGH_KEY, "1");
    setShowWalkthrough(false);
  }

  if (!ready) return <div className="p-10 text-center text-navy">Loading…</div>;

  return (
    <div className="min-h-screen">
      {showWalkthrough && <Walkthrough onDone={finishWalkthrough} />}
      {/* Get Started card (its button links to /banks) */}
      <Welcome />
    </div>
  );
}
