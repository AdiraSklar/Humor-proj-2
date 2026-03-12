import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { updateFlavorMix } from "./actions";

interface HumorFlavorMix {
  id: number;
  caption_count: number;
  created_datetime_utc: string;
  humor_flavors: { slug: string; description: string | null } | null;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()];
  return `${mon} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export default async function HumorFlavorMixPage() {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const supabase = await createClient();
  const { data: mixes, error } = await supabase
    .from("humor_flavor_mix")
    .select("id, caption_count, created_datetime_utc, humor_flavors(slug, description)")
    .order("id", { ascending: true })
    .returns<HumorFlavorMix[]>();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
          Flavor <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Mix</span>
        </h1>
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-[0.2em]">
          {(mixes?.length ?? 0).toLocaleString()} Flavor Targets · caption_count editable
        </p>
      </div>

      {error && (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Failed to load flavor mix: {error.message}
        </p>
      )}

      {!mixes?.length ? (
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-12 text-center backdrop-blur-sm">
          <p className="text-sm text-zinc-500 italic">No flavor mix rows found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mixes.map((mix) => (
            <div
              key={mix.id}
              className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm shadow-2xl"
            >
              <div className="flex flex-wrap items-center justify-between gap-6">
                {/* Flavor info */}
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center rounded-full bg-violet-500/10 px-3 py-1 text-sm font-black uppercase tracking-widest text-violet-400 border border-violet-500/20">
                    {mix.humor_flavors?.slug ?? `flavor #${mix.id}`}
                  </span>
                  {mix.humor_flavors?.description && (
                    <p className="text-sm text-zinc-500 max-w-xs">{mix.humor_flavors.description}</p>
                  )}
                  <p className="text-[10px] font-mono text-zinc-700">added {formatDate(mix.created_datetime_utc)}</p>
                </div>

                {/* Inline edit form */}
                <form action={updateFlavorMix} className="flex items-center gap-3">
                  <input type="hidden" name="id" value={mix.id} />
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap">
                      Caption Count
                    </label>
                    <input
                      type="number"
                      name="caption_count"
                      defaultValue={mix.caption_count}
                      min={0}
                      required
                      className="w-24 rounded-xl border border-white/5 bg-zinc-950/50 px-3 py-2 text-sm text-white text-center font-black tabular-nums focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="cursor-pointer rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-violet-400 transition-all hover:bg-violet-500/15 hover:border-violet-500/40 active:scale-[0.98]"
                  >
                    Save
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
