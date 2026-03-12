import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { updateFlavorMix } from "./actions";

interface HumorFlavorMix {
  id: number;
  humor_flavor_id: number;
  caption_count: number;
  created_datetime_utc: string;
  humor_flavors: { slug: string; description: string | null } | null;
}

interface HumorFlavor {
  id: number;
  slug: string;
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
  const [{ data: mixes, error }, { data: allFlavors }] = await Promise.all([
    supabase
      .from("humor_flavor_mix")
      .select("id, humor_flavor_id, caption_count, created_datetime_utc, humor_flavors(slug, description)")
      .order("id", { ascending: true })
      .returns<HumorFlavorMix[]>(),
    supabase
      .from("humor_flavors")
      .select("id, slug")
      .order("slug", { ascending: true })
      .returns<HumorFlavor[]>(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
          Flavor <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Mix</span>
        </h1>
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-[0.2em]">
          {(mixes?.length ?? 0).toLocaleString()} Flavor Targets
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
              <form action={updateFlavorMix} className="flex flex-wrap items-end gap-6">
                <input type="hidden" name="id" value={mix.id} />

                {/* Flavor dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                    Humor Flavor
                  </label>
                  <select
                    name="humor_flavor_id"
                    defaultValue={mix.humor_flavor_id}
                    className="rounded-xl border border-white/5 bg-zinc-950/50 px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                  >
                    {allFlavors?.map((f) => (
                      <option key={f.id} value={f.id}>{f.slug}</option>
                    ))}
                  </select>
                </div>

                {/* Caption count */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                    Caption Count
                  </label>
                  <input
                    type="number"
                    name="caption_count"
                    defaultValue={mix.caption_count}
                    min={0}
                    required
                    className="w-28 rounded-xl border border-white/5 bg-zinc-950/50 px-3 py-2 text-sm text-white text-center font-black tabular-nums focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                  />
                </div>

                {/* Save */}
                <button
                  type="submit"
                  className="cursor-pointer rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-violet-400 transition-all hover:bg-violet-500/15 hover:border-violet-500/40 active:scale-[0.98]"
                >
                  Save
                </button>

                {/* Meta */}
                <p className="ml-auto self-center text-[10px] font-mono text-zinc-700">
                  id:{mix.id} · added {formatDate(mix.created_datetime_utc)}
                </p>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}