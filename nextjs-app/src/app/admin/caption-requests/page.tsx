import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

interface CaptionRequest {
  id: number;
  profile_id: string;
  image_id: string;
  created_datetime_utc: string;
}

type Props = {
  searchParams: Promise<{ page?: string }>;
};

const PAGE_SIZE = 50;

function formatDate(iso: string) {
  const d = new Date(iso);
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()];
  return `${mon} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export default async function CaptionRequestsPage({ searchParams }: Props) {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { page: pageParam = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const { data: requests, error, count } = await supabase
    .from("caption_requests")
    .select("id, profile_id, image_id, created_datetime_utc", { count: "exact" })
    .order("created_datetime_utc", { ascending: false })
    .range(from, to)
    .returns<CaptionRequest[]>();

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  function pageHref(p: number) {
    return `/admin/caption-requests?page=${p}`;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
          Caption <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Requests</span>
        </h1>
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-[0.2em]">
          {(count ?? 0).toLocaleString()} Requests · Read-only
        </p>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm shadow-2xl">
        {error && (
          <p className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            Failed to load requests: {error.message}
          </p>
        )}
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/50 shadow-inner">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Profile</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Image</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {!requests?.length ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-zinc-500 italic">
                    No caption requests found.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="group transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-600">{r.id}</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/users`}
                        className="font-mono text-[10px] text-zinc-500 group-hover:text-violet-400 transition-colors"
                        title={r.profile_id}
                      >
                        {r.profile_id.slice(0, 12)}…
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/images/${r.image_id}`}
                        className="font-mono text-[10px] text-zinc-500 group-hover:text-fuchsia-400 transition-colors"
                        title={r.image_id}
                      >
                        {r.image_id.slice(0, 12)}…
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-zinc-500 tabular-nums">{formatDate(r.created_datetime_utc)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/5 pt-6">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Link
                href={pageHref(page - 1)}
                className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/5 transition-all ${
                  page > 1 ? "bg-zinc-800 text-white hover:bg-purple-500/20 hover:border-purple-500/30" : "bg-zinc-900/50 text-zinc-700 pointer-events-none"
                }`}
              >←</Link>
              <Link
                href={pageHref(page + 1)}
                className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/5 transition-all ${
                  page < totalPages ? "bg-zinc-800 text-white hover:bg-purple-500/20 hover:border-purple-500/30" : "bg-zinc-900/50 text-zinc-700 pointer-events-none"
                }`}
              >→</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}