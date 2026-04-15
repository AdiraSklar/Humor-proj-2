"use client";

import { useState } from "react";

export interface PodiumEntry {
  id: string;
  content: string;
  imageUrl: string;
  mainStat: number;
  mainStatLabel: string;
  extraBadge?: string; // e.g. "9♥ · 9✗"
  likes?: number;
  dislikes?: number;
}

export interface PodiumSlide {
  title: string;
  subtitle: string;
  emoji: string;
  entries: PodiumEntry[];
  positions: { label: string; medal: string }[]; // [1st, 2nd, 3rd] labels/medals
}

function n(x: number) {
  return x.toLocaleString("en-US");
}

function PodiumCard({
  entry,
  position,
  isFirst,
  isSecond,
  isThird,
}: {
  entry: PodiumEntry;
  position: { label: string; medal: string };
  isFirst: boolean;
  isSecond: boolean;
  isThird: boolean;
}) {
  let ringColor = "border-zinc-700";
  let bgColor = "bg-zinc-950";
  let height = "min-h-[320px]";
  let shadow = "shadow-fuchsia-500/5";
  let glow = "";

  if (isFirst) {
    ringColor = "border-fuchsia-500/50 shadow-fuchsia-500/10";
    bgColor = "bg-zinc-950 border-fuchsia-500/20";
    height = "min-h-[420px]";
    shadow = "shadow-fuchsia-500/10";
    glow =
      "before:absolute before:inset-0 before:-z-10 before:bg-fuchsia-500/30 before:blur-[80px] before:rounded-full before:scale-125 after:absolute after:inset-0 after:-z-20 after:bg-purple-500/20 after:blur-[120px] after:rounded-full after:scale-150";
  } else if (isSecond) {
    ringColor = "border-zinc-500/30 shadow-zinc-400/10";
    height = "min-h-[360px]";
    glow =
      "before:absolute before:inset-0 before:-z-10 before:bg-purple-500/20 before:blur-[60px] before:rounded-full before:scale-110 after:absolute after:inset-0 after:-z-20 after:bg-fuchsia-500/10 after:blur-[90px] after:rounded-full after:scale-125";
  } else if (isThird) {
    ringColor = "border-purple-800/40 shadow-purple-900/10";
    height = "min-h-[320px]";
    glow =
      "before:absolute before:inset-0 before:-z-10 before:bg-purple-900/20 before:blur-[50px] before:rounded-full before:scale-100 after:absolute after:inset-0 after:-z-20 after:bg-indigo-500/10 after:blur-[80px] after:rounded-full after:scale-110";
  }

  return (
    <div
      className={`relative flex w-full max-w-sm flex-col overflow-hidden rounded-3xl border ${ringColor} ${bgColor} ${height} ${shadow} transition-all hover:scale-[1.02] sm:w-72 shadow-2xl ${glow}`}
    >
      <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/10">
        {entry.extraBadge ? (
          <span>{entry.extraBadge}</span>
        ) : (
          <>
            <span className="text-red-400">♥</span> {n(entry.mainStat)}
          </>
        )}
      </div>
      <div className="h-44 w-full overflow-hidden bg-zinc-800">
        <img src={entry.imageUrl} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col p-6 text-left">
        <div className="mb-4">
          <span className="font-serif text-4xl leading-none text-zinc-700">&ldquo;</span>
          <p className="line-clamp-4 text-base font-medium leading-relaxed text-zinc-100 mt-[-10px]">
            {entry.content || <span className="text-zinc-500 italic">No content</span>}
          </p>
        </div>
        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                {position.label}
              </p>
              {entry.likes !== undefined && entry.dislikes !== undefined ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold text-green-400">{n(entry.likes)} ♥</span>
                  <span className="text-zinc-700 text-xs">·</span>
                  <span className="text-xs font-semibold text-red-400">{n(entry.dislikes)} ✗</span>
                </div>
              ) : (
                <p className="text-xs text-zinc-400 mt-0.5">
                  {n(entry.mainStat)} {entry.mainStatLabel}
                </p>
              )}
            </div>
            <span className="text-4xl">{position.medal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PodiumCarousel({ slides }: { slides: PodiumSlide[] }) {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setCurrent((i) => (i + 1) % slides.length);

  const slide = slides[current];
  // podium order: 2nd, 1st, 3rd
  const ordered = [slide.entries[1], slide.entries[0], slide.entries[2]].filter(Boolean);
  const posOrder = [slide.positions[1], slide.positions[0], slide.positions[2]].filter(Boolean);

  return (
    <section className="relative bg-zinc-900/50 px-6 py-32 border-b border-white/5">
      <div className="mx-auto max-w-5xl text-center">

        {/* Title */}
        <div className="flex flex-col items-center justify-center gap-6 mb-4">
          <span className="text-7xl sm:text-9xl transition-all duration-300">{slide.emoji}</span>
          <h2 className="font-display bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-500 bg-clip-text text-5xl tracking-[0.35em] text-transparent md:text-7xl transition-all duration-300">
            {slide.title}
          </h2>
        </div>
        <p className="text-xl font-medium text-zinc-500 mb-16 uppercase tracking-[0.2em]">
          {slide.subtitle}
        </p>

        {/* Carousel wrapper */}
        <div className="relative">
          {/* Left arrow */}
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-purple-500/50 bg-purple-500/10 text-purple-300 backdrop-blur-sm transition shadow-[0_0_16px_rgba(168,85,247,0.4)] hover:bg-purple-500/25 hover:text-white hover:shadow-[0_0_28px_rgba(168,85,247,0.7)] sm:-translate-x-8"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Right arrow */}
          <button
            onClick={next}
            aria-label="Next"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-purple-500/50 bg-purple-500/10 text-purple-300 backdrop-blur-sm transition shadow-[0_0_16px_rgba(168,85,247,0.4)] hover:bg-purple-500/25 hover:text-white hover:shadow-[0_0_28px_rgba(168,85,247,0.7)] sm:translate-x-8"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Slides */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${current * (100 / slides.length)}%)`, width: `${slides.length * 100}%` }}
            >
              {slides.map((s, si) => {
                const ord = [s.entries[1], s.entries[0], s.entries[2]].filter(Boolean);
                const posOrd = [s.positions[1], s.positions[0], s.positions[2]].filter(Boolean);
                return (
                  <div key={si} className="flex justify-center" style={{ width: `${100 / slides.length}%` }}>
                    {ord.length === 0 ? (
                      <p className="text-sm text-zinc-500">No data yet.</p>
                    ) : (
                      <div className="flex flex-col items-end justify-center gap-6 sm:flex-row sm:items-end lg:gap-10">
                        {ord.map((entry, idx) => (
                          <PodiumCard
                            key={entry.id}
                            entry={entry}
                            position={posOrd[idx]}
                            isFirst={idx === 1}
                            isSecond={idx === 0}
                            isThird={idx === 2}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="mt-12 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-8 bg-purple-400"
                  : "w-2 bg-zinc-600 hover:bg-zinc-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
