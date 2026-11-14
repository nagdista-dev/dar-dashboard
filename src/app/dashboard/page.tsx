"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useApp } from "@/lib/app";
import { isoDay, productById, STATUSES } from "@/lib/data";
import { fmtDate, money, num, statusColor, statusLabel } from "@/lib/i18n";
import { AreaChart, Bars, Donut } from "@/components/charts";
import { Card, ICONS, Icon, StatusBadge } from "@/components/ui";

const PERIOD = 30;

export default function Overview() {
  const { orders, t, lang, user } = useApp();
  const isAdmin = user?.role === "admin";

  const stats = useMemo(() => {
    const from = isoDay(PERIOD - 1);
    const prevFrom = isoDay(PERIOD * 2 - 1);
    const cur = orders.filter((o) => o.date >= from);
    const prev = orders.filter((o) => o.date >= prevFrom && o.date < from);
    const paid = (list: typeof orders) => list.filter((o) => o.status !== "cancelled" && o.status !== "returned");
    const rev = (list: typeof orders) => paid(list).reduce((s, o) => s + o.total, 0);
    const ret = (list: typeof orders) => list.filter((o) => o.status === "returned").length / Math.max(list.length, 1);
    const pct = (a: number, b: number) => (b ? ((a - b) / b) * 100 : 0);

    const daily = Array.from({ length: PERIOD }, (_, i) => {
      const d = isoDay(PERIOD - 1 - i);
      return { x: d, y: rev(cur.filter((o) => o.date === d)) };
    });

    const byProduct = new Map<string, number>();
    for (const o of paid(cur)) for (const it of o.items) byProduct.set(it.productId, (byProduct.get(it.productId) ?? 0) + it.qty);
    const top = [...byProduct.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

    return {
      revenue: rev(cur),
      revenueDelta: pct(rev(cur), rev(prev)),
      count: cur.length,
      countDelta: pct(cur.length, prev.length),
      aov: rev(cur) / Math.max(paid(cur).length, 1),
      aovDelta: pct(rev(cur) / Math.max(paid(cur).length, 1), rev(prev) / Math.max(paid(prev).length, 1)),
      returns: ret(cur) * 100,
      returnsDelta: (ret(cur) - ret(prev)) * 100,
      daily,
      status: STATUSES.map((s) => ({ s, n: cur.filter((o) => o.status === s).length })),
      top,
    };
  }, [orders]);

  const kpis = [
    { label: t.revenue, value: money(stats.revenue, lang), delta: stats.revenueDelta, money: true },
    { label: t.ordersCount, value: num(stats.count, lang), delta: stats.countDelta },
    { label: t.aov, value: money(stats.aov, lang), delta: stats.aovDelta, money: true },
    { label: t.returnRate, value: `${num(Number(stats.returns.toFixed(1)), lang)}%`, delta: stats.returnsDelta, invert: true },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{t.last30}</p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const hidden = k.money && !isAdmin;
          const good = k.invert ? k.delta <= 0 : k.delta >= 0;
          return (
            <div key={k.label} className="rounded-[2px] border border-line bg-surface p-5">
              <p className="text-sm text-muted">{k.label}</p>
              {hidden ? (
                <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                  <Icon d={ICONS.lock} className="size-4" />
                  {t.hiddenForStaff}
                </p>
              ) : (
                <>
                  <p className="tabular mt-2 text-2xl font-bold">{k.value}</p>
                  <p className={`mt-2 flex items-center gap-1 text-xs font-medium ${good ? "text-[#1f6b3b]" : "text-[#a32a1a]"}`}>
                    <Icon d={k.delta >= 0 ? ICONS.up : ICONS.down} className="size-3.5" />
                    <span className="tabular">{num(Number(Math.abs(k.delta).toFixed(1)), lang)}%</span>
                    <span className="font-normal text-muted">{t.vsPrev}</span>
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title={t.revenueTrend} className="xl:col-span-2">
          <div className="p-5">
            {isAdmin ? (
              <AreaChart points={stats.daily} format={(n) => money(n, lang)} labelFor={(x) => fmtDate(x, lang)} />
            ) : (
              <p className="flex h-56 items-center justify-center gap-2 text-sm text-muted">
                <Icon d={ICONS.lock} className="size-4" />
                {t.hiddenForStaff}
              </p>
            )}
          </div>
        </Card>
        <Card title={t.byStatus}>
          <div className="p-5">
            <Donut
              center={num(stats.count, lang)}
              data={stats.status.map(({ s, n }) => ({ label: statusLabel[lang][s], value: n, color: statusColor[s] }))}
            />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title={t.topProducts}>
          <div className="p-5">
            <Bars
              data={stats.top.map(([id, qty]) => ({
                label: productById(id).name[lang],
                value: qty,
                display: num(qty, lang),
              }))}
            />
          </div>
        </Card>
        <Card
          title={t.recentOrders}
          className="xl:col-span-2"
          action={
            <Link href="/dashboard/orders/" className="text-sm font-medium text-brand-strong hover:underline">
              {t.viewAll}
            </Link>
          }
        >
          <ul className="divide-y divide-line">
            {orders.slice(0, 6).map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">
                    <span className="tabular text-muted">{o.id}</span> · {o.customer[lang]}
                  </p>
                  <p className="text-xs text-muted">
                    {o.city[lang]} · {fmtDate(o.date, lang)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {isAdmin && <span className="tabular hidden font-medium sm:inline">{money(o.total, lang)}</span>}
                  <StatusBadge status={o.status} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
