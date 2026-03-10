"use client";

import { useEffect, useState } from "react";

interface Props {
  data: { label: string; count: number }[];
}

export function HumorFlavorChart({ data }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Delay slightly to ensure the grow effect is visible on mount
    const timer = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {data.map((item, i) => {
        const percentage = (item.count / maxCount) * 100;
        
        return (
          <div key={item.label} className="group">
            <div className="flex justify-between mb-2 items-end">
              <span className="text-sm font-bold uppercase tracking-widest text-zinc-400 group-hover:text-purple-400 transition-colors">
                {item.label}
              </span>
              <span className="text-xs font-black tabular-nums text-zinc-500 group-hover:text-white transition-colors">
                {item.count.toLocaleString()} {item.count === 1 ? 'Caption' : 'Captions'}
              </span>
            </div>
            <div className="h-4 w-full bg-zinc-900/50 rounded-full overflow-hidden border border-white/5 relative">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-full transition-all duration-[900ms] ease-out relative"
                style={{ 
                  width: mounted ? `${percentage}%` : "0%",
                  boxShadow: "0 0 20px rgba(168, 85, 247, 0.2)"
                }}
              >
                {/* Subtle highlight shine */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
