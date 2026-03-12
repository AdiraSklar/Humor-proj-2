import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { AdminSidebar } from "./_components/AdminSidebar";

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
    <div className="flex min-h-screen bg-zinc-950">
      <AdminSidebar userEmail={user.email ?? ""} />

      {/* Main content */}
      <main className="flex-1 relative selection:bg-violet-500/30">
        {/* Ambient background glow */}
        <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-violet-500/[0.03] blur-[140px] rounded-full pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-fuchsia-500/[0.03] blur-[120px] rounded-full pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-8 lg:px-12 pb-16 pt-8 z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
