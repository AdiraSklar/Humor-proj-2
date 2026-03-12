import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { createDomain, deleteDomain } from "./actions";

interface AllowedDomain {
  id: number;
  apex_domain: string;
  created_datetime_utc: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()];
  return `${mon} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export default async function AllowedSignupDomainsPage() {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const supabase = await createClient();
  const { data: domains, error } = await supabase
    .from("allowed_signup_domains")
    .select("id, apex_domain, created_datetime_utc")
    .order("created_datetime_utc", { ascending: false })
    .returns<AllowedDomain[]>();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
          Allowed <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Domains</span>
        </h1>
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-[0.2em]">
          {(domains?.length ?? 0).toLocaleString()} Allowed Signup Domains
        </p>
      </div>

      {/* Add form */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm shadow-2xl">
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Add Domain</p>
        <form action={createDomain} className="flex items-center gap-3">
          <input
            type="text"
            name="apex_domain"
            required
            placeholder="e.g. university.edu"
            className="flex-1 rounded-2xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
          />
          <button
            type="submit"
            className="flex cursor-pointer items-center gap-2 rounded-2xl border border-violet-500/30 bg-violet-500/10 px-6 py-3 text-xs font-black uppercase tracking-widest text-violet-400 transition-all hover:border-violet-400/50 hover:bg-violet-500/20 active:scale-[0.98] whitespace-nowrap"
          >
            <span className="text-base leading-none">+</span> Add
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm shadow-2xl">
        {error && (
          <p className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            Failed to load domains: {error.message}
          </p>
        )}
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/50 shadow-inner">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Apex Domain</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Added</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {!domains?.length ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-zinc-500 italic">
                    No allowed domains configured.
                  </td>
                </tr>
              ) : (
                domains.map((d) => (
                  <tr key={d.id} className="group transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-600">{d.id}</td>
                    <td className="px-6 py-4 font-bold text-zinc-200">{d.apex_domain}</td>
                    <td className="px-6 py-4 text-xs text-zinc-500 tabular-nums">{formatDate(d.created_datetime_utc)}</td>
                    <td className="px-6 py-4 text-right">
                      <form action={deleteDomain.bind(null, d.id)}>
                        <button
                          type="submit"
                          className="cursor-pointer rounded-xl border border-white/5 bg-zinc-900 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 active:scale-[0.98]"
                        >
                          Delete
                        </button>
                      </form>
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
