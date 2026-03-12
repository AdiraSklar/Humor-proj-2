import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { createTerm } from "../actions";

interface TermType { id: number; name: string; }

export default async function NewTermPage() {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const supabase = await createClient();
  const { data: termTypes } = await supabase
    .from("term_types")
    .select("id, name")
    .order("name")
    .returns<TermType[]>();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/admin/terms" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-violet-400 transition-colors">
          ← Terms
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">New</span>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
          New <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Term</span>
        </h1>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm shadow-2xl max-w-2xl">
        <form action={createTerm} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                Term <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="term"
                required
                placeholder="e.g. Irony"
                className="w-full rounded-2xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                Type
              </label>
              <select
                name="term_type_id"
                className="w-full rounded-2xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
              >
                <option value="">No type</option>
                {termTypes?.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
              Definition <span className="text-red-400">*</span>
            </label>
            <textarea
              name="definition"
              required
              rows={3}
              placeholder="Clear definition of the term…"
              className="w-full rounded-2xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
              Example <span className="text-red-400">*</span>
            </label>
            <textarea
              name="example"
              required
              rows={3}
              placeholder="Example usage or sentence…"
              className="w-full rounded-2xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
              Priority
            </label>
            <input
              type="number"
              name="priority"
              defaultValue={0}
              min={0}
              className="w-32 rounded-2xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
            />
            <p className="mt-1 text-xs text-zinc-600">Higher value = shown first.</p>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              className="flex cursor-pointer items-center gap-2 rounded-2xl border border-violet-500/30 bg-violet-500/10 px-6 py-3 text-xs font-black uppercase tracking-widest text-violet-400 transition-all hover:border-violet-400/50 hover:bg-violet-500/20 active:scale-[0.98]"
            >
              Create Term
            </button>
            <Link href="/admin/terms" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}