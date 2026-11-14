"use client";

import { useApp } from "@/lib/app";
import { Card, ICONS, Icon } from "@/components/ui";

const TEAM = [
  { name: { ar: "سارة المدير", en: "Sara (Admin)" }, email: "admin@dar.demo", role: "admin", last: { ar: "الآن", en: "Now" } },
  { name: { ar: "علي الموظف", en: "Ali (Staff)" }, email: "staff@dar.demo", role: "staff", last: { ar: "منذ 12 دقيقة", en: "12 min ago" } },
  { name: { ar: "منى خدمة العملاء", en: "Mona (Support)" }, email: "mona@dar.demo", role: "staff", last: { ar: "منذ ساعتين", en: "2 hours ago" } },
  { name: { ar: "حسام المخزن", en: "Hossam (Warehouse)" }, email: "hossam@dar.demo", role: "staff", last: { ar: "أمس", en: "Yesterday" } },
] as const;

export default function TeamPage() {
  const { t, lang, user } = useApp();

  if (user?.role !== "admin") {
    return (
      <p className="flex items-center justify-center gap-2 rounded-[2px] border border-line bg-surface p-12 text-muted">
        <Icon d={ICONS.lock} className="size-4" />
        {t.adminOnly}
      </p>
    );
  }

  const perms = (role: "admin" | "staff") => ({
    orders: true,
    revenue: role === "admin",
    export: role === "admin",
    team: role === "admin",
  });

  return (
    <div className="space-y-5">
      <div className="max-w-2xl">
        <h2 className="text-xl font-bold">{t.teamTitle}</h2>
        <p className="mt-2 text-muted">{t.teamBody}</p>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="border-b border-line bg-surface-2 text-xs text-muted">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t.member}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.role}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.perms}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.lastActive}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {TEAM.map((m) => {
                const p = perms(m.role);
                return (
                  <tr key={m.email}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{m.name[lang]}</p>
                      <p className="text-xs text-muted">
                        <bdi dir="ltr">{m.email}</bdi>
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-[2px] px-2 py-1 text-xs font-semibold ${
                          m.role === "admin" ? "bg-ink text-paper" : "bg-surface-2 text-ink-2"
                        }`}
                      >
                        {m.role === "admin" ? t.role_admin : t.role_staff}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ul className="flex flex-wrap gap-1.5">
                        {(["orders", "revenue", "export", "team"] as const).map((k) => (
                          <li
                            key={k}
                            className={`rounded-[2px] border px-2 py-0.5 text-xs ${
                              p[k] ? "border-ink/30 text-ink" : "border-line text-muted line-through"
                            }`}
                          >
                            {t[`perm_${k}`]}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3 text-muted">{m.last[lang]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
