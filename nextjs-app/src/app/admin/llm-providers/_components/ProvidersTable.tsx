"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { updateProvider, deleteProvider } from "../actions";

interface LlmProvider {
  id: number;
  name: string;
  created_datetime_utc: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()];
  return `${mon} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function EditableRow({ provider }: { provider: LlmProvider }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(provider.name);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  function commit() {
    setEditing(false);
    const trimmed = value.trim();
    if (!trimmed || trimmed === provider.name) { setValue(provider.name); return; }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", String(provider.id));
      fd.set("name", trimmed);
      try { await updateProvider(fd); } catch { setValue(provider.name); }
    });
  }

  return (
    <tr className={`group transition-colors hover:bg-white/[0.02] ${isPending ? "opacity-60" : ""}`}>
      <td className="px-6 py-4 font-mono text-xs text-zinc-600">{provider.id}</td>
      <td
        className="px-6 py-4 cursor-pointer hover:bg-violet-500/5 transition-colors"
        onClick={() => !editing && setEditing(true)}
        title={editing ? undefined : "Click to edit"}
      >
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); commit(); }
              if (e.key === "Escape") { setValue(provider.name); setEditing(false); }
            }}
            className="w-full rounded-xl border border-violet-500/50 bg-zinc-900 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        ) : (
          <span className="font-bold text-zinc-200 group-hover:text-violet-300 transition-colors">{value}</span>
        )}
      </td>
      <td className="px-6 py-4 text-xs text-zinc-500 tabular-nums">{formatDate(provider.created_datetime_utc)}</td>
      <td className="px-6 py-4 text-right">
        <form action={deleteProvider.bind(null, provider.id)}>
          <button
            type="submit"
            className="cursor-pointer rounded-xl border border-white/5 bg-zinc-900 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 active:scale-[0.98]"
          >
            Delete
          </button>
        </form>
      </td>
    </tr>
  );
}

export default function ProvidersTable({ providers }: { providers: LlmProvider[] }) {
  if (!providers.length) {
    return (
      <tr>
        <td colSpan={4} className="px-6 py-16 text-center text-zinc-500 italic">
          No providers yet.
        </td>
      </tr>
    );
  }
  return <>{providers.map((p) => <EditableRow key={p.id} provider={p} />)}</>;
}
