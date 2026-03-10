import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateImage } from "../actions";
import { ImageForm } from "../_components/ImageForm";

interface Image {
  id: string;
  url: string;
  profile_id: string | null;
  is_public: boolean;
  is_common_use: boolean;
  additional_context: string | null;
  image_description: string | null;
}

interface ProfileOption {
  id: string;
  email: string;
}

type Props = { params: Promise<{ id: string }> };

export default async function EditImagePage({ params }: Props) {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { id } = await params;
  const supabase = await createClient();

  const [{ data: image }, { data: profiles }] = await Promise.all([
    supabase
      .from("images")
      .select("id, url, profile_id, is_public, is_common_use, additional_context, image_description")
      .eq("id", id)
      .single<Image>(),
    supabase
      .from("profiles")
      .select("id, email")
      .order("email")
      .returns<ProfileOption[]>(),
  ]);

  if (!image) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/images" className="hover:text-zinc-700 dark:hover:text-zinc-200">
          Images
        </Link>
        <span>/</span>
        <span title={image.id} className="font-mono text-zinc-900 dark:text-zinc-50">
          {image.id.slice(0, 8)}…
        </span>
      </div>

      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Edit image</h1>

      <ImageForm
        action={updateImage}
        defaultValues={image}
        profiles={profiles ?? []}
      />
    </div>
  );
}
