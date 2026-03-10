import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { DeleteButton } from "./_components/DeleteButton";

interface Image {
  id: string;
  url: string;
  profile_id: string | null;
  is_public: boolean;
  created_datetime_utc: string | null;
  modified_datetime_utc: string | null;
}

type Props = {
  searchParams: Promise<{ page?: string; q?: string; filter?: string }>;
};

const PAGE_SIZE = 30;

function formatDateShort(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function ImagesPage({ searchParams }: Props) {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { page: pageParam = "1", q = "", filter = "all" } = await searchParams;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  let query = supabase
    .from("images")
    .select("id, url, profile_id, is_public, created_datetime_utc, modified_datetime_utc", { count: "exact" })
    .order("created_datetime_utc", { ascending: false })
    .range(from, to);

  if (q.trim()) query = query.ilike("url", `%${q.trim()}%`);
  if (filter === "public") query = query.eq("is_public", true);

  const { data: images, error, count } = await query.returns<Image[]>();
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  function filterHref(f: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (f !== "all") params.set("filter", f);
    const qs = params.toString();
    return `/admin/images${qs ? `?${qs}` : ""}`;
  }

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (filter !== "all") params.set("filter", filter);
    params.set("page", String(p));
    return `/admin/images?${params.toString()}`;
  }

  const filters = [
    { key: "all", label: "All" },
    { key: "public", label: "Public" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
            Image <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Gallery</span>
          </h1>
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-[0.2em]">
            {(count ?? 0).toLocaleString()} Media Items
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <form action="/admin/images" method="GET" className="relative group">
            {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search assets..."
              className="h-11 w-64 rounded-2xl border border-white/5 bg-zinc-900/50 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:border-purple-500/50 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all"
            />
          </form>

          {/* Filter tabs */}
          <div className="flex items-center rounded-2xl border border-white/5 bg-zinc-900/50 p-1 backdrop-blur-sm">
            {filters.map(({ key, label }) => {
              const active = filter === key;
              return (
                <Link
                  key={key}
                  href={filterHref(key)}
                  className={
                    active
                      ? "cursor-pointer rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 shadow-lg shadow-purple-500/5"
                      : "cursor-pointer rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-500 transition-all hover:text-zinc-300 hover:bg-white/5"
                  }
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Upload */}
          <Link
            href="/admin/images/new"
            className="flex cursor-pointer items-center gap-2 rounded-2xl border border-purple-500/30 bg-purple-500/10 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-purple-400 transition-all hover:border-purple-400/50 hover:bg-purple-500/20 active:scale-[0.98] shadow-lg shadow-purple-500/10"
          >
            <span className="text-lg leading-none mt-[-2px]">+</span> Upload
          </Link>
        </div>
      </div>

      {error && (
        <p className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Failed to load images: {error.message}
        </p>
      )}

      {/* Grid */}
      {!images?.length ? (
        <div className="rounded-3xl border border-white/5 bg-zinc-900/30 py-24 text-center backdrop-blur-sm">
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest italic">No assets found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative flex flex-col gap-3 p-3 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-sm transition-all hover:border-purple-500/30 hover:bg-zinc-900/60 hover:shadow-2xl hover:shadow-purple-500/5"
            >
              {/* Thumbnail */}
              <div className="aspect-square overflow-hidden rounded-2xl bg-zinc-950 border border-white/5 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Badges */}
                {img.is_public && (
                  <div className="absolute left-3 top-3">
                    <span className="rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-widest bg-purple-500 text-white leading-none shadow-2xl">
                      Public
                    </span>
                  </div>
                )}

                {/* Hover actions Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/60 opacity-0 transition-all duration-300 backdrop-blur-[2px] group-hover:opacity-100 rounded-2xl p-4">
                  <Link
                    href={`/admin/images/${img.id}`}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-950 shadow-xl hover:bg-purple-100 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Link>
                  <DeleteButton id={img.id} />
                </div>
              </div>

              {/* Date Footer */}
              <div className="px-1 flex justify-between items-center" suppressHydrationWarning>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400 transition-colors">
                  {formatDateShort(img.created_datetime_utc)}
                </p>
                <span className="text-[10px] font-mono text-zinc-700 group-hover:text-purple-500/50">
                  {img.id.slice(0, 6)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-between gap-4 border-t border-white/5 pt-8 bg-zinc-900/20 p-6 rounded-3xl">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Link
              href={pageHref(page - 1)}
              className={`flex h-12 w-12 items-center justify-center rounded-full border border-white/5 transition-all ${
                page > 1 ? "bg-zinc-800 text-white hover:bg-purple-500/20 hover:border-purple-500/30" : "bg-zinc-900/50 text-zinc-700 pointer-events-none"
              }`}
            >
              ←
            </Link>
            <Link
              href={pageHref(page + 1)}
              className={`flex h-12 w-12 items-center justify-center rounded-full border border-white/5 transition-all ${
                page < totalPages ? "bg-zinc-800 text-white hover:bg-purple-500/20 hover:border-purple-500/30" : "bg-zinc-900/50 text-zinc-700 pointer-events-none"
              }`}
            >
              →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
