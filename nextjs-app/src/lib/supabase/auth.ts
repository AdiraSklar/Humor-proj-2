import { createClient } from "./server";

/**
 * Returns the authenticated user from the server-side session, or null.
 * Uses getUser() which re-validates the JWT with Supabase on every call —
 * safe to use in Server Components, Route Handlers, and Server Actions.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
