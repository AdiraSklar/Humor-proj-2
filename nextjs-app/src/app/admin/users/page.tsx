import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { UsersPageHeader } from "./_components/UsersPageHeader";
import ExpandableText from "../_components/ExpandableText";

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_superadmin: boolean;
  created_datetime_utc: string | null;
}

type Props = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

const PAGE_SIZE = 100;

/** Format ISO date for display; same output on server and client to avoid hydration mismatch. */
function formatCreatedUtc(iso: string): string {
  const d = new Date(iso);
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()];
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const am = h < 12;
  const h12 = h % 12 || 12;
  const mm = m < 10 ? `0${m}` : String(m);
  return `${mon} ${day}, ${year}, ${h12}:${mm} ${am ? "AM" : "PM"} UTC`;
}

export default async function UsersPage({ searchParams }: Props) {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { q = "", page: pageParam = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("id, email, first_name, last_name, is_superadmin, created_datetime_utc", { count: "exact" })
    .order("created_datetime_utc", { ascending: false })
    .range(from, to);

  if (q.trim()) {
    query = query.ilike("email", `%${q.trim()}%`);
  }

  const { data: users, error, count } = await query.returns<Profile[]>();
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
          <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Users</span>
        </h1>
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-[0.2em]">
          {(count ?? 0).toLocaleString()} Registered Profiles
        </p>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm shadow-2xl">
        <UsersPageHeader defaultValue={q} />

        {error && (
          <p className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            Failed to load users: {error.message}
          </p>
        )}

        <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/50 shadow-inner">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Identity</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Email Address</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {!users?.length ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-zinc-500 italic">
                    {q ? `No matches found for "${q}"` : "The community is currently empty."}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="group transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-bold text-zinc-200">
                      {user.first_name || user.last_name
                        ? [user.first_name, user.last_name].filter(Boolean).join(" ")
                        : <span className="text-zinc-600">Anonymous</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-[10px] uppercase tracking-tighter text-zinc-500 group-hover:text-purple-400 transition-colors">
                        <ExpandableText text={user.id} max={12} />
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      {user.is_superadmin ? (
                        <span className="inline-flex items-center rounded-full bg-purple-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                          Superadmin
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-zinc-800/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border border-white/5">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-medium text-zinc-500 tabular-nums" suppressHydrationWarning>
                      {user.created_datetime_utc ? formatCreatedUtc(user.created_datetime_utc).split(',')[0] : "—"}
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
                href={page > 1 ? `?${new URLSearchParams({ ...(q && { q }), page: String(page - 1) })}` : "#"}
                className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/5 transition-all ${
                  page > 1 ? "bg-zinc-800 text-white hover:bg-purple-500/20 hover:border-purple-500/30" : "bg-zinc-900/50 text-zinc-700 cursor-not-allowed"
                }`}
              >
                ←
              </a>
              <a
                href={page < totalPages ? `?${new URLSearchParams({ ...(q && { q }), page: String(page + 1) })}` : "#"}
                className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/5 transition-all ${
                  page < totalPages ? "bg-zinc-800 text-white hover:bg-purple-500/20 hover:border-purple-500/30" : "bg-zinc-900/50 text-zinc-700 cursor-not-allowed"
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
