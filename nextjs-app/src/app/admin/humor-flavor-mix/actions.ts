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
  const humor_flavor_id = Number(formData.get("humor_flavor_id"));

  if (!id || isNaN(caption_count) || caption_count < 0 || !humor_flavor_id) throw new Error("Invalid input.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("humor_flavor_mix")
    .update({ caption_count, humor_flavor_id })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(PATH);
}
