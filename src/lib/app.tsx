"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ORDERS, type Order, type Status } from "./data";
import { dict, type Lang } from "./i18n";

// Front-end-only demo auth. A real build would verify these on the server
// (NextAuth / Supabase Auth) and enforce roles in the API, not just the UI.
export type Role = "admin" | "staff";
export type User = { email: string; name: { ar: string; en: string }; role: Role };

export const DEMO_USERS: (User & { password: string })[] = [
  { email: "admin@dar.demo", password: "admin123", name: { ar: "سارة المدير", en: "Sara (Admin)" }, role: "admin" },
  { email: "staff@dar.demo", password: "staff123", name: { ar: "علي الموظف", en: "Ali (Staff)" }, role: "staff" },
];

type Ctx = {
  ready: boolean;
  lang: Lang;
  t: (typeof dict)[Lang];
  toggleLang: () => void;
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  orders: Order[];
  setStatus: (id: string, status: Status) => void;
};

const AppContext = createContext<Ctx | null>(null);

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode: keep state in memory only */
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [lang, setLang] = useState<Lang>("ar");
  const [user, setUser] = useState<User | null>(null);
  const [overrides, setOverrides] = useState<Record<string, Status>>({});

  useEffect(() => {
    // Restoring persisted client state after hydration is the intended use here.
    /* eslint-disable react-hooks/set-state-in-effect */
    setLang(read<Lang>("dar.lang", "ar"));
    setUser(read<User | null>("dar.user", null));
    setOverrides(read<Record<string, Status>>("dar.status", {}));
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang((l) => {
      const next = l === "ar" ? "en" : "ar";
      write("dar.lang", next);
      return next;
    });
  }, []);

  const login = useCallback((email: string, password: string) => {
    const found = DEMO_USERS.find((u) => u.email === email.trim().toLowerCase() && u.password === password);
    if (!found) return false;
    const u: User = { email: found.email, name: found.name, role: found.role };
    setUser(u);
    write("dar.user", u);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    write("dar.user", null);
  }, []);

  const setStatus = useCallback((id: string, status: Status) => {
    setOverrides((o) => {
      const next = { ...o, [id]: status };
      write("dar.status", next);
      return next;
    });
  }, []);

  const orders = useMemo(
    () => ORDERS.map((o) => (overrides[o.id] ? { ...o, status: overrides[o.id] } : o)),
    [overrides],
  );

  const value: Ctx = { ready, lang, t: dict[lang], toggleLang, user, login, logout, orders, setStatus };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
