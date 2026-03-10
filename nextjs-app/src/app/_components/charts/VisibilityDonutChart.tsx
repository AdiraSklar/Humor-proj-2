"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  data: { name: string; value: number }[];
  title: string;
}

const COLORS = ["#22c55e", "#a1a1aa"];

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs text-zinc-500">{payload[0].name}</p>
      <p className="text-sm font-semibold text-zinc-900">
        {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export function VisibilityDonutChart({ data, title }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const total = data.reduce((s, d) => s + d.value, 0);
  const publicPct = total > 0 ? Math.round((data[0].value / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-44 w-44">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={76}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                strokeWidth={0}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-44 w-44 animate-pulse rounded-full bg-zinc-100" />
        )}
        {/* centre label — always rendered so layout doesn't shift */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-zinc-900">{publicPct}%</span>
          <span className="text-xs text-zinc-400">public</span>
        </div>
      </div>

      <p className="mt-3 text-sm font-semibold text-zinc-700">{title}</p>

      <div className="mt-2 flex gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
          Public&nbsp;
          <span className="font-medium text-zinc-700">
            {data[0].value.toLocaleString()}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-zinc-400" />
          Private&nbsp;
          <span className="font-medium text-zinc-700">
            {data[1].value.toLocaleString()}
          </span>
        </span>
      </div>
    </div>
  );
}
