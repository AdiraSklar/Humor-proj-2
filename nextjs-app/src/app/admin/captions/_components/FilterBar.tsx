"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

interface Props {
  imageId: string;
  profileId: string;
}

export function FilterBar({ imageId, profileId }: Props) {
  const router = useRouter();
  const imageRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    const img = imageRef.current?.value.trim() ?? "";
    const prof = profileRef.current?.value.trim() ?? "";
    if (img) params.set("image_id", img);
    if (prof) params.set("profile_id", prof);
    const qs = params.toString();
    router.push(qs ? `/admin/captions?${qs}` : "/admin/captions");
  }

  function handleClear() {
    if (imageRef.current) imageRef.current.value = "";
    if (profileRef.current) profileRef.current.value = "";
    router.push("/admin/captions");
  }

  const hasFilters = imageId || profileId;

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[240px]">
        <input
          ref={imageRef}
          type="text"
          defaultValue={imageId}
          placeholder="Filter by image ID…"
          className="h-11 w-full rounded-2xl border border-white/5 bg-zinc-950/50 px-4 text-sm text-white placeholder-zinc-600 focus:border-purple-500/50 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all shadow-inner"
        />
      </div>
      <div className="relative flex-1 min-w-[240px]">
        <input
          ref={profileRef}
          type="text"
          defaultValue={profileId}
          placeholder="Filter by profile ID…"
          className="h-11 w-full rounded-2xl border border-white/5 bg-zinc-950/50 px-4 text-sm text-white placeholder-zinc-600 focus:border-purple-500/50 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all shadow-inner"
        />
      </div>
      <button
        type="submit"
        className="h-11 cursor-pointer rounded-2xl border border-purple-500/30 bg-purple-500/10 px-6 text-xs font-black uppercase tracking-widest text-purple-400 transition-all hover:border-purple-400/50 hover:bg-purple-500/20 active:scale-[0.98] shadow-lg shadow-purple-500/10"
      >
        Filter
      </button>
      <button
        type="button"
        onClick={handleClear}
        className={`h-11 cursor-pointer rounded-2xl border border-white/5 bg-zinc-800 px-6 text-xs font-bold uppercase tracking-widest text-zinc-400 transition-all hover:bg-white/5 hover:text-white ${hasFilters ? "" : "pointer-events-none invisible"}`}
      >
        Clear
      </button>
    </form>
  );
}
