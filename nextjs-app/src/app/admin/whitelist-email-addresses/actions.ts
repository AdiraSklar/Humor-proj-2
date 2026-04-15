"use server";

import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const PATH = "/admin/whitelist-email-addresses";

export async function createEmail(formData: FormData) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const email_address = (formData.get("email_address") as string)?.trim().toLowerCase();
  if (!email_address) return;

  const supabase = await createClient();
  const { error } = await supabase.from("whitelist_email_addresses").insert({
    email_address,
    created_by_user_id: result.profile.id,
    modified_by_user_id: result.profile.id,
  });
  if (error) throw new Error(error.message);

  revalidatePath(PATH);
}

export async function updateEmail(formData: FormData) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const id = Number(formData.get("id"));
  const email_address = (formData.get("email_address") as string)?.trim().toLowerCase();
  if (!id || !email_address) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("whitelist_email_addresses")
    .update({ email_address, modified_by_user_id: result.profile.id })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(PATH);
}

export async function deleteEmail(id: number) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const supabase = await createClient();
  const { error } = await supabase.from("whitelist_email_addresses").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(PATH);
  redirect(PATH);
}