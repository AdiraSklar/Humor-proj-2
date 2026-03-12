import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

interface LlmModel {
  id: number;
  name: string;
  provider_model_id: string;
  is_temperature_supported: boolean;
  created_datetime_utc: string;
  llm_providers: { name: string } | null;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()];
  return `${mon} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export default async function LlmModelsPage() {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const supabase = await createClient();
  const { data: models, error } = await supabase
    .from("llm_models")
    .select("id, name, provider_model_id, is_temperature_supported, created_datetime_utc, llm_providers(name)")
    .order("created_datetime_utc", { ascending: false })
    .returns<LlmModel[]>();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
            LLM <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Models</span>
          </h1>
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-[0.2em]">
            {(models?.length ?? 0).toLocaleString()} Models
          </p>
        </div>
        <Link
          href="/admin/llm-models/new"
          className="flex cursor-pointer items-center gap-2 rounded-2xl border border-purple-500/30 bg-purple-500/10 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-purple-400 transition-all hover:border-purple-400/50 hover:bg-purple-500/20 active:scale-[0.98] shadow-lg shadow-purple-500/10"
        >
          <span className="text-lg leading-none mt-[-2px]">+</span> Add Model
        </Link>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm shadow-2xl">
        {error && (
          <p className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            Failed to load models: {error.message}
          </p>
        )}
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/50 shadow-inner">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Provider</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Model ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-center">Temp</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-right">Created</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {!models?.length ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-zinc-500 italic">
                    No models yet. <Link href="/admin/llm-models/new" className="text-violet-400 hover:underline">Add one →</Link>
                  </td>
                </tr>
              ) : (
                models.map((m) => (
                  <tr key={m.id} className="group transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-600">{m.id}</td>
                    <td className="px-6 py-4 font-bold text-zinc-200">{m.name}</td>
                    <td className="px-6 py-4 text-zinc-400">
                      {m.llm_providers?.name ?? <span className="text-zinc-600 italic">—</span>}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-500">{m.provider_model_id}</td>
                    <td className="px-6 py-4 text-center">
                      {m.is_temperature_supported ? (
                        <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-400 border border-purple-500/20">Yes</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-zinc-800/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border border-white/5">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-zinc-500 tabular-nums">{formatDate(m.created_datetime_utc)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/llm-models/${m.id}`}
                        className="cursor-pointer rounded-xl border border-white/5 bg-zinc-900 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 transition-all hover:bg-violet-500/10 hover:text-violet-400 hover:border-violet-500/20 active:scale-[0.98]"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
