"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Client-side user preferences: appearance (light/dark) and language.
// Persisted in localStorage. Appearance toggles the `dark` class on <html>
// (Tailwind darkMode: "class"). Language is a stored preference used to label
// the UI choice — see the note on the Profile page about its current scope.

type Theme = "light" | "dark";
type Language = "en" | "ar";

interface PrefsContext {
  theme: Theme;
  setTheme: (t: Theme) => void;
  language: Language;
  setLanguage: (l: Language) => void;
}

const Ctx = createContext<PrefsContext | null>(null);

const THEME_KEY = "sila_theme";
const LANG_KEY = "sila_lang";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [language, setLanguageState] = useState<Language>("en");

  // Load persisted prefs on mount.
  useEffect(() => {
    const savedTheme = (localStorage.getItem(THEME_KEY) as Theme) || "light";
    const savedLang = (localStorage.getItem(LANG_KEY) as Language) || "en";
    setThemeState(savedTheme);
    setLanguageState(savedLang);
    applyTheme(savedTheme);
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
    applyTheme(t);
  }

  function setLanguage(l: Language) {
    setLanguageState(l);
    localStorage.setItem(LANG_KEY, l);
  }

  return (
    <Ctx.Provider value={{ theme, setTheme, language, setLanguage }}>{children}</Ctx.Provider>
  );
}

export function usePreferences(): PrefsContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}
