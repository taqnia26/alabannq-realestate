import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Locale = "ar" | "en";
export type Theme = "dark" | "light";

type Preferences = {
  locale: Locale;
  setLocale: (value: Locale) => void;
  theme: Theme;
  setTheme: (value: Theme) => void;
  t: (arabic: string, english: string) => string;
};

const PreferencesContext = createContext<Preferences | null>(null);

function stored<T extends string>(key: string, values: readonly T[], fallback: T): T {
  try {
    const value = window.localStorage.getItem(key) as T;
    return values.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => stored("alabnq-locale", ["ar", "en"], "ar"));
  const [theme, setTheme] = useState<Theme>(() => stored("alabnq-site-theme", ["dark", "light"], "dark"));

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    try { window.localStorage.setItem("alabnq-locale", locale); } catch { /* unavailable */ }
  }, [locale]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.theme = theme;
    try { window.localStorage.setItem("alabnq-site-theme", theme); } catch { /* unavailable */ }
  }, [theme]);

  const value = useMemo<Preferences>(() => ({
    locale, setLocale, theme, setTheme,
    t: (arabic, english) => locale === "en" ? english : arabic,
  }), [locale, theme]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("PreferencesProvider is missing");
  return context;
}

export function localized<T extends object>(item: T, field: keyof T & string, locale: Locale): string {
  const record = item as Record<string, unknown>;
  const value = locale === "en" ? record[`${field}En`] : record[field];
  return typeof value === "string" && value.trim() ? value : locale === "en" ? "Translation pending" : "";
}