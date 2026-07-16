import type { Metadata } from "next";
import "./globals.css";
import { PreferencesProvider } from "@/components/prefs/PreferencesProvider";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Sila | صِلة",
  description: "AI-powered personal finance — all your accounts, one dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PreferencesProvider>
          <ToastProvider>
            {/* Mobile-first: constrain to a phone-width column, centered. */}
            <div className="mx-auto min-h-screen max-w-md bg-mist dark:bg-[#0d1526]">
              {children}
            </div>
          </ToastProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}
