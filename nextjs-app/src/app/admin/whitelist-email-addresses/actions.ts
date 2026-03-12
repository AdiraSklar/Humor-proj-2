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
  const { error } = await supabase.from("whitelist_email_addresses").insert({ email_address });
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