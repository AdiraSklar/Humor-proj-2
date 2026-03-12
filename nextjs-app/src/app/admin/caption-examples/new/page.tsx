import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { createExample } from "../actions";

interface ImageOption { id: string; url: string | null; }

export default async function NewCaptionExamplePage() {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const supabase = await createClient();
  const { data: images } = await supabase
    .from("images")
    .select("id, url")
    .order("created_datetime_utc", { ascending: false })
    .limit(100)
    .returns<ImageOption[]>();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/admin/caption-examples" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-violet-400 transition-colors">
          ← Caption Examples
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">New</span>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
          New <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Example</span>
        </h1>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm shadow-2xl max-w-2xl">
        <form action={createExample} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
              Image Description <span className="text-red-400">*</span>
            </label>
            <textarea
              name="image_description"
              required
              rows={3}
              placeholder="Describe the image content as the LLM would see it…"
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
              placeholder="The ideal caption for this image…"
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
              placeholder="Why is this a good caption? What makes it funny or effective?"
              className="w-full rounded-2xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Priority</label>
              <input
                type="number"
                name="priority"
                defaultValue={0}
                min={0}
                className="w-full rounded-2xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
              />
              <p className="mt-1 text-xs text-zinc-600">Higher = used first in prompts.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                Linked Image <span className="text-zinc-600">(optional)</span>
              </label>
              <select
                name="image_id"
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
              Create Example
            </button>
            <Link href="/admin/caption-examples" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}