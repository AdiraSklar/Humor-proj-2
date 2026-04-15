import { createClient } from "@/lib/supabase/server";
import { NavSignInButton } from "./_components/NavSignInButton";
import { VotePieChart } from "./_components/charts/VotePieChart";
import { HumorFlavorChart } from "./_components/charts/HumorFlavorChart";
import { PodiumCarousel, type PodiumSlide } from "./_components/PodiumCarousel";

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

interface ControversyRow {
  id: string;
  content: string;
  image_url: string;
  total_votes: number;
  likes: number;
  dislikes: number;
  controversy_score: number;
}

interface TrendingRow {
  id: string;
  content: string;
  image_url: string;
  vote_count: number;
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
    { data: controversyRaw },
    { data: trendingRaw },
  ] = await Promise.all([
    supabase.from("images").select("id, url, is_public", { count: "exact" }).returns<ImageRow[]>(),
    supabase.from("captions").select("id, image_id, content, like_count, is_public, humor_flavor_id", { count: "exact" }).returns<CaptionRow[]>(),
    supabase.from("humor_flavors").select("*", { count: "exact", head: true }),
    supabase.from("caption_votes").select("*", { count: "exact", head: true }).eq("vote_value", 1),
    supabase.from("caption_votes").select("*", { count: "exact", head: true }).eq("vote_value", -1),
    supabase.from("humor_flavors").select("id, slug"),
    supabase.from("v_caption_controversy").select("*").order("controversy_score", { ascending: true }).order("total_votes", { ascending: false }).limit(5).returns<ControversyRow[]>(),
    supabase.from("v_caption_trending_week").select("*").order("vote_count", { ascending: false }).limit(5).returns<TrendingRow[]>(),
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

  // Map images for quick lookup
  const imageUrlMap = new Map(imgs.map((img) => [img.id, img.url]));

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

  // ── carousel slides ────────────────────────────────────────────────────────

  const podiumSlides: PodiumSlide[] = [
    {
      title: "THE PODIUM",
      subtitle: "Memes people loved most",
      emoji: "🏆",
      positions: [
        { label: "Most Liked", medal: "🥇" },
        { label: "Second Place", medal: "🥈" },
        { label: "Third Place", medal: "🥉" },
      ],
      entries: topLiked.slice(0, 3).map((c, i) => ({
        id: c.id,
        content: c.content,
        imageUrl: c.imageUrl,
        mainStat: c.likeCount,
        mainStatLabel: "likes",
      })),
    },
    {
      title: "TRENDING",
      subtitle: "Most votes cast this week",
      emoji: "🔥",
      positions: [
        { label: "Hottest This Week", medal: "🥇" },
        { label: "2nd Trending", medal: "🥈" },
        { label: "3rd Trending", medal: "🥉" },
      ],
      entries: (trendingRaw ?? []).slice(0, 3).map((r) => ({
        id: r.id,
        content: r.content,
        imageUrl: r.image_url,
        mainStat: r.vote_count,
        mainStatLabel: "votes this week",
      })),
    },
    {
      title: "MOST CONTROVERSIAL",
      subtitle: "The people couldn't decide",
      emoji: "⚡",
      positions: [
        { label: "Most Divided", medal: "🥇" },
        { label: "2nd Most Divided", medal: "🥈" },
        { label: "3rd Most Divided", medal: "🥉" },
      ],
      entries: (controversyRaw ?? []).slice(0, 3).map((r) => ({
        id: r.id,
        content: r.content,
        imageUrl: r.image_url,
        mainStat: r.total_votes,
        mainStatLabel: "total votes",
        extraBadge: `${r.likes}♥ · ${r.dislikes}✗`,
        likes: r.likes,
        dislikes: r.dislikes,
      })),
    },
  ];

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
      <section className="relative bg-zinc-950 pt-24 pb-12 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative px-6 z-10">
          <div className="mx-auto max-w-5xl flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-purple-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              Live Platform Data
            </div>
            
            <h1 className="mt-8 text-4xl font-black tracking-tighter text-white sm:text-5xl">
              Stats & <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Claps</span>
            </h1>
            
            <p className="mt-4 max-w-xl text-base text-zinc-500 leading-relaxed">
              The internet is weird. Let&apos;s make it weirder. <br className="hidden sm:block" />
              A real-time snapshot of our community&apos;s collective creativity.
            </p>
          </div>
        </div>

        {/* ── Marquee Stats ───────────────────────────────────────────────── */}
        <div className="mt-16 relative flex overflow-x-hidden border-y border-white/5 bg-zinc-900/40 py-6 backdrop-blur-md shadow-[0_0_40px_rgba(168,85,247,0.03)]">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none"></div>
          
          <div className="animate-marquee whitespace-nowrap flex items-center">
            {[...stats, ...stats, ...stats, ...stats].map((stat, i) => (
              <div key={i} className="flex items-center mx-10">
                <span className="text-2xl font-bold tracking-tighter text-white sm:text-3xl">
                  <span className="text-purple-400">{stat.value}</span> <span className="text-zinc-500 font-medium tracking-tight ml-2">{stat.label}</span>
                </span>
                <span className="mx-10 text-zinc-800 text-2xl">•</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Podium Carousel ──────────────────────────────────────────────── */}
      <PodiumCarousel slides={podiumSlides} />

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
