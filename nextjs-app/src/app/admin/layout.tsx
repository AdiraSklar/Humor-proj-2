import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { AdminNav } from "./_components/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await requireSuperadmin();

  if (!result.authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
        <div className="w-full max-w-sm rounded-3xl border border-white/5 bg-zinc-900/50 p-8 text-center shadow-2xl backdrop-blur-md">
          <h1 className="mb-2 text-xl font-semibold text-white">
            Not Authorized
          </h1>
          <p className="text-sm text-zinc-500">
            Your account does not have access to this area.
          </p>
          <form action="/logout" method="POST" className="mt-6">
            <button
              type="submit"
              className="inline-block cursor-pointer rounded-full bg-white px-6 py-2 text-sm font-bold uppercase tracking-widest text-black transition-colors hover:bg-zinc-200"
            >
              Sign out
            </button>
          </form>
        </div>
      </main>
    );
  }

  const { user } = result;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Top Utility Bar */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1600px] px-6 py-4 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 shadow-lg shadow-violet-500/20 transition-transform group-hover:scale-110">
              <span className="text-sm font-bold text-white leading-none">C</span>
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white uppercase group-hover:text-violet-400 transition-colors">
                Cracked AI
              </h1>
              <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase -mt-0.5">Admin Central</p>
            </div>
          </Link>

          {/* Profile Actions */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">Active Admin</p>
              <p className="text-xs font-black text-white tabular-nums tracking-tight">
                {user.email}
              </p>
            </div>

            <form action="/logout" method="POST">
              <button
                type="submit"
                className="flex cursor-pointer items-center justify-center rounded-xl border border-white/5 bg-zinc-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 active:scale-[0.98]"
              >
                Sign out
              </button>
            </form>

            <Link
              href="/"
              className="group flex cursor-pointer items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-violet-400 transition-all hover:border-violet-400/50 hover:bg-violet-500/20 active:scale-[0.98] shadow-lg shadow-violet-500/5"
            >
              Return to Dashboard
              <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Secondary Navigation (Below Header) */}
      <div className="relative py-12 flex justify-center z-40 bg-zinc-950">
        <div className="inline-flex p-1.5 rounded-[2rem] bg-zinc-900/50 border border-white/5 backdrop-blur-sm shadow-2xl">
          <AdminNav />
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 relative selection:bg-violet-500/30">
        {/* Ambient background glow */}
        <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-violet-500/[0.03] blur-[140px] rounded-full pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-fuchsia-500/[0.03] blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative mx-auto max-w-[1600px] px-8 pb-32 lg:px-12 z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
