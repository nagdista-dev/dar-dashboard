"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_USERS, useApp } from "@/lib/app";
import { Logo, LangButton } from "@/components/ui";

export default function LoginPage() {
  const { t, lang, user, ready, login } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/dashboard/");
  }, [ready, user, router]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (login(email, password)) router.replace("/dashboard/");
    else setError(true);
  }

  const input =
    "h-11 w-full rounded-[2px] border border-line bg-surface px-3.5 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15";

  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <section className="flex flex-col justify-between p-6 sm:p-10">
        <div className="flex items-center justify-between">
          <Logo />
          <LangButton />
        </div>

        <div className="mx-auto w-full max-w-sm py-12">
          <h1 className="text-3xl font-bold">{t.loginTitle}</h1>
          <p className="mt-2 text-muted">{t.loginBody}</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">{t.email}</span>
              <input
                type="email"
                dir="ltr"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(false);
                }}
                className={input}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">{t.password}</span>
              <input
                type="password"
                dir="ltr"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className={input}
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-[#a32a1a]">
                {t.loginError}
              </p>
            )}
            <button className="h-11 w-full rounded-[2px] bg-brand font-semibold text-paper transition hover:bg-brand-strong">
              {t.login}
            </button>
          </form>

          <div className="mt-8 rounded-[2px] border border-dashed border-line bg-surface p-4">
            <p className="text-xs font-semibold text-muted">{t.demoAccounts}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => {
                    setEmail(u.email);
                    setPassword(u.password);
                    setError(false);
                  }}
                  className="rounded-[2px] border border-line px-3 py-2 text-start text-sm transition hover:border-brand hover:bg-brand-soft"
                >
                  <span className="block font-semibold">{u.role === "admin" ? t.asAdmin : t.asStaff}</span>
                  <span className="block truncate text-xs text-muted" dir="ltr">
                    {u.email}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-muted">{t.demoNote}</p>
      </section>

      <section
        aria-hidden="true"
        className="relative hidden overflow-hidden bg-ink p-12 text-paper lg:flex lg:flex-col lg:justify-end"
      >
        <div className="dot-grid absolute inset-0" />
        <div className="relative">
          <div className="mb-8 grid grid-cols-3 gap-3">
            {[
              [lang === "ar" ? "الطلبات اليوم" : "Orders today", "14"],
              [lang === "ar" ? "قيد التجهيز" : "Processing", "6"],
              [lang === "ar" ? "تم التسليم" : "Delivered", "92%"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-[2px] bg-surface/10 p-4 backdrop-blur">
                <p className="text-xs text-paper/70">{k}</p>
                <p className="mt-1 font-display text-2xl font-bold">{v}</p>
              </div>
            ))}
          </div>
          <p className="max-w-md text-2xl font-semibold leading-relaxed">
            {lang === "ar"
              ? "كل طلبات المتجر، مبيعاته، وفريقه — في شاشة واحدة واضحة."
              : "Every order, sale and teammate — on one clear screen."}
          </p>
        </div>
      </section>
    </main>
  );
}
