"use server";

import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const ALLOWED_FIELDS = ["term", "definition", "example", "priority", "term_type_id"] as const;
type TermField = (typeof ALLOWED_FIELDS)[number];

export async function updateTermField(
  id: number,
  field: TermField,
  value: string | number | null
) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");
  if (!ALLOWED_FIELDS.includes(field)) throw new Error("Invalid field.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("terms")
    .update({ [field]: value, modified_datetime_utc: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/terms");
}

const LIST_PATH = "/admin/terms";

function parseTermForm(formData: FormData) {
  return {
    term: (formData.get("term") as string)?.trim(),
    definition: (formData.get("definition") as string)?.trim(),
    example: (formData.get("example") as string)?.trim(),
    priority: Number(formData.get("priority") ?? 0),
    term_type_id: formData.get("term_type_id") ? Number(formData.get("term_type_id")) : null,
  };
}

export async function createTerm(formData: FormData) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const payload = parseTermForm(formData);
  if (!payload.term || !payload.definition || !payload.example) throw new Error("Missing required fields.");

  const supabase = await createClient();
  const { error } = await supabase.from("terms").insert(payload);
  if (error) throw new Error(error.message);

  redirect(LIST_PATH);
}

export async function updateTerm(formData: FormData) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const id = Number(formData.get("id"));
  if (!id) throw new Error("Missing ID.");

  const payload = parseTermForm(formData);
  if (!payload.term || !payload.definition || !payload.example) throw new Error("Missing required fields.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("terms")
    .update({ ...payload, modified_datetime_utc: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  redirect(LIST_PATH);
}

export async function deleteTerm(id: number) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const supabase = await createClient();
  const { error } = await supabase.from("terms").delete().eq("id", id);
  if (error) throw new Error(error.message);

  redirect(LIST_PATH);
}
