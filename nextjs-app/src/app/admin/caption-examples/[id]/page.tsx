import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateExample, deleteExample } from "../actions";

interface CaptionExample {
  id: number;
  image_description: string;
  caption: string;
  explanation: string;
  priority: number;
  image_id: string | null;
}

interface ImageOption { id: string; url: string | null; }

type Props = { params: Promise<{ id: string }> };

export default async function EditCaptionExamplePage({ params }: Props) {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { id } = await params;
  const supabase = await createClient();

  const [{ data: example }, { data: images }] = await Promise.all([
    supabase
      .from("caption_examples")
      .select("id, image_description, caption, explanation, priority, image_id")
      .eq("id", Number(id))
      .single<CaptionExample>(),
    supabase
      .from("images")
      .select("id, url")
      .order("created_datetime_utc", { ascending: false })
      .limit(100)
      .returns<ImageOption[]>(),
  ]);

  if (!example) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/admin/caption-examples" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-violet-400 transition-colors">
          ← Caption Examples
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">Edit</span>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
          Edit <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Example</span>
        </h1>
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-[0.2em]">ID: {example.id}</p>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm shadow-2xl max-w-2xl">
        <form action={updateExample} className="space-y-6">
          <input type="hidden" name="id" value={example.id} />

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
              Image Description <span className="text-red-400">*</span>
            </label>
            <textarea
              name="image_description"
              required
              rows={3}
              defaultValue={example.image_description}
              className="w-full rounded-2xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
              Caption <span className="text-red-400">*</span>
            </label>
            <textarea
              name="caption"
              required
              rows={2}
              defaultValue={example.caption}
              className="w-full rounded-2xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
              Explanation <span className="text-red-400">*</span>
            </label>
            <textarea
              name="explanation"
              required
              rows={3}
              defaultValue={example.explanation}
              className="w-full rounded-2xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Priority</label>
              <input
                type="number"
                name="priority"
                defaultValue={example.priority}
                min={0}
                className="w-full rounded-2xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                Linked Image <span className="text-zinc-600">(optional)</span>
              </label>
              <select
                name="image_id"
                defaultValue={example.image_id ?? ""}
                className="w-full rounded-2xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
              >
                <option value="">None</option>
                {images?.map((img) => (
                  <option key={img.id} value={img.id}>
                    {img.id.slice(0, 8)}… {img.url ? `— ${img.url.slice(0, 40)}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              className="flex cursor-pointer items-center gap-2 rounded-2xl border border-violet-500/30 bg-violet-500/10 px-6 py-3 text-xs font-black uppercase tracking-widest text-violet-400 transition-all hover:border-violet-400/50 hover:bg-violet-500/20 active:scale-[0.98]"
            >
              Save Changes
            </button>
            <Link href="/admin/caption-examples" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>

      <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-6 max-w-2xl">
        <p className="text-xs font-black uppercase tracking-widest text-red-400/80 mb-1">Danger Zone</p>
        <p className="text-sm text-zinc-500 mb-4">This will permanently delete the caption example.</p>
        <form action={deleteExample.bind(null, example.id)}>
          <button
            type="submit"
            className="cursor-pointer rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-red-400 transition-all hover:bg-red-500/20 active:scale-[0.98]"
          >
            Delete Example
          </button>
        </form>
      </div>
    </div>
  );
}
