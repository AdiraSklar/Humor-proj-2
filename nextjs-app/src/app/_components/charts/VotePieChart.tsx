"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Sector } from "recharts";

interface Props {
  likes: number;
  dislikes: number;
}

const COLORS = ["#a855f7", "#3f3f46"]; // Purple-500 for Likes, Zinc-700 for Dislikes

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius + 12}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="drop-shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300"
      />
    </g>
  );
};

export function VotePieChart({ likes, dislikes }: Props) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => setMounted(true), []);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  const data = [
    { name: "Likes", value: likes },
    { name: "Dislikes", value: dislikes },
  ];

  const total = likes + dislikes;
  const likePct = total > 0 ? Math.round((likes / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center w-full min-w-0">
      {/* Explicitly sized container to prevent "width/height -1" errors in Chrome */}
      <div className="w-full min-w-0 relative h-[450px] sm:h-[650px] -mb-12 flex justify-center">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                {...({
                  activeIndex,
                  activeShape: renderActiveShape,
                  data,
                  cx: "50%",
                  cy: "50%",
                  innerRadius: 130,
                  outerRadius: 190,
                  paddingAngle: 8,
                  dataKey: "value",
                  animationBegin: 0,
                  animationDuration: 1500,
                  stroke: "none",
                  onMouseEnter: onPieEnter,
                  onMouseLeave: onPieLeave,
                } as any)}
              >
                {data.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    className="focus:outline-none cursor-pointer" 
                  />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-2xl border border-white/10 bg-zinc-900/95 px-5 py-3 shadow-2xl backdrop-blur-xl scale-110">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1">{payload[0].name}</p>
                        <p className="text-2xl font-black text-white leading-tight">
                          {payload[0].value.toLocaleString()}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full animate-pulse rounded-full border-[20px] border-zinc-900 bg-zinc-900/20" />
        )}
        
        {/* Center Percentage Label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-7xl font-black tracking-tighter text-white sm:text-9xl">{likePct}%</span>
          <span className="text-sm font-bold uppercase tracking-[0.5em] text-purple-400 mt-2">Positive Vibes</span>
        </div>
      </div>

      <div className="mt-12 flex gap-16">
        <div className="group text-center transition-transform hover:scale-110">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-2.5 w-2.5 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-purple-400 transition-colors">Likes</span>
          </div>
          <p className="text-4xl font-black text-white tabular-nums">{likes.toLocaleString()}</p>
        </div>
        
        <div className="group text-center transition-transform hover:scale-110">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-2.5 w-2.5 rounded-full bg-zinc-700 shadow-[0_0_12px_rgba(161,161,170,0.2)]" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">Dislikes</span>
          </div>
          <p className="text-4xl font-black text-white tabular-nums">{dislikes.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
