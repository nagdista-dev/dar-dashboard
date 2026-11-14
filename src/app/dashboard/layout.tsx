"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/app";
import { ICONS, Icon, LangButton, Logo } from "@/components/ui";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { ready, user, t, lang, logout } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/");
  }, [ready, user, router]);

  if (!ready || !user) {
    return <div className="grid min-h-dvh place-items-center text-muted">…</div>;
  }

  const nav = [
    { href: "/dashboard/", label: t.overview, icon: ICONS.grid },
    { href: "/dashboard/orders/", label: t.orders, icon: ICONS.box },
    ...(user.role === "admin" ? [{ href: "/dashboard/team/", label: t.team, icon: ICONS.users }] : []),
  ];

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-5">
      <Logo />
      <nav aria-label={t.brandSub}>
        <ul className="space-y-1">
          {nav.map((n) => {
            const active = pathname === n.href || pathname === n.href.slice(0, -1);
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-10 items-center gap-3 rounded-[2px] px-3 text-sm font-medium transition ${
                    active ? "bg-brand-soft text-brand-strong" : "text-ink-2 hover:bg-surface-2"
                  }`}
                >
                  <Icon d={n.icon} />
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto space-y-3 border-t border-line pt-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-brand-soft font-semibold text-brand-strong">
            {user.name[lang].charAt(0)}
          </span>
          <div className="min-w-0 text-sm">
            <p className="truncate font-semibold">{user.name[lang]}</p>
            <p className="text-xs text-muted">{user.role === "admin" ? t.role_admin : t.role_staff}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            router.replace("/");
          }}
          className="flex h-9 w-full items-center gap-2 rounded-[2px] px-3 text-sm text-muted transition hover:bg-surface-2 hover:text-ink"
        >
          <Icon d={ICONS.out} className="size-4 rtl:-scale-x-100" />
          {t.logout}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh border-e border-line bg-surface lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button aria-label={t.close} className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 start-0 w-64 bg-surface">{sidebar}</aside>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-bg/90 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="menu"
              className="grid size-9 place-items-center rounded-[2px] border border-line bg-surface lg:hidden"
            >
              <Icon d={ICONS.menu} />
            </button>
            <h1 className="text-lg font-semibold">{nav.find((n) => n.href === pathname)?.label ?? t.overview}</h1>
          </div>
          <LangButton />
        </header>
        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
