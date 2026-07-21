import type { Locale } from "@/lib/i18n/dictionaries";

const storageKey = "frontend-debugging-arena-locale";
const listeners = new Set<() => void>();
let activeLocale: Locale | null = null;

const isLocale = (value: string | null): value is Locale => value === "ko" || value === "en";

function resolveLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (isLocale(stored)) return stored;
  } catch {
    // Storage can be disabled; browser language remains a safe fallback.
  }
  return window.navigator.language.toLowerCase().startsWith("ko") ? "ko" : "en";
}

export function getLocaleSnapshot(): Locale {
  if (activeLocale === null) activeLocale = resolveLocale();
  return activeLocale;
}

export function getServerLocaleSnapshot(): Locale {
  return "en";
}

export function subscribeToLocale(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function selectLocale(locale: Locale): void {
  activeLocale = locale;
  try {
    window.localStorage.setItem(storageKey, locale);
  } catch {
    // An explicit choice still applies to the current session.
  }
  listeners.forEach((listener) => listener());
}
