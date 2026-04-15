"use server";

import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const LIST_PATH = "/admin/llm-models";

export async function createModel(formData: FormData) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const name = (formData.get("name") as string)?.trim();
  const provider_id = Number(formData.get("llm_provider_id"));
  const provider_model_id = (formData.get("provider_model_id") as string)?.trim();
  const is_temperature_supported = formData.get("is_temperature_supported") === "on";

  if (!name || !provider_id || !provider_model_id) throw new Error("Missing required fields.");

  const supabase = await createClient();
  const { error } = await supabase.from("llm_models").insert({
    name,
    llm_provider_id: provider_id,
    provider_model_id,
    is_temperature_supported,
    created_by_user_id: result.profile.id,
    modified_by_user_id: result.profile.id,
  });
  if (error) throw new Error(error.message);

  redirect(LIST_PATH);
}

export async function updateModel(formData: FormData) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const id = Number(formData.get("id"));
  const name = (formData.get("name") as string)?.trim();
  const provider_id = Number(formData.get("llm_provider_id"));
  const provider_model_id = (formData.get("provider_model_id") as string)?.trim();
  const is_temperature_supported = formData.get("is_temperature_supported") === "on";

  if (!id || !name || !provider_id || !provider_model_id) throw new Error("Missing required fields.");

  const supabase = await createClient();
  const { error } = await supabase.from("llm_models").update({
    name,
    llm_provider_id: provider_id,
    provider_model_id,
    is_temperature_supported,
    modified_by_user_id: result.profile.id,
  }).eq("id", id);
  if (error) throw new Error(error.message);

  redirect(LIST_PATH);
}

export async function deleteModel(id: number) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const supabase = await createClient();
  const { error } = await supabase.from("llm_models").delete().eq("id", id);
  if (error) throw new Error(error.message);

  redirect(LIST_PATH);
}
