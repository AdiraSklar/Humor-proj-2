import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

interface HumorFlavor {
  id: number;
  slug: string;
  description: string | null;
  created_datetime_utc: string;
}

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
  llm_models: { name: string; provider_model_id: string } | null;
}

type Props = { params: Promise<{ id: string }> };

function formatDate(iso: string) {
  const d = new Date(iso);
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()];
  return `${mon} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

const STEP_TYPE_LABELS: Record<number, string> = {
  1: "Recognition",
  2: "Description",
  3: "Generation",
};

const INPUT_LABELS: Record<number, string> = {
  1: "Image",
  2: "Text",
};

const OUTPUT_LABELS: Record<number, string> = {
  1: "Text",
  2: "Array",
};

function truncate(str: string | null, max = 120) {
  if (!str) return null;
  return str.length > max ? str.slice(0, max) + "…" : str;
}

export default async function HumorFlavorDetailPage({ params }: Props) {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { id } = await params;
  const supabase = await createClient();

  const [{ data: flavor }, { data: steps }] = await Promise.all([
    supabase
      .from("humor_flavors")
      .select("id, slug, description, created_datetime_utc")
      .eq("id", Number(id))
      .single<HumorFlavor>(),
    supabase
      .from("humor_flavor_steps")
      .select(`
        id, order_by, description, llm_temperature,
        llm_system_prompt, llm_user_prompt,
        llm_input_type_id, llm_output_type_id, humor_flavor_step_type_id,
        llm_models(name, provider_model_id)
      `)
      .eq("humor_flavor_id", Number(id))
      .order("order_by", { ascending: true })
      .returns<HumorFlavorStep[]>(),
  ]);

  if (!flavor) notFound();

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/humor-flavors"
          className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-violet-400 transition-colors"
        >
          ← Humor Flavors
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">{flavor.slug}</span>
      </div>

      {/* Flavor header */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full bg-violet-500/10 px-4 py-1.5 text-sm font-black uppercase tracking-widest text-violet-400 border border-violet-500/20">
              {flavor.slug}
            </span>
            <p className="text-zinc-300 text-sm max-w-xl">
              {flavor.description ?? <span className="text-zinc-600 italic">No description.</span>}
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Flavor ID</p>
            <p className="font-mono text-xs text-zinc-500">{flavor.id}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 mt-2">Created</p>
            <p className="text-xs text-zinc-500">{formatDate(flavor.created_datetime_utc)}</p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-black uppercase tracking-widest text-zinc-300">Pipeline Steps</h2>
          <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-black text-zinc-500">
            {steps?.length ?? 0}
          </span>
        </div>

        {!steps?.length ? (
          <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-12 text-center backdrop-blur-sm">
            <p className="text-sm text-zinc-500 italic">No steps defined for this flavor.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm shadow-lg"
              >
                {/* Step header row */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {/* Order badge */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-sm font-black text-violet-400">
                    {idx + 1}
                  </div>

                  {/* Step type */}
                  <span className="rounded-xl bg-zinc-800 border border-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {STEP_TYPE_LABELS[step.humor_flavor_step_type_id] ?? `Type ${step.humor_flavor_step_type_id}`}
                  </span>

                  {/* Model */}
                  {step.llm_models && (
                    <span className="text-xs font-bold text-zinc-300">
                      {step.llm_models.name}
                      <span className="ml-1.5 font-mono text-[10px] text-zinc-600">
                        ({step.llm_models.provider_model_id})
                      </span>
                    </span>
                  )}

                  {/* Temperature */}
                  {step.llm_temperature != null && (
                    <span className="rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-fuchsia-400">
                      temp {step.llm_temperature}
                    </span>
                  )}

                  {/* Input → Output */}
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                    {INPUT_LABELS[step.llm_input_type_id] ?? step.llm_input_type_id}
                    {" → "}
                    {OUTPUT_LABELS[step.llm_output_type_id] ?? step.llm_output_type_id}
                  </span>

                  {/* Step ID */}
                  <span className="font-mono text-[9px] text-zinc-700">id:{step.id}</span>
                </div>

                {/* Description */}
                {step.description && (
                  <p className="mb-4 text-sm font-medium text-zinc-300">{step.description}</p>
                )}

                {/* Prompts */}
                {(step.llm_system_prompt || step.llm_user_prompt) && (
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {step.llm_system_prompt && (
                      <div className="rounded-2xl border border-white/5 bg-zinc-950/60 p-4">
                        <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-zinc-600">System Prompt</p>
                        <p className="font-mono text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap break-words">
                          {truncate(step.llm_system_prompt, 300)}
                        </p>
                      </div>
                    )}
                    {step.llm_user_prompt && (
                      <div className="rounded-2xl border border-white/5 bg-zinc-950/60 p-4">
                        <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-zinc-600">User Prompt</p>
                        <p className="font-mono text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap break-words">
                          {truncate(step.llm_user_prompt, 300)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
