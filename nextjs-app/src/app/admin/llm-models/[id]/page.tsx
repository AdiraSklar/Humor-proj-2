import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateModel, deleteModel } from "../actions";

interface LlmModel {
  id: number;
  name: string;
  llm_provider_id: number;
  provider_model_id: string;
  is_temperature_supported: boolean;
}

interface LlmProvider { id: number; name: string; }

type Props = { params: Promise<{ id: string }> };

export default async function EditLlmModelPage({ params }: Props) {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { id } = await params;
  const supabase = await createClient();

  const [{ data: model }, { data: providers }] = await Promise.all([
    supabase
      .from("llm_models")
      .select("id, name, llm_provider_id, provider_model_id, is_temperature_supported")
      .eq("id", Number(id))
      .single<LlmModel>(),
    supabase
      .from("llm_providers")
      .select("id, name")
      .order("name")
      .returns<LlmProvider[]>(),
  ]);

  if (!model) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/admin/llm-models" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-violet-400 transition-colors">
          ← Models
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">Edit</span>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
          Edit <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Model</span>
        </h1>
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-[0.2em]">ID: {model.id}</p>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm shadow-2xl max-w-xl">
        <form action={updateModel} className="space-y-6">
          <input type="hidden" name="id" value={model.id} />

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
              Display Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={model.name}
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
              defaultValue={model.llm_provider_id}
              className="w-full rounded-2xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
            >
              <option value="">Select a provider…</option>
              {providers?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
              Provider Model ID <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="provider_model_id"
              required
              defaultValue={model.provider_model_id}
              className="w-full rounded-2xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white placeholder-zinc-600 font-mono focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_temperature_supported"
              id="temp_edit"
              defaultChecked={model.is_temperature_supported}
              className="h-4 w-4 rounded border-white/10 bg-zinc-900 text-violet-500 focus:ring-violet-500/20"
            />
            <label htmlFor="temp_edit" className="text-sm font-bold text-zinc-300 cursor-pointer">
              Temperature supported
            </label>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              className="flex cursor-pointer items-center gap-2 rounded-2xl border border-violet-500/30 bg-violet-500/10 px-6 py-3 text-xs font-black uppercase tracking-widest text-violet-400 transition-all hover:border-violet-400/50 hover:bg-violet-500/20 active:scale-[0.98]"
            >
              Save Changes
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

      {/* Delete */}
      <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-6 max-w-xl">
        <p className="text-xs font-black uppercase tracking-widest text-red-400/80 mb-1">Danger Zone</p>
        <p className="text-sm text-zinc-500 mb-4">Deleting this model cannot be undone. References in flavor steps and responses will be affected.</p>
        <form action={deleteModel.bind(null, model.id)}>
          <button
            type="submit"
            className="cursor-pointer rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-red-400 transition-all hover:bg-red-500/20 active:scale-[0.98]"
          >
            Delete Model
          </button>
        </form>
      </div>
    </div>
  );
}
