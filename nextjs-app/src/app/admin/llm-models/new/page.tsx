import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { createModel } from "../actions";

interface LlmProvider { id: number; name: string; }

export default async function NewLlmModelPage() {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const supabase = await createClient();
  const { data: providers } = await supabase
    .from("llm_providers")
    .select("id, name")
    .order("name")
    .returns<LlmProvider[]>();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/admin/llm-models" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-violet-400 transition-colors">
          ← Models
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">New</span>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
          New <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Model</span>
        </h1>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm shadow-2xl max-w-xl">
        <form action={createModel} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
              Display Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Claude Sonnet 4.5"
              className="w-full rounded-2xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
              Provider <span className="text-red-400">*</span>
            </label>
            <select
              name="llm_provider_id"
              required
              className="w-full rounded-2xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
            >
              <option value="">Select a provider…</option>
              {providers?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {!providers?.length && (
              <p className="mt-2 text-xs text-amber-400/80">
                No providers found. <Link href="/admin/llm-providers" className="underline">Add one first →</Link>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
              Provider Model ID <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="provider_model_id"
              required
              placeholder="e.g. claude-sonnet-4-5-20251001"
              className="w-full rounded-2xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white placeholder-zinc-600 font-mono focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_temperature_supported"
              id="temp_new"
              className="h-4 w-4 rounded border-white/10 bg-zinc-900 text-violet-500 focus:ring-violet-500/20"
            />
            <label htmlFor="temp_new" className="text-sm font-bold text-zinc-300 cursor-pointer">
              Temperature supported
            </label>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              className="flex cursor-pointer items-center gap-2 rounded-2xl border border-violet-500/30 bg-violet-500/10 px-6 py-3 text-xs font-black uppercase tracking-widest text-violet-400 transition-all hover:border-violet-400/50 hover:bg-violet-500/20 active:scale-[0.98]"
            >
              Create Model
            </button>
            <Link
              href="/admin/llm-models"
              className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
