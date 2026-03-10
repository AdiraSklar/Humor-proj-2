import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  is_superadmin: boolean;
}

type SuperadminResult =
  | { authorized: true; user: User; profile: Profile }
  | { authorized: false };

/**
 * Server-side superadmin guard. Call at the top of every /admin page or layout.
 *
 * - No session          → redirect to /login  (never reaches caller)
 * - Session, not admin  → { authorized: false }
 * - Session, is admin   → { authorized: true, user, profile }
 *
 * All checks happen server-side using getUser() (JWT re-validated with Supabase).
 * The anon key is used so RLS is fully enforced — no policy changes needed.
 */
export const requireSuperadmin = cache(async function requireSuperadmin(): Promise<SuperadminResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_superadmin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_superadmin) {
    return { authorized: false };
  }

  return { authorized: true, user, profile };
});
