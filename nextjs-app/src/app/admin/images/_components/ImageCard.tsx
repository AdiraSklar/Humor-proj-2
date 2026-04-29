"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DeleteButton } from "./DeleteButton";

interface Props {
  id: string;
  url: string;
  isPublic: boolean;
  dateLabel: string;
}

export function ImageCard({ id, url, isPublic, dateLabel }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className="group relative flex flex-col gap-3 p-3 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-sm transition-all hover:border-purple-500/30 hover:bg-zinc-900/60 hover:shadow-2xl hover:shadow-purple-500/5">
        {/* Thumbnail */}
        <div className="aspect-square overflow-hidden rounded-2xl bg-zinc-950 border border-white/5 relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {isPublic && (
            <div className="absolute left-3 top-3">
              <span className="rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-widest bg-purple-500 text-white leading-none shadow-2xl">
                Public
              </span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/60 opacity-0 transition-all duration-300 backdrop-blur-[2px] group-hover:opacity-100 rounded-2xl p-4">
            <button
              onClick={() => setOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-500 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-xl hover:bg-purple-400 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </button>
            <Link
              href={`/admin/images/${id}`}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-950 shadow-xl hover:bg-purple-100 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
            <DeleteButton id={id} />
          </div>
        </div>

        {/* Date footer */}
        <div className="px-1 flex justify-between items-center" suppressHydrationWarning>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400 transition-colors">
            {dateLabel}
          </p>
          <span className="text-[10px] font-mono text-zinc-700 group-hover:text-purple-500/50">
            {id.slice(0, 6)}
          </span>
        </div>
      </div>

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 border border-white/10 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors shadow-xl"
              aria-label="Close"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
