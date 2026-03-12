import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ExpandableText from "../_components/ExpandableText";

interface CaptionExample {
  id: number;
  image_description: string;
  caption: string;
  explanation: string;
  priority: number;
  image_id: string | null;
  created_datetime_utc: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()];
  return `${mon} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}


export default async function CaptionExamplesPage() {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const supabase = await createClient();
  const { data: examples, error } = await supabase
    .from("caption_examples")
    .select("id, image_description, caption, explanation, priority, image_id, created_datetime_utc")
    .order("priority", { ascending: false })
    .order("created_datetime_utc", { ascending: false })
    .returns<CaptionExample[]>();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
            Caption <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Examples</span>
          </h1>
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-[0.2em]">
            {(examples?.length ?? 0).toLocaleString()} Few-shot Examples
          </p>
        </div>
        <Link
          href="/admin/caption-examples/new"
          className="flex cursor-pointer items-center gap-2 rounded-2xl border border-purple-500/30 bg-purple-500/10 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-purple-400 transition-all hover:border-purple-400/50 hover:bg-purple-500/20 active:scale-[0.98] shadow-lg shadow-purple-500/10"
        >
          <span className="text-lg leading-none mt-[-2px]">+</span> New Example
        </Link>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm shadow-2xl">
        {error && (
          <p className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            Failed to load examples: {error.message}
          </p>
        )}
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/50 shadow-inner">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-center">Pri</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Image Description</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Caption</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Explanation</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Image</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-right">Created</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {!examples?.length ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-zinc-500 italic">
                    No caption examples yet. <Link href="/admin/caption-examples/new" className="text-violet-400 hover:underline">Add one →</Link>
                  </td>
                </tr>
              ) : (
                examples.map((ex) => (
                  <tr key={ex.id} className="group transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-4 text-center font-black text-zinc-300 tabular-nums">{ex.priority}</td>
                    <td className="px-6 py-4 text-zinc-400 text-xs max-w-[160px]"><ExpandableText text={ex.image_description} max={80} /></td>
                    <td className="px-6 py-4 text-zinc-200 text-xs max-w-[160px] font-medium"><ExpandableText text={ex.caption} max={80} /></td>
                    <td className="px-6 py-4 text-zinc-500 text-xs max-w-[160px]"><ExpandableText text={ex.explanation} max={80} /></td>
                    <td className="px-6 py-4">
                      {ex.image_id ? (
                        <Link
                          href={`/admin/images/${ex.image_id}`}
                          className="font-mono text-[10px] text-zinc-500 group-hover:text-fuchsia-400 transition-colors"
                          title={ex.image_id}
                        >
                          {ex.image_id.slice(0, 8)}…
                        </Link>
                      ) : <span className="text-zinc-700 italic text-xs">—</span>}
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-zinc-500 tabular-nums">{formatDate(ex.created_datetime_utc)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/caption-examples/${ex.id}`}
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
