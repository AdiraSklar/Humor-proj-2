import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import FlavorMixList from "./_components/FlavorMixList";

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
        <FlavorMixList mixes={mixes} allFlavors={allFlavors ?? []} />
      )}
    </div>
  );
}