"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { updateEmail, deleteEmail } from "../actions";

interface WhitelistEmail {
  id: number;
  email_address: string;
  created_datetime_utc: string;
  modified_datetime_utc: string | null;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()];
  return `${mon} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function EditableRow({ email }: { email: WhitelistEmail }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(email.email_address);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  function commit() {
    setEditing(false);
    const trimmed = value.trim().toLowerCase();
    if (!trimmed || trimmed === email.email_address) { setValue(email.email_address); return; }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", String(email.id));
      fd.set("email_address", trimmed);
      try { await updateEmail(fd); } catch { setValue(email.email_address); }
    });
  }

  return (
    <tr className={`group transition-colors hover:bg-white/[0.02] ${isPending ? "opacity-60" : ""}`}>
      <td className="px-6 py-4 font-mono text-xs text-zinc-600">{email.id}</td>
      <td
        className="px-6 py-4 cursor-pointer hover:bg-violet-500/5 transition-colors"
        onClick={() => !editing && setEditing(true)}
        title={editing ? undefined : "Click to edit"}
      >
        {editing ? (
          <input
            ref={inputRef}
            type="email"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } if (e.key === "Escape") { setValue(email.email_address); setEditing(false); } }}
            className="w-full rounded-xl border border-violet-500/50 bg-zinc-900 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        ) : (
          <span className="font-bold text-zinc-200 group-hover:text-violet-300 transition-colors">{value}</span>
        )}
      </td>
      <td className="px-6 py-4 text-xs text-zinc-500 tabular-nums">{formatDate(email.created_datetime_utc)}</td>
      <td className="px-6 py-4 text-xs text-zinc-500 tabular-nums">{formatDate(email.modified_datetime_utc)}</td>
      <td className="px-6 py-4 text-right">
        <form action={deleteEmail.bind(null, email.id)}>
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

export default function EmailsTable({ emails }: { emails: WhitelistEmail[] }) {
  if (!emails.length) {
    return (
      <tr>
        <td colSpan={5} className="px-6 py-16 text-center text-zinc-500 italic">
          No whitelisted email addresses.
        </td>
      </tr>
    );
  }
  return <>{emails.map((e) => <EditableRow key={e.id} email={e} />)}</>;
}
