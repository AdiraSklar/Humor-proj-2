import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { createImage } from "../actions";
import { ImageForm } from "../_components/ImageForm";

interface ProfileOption {
  id: string;
  email: string;
}

export default async function NewImagePage() {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email")
    .order("email")
    .returns<ProfileOption[]>();

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/images" className="hover:text-zinc-700 dark:hover:text-zinc-200">
          Images
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-50">New</span>
      </div>

      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-50">New image</h1>

      <ImageForm action={createImage} profiles={profiles ?? []} />
    </div>
  );
}
