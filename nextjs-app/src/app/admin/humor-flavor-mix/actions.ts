"use server";

import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const PATH = "/admin/humor-flavor-mix";

export async function updateFlavorMix(formData: FormData) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const id = Number(formData.get("id"));
  const caption_count = Number(formData.get("caption_count"));

  if (!id || isNaN(caption_count) || caption_count < 0) throw new Error("Invalid input.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("humor_flavor_mix")
    .update({ caption_count })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(PATH);
}
