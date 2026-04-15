"use server";

import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const LIST_PATH = "/admin/caption-examples";

function parseExampleForm(formData: FormData) {
  const image_id = (formData.get("image_id") as string)?.trim() || null;
  return {
    image_description: (formData.get("image_description") as string)?.trim(),
    caption: (formData.get("caption") as string)?.trim(),
    explanation: (formData.get("explanation") as string)?.trim(),
    priority: Number(formData.get("priority") ?? 0),
    image_id: image_id || null,
  };
}

export async function createExample(formData: FormData) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const payload = parseExampleForm(formData);
  if (!payload.image_description || !payload.caption || !payload.explanation) {
    throw new Error("Missing required fields.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("caption_examples").insert({
    ...payload,
    created_by_user_id: result.profile.id,
    modified_by_user_id: result.profile.id,
  });
  if (error) throw new Error(error.message);

  redirect(LIST_PATH);
}

export async function updateExample(formData: FormData) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const id = Number(formData.get("id"));
  if (!id) throw new Error("Missing ID.");

  const payload = parseExampleForm(formData);
  if (!payload.image_description || !payload.caption || !payload.explanation) {
    throw new Error("Missing required fields.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("caption_examples")
    .update({ ...payload, modified_by_user_id: result.profile.id })
    .eq("id", id);
  if (error) throw new Error(error.message);

  redirect(LIST_PATH);
}

export async function deleteExample(id: number) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const supabase = await createClient();
  const { error } = await supabase.from("caption_examples").delete().eq("id", id);
  if (error) throw new Error(error.message);

  redirect(LIST_PATH);
}