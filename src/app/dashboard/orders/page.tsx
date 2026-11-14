"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/app";
import { CITIES, productById, STATUSES, type Order, type Status } from "@/lib/data";
import { exportOrdersCsv } from "@/lib/export";
import { fmtDate, money, statusLabel } from "@/lib/i18n";
import { Card, ICONS, Icon, StatusBadge } from "@/components/ui";

const PAGE_SIZE = 12;
type SortKey = "date" | "total";

export default function OrdersPage() {
  const { orders, t, lang, user, setStatus } = useApp();
  const isAdmin = user?.role === "admin";

  const [q, setQ] = useState("");
  const [status, setStatusFilter] = useState<Status | "">("");
  const [city, setCity] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "date", dir: -1 });
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = orders.filter((o) => {
      if (status && o.status !== status) return false;
      if (city && o.city.en !== city) return false;
      if (from && o.date < from) return false;
      if (to && o.date > to) return false;
      if (!needle) return true;
      return (
        o.id.toLowerCase().includes(needle) ||
        o.customer.ar.includes(needle) ||
        o.customer.en.toLowerCase().includes(needle) ||
        o.phone.includes(needle)
      );
    });
    return [...list].sort((a, b) => {
      const v = sort.key === "date" ? a.date.localeCompare(b.date) || a.id.localeCompare(b.id) : a.total - b.total;
      return v * sort.dir;
    });
  }, [orders, q, status, city, from, to, sort]);

  // Any filter change sends the user back to page 1.
  useEffect(() => {
    setPage(1); // eslint-disable-line react-hooks/set-state-in-effect
  }, [q, status, city, from, to, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const open = openId ? orders.find((o) => o.id === openId) ?? null : null;
  const hasFilters = q || status || city || from || to;

  const control =
    "h-10 rounded-[2px] border border-line bg-surface px-3 text-sm outline-none transition focus:border-brand";

  function toggleSort(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: -1 }));
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-col gap-3 p-4 xl:flex-row xl:items-center">
          <label className="relative flex-1">
            <span className="sr-only">{t.search}</span>
            <Icon d={ICONS.search} className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} className={`${control} w-full ps-9`} />
          </label>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <select value={status} onChange={(e) => setStatusFilter(e.target.value as Status | "")} className={control} aria-label={t.status}>
              <option value="">{t.allStatuses}</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel[lang][s]}
                </option>
              ))}
            </select>
            <select value={city} onChange={(e) => setCity(e.target.value)} className={control} aria-label={t.city}>
              <option value="">{t.allCities}</option>
              {CITIES.map((c) => (
                <option key={c.en} value={c.en}>
                  {c[lang]}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-muted">
              {t.from}
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={`${control} min-w-0 flex-1`} />
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">
              {t.to}
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={`${control} min-w-0 flex-1`} />
            </label>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
          <p className="text-sm text-muted">
            <span className="tabular font-semibold text-ink">{t.results(filtered.length)}</span>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setStatusFilter("");
                  setCity("");
                  setFrom("");
                  setTo("");
                }}
                className="ms-3 text-brand-strong hover:underline"
              >
                {t.reset}
              </button>
            )}
          </p>
          {isAdmin && (
            <button
              type="button"
              onClick={() => exportOrdersCsv(filtered, lang)}
              disabled={!filtered.length}
              className="inline-flex h-9 items-center gap-2 rounded-[2px] bg-ink px-3.5 text-sm font-semibold text-paper transition hover:bg-ink-2 disabled:opacity-40"
            >
              <Icon d={ICONS.download} className="size-4" />
              {t.exportExcel}
            </button>
          )}
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-line bg-surface-2 text-start text-xs text-muted">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t.order}</th>
                <th className="px-4 py-3 text-start">
                  <SortHead k="date" label={t.date} sort={sort} onToggle={toggleSort} />
                </th>
                <th className="px-4 py-3 text-start font-semibold">{t.customer}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.city}</th>
                {isAdmin && (
                  <th className="px-4 py-3 text-start">
                    <SortHead k="total" label={t.total} sort={sort} onToggle={toggleSort} />
                  </th>
                )}
                <th className="px-4 py-3 text-start font-semibold">{t.payment}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((o) => (
                <tr
                  key={o.id}
                  tabIndex={0}
                  onClick={() => setOpenId(o.id)}
                  onKeyDown={(e) => e.key === "Enter" && setOpenId(o.id)}
                  className="cursor-pointer transition hover:bg-surface-2 focus:bg-surface-2 focus:outline-none"
                >
                  <td className="tabular px-4 py-3 font-semibold">{o.id}</td>
                  <td className="tabular px-4 py-3 text-muted">{fmtDate(o.date, lang)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.customer[lang]}</p>
                    <p className="tabular text-xs text-muted">
                      <bdi dir="ltr">{o.phone}</bdi>
                    </p>
                  </td>
                  <td className="px-4 py-3">{o.city[lang]}</td>
                  {isAdmin && <td className="tabular px-4 py-3 font-medium">{money(o.total, lang)}</td>}
                  <td className="px-4 py-3 text-muted">{o.payment === "cod" ? t.cod : t.card}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <p className="p-10 text-center text-muted">{t.noResults}</p>}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm">
          <span className="tabular text-muted">{t.page(page, pages)}</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-9 rounded-[2px] border border-line bg-surface px-3 transition hover:border-ink disabled:opacity-40"
            >
              {t.prev}
            </button>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
              className="h-9 rounded-[2px] border border-line bg-surface px-3 transition hover:border-ink disabled:opacity-40"
            >
              {t.next}
            </button>
          </div>
        </div>
      </Card>

      {open && <OrderDrawer order={open} onClose={() => setOpenId(null)} onStatus={(s) => setStatus(open.id, s)} />}
    </div>
  );
}

function SortHead({
  k,
  label,
  sort,
  onToggle,
}: {
  k: SortKey;
  label: string;
  sort: { key: SortKey; dir: 1 | -1 };
  onToggle: (k: SortKey) => void;
}) {
  const active = sort.key === k;
  return (
    <button type="button" onClick={() => onToggle(k)} className="inline-flex items-center gap-1 font-semibold hover:text-ink">
      {label}
      <Icon d={active && sort.dir === 1 ? ICONS.up : ICONS.down} className={`size-3.5 ${active ? "text-brand-strong" : "opacity-30"}`} />
    </button>
  );
}

function OrderDrawer({ order, onClose, onStatus }: { order: Order; onClose: () => void; onStatus: (s: Status) => void }) {
  const { t, lang, user } = useApp();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={t.details}>
      <button aria-label={t.close} className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <aside className="absolute inset-y-0 end-0 flex w-full max-w-md flex-col border-s border-line bg-bg">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="text-xs text-muted">{t.details}</p>
            <h2 className="tabular text-lg font-bold">{order.id}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label={t.close} className="grid size-9 place-items-center rounded-[2px] border border-line hover:border-ink">
            <Icon d={ICONS.x} className="size-4" />
          </button>
        </header>
        <div className="flex-1 space-y-6 overflow-y-auto p-5 text-sm">
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-muted">{t.customer}</dt>
              <dd className="mt-1 font-medium">{order.customer[lang]}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">{t.phone}</dt>
              <dd className="tabular mt-1">
                <bdi dir="ltr">{order.phone}</bdi>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">{t.city}</dt>
              <dd className="mt-1">{order.city[lang]}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">{t.date}</dt>
              <dd className="tabular mt-1">{fmtDate(order.date, lang)}</dd>
            </div>
          </dl>

          <div>
            <p className="mb-2 text-xs text-muted">{t.items}</p>
            <ul className="divide-y divide-line rounded-[2px] border border-line bg-surface">
              {order.items.map((it, i) => {
                const p = productById(it.productId);
                return (
                  <li key={i} className="flex justify-between gap-3 px-4 py-3">
                    <span>
                      {p.name[lang]} <span className="text-muted">×{it.qty}</span>
                    </span>
                    {isAdmin && <span className="tabular">{money(p.price * it.qty, lang)}</span>}
                  </li>
                );
              })}
              {isAdmin && (
                <>
                  <li className="flex justify-between gap-3 px-4 py-3 text-muted">
                    <span>{t.shipping}</span>
                    <span className="tabular">{money(50, lang)}</span>
                  </li>
                  <li className="flex justify-between gap-3 px-4 py-3 font-semibold">
                    <span>{t.total}</span>
                    <span className="tabular">{money(order.total, lang)}</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs text-muted">{t.changeStatus}</span>
            <select
              value={order.status}
              onChange={(e) => onStatus(e.target.value as Status)}
              className="h-10 w-full rounded-[2px] border border-line bg-surface px-3 outline-none focus:border-brand"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel[lang][s]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </aside>
    </div>
  );
}
