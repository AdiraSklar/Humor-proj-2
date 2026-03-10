"use client";

export function SearchInput({ defaultValue }: { defaultValue: string }) {
  return (
    <form action="/admin/users" method="GET" className="flex gap-3">
      <div className="relative group">
        <input
          type="text"
          name="q"
          defaultValue={defaultValue}
          placeholder="Search by email…"
          className="h-11 w-72 rounded-2xl border border-white/5 bg-zinc-950/50 pl-4 pr-10 text-sm text-white placeholder-zinc-600 focus:border-purple-500/50 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all shadow-inner"
        />
        <a
          href="/admin/users"
          aria-label="Clear search"
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors ${defaultValue ? "" : "pointer-events-none invisible"}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </a>
      </div>
      <button
        type="submit"
        className="h-11 cursor-pointer rounded-2xl border border-purple-500/30 bg-purple-500/10 px-6 text-xs font-black uppercase tracking-widest text-purple-400 transition-all hover:border-purple-400/50 hover:bg-purple-500/20 active:scale-[0.98] shadow-lg shadow-purple-500/10"
      >
        Search
      </button>
    </form>
  );
}
