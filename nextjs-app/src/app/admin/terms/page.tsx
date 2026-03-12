import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import TermsTable from "./_components/TermsTable";

interface Term {
  id: number;
  term: string;
  definition: string;
  example: string;
  priority: number;
  term_type_id: number | null;
  created_datetime_utc: string;
  term_types: { name: string } | null;
}

interface TermType {
  id: number;
  name: string;
}

type Props = { searchParams: Promise<{ page?: string; q?: string }> };
const PAGE_SIZE = 50;

export default async function TermsPage({ searchParams }: Props) {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { page: pageParam = "1", q = "" } = await searchParams;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  let query = supabase
    .from("terms")
    .select("id, term, definition, example, priority, term_type_id, created_datetime_utc, term_types(name)", { count: "exact" })
    .order("priority", { ascending: false })
    .order("term", { ascending: true })
    .range(from, to);

  if (q.trim()) query = query.ilike("term", `%${q.trim()}%`);

  const [{ data: terms, error, count }, { data: termTypes }] = await Promise.all([
    query.returns<Term[]>(),
    supabase.from("term_types").select("id, name").order("name").returns<TermType[]>(),
  ]);
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
            <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Terms</span>
          </h1>
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-[0.2em]">
            {(count ?? 0).toLocaleString()} Terms
          </p>
        </div>
        <div className="flex items-center gap-4">
          <form action="/admin/terms" method="GET" className="relative group">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search terms…"
              className="h-11 w-56 rounded-2xl border border-white/5 bg-zinc-900/50 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:border-purple-500/50 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all"
            />
          </form>
          <Link
            href="/admin/terms/new"
            className="flex cursor-pointer items-center gap-2 rounded-2xl border border-purple-500/30 bg-purple-500/10 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-purple-400 transition-all hover:border-purple-400/50 hover:bg-purple-500/20 active:scale-[0.98] shadow-lg shadow-purple-500/10"
          >
            <span className="text-lg leading-none mt-[-2px]">+</span> New Term
          </Link>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm shadow-2xl">
        {error && (
          <p className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            Failed to load terms: {error.message}
          </p>
        )}
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/50 shadow-inner">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Term</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Definition</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-center">Priority</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-right">Created</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <TermsTable terms={terms ?? []} termTypes={termTypes ?? []} q={q} />
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/5 pt-6">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Link href={`?${new URLSearchParams({ ...(q && { q }), page: String(page - 1) })}`} className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/5 transition-all ${page > 1 ? "bg-zinc-800 text-white hover:bg-purple-500/20" : "bg-zinc-900/50 text-zinc-700 pointer-events-none"}`}>←</Link>
              <Link href={`?${new URLSearchParams({ ...(q && { q }), page: String(page + 1) })}`} className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/5 transition-all ${page < totalPages ? "bg-zinc-800 text-white hover:bg-purple-500/20" : "bg-zinc-900/50 text-zinc-700 pointer-events-none"}`}>→</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
