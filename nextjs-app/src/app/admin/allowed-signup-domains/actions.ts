"use server";

import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const PATH = "/admin/allowed-signup-domains";

export async function createDomain(formData: FormData) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const apex_domain = (formData.get("apex_domain") as string)?.trim().toLowerCase();
  if (!apex_domain) return;

  const supabase = await createClient();
  const { error } = await supabase.from("allowed_signup_domains").insert({ apex_domain });
  if (error) throw new Error(error.message);

  revalidatePath(PATH);
}

export async function updateDomain(formData: FormData) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const id = Number(formData.get("id"));
  const apex_domain = (formData.get("apex_domain") as string)?.trim().toLowerCase();
  if (!id || !apex_domain) return;

  const supabase = await createClient();
  const { error } = await supabase.from("allowed_signup_domains").update({ apex_domain }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(PATH);
}

export async function deleteDomain(id: number) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const supabase = await createClient();
  const { error } = await supabase.from("allowed_signup_domains").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(PATH);
  redirect(PATH);
}
