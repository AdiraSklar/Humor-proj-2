import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";

interface HumorFlavorStep {
  id: number;
  order_by: number;
  description: string | null;
  llm_temperature: number | null;
  llm_system_prompt: string | null;
  llm_user_prompt: string | null;
  llm_input_type_id: number;
  llm_output_type_id: number;
  humor_flavor_step_type_id: number;
  created_datetime_utc: string;
  humor_flavors: { slug: string } | null;
  llm_models: { name: string } | null;
}

function truncate(str: string | null, max = 80) {
  if (!str) return <span className="text-zinc-600 italic">—</span>;
  return str.length > max ? str.slice(0, max) + "…" : str;
}

export default async function HumorFlavorStepsPage() {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const supabase = await createClient();
  const { data: steps, error } = await supabase
    .from("humor_flavor_steps")
    .select(`
      id, order_by, description, llm_temperature,
      llm_system_prompt, llm_user_prompt,
      llm_input_type_id, llm_output_type_id, humor_flavor_step_type_id,
      created_datetime_utc,
      humor_flavors(slug),
      llm_models(name)
    `)
    .order("humor_flavor_id", { ascending: true })
    .order("order_by", { ascending: true })
    .returns<HumorFlavorStep[]>();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
          Flavor <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Steps</span>
        </h1>
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-[0.2em]">
          {(steps?.length ?? 0).toLocaleString()} Steps · Read-only
        </p>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm shadow-2xl">
        {error && (
          <p className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            Failed to load steps: {error.message}
          </p>
        )}
        <div className="overflow-x-auto overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/50 shadow-inner">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Flavor</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-center">Order</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Model</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-center">Temp</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-center">In / Out / Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Description</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">System Prompt</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">User Prompt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {!steps?.length ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-zinc-500 italic">
                    No flavor steps found.
                  </td>
                </tr>
              ) : (
                steps.map((s) => (
                  <tr key={s.id} className="group transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-600">{s.id}</td>
                    <td className="px-6 py-4">
                      {s.humor_flavors?.slug ? (
                        <span className="inline-flex items-center rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-violet-400 border border-violet-500/20">
                          {s.humor_flavors.slug}
                        </span>
                      ) : <span className="text-zinc-600 italic">—</span>}
                    </td>
                    <td className="px-6 py-4 text-center font-black text-zinc-200">{s.order_by}</td>
                    <td className="px-6 py-4 text-zinc-400 text-xs">
                      {s.llm_models?.name ?? <span className="text-zinc-600 italic">—</span>}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-xs text-zinc-400">
                      {s.llm_temperature ?? <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-xs text-zinc-500">
                      {s.llm_input_type_id} / {s.llm_output_type_id} / {s.humor_flavor_step_type_id}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-xs max-w-[120px]">{truncate(s.description, 60)}</td>
                    <td className="px-6 py-4 text-zinc-500 text-xs font-mono max-w-[180px]">{truncate(s.llm_system_prompt)}</td>
                    <td className="px-6 py-4 text-zinc-500 text-xs font-mono max-w-[180px]">{truncate(s.llm_user_prompt)}</td>
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
