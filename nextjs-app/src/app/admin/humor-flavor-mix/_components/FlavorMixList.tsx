"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { updateFlavorMix } from "../actions";

interface HumorFlavorMix {
  id: number;
  humor_flavor_id: number;
  caption_count: number;
  created_datetime_utc: string;
  humor_flavors: { slug: string; description: string | null } | null;
}

interface HumorFlavor {
  id: number;
  slug: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()];
  return `${mon} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function MixRow({ mix, allFlavors }: { mix: HumorFlavorMix; allFlavors: HumorFlavor[] }) {
  const [flavorId, setFlavorId] = useState(mix.humor_flavor_id);
  const [count, setCount] = useState(mix.caption_count);
  const [editingCount, setEditingCount] = useState(false);
  const [isPending, startTransition] = useTransition();
  const countRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editingCount) countRef.current?.focus(); }, [editingCount]);

  function save(newFlavorId: number, newCount: number) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", String(mix.id));
      fd.set("humor_flavor_id", String(newFlavorId));
      fd.set("caption_count", String(newCount));
      try { await updateFlavorMix(fd); } catch { /* revert handled per-field */ }
    });
  }

  function handleFlavorChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newId = Number(e.target.value);
    setFlavorId(newId);
    save(newId, count);
  }

  function commitCount() {
    setEditingCount(false);
    if (count === mix.caption_count && flavorId === mix.humor_flavor_id) return;
    save(flavorId, count);
  }

  return (
    <div className={`bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm shadow-2xl transition-opacity ${isPending ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-center gap-6">

        {/* Flavor dropdown — saves on change */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Humor Flavor</span>
          <select
            value={flavorId}
            onChange={handleFlavorChange}
            className="rounded-xl border border-white/5 bg-zinc-950/50 px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all cursor-pointer"
          >
            {allFlavors.map((f) => (
              <option key={f.id} value={f.id}>{f.slug}</option>
            ))}
          </select>
        </div>

        {/* Caption count — click to edit, blur/Enter to save */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Caption Count</span>
          {editingCount ? (
            <input
              ref={countRef}
              type="number"
              min={0}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              onBlur={commitCount}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); commitCount(); }
                if (e.key === "Escape") { setCount(mix.caption_count); setEditingCount(false); }
              }}
              className="w-28 rounded-xl border border-violet-500/50 bg-zinc-950/50 px-3 py-2 text-sm text-white text-center font-black tabular-nums focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingCount(true)}
              title="Click to edit"
              className="w-28 rounded-xl border border-white/5 bg-zinc-950/50 px-3 py-2 text-sm text-white text-center font-black tabular-nums hover:border-violet-500/40 hover:text-violet-300 transition-all cursor-pointer"
            >
              {count}
            </button>
          )}
        </div>

        {/* Meta */}
        <p className="ml-auto self-center text-[10px] font-mono text-zinc-700">
          id:{mix.id} · added {formatDate(mix.created_datetime_utc)}
        </p>
      </div>
    </div>
  );
}

export default function FlavorMixList({
  mixes,
  allFlavors,
}: {
  mixes: HumorFlavorMix[];
  allFlavors: HumorFlavor[];
}) {
  return (
    <div className="space-y-4">
      {mixes.map((mix) => (
        <MixRow key={mix.id} mix={mix} allFlavors={allFlavors} />
      ))}
    </div>
  );
}