"use client";

import { createClient } from "@/lib/supabase/client";

export function NavSignInButton() {
  async function handleClick() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  }

  return (
    <button
      onClick={handleClick}
      className="group flex cursor-pointer items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-purple-400 transition-all hover:border-purple-400/50 hover:bg-purple-500/20 active:scale-[0.98] shadow-lg shadow-purple-500/5"
    >
      See the Database
      <svg
        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </button>
  );
}
