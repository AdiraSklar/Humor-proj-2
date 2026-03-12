import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

interface HumorFlavor {
  id: number;
  slug: string;
  description: string | null;
  created_datetime_utc: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()];
  return `${mon} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export default async function HumorFlavorsPage() {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const supabase = await createClient();
  const { data: flavors, error } = await supabase
    .from("humor_flavors")
    .select("id, slug, description, created_datetime_utc")
    .order("id", { ascending: true })
    .returns<HumorFlavor[]>();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
          Humor <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Flavors</span>
        </h1>
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-[0.2em]">
          {(flavors?.length ?? 0).toLocaleString()} Flavors · Read-only
        </p>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm shadow-2xl">
        {error && (
          <p className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            Failed to load flavors: {error.message}
          </p>
        )}
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/50 shadow-inner">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Slug</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Description</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-right">Created</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-right">Humor Flavor Steps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {!flavors?.length ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-zinc-500 italic">
                    No humor flavors found.
                  </td>
                </tr>
              ) : (
                flavors.map((f) => (
                  <tr key={f.id} className="group transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-600">{f.id}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-violet-500/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-violet-400 border border-violet-500/20">
                        {f.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 max-w-md">{f.description ?? <span className="text-zinc-600 italic">—</span>}</td>
                    <td className="px-6 py-4 text-right text-xs text-zinc-500 tabular-nums">{formatDate(f.created_datetime_utc)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/humor-flavors/${f.id}`}
                        className="cursor-pointer whitespace-nowrap rounded-xl border border-white/5 bg-zinc-900 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 transition-all hover:bg-violet-500/10 hover:text-violet-400 hover:border-violet-500/20 active:scale-[0.98]"
                      >
                        View →
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
