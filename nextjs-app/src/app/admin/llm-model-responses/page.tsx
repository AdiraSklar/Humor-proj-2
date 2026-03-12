import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

interface LlmModelResponse {
  id: string;
  llm_model_response: string | null;
  llm_system_prompt: string;
  llm_user_prompt: string;
  llm_temperature: number | null;
  processing_time_seconds: number;
  created_datetime_utc: string;
  llm_models: { name: string } | null;
  humor_flavors: { slug: string } | null;
  caption_request_id: number;
  llm_prompt_chain_id: number | null;
}

type Props = { searchParams: Promise<{ page?: string }> };
const PAGE_SIZE = 50;

function formatDate(iso: string) {
  const d = new Date(iso);
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()];
  return `${mon} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function truncate(str: string | null, max = 80) {
  if (!str) return <span className="text-zinc-600 italic">—</span>;
  return str.length > max ? str.slice(0, max) + "…" : str;
}

export default async function LlmModelResponsesPage({ searchParams }: Props) {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { page: pageParam = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const { data: responses, error, count } = await supabase
    .from("llm_model_responses")
    .select(`
      id, llm_model_response, llm_system_prompt, llm_user_prompt,
      llm_temperature, processing_time_seconds, created_datetime_utc,
      caption_request_id, llm_prompt_chain_id,
      llm_models(name),
      humor_flavors(slug)
    `, { count: "exact" })
    .order("created_datetime_utc", { ascending: false })
    .range(from, to)
    .returns<LlmModelResponse[]>();

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
          LLM <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Responses</span>
        </h1>
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-[0.2em]">
          {(count ?? 0).toLocaleString()} Responses · Read-only
        </p>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm shadow-2xl">
        {error && (
          <p className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            Failed to load responses: {error.message}
          </p>
        )}
        <div className="overflow-x-auto overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/50 shadow-inner">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Model</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Flavor</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Response</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-center">Time (s)</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-center">Temp</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Request</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {!responses?.length ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-zinc-500 italic">
                    No LLM responses found.
                  </td>
                </tr>
              ) : (
                responses.map((r) => (
                  <tr key={r.id} className="group transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-mono text-[10px] text-zinc-600">{r.id.slice(0, 8)}…</td>
                    <td className="px-6 py-4 text-xs text-zinc-300 whitespace-nowrap">
                      {r.llm_models?.name ?? <span className="text-zinc-600 italic">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      {r.humor_flavors?.slug ? (
                        <span className="inline-flex items-center rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-violet-400 border border-violet-500/20">
                          {r.humor_flavors.slug}
                        </span>
                      ) : <span className="text-zinc-600 italic">—</span>}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-xs max-w-[200px]">{truncate(r.llm_model_response)}</td>
                    <td className="px-6 py-4 text-center font-black text-zinc-200 tabular-nums">{r.processing_time_seconds}</td>
                    <td className="px-6 py-4 text-center font-mono text-xs text-zinc-500">
                      {r.llm_temperature ?? <span className="text-zinc-700">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <Link href="/admin/caption-requests" className="font-mono text-xs text-zinc-500 group-hover:text-fuchsia-400 transition-colors">
                        #{r.caption_request_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-zinc-500 tabular-nums whitespace-nowrap">{formatDate(r.created_datetime_utc)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/5 pt-6">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Link href={`?page=${page - 1}`} className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/5 transition-all ${page > 1 ? "bg-zinc-800 text-white hover:bg-purple-500/20" : "bg-zinc-900/50 text-zinc-700 pointer-events-none"}`}>←</Link>
              <Link href={`?page=${page + 1}`} className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/5 transition-all ${page < totalPages ? "bg-zinc-800 text-white hover:bg-purple-500/20" : "bg-zinc-900/50 text-zinc-700 pointer-events-none"}`}>→</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
