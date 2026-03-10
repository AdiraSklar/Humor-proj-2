"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  data: { bucket: string; count: number }[];
  color?: string;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-sm font-semibold text-zinc-900">
        {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export function DistributionBarChart({ data, color = "#f97316" }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-[220px] animate-pulse rounded-lg bg-zinc-100" />;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
        <XAxis
          dataKey="bucket"
          tick={{ fontSize: 11, fill: "#a1a1aa" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#a1a1aa" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f4f4f5" }} />
        <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
