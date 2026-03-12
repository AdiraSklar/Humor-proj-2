"use client";

import { useTransition, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { updateTermField } from "../actions";

interface Term {
  id: number;
  term: string;
  definition: string;
  example: string;
  priority: number;
  term_type_id: number | null;
  created_datetime_utc: string;
  term_types: { name: string } | null;
}

interface TermType {
  id: number;
  name: string;
}

interface EditingCell {
  id: number;
  field: "term" | "definition" | "example" | "priority" | "term_type_id";
  value: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()];
  return `${mon} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export default function TermsTable({
  terms: initialTerms,
  termTypes,
  q,
}: {
  terms: Term[];
  termTypes: TermType[];
  q: string;
}) {
  const [terms, setTerms] = useState(initialTerms);
  const [editing, setEditing] = useState<EditingCell | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>(null);

  // Keep local state in sync when server re-renders with new data (pagination / search)
  useEffect(() => { setTerms(initialTerms); }, [initialTerms]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function startEdit(term: Term, field: EditingCell["field"]) {
    const raw =
      field === "term_type_id" ? String(term.term_type_id ?? "")
      : field === "priority" ? String(term.priority)
      : String((term as unknown as Record<string, unknown>)[field] ?? "");
    setEditing({ id: term.id, field, value: raw });
  }

  function cancelEdit() { setEditing(null); }

  function commitEdit() {
    if (!editing) return;
    const { id, field, value } = editing;

    let parsed: string | number | null = value;
    if (field === "priority") parsed = Number(value) || 0;
    if (field === "term_type_id") parsed = value === "" ? null : Number(value);

    // Optimistic update
    setTerms((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, [field]: parsed };
        if (field === "term_type_id") {
          const found = termTypes.find((tt) => tt.id === (parsed as number));
          updated.term_types = found ? { name: found.name } : null;
        }
        return updated;
      })
    );
    setEditing(null);

    startTransition(async () => {
      try {
        await updateTermField(id, field, parsed);
      } catch {
        // revert on error
        setTerms(initialTerms);
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && e.currentTarget.tagName !== "TEXTAREA") { e.preventDefault(); commitEdit(); }
    if (e.key === "Escape") cancelEdit();
  }

  function EditableCell({
    term,
    field,
    children,
    className = "",
  }: {
    term: Term;
    field: EditingCell["field"];
    children: React.ReactNode;
    className?: string;
  }) {
    const isActive = editing?.id === term.id && editing?.field === field;

    if (isActive) {
      if (field === "definition" || field === "example") {
        return (
          <td className={`px-6 py-2 ${className}`}>
            <textarea
              ref={inputRef as React.Ref<HTMLTextAreaElement>}
              value={editing.value}
              rows={4}
              onChange={(e) => setEditing({ ...editing, value: e.target.value })}
              onBlur={commitEdit}
              onKeyDown={(e) => { if (e.key === "Escape") cancelEdit(); }}
              className="w-full min-w-[280px] rounded-xl border border-violet-500/50 bg-zinc-900 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-y"
            />
          </td>
        );
      }
      if (field === "term_type_id") {
        return (
          <td className={`px-6 py-2 ${className}`}>
            <select
              ref={inputRef as React.Ref<HTMLSelectElement>}
              value={editing.value}
              onChange={(e) => setEditing({ ...editing, value: e.target.value })}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              className="rounded-xl border border-violet-500/50 bg-zinc-900 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              <option value="">— none —</option>
              {termTypes.map((tt) => (
                <option key={tt.id} value={tt.id}>{tt.name}</option>
              ))}
            </select>
          </td>
        );
      }
      return (
        <td className={`px-6 py-2 ${className}`}>
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type={field === "priority" ? "number" : "text"}
            value={editing.value}
            onChange={(e) => setEditing({ ...editing, value: e.target.value })}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="w-full rounded-xl border border-violet-500/50 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        </td>
      );
    }

    return (
      <td
        className={`px-6 py-4 cursor-pointer hover:bg-violet-500/5 group/cell transition-colors ${className}`}
        onClick={() => startEdit(term, field)}
        title="Click to edit"
      >
        <span className="group-hover/cell:text-violet-300 transition-colors">{children}</span>
      </td>
    );
  }

  if (!terms.length) {
    return (
      <tr>
        <td colSpan={6} className="px-6 py-16 text-center text-zinc-500 italic">
          {q ? `No terms matching "${q}".` : "No terms yet."}
        </td>
      </tr>
    );
  }

  return (
    <>
      {terms.map((t) => (
        <tr key={t.id} className={`group transition-colors hover:bg-white/[0.02] ${isPending ? "opacity-70" : ""}`}>
          <EditableCell term={t} field="term" className="font-bold text-zinc-200">
            {t.term}
          </EditableCell>

          <EditableCell term={t} field="term_type_id">
            {t.term_types?.name ? (
              <span className="inline-flex items-center rounded-full bg-zinc-800/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border border-white/5">
                {t.term_types.name}
              </span>
            ) : <span className="text-zinc-700 italic text-xs">—</span>}
          </EditableCell>

          <EditableCell term={t} field="definition" className="text-zinc-400 text-xs max-w-xs">
            <span className="line-clamp-2">{t.definition}</span>
          </EditableCell>

          <EditableCell term={t} field="priority" className="text-center font-black text-zinc-300 tabular-nums">
            {t.priority}
          </EditableCell>

          <td className="px-6 py-4 text-right text-xs text-zinc-500 tabular-nums whitespace-nowrap">
            {formatDate(t.created_datetime_utc)}
          </td>

          <td className="px-6 py-4 text-right">
            <Link
              href={`/admin/terms/${t.id}`}
              className="cursor-pointer rounded-xl border border-white/5 bg-zinc-900 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 transition-all hover:bg-violet-500/10 hover:text-violet-400 hover:border-violet-500/20 active:scale-[0.98]"
            >
              Edit
            </Link>
          </td>
        </tr>
      ))}
    </>
  );
}
