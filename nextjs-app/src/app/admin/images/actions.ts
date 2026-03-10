"use server";

import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type ImageFormState = { error: string } | null;

function parseFormData(formData: FormData) {
  return {
    url: (formData.get("url") as string).trim(),
    profile_id: (formData.get("profile_id") as string) || null,
    is_public: formData.get("is_public") === "on",
    is_common_use: formData.get("is_common_use") === "on",
    additional_context: (formData.get("additional_context") as string).trim() || null,
    image_description: (formData.get("image_description") as string).trim() || null,
  };
}

export async function createImage(
  _prevState: ImageFormState,
  formData: FormData
): Promise<ImageFormState> {
  const result = await requireSuperadmin();
  if (!result.authorized) return { error: "Forbidden" };

  const payload = parseFormData(formData);
  if (!payload.url) return { error: "URL is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("images").insert(payload);
  if (error) return { error: error.message };

  redirect("/admin/images");
}

export async function updateImage(
  _prevState: ImageFormState,
  formData: FormData
): Promise<ImageFormState> {
  const result = await requireSuperadmin();
  if (!result.authorized) return { error: "Forbidden" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing image ID." };

  const payload = parseFormData(formData);
  if (!payload.url) return { error: "URL is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("images").update(payload).eq("id", id);
  if (error) return { error: error.message };

  redirect("/admin/images");
}

export async function deleteImage(formData: FormData) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const id = formData.get("id") as string;
  if (!id) throw new Error("Missing image ID.");

  const supabase = await createClient();
  const { error } = await supabase.from("images").delete().eq("id", id);
  if (error) throw new Error(error.message);

  redirect("/admin/images");
}
