import { createClient } from "@/lib/supabase/server";
import { NavSignInButton } from "./_components/NavSignInButton";
import { VotePieChart } from "./_components/charts/VotePieChart";
import { HumorFlavorChart } from "./_components/charts/HumorFlavorChart";

// ── types ──────────────────────────────────────────────────────────────────

interface ImageRow {
  id: string;
  url: string;
  is_public: boolean;
}

interface CaptionRow {
  id: string;
  image_id: string | null;
  content: string | null;
  like_count: number | null;
  is_public: boolean;
  humor_flavor_id: string | null;
}

// ── helpers ────────────────────────────────────────────────────────────────

function n(x: number | null | undefined) {
  return (x ?? 0).toLocaleString("en-US");
}

function formatSlugToLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ── page ───────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: images, count: imageCount },
    { data: captions, count: captionCount },
    { count: flavorCount },
    { count: totalLikesCount },
    { count: totalDislikesCount },
    { data: flavors },
  ] = await Promise.all([
    supabase.from("images").select("id, url, is_public", { count: "exact" }).returns<ImageRow[]>(),
    supabase.from("captions").select("id, image_id, content, like_count, is_public, humor_flavor_id", { count: "exact" }).returns<CaptionRow[]>(),
    supabase.from("humor_flavors").select("*", { count: "exact", head: true }),
    supabase.from("caption_votes").select("*", { count: "exact", head: true }).eq("vote_value", 1),
    supabase.from("caption_votes").select("*", { count: "exact", head: true }).eq("vote_value", -1),
    supabase.from("humor_flavors").select("id, slug"),
  ]);

  const imgs = images ?? [];
  const caps = captions ?? [];
  const flavorList = flavors ?? [];

  // humor flavor stats
  const flavorNameMap = new Map(flavorList.map((f) => [f.id, f.slug]));
  const flavorUsageCount = new Map<string, number>();
  
  for (const c of caps) {
    if (c.humor_flavor_id) {
      const slug = flavorNameMap.get(c.humor_flavor_id);
      if (slug) {
        flavorUsageCount.set(slug, (flavorUsageCount.get(slug) ?? 0) + 1);
      }
    }
  }

  const topFlavors = [...flavorUsageCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([slug, count]) => ({
      label: formatSlugToLabel(slug),
      count,
    }));

  // captions per image
  const captionsByImage = new Map<string, number>();
  for (const c of caps) {
    if (c.image_id)
      captionsByImage.set(c.image_id, (captionsByImage.get(c.image_id) ?? 0) + 1);
  }

  const totalLikes = caps.reduce((sum, c) => sum + Math.max(0, c.like_count ?? 0), 0);

  // top 7 images by caption count
  const imageUrlMap = new Map(imgs.map((img) => [img.id, img.url]));
  const topImages = [...captionsByImage.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({ id, url: imageUrlMap.get(id) ?? null, count }))
    .filter((img) => img.url)
    .slice(0, 7)
    .map((img, i) => ({ ...img, rank: i + 1 }));

  // top 5 most-liked captions
  const topLiked = [...caps]
    .filter((c) => (c.like_count ?? 0) > 0 && c.image_id && imageUrlMap.get(c.image_id))
    .sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0))
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      content: c.content ?? "",
      likeCount: c.like_count ?? 0,
      imageUrl: imageUrlMap.get(c.image_id!)!,
    }));

  const stats = [
    { label: "Images", value: n(imageCount) },
    { label: "Captions", value: n(captionCount) },
    { label: "Humor Flavors", value: n(flavorCount) },
    { label: "Likes Given", value: n(totalLikes) },
  ];

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 font-sans overflow-x-hidden" suppressHydrationWarning>

      {/* ── Custom Styles for Marquee ────────────────────────────────────── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg shadow-purple-500/20">
            <span className="font-bold text-white leading-none">C</span>
          </div>
          <span className="text-lg font-black tracking-tight text-zinc-100">Cracked AI</span>
        </div>
        <NavSignInButton />
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-zinc-950 pt-24 pb-16">
        <div className="px-6">
          <div className="mx-auto max-w-5xl flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-purple-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              Live Platform Data
            </div>
            
            <h1 className="mt-8 text-6xl font-black tracking-tighter text-white sm:text-8xl">
              Stats & <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Claps</span>
            </h1>
            
            <p className="mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl leading-relaxed">
              The internet is weird. Let&apos;s make it weirder. <br className="hidden sm:block" />
              A real-time snapshot of our community&apos;s collective creativity.
            </p>
          </div>
        </div>

        {/* ── Marquee Stats ───────────────────────────────────────────────── */}
        <div className="mt-20 relative flex overflow-x-hidden border-y border-white/5 bg-zinc-900/40 py-10 backdrop-blur-md shadow-[0_0_40px_rgba(168,85,247,0.03)]">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none"></div>
          
          <div className="animate-marquee whitespace-nowrap flex items-center">
            {[...stats, ...stats, ...stats, ...stats].map((stat, i) => (
              <div key={i} className="flex items-center mx-12">
                <span className="text-4xl font-bold tracking-tighter text-white sm:text-6xl">
                  <span className="text-purple-400">{stat.value}</span> <span className="text-zinc-500 font-medium tracking-tight ml-2">{stat.label}</span>
                </span>
                <span className="mx-12 text-zinc-800 text-4xl">•</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Podium ───────────────────────────────────────────────────── */}
      <section className="relative bg-zinc-900/50 px-6 py-32 border-b border-white/5">
        <div className="mx-auto max-w-5xl text-center">
          <div className="flex flex-col items-center justify-center gap-6 mb-4">
            <span className="text-7xl sm:text-9xl">🏆</span>
            <h2 className="font-display bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-500 bg-clip-text text-5xl tracking-[0.35em] text-transparent md:text-7xl">
              THE PODIUM
            </h2>
          </div>
          <h2 className="text-xl font-medium text-zinc-500 mb-20 uppercase tracking-[0.2em]">
            Memes people loved most
          </h2>

          {topLiked.length === 0 ? (
            <p className="mt-8 text-sm text-zinc-500">No liked captions yet.</p>
          ) : (
            <div className="flex flex-col items-end justify-center gap-6 sm:flex-row sm:items-end lg:gap-10">
              {[topLiked[1], topLiked[0], topLiked[2]].filter(Boolean).map((cap, idx, arr) => {
                const isFirst = arr.length === 3 ? idx === 1 : arr.length === 2 ? idx === 0 : true;
                const isSecond = arr.length === 3 ? idx === 0 : arr.length === 2 ? idx === 1 : false;
                const isThird = arr.length === 3 ? idx === 2 : false;

                let ringColor = "border-zinc-700";
                let bgColor = "bg-zinc-950";
                let height = "min-h-[320px]";
                let label = "Runner Up";
                let medal = "🥈";
                let shadow = "shadow-fuchsia-500/5";
                let glow = "";

                if (isFirst) {
                  ringColor = "border-fuchsia-500/50 shadow-fuchsia-500/10";
                  bgColor = "bg-zinc-950 border-fuchsia-500/20";
                  height = "min-h-[420px]";
                  label = "Most Liked";
                  medal = "🥇";
                  shadow = "shadow-fuchsia-500/10";
                  glow = "before:absolute before:inset-0 before:-z-10 before:bg-fuchsia-500/30 before:blur-[80px] before:rounded-full before:scale-125 after:absolute after:inset-0 after:-z-20 after:bg-purple-500/20 after:blur-[120px] after:rounded-full after:scale-150";
                } else if (isSecond) {
                  ringColor = "border-zinc-500/30 shadow-zinc-400/10";
                  height = "min-h-[360px]";
                  label = "Second Place";
                  medal = "🥈";
                  glow = "before:absolute before:inset-0 before:-z-10 before:bg-purple-500/20 before:blur-[60px] before:rounded-full before:scale-110 after:absolute after:inset-0 after:-z-20 after:bg-fuchsia-500/10 after:blur-[90px] after:rounded-full after:scale-125";
                } else if (isThird) {
                  ringColor = "border-purple-800/40 shadow-purple-900/10";
                  height = "min-h-[320px]";
                  label = "Third Place";
                  medal = "🥉";
                  glow = "before:absolute before:inset-0 before:-z-10 before:bg-purple-900/20 before:blur-[50px] before:rounded-full before:scale-100 after:absolute after:inset-0 after:-z-20 after:bg-indigo-500/10 after:blur-[80px] after:rounded-full after:scale-110";
                }

                return (
                  <div
                    key={cap.id}
                    className={`relative flex w-full max-w-sm flex-col overflow-hidden rounded-3xl border ${ringColor} ${bgColor} ${height} ${shadow} transition-all hover:scale-[1.02] sm:w-72 shadow-2xl ${glow}`}
                  >
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/10">
                      <span className="text-red-400">♥</span> {n(cap.likeCount)}
                    </div>
                    <div className="h-44 w-full overflow-hidden bg-zinc-800">
                      <img src={cap.imageUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col p-6 text-left">
                      <div className="mb-4">
                        <span className="font-serif text-4xl leading-none text-zinc-700">&ldquo;</span>
                        <p className="line-clamp-4 text-base font-medium leading-relaxed text-zinc-100 mt-[-10px]">
                          {cap.content || <span className="text-zinc-500 italic">No content</span>}
                        </p>
                      </div>
                      <div className="mt-auto pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                              {label}
                            </p>
                            <p className="text-xs text-zinc-400 mt-0.5">Caption-image pair</p>
                          </div>
                          <span className="text-4xl">{medal}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Community Sentiment ─────────────────────────────────────────── */}
      <section className="relative bg-zinc-950 px-6 py-12 border-b border-white/5 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute bottom-0 right-0 w-[800px] h-[400px] bg-fuchsia-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="flex flex-col items-center justify-center gap-6 mb-4">
            <h2 className="font-display bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-500 bg-clip-text text-5xl tracking-[0.35em] text-transparent md:text-7xl">
              COMMUNITY SENTIMENT
            </h2>
          </div>
          <h2 className="text-xl font-medium text-zinc-500 mb-8 uppercase tracking-[0.2em]">
            Meme Likes vs. Dislikes
          </h2>
          <div className="flex justify-center">
            <VotePieChart 
              likes={totalLikesCount ?? 0} 
              dislikes={totalDislikesCount ?? 0} 
            />
          </div>
        </div>
      </section>

      {/* ── Humor Flavor Popularity ─────────────────────────────────────────── */}
      <section className="relative bg-zinc-900/50 px-6 py-32 border-b border-white/5 overflow-hidden">
        <div className="mx-auto max-w-5xl text-center">
          <div className="flex flex-col items-center justify-center gap-6 mb-4">
            <h2 className="font-display bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-500 bg-clip-text text-5xl tracking-[0.35em] text-transparent md:text-7xl">
              HUMOR FLAVOR POPULARITY
            </h2>
          </div>
          <h2 className="text-xl font-medium text-zinc-500 mb-20 uppercase tracking-[0.2em]">
            Which flavors community uses most
          </h2>
          <div className="flex justify-center">
            <HumorFlavorChart data={topFlavors} />
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-800 bg-zinc-950 px-6 py-8 text-center text-xs text-zinc-500">

      </footer>
    </div>
  );
}
