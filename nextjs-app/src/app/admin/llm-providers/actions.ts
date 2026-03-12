"use server";

import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const PATH = "/admin/llm-providers";

export async function createProvider(formData: FormData) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const name = (formData.get("name") as string)?.trim();
  if (!name) return;

  const supabase = await createClient();
  const { error } = await supabase.from("llm_providers").insert({ name });
  if (error) throw new Error(error.message);

  revalidatePath(PATH);
}

export async function updateProvider(formData: FormData) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const id = Number(formData.get("id"));
  const name = (formData.get("name") as string)?.trim();
  if (!id || !name) return;

  const supabase = await createClient();
  const { error } = await supabase.from("llm_providers").update({ name }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(PATH);
}

export async function deleteProvider(id: number) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const supabase = await createClient();
  const { error } = await supabase.from("llm_providers").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(PATH);
  redirect(PATH);
}
