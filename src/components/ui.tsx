"use client";

import { useApp } from "@/lib/app";
import type { Status } from "@/lib/data";
import { statusColor, statusLabel } from "@/lib/i18n";

export function Logo() {
  const { t } = useApp();
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-[2px] bg-ink font-display text-lg font-bold text-paper">د</span>
      <span className="leading-tight">
        <span className="block font-bold">{t.brand}</span>
        <span className="block text-xs text-muted">{t.brandSub}</span>
      </span>
    </div>
  );
}

export function LangButton() {
  const { t, toggleLang } = useApp();
  return (
    <button
      type="button"
      onClick={toggleLang}
      className="h-9 rounded-[2px] border border-line bg-surface px-3 text-sm font-medium transition hover:border-brand"
    >
      {t.lang}
    </button>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const { lang } = useApp();
  const c = statusColor[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ color: c, backgroundColor: `${c}14` }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: c }} />
      {statusLabel[lang][status]}
    </span>
  );
}

export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[2px] border border-line bg-surface ${className}`}>
      {title && (
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="font-semibold">{title}</h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Icon({ d, className = "size-5" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export const ICONS = {
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  box: "M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8",
  users: "M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM21 19v-1a4 4 0 0 0-3-3.9M16 3.1a3.5 3.5 0 0 1 0 6.8",
  out: "M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l-5-5 5-5M5 12h11",
  download: "M12 4v11m-5-5 5 5 5-5M5 20h14",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 2-4-4",
  x: "M6 6l12 12M18 6 6 18",
  lock: "M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3",
  up: "M7 14l5-5 5 5",
  down: "M7 10l5 5 5-5",
  menu: "M4 7h16M4 12h16M4 17h16",
};
