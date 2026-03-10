import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { FilterBar } from "./_components/FilterBar";

interface Caption {
  id: string;
  content: string | null;
  like_count: number | null;
  is_public: boolean;
  is_featured: boolean;
  created_datetime_utc: string | null;
  profile_id: string | null;
  image_id: string | null;
  images: { url: string } | null;
}

type Props = {
  searchParams: Promise<{ image_id?: string; profile_id?: string; page?: string }>;
};

const PAGE_SIZE = 50;

/** Stable date formatting to prevent hydration mismatch */
function formatDateStable(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()];
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  return `${mon} ${day}, ${year}`;
}

function Flag({ value }: { value: boolean }) {
  return value ? (
    <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-400 border border-purple-500/20">
      Yes
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
      No
    </span>
  );
}

export default async function CaptionsPage({ searchParams }: Props) {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { image_id = "", profile_id = "", page: pageParam = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase
    .from("captions")
    .select(
      "id, content, like_count, is_public, is_featured, created_datetime_utc, profile_id, image_id, images(url)",
      { count: "exact" }
    )
    .order("created_datetime_utc", { ascending: false })
    .range(from, to);

  if (image_id.trim()) query = query.eq("image_id", image_id.trim());
  if (profile_id.trim()) query = query.eq("profile_id", profile_id.trim());

  const { data: captions, error, count } = await query.returns<Caption[]>();
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const activeFilters = [
    image_id && `image: ${image_id.slice(0, 8)}…`,
    profile_id && `profile: ${profile_id.slice(0, 8)}…`,
  ].filter(Boolean);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
          <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Captions</span>
        </h1>
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-[0.2em]">
          {(count ?? 0).toLocaleString()} Community Submissions
        </p>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm shadow-2xl">
        <div className="mb-6">
          <FilterBar imageId={image_id} profileId={profile_id} />
          {activeFilters.length > 0 && (
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-purple-400/80">
              Filtering by {activeFilters.join(", ")}
            </p>
          )}
        </div>

        {error && (
          <p className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            Failed to load captions: {error.message}
          </p>
        )}

        <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/50 shadow-inner">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Preview</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Content</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-center">Likes</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-center">Flags</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {!captions?.length ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-zinc-500 italic">
                    {activeFilters.length ? "No captions match your current filters." : "No community captions found."}
                  </td>
                </tr>
              ) : (
                captions.map((caption) => (
                  <tr key={caption.id} className="group transition-colors hover:bg-white/[0.02]">
                    {/* Thumbnail */}
                    <td className="px-6 py-4">
                      {caption.images?.url ? (
                        <a
                          href={caption.images.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block relative h-12 w-12 rounded-xl overflow-hidden border border-white/10 group-hover:border-purple-500/50 transition-colors shadow-lg"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={caption.images.url} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                        </a>
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-zinc-800 border border-white/5" />
                      )}
                    </td>

                    {/* Content */}
                    <td className="px-6 py-4">
                      <p className="text-zinc-200 font-medium leading-relaxed max-w-md group-hover:text-white transition-colors">
                        {caption.content || <span className="text-zinc-600 italic">Empty caption</span>}
                      </p>
                      <div className="flex gap-3 mt-1.5">
                        <span className="text-[9px] font-mono uppercase tracking-tighter text-zinc-500 group-hover:text-purple-400">ID: {caption.id.slice(0, 8)}</span>
                        {caption.profile_id && <span className="text-[9px] font-mono uppercase tracking-tighter text-zinc-500 group-hover:text-fuchsia-400">User: {caption.profile_id.slice(0, 8)}</span>}
                      </div>
                    </td>

                    {/* Likes */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-black text-white tabular-nums tracking-tighter">
                        {caption.like_count ?? 0}
                      </span>
                    </td>

                    {/* Flags */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Pub</span>
                          <Flag value={caption.is_public} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Feat</span>
                          <Flag value={caption.is_featured} />
                        </div>
                      </div>
                    </td>

                    {/* Created */}
                    <td className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-zinc-500 tabular-nums" suppressHydrationWarning>
                      {formatDateStable(caption.created_datetime_utc)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/5 pt-6">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <a
                href={page > 1 ? `?${new URLSearchParams({ ...(image_id && { image_id }), ...(profile_id && { profile_id }), page: String(page - 1) })}` : "#"}
                className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/5 transition-all ${
                  page > 1 ? "bg-zinc-800 text-white hover:bg-purple-500/20 hover:border-purple-500/30" : "bg-zinc-900/50 text-zinc-700 cursor-not-allowed"
                }`}
              >
                ←
              </a>
              <a
                href={page < totalPages ? `?${new URLSearchParams({ ...(image_id && { image_id }), ...(profile_id && { profile_id }), page: String(page + 1) })}` : "#"}
                className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/5 transition-all ${
                  page < totalPages ? "bg-zinc-900 text-white hover:bg-purple-500/20 hover:border-purple-500/30" : "bg-zinc-900/50 text-zinc-700 cursor-not-allowed"
                }`}
              >
                →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
