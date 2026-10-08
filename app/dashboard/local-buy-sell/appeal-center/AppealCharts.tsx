"use client";

import React, { useMemo, useState } from "react";

// ─── Shared palette ───────────────────────────────────────────────────────────

export const CHART_COLORS = {
  total: "#a855f7",
  resolved: "#22c55e",
  pending: "#f59e0b",
  cancelled: "#ef4444",
};

// ─── Line Chart ───────────────────────────────────────────────────────────────

export interface OverviewPoint {
  label: string;
  total: number;
  resolved: number;
  pending: number;
  cancelled: number;
}

interface AppealLineChartProps {
  data: OverviewPoint[];
  height?: number;
}

const SERIES: Array<{ key: keyof OverviewPoint; color: string; name: string }> = [
  { key: "total", color: CHART_COLORS.total, name: "Total Appeals" },
  { key: "resolved", color: CHART_COLORS.resolved, name: "Resolved" },
  { key: "pending", color: CHART_COLORS.pending, name: "Pending" },
  { key: "cancelled", color: CHART_COLORS.cancelled, name: "Cancelled" },
];

export function AppealLineChart({ data, height = 260 }: AppealLineChartProps) {
  const width = 700;
  const padding = { top: 16, right: 12, bottom: 28, left: 28 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const maxVal = useMemo(() => {
    const m = Math.max(1, ...data.flatMap((d) => [d.total, d.resolved, d.pending, d.cancelled]));
    return Math.ceil(m / 4) * 4 || 4;
  }, [data]);

  const xFor = (i: number) => padding.left + (innerW * i) / Math.max(1, data.length - 1);
  const yFor = (v: number) => padding.top + innerH - (innerH * v) / maxVal;

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const gridLines = 4;

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label="Appeal overview chart"
        onMouseLeave={() => setHoverIdx(null)}
      >
        {/* Horizontal grid lines */}
        {Array.from({ length: gridLines + 1 }).map((_, i) => {
          const y = padding.top + (innerH * i) / gridLines;
          const val = Math.round(maxVal - (maxVal * i) / gridLines);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
              />
              <text x={4} y={y + 4} fontSize={10} fill="rgba(255,255,255,0.35)">
                {val}
              </text>
            </g>
          );
        })}

        {/* Series lines */}
        {SERIES.map((s) => {
          const points = data.map((d, i) => `${xFor(i)},${yFor(Number(d[s.key]))}`).join(" ");
          return (
            <polyline
              key={s.key}
              points={points}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        })}

        {/* Dots + hover target */}
        {data.map((d, i) => (
          <g key={i}>
            <rect
              x={xFor(i) - (innerW / Math.max(1, data.length - 1)) / 2}
              y={padding.top}
              width={innerW / Math.max(1, data.length - 1)}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
            />
            {SERIES.map((s) => (
              <circle
                key={s.key}
                cx={xFor(i)}
                cy={yFor(Number(d[s.key]))}
                r={hoverIdx === i ? 4 : 2.5}
                fill={s.color}
                opacity={hoverIdx === i ? 1 : 0.85}
              />
            ))}
            {hoverIdx === i && (
              <line
                x1={xFor(i)}
                x2={xFor(i)}
                y1={padding.top}
                y2={padding.top + innerH}
                stroke="rgba(255,255,255,0.2)"
                strokeDasharray="3,3"
              />
            )}
          </g>
        ))}

        {/* X labels (sparse) */}
        {data.map((d, i) =>
          i % Math.ceil(data.length / 6) === 0 ? (
            <text
              key={i}
              x={xFor(i)}
              y={height - 6}
              fontSize={10}
              fill="rgba(255,255,255,0.35)"
              textAnchor="middle"
            >
              {d.label}
            </text>
          ) : null
        )}
      </svg>

      {/* Tooltip */}
      {hoverIdx !== null && (
        <div
          style={{
            fontSize: 12,
            color: "#fff",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            padding: "8px 12px",
            display: "inline-flex",
            gap: 14,
            marginTop: 4,
          }}
        >
          <strong>{data[hoverIdx].label}</strong>
          {SERIES.map((s) => (
            <span key={s.key} style={{ color: s.color }}>
              {s.name}: {data[hoverIdx][s.key]}
            </span>
          ))}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 10 }}>
        {SERIES.map((s) => (
          <span key={s.key} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: s.color, display: "inline-block" }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

export interface ReasonSlice {
  label: string;
  value: number;
  color: string;
}

export function AppealDonutChart({ data, size = 200 }: { data: ReasonSlice[]; size?: number }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = size / 2;
  const innerRadius = radius * 0.62;
  const cx = radius;
  const cy = radius;

  let cumulative = 0;
  const arcs = data.map((d) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    const ix1 = cx + innerRadius * Math.cos(endAngle);
    const iy1 = cy + innerRadius * Math.sin(endAngle);
    const ix2 = cx + innerRadius * Math.cos(startAngle);
    const iy2 = cy + innerRadius * Math.sin(startAngle);

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    const path = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      "Z",
    ].join(" ");

    return { path, color: d.color, label: d.label, value: d.value };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Appeal by reason">
          {arcs.map((a, i) => (
            <path key={i} d={a.path} fill={a.color} />
          ))}
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{total}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Total</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.map((d) => (
          <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <span style={{ width: 9, height: 9, borderRadius: 999, background: d.color, display: "inline-block", flexShrink: 0 }} />
            <span style={{ color: "rgba(255,255,255,0.85)" }}>{d.label}</span>
            <span style={{ color: "rgba(255,255,255,0.45)", marginLeft: "auto" }}>
              {d.value} ({((d.value / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
