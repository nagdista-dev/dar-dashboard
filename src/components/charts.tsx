"use client";

import { useState } from "react";

// Dependency-free SVG charts: small bundle, full control over RTL and theming.

export function AreaChart({
  points,
  format,
  labelFor,
}: {
  points: { x: string; y: number }[];
  format: (n: number) => string;
  labelFor: (x: string) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = 220;
  const P = { t: 16, r: 12, b: 26, l: 12 };
  const max = Math.max(...points.map((p) => p.y)) * 1.1 || 1;
  const step = (W - P.l - P.r) / Math.max(points.length - 1, 1);
  const xy = points.map((p, i) => [P.l + i * step, P.t + (H - P.t - P.b) * (1 - p.y / max)] as const);
  const line = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${xy.at(-1)![0]},${H - P.b} L${xy[0][0]},${H - P.b} Z`;
  const ticks = [0, Math.floor(points.length / 2), points.length - 1];

  return (
    <div dir="ltr" className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-56 w-full"
        role="img"
        aria-label="revenue chart"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width) * W;
          setHover(Math.max(0, Math.min(points.length - 1, Math.round((x - P.l) / step))));
        }}
      >
        <defs>
          <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={P.l} x2={W - P.r} y1={P.t + (H - P.t - P.b) * f} y2={P.t + (H - P.t - P.b) * f} stroke="var(--line)" strokeDasharray="3 4" />
        ))}
        <path d={area} fill="url(#fill)" />
        <path d={line} fill="none" stroke="var(--brand)" strokeWidth="2.2" strokeLinejoin="round" />
        {ticks.map((i) => (
          <text key={i} x={xy[i][0]} y={H - 6} fontSize="11" fill="var(--muted)" textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}>
            {labelFor(points[i].x)}
          </text>
        ))}
        {hover !== null && (
          <>
            <line x1={xy[hover][0]} x2={xy[hover][0]} y1={P.t} y2={H - P.b} stroke="var(--brand)" strokeOpacity="0.3" />
            <circle cx={xy[hover][0]} cy={xy[hover][1]} r="4.5" fill="white" stroke="var(--brand)" strokeWidth="2.2" />
          </>
        )}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 rounded-[2px] bg-ink px-2.5 py-1.5 text-xs text-paper"
          style={{
            left: `${(xy[hover][0] / W) * 100}%`,
            transform: `translateX(${hover > points.length / 2 ? "-105%" : "5%"})`,
          }}
        >
          <p className="opacity-70">{labelFor(points[hover].x)}</p>
          <p className="font-semibold">{format(points[hover].y)}</p>
        </div>
      )}
    </div>
  );
}

export function Donut({
  data,
  center,
}: {
  data: { label: string; value: number; color: string }[];
  center: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = 52;
  const C = 2 * Math.PI * R;
  const offsets = data.map((_, i) => data.slice(0, i).reduce((s, d) => s + (d.value / total) * C, 0));
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <svg viewBox="0 0 140 140" className="size-40 shrink-0 -rotate-90" role="img" aria-label="status chart">
        <circle cx="70" cy="70" r={R} fill="none" stroke="var(--line)" strokeWidth="16" />
        {data.map((d, i) => {
          const len = (d.value / total) * C;
          return (
            <circle
              key={d.label}
              cx="70"
              cy="70"
              r={R}
              fill="none"
              stroke={d.color}
              strokeWidth="16"
              strokeDasharray={`${Math.max(len - 1.5, 0)} ${C}`}
              strokeDashoffset={-offsets[i]}
            />
          );
        })}
        <text x="70" y="76" textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--ink)" transform="rotate(90 70 70)">
          {center}
        </text>
      </svg>
      <ul className="w-full space-y-2 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
              {d.label}
            </span>
            <span className="tabular text-muted">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Bars({ data }: { data: { label: string; value: number; display: string }[] }) {
  const max = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <ul className="space-y-3.5">
      {data.map((d) => (
        <li key={d.label}>
          <div className="mb-1.5 flex justify-between gap-3 text-sm">
            <span className="truncate">{d.label}</span>
            <span className="tabular shrink-0 text-muted">{d.display}</span>
          </div>
          <div className="h-2 rounded-full bg-surface-2">
            <div className="h-2 rounded-full bg-brand" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
