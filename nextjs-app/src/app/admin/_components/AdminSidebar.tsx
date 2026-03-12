"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
  userEmail: string;
}

interface NavItem {
  href: string;
  label: string;
  soon?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    label: "Content",
    items: [
      { href: "/admin/images", label: "Images" },
      { href: "/admin/captions", label: "Captions" },
      { href: "/admin/caption-examples", label: "Caption Examples" },
    ],
  },
  {
    label: "Users",
    items: [
      { href: "/admin/users", label: "Users" },
    ],
  },
  {
    label: "Humor Engine",
    items: [
      { href: "/admin/humor-flavors", label: "Humor Flavors" },
      { href: "/admin/humor-flavor-steps", label: "Flavor Steps" },
      { href: "/admin/humor-flavor-mix", label: "Flavor Mix" },
    ],
  },
  {
    label: "LLM",
    items: [
      { href: "/admin/llm-providers", label: "Providers" },
      { href: "/admin/llm-models", label: "Models" },
      { href: "/admin/llm-prompt-chains", label: "Prompt Chains" },
      { href: "/admin/llm-model-responses", label: "Responses" },
    ],
  },
  {
    label: "Content Pipeline",
    items: [
      { href: "/admin/caption-requests", label: "Caption Requests" },
    ],
  },
  {
    label: "Terms",
    items: [
      { href: "/admin/terms", label: "Terms" },
    ],
  },
  {
    label: "Access Control",
    items: [
      { href: "/admin/allowed-signup-domains", label: "Allowed Domains" },
      { href: "/admin/whitelist-email-addresses", label: "Email Whitelist" },
    ],
  },
];

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="w-56 shrink-0 sticky top-0 h-screen overflow-y-auto flex flex-col bg-zinc-950 border-r border-white/5">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-white/5 shrink-0">
        <Link href="/" className="flex items-center gap-2.5 group w-fit">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 to-violet-600 shadow-lg shadow-violet-500/20 transition-transform group-hover:scale-110 shrink-0">
            <span className="text-xs font-bold text-white leading-none">C</span>
          </div>
          <div>
            <p className="text-sm font-black tracking-tight text-white uppercase group-hover:text-violet-400 transition-colors leading-none">
              Cracked AI
            </p>
            <p className="text-[9px] font-bold text-zinc-500 tracking-widest uppercase mt-0.5">
              Admin Central
            </p>
          </div>
        </Link>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 px-3 py-4 space-y-5" aria-label="Admin navigation">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="px-2 mb-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                if (item.soon) {
                  return (
                    <li key={item.href}>
                      <span
                        className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-700 cursor-not-allowed select-none`}
                      >
                        {item.label}
                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-800 bg-zinc-900 rounded-md px-1.5 py-0.5 shrink-0">
                          Soon
                        </span>
                      </span>
                    </li>
                  );
                }

                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                        active
                          ? "bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                          : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom: user info + actions */}
      <div className="px-3 py-4 border-t border-white/5 space-y-2 shrink-0">
        <div className="px-2 pb-1">
          <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 mb-0.5">
            Active Admin
          </p>
          <p className="text-[10px] font-black text-zinc-400 truncate">{userEmail}</p>
        </div>
        <form action="/logout" method="POST" className="w-full">
          <button
            type="submit"
            className="w-full flex cursor-pointer items-center justify-center rounded-xl border border-white/5 bg-zinc-900 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-zinc-500 transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 active:scale-[0.98]"
          >
            Sign out
          </button>
        </form>
        <Link
          href="/"
          className="w-full flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-violet-500/20 bg-violet-500/5 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-violet-500 transition-all hover:border-violet-400/40 hover:bg-violet-500/10 active:scale-[0.98]"
        >
          Exit
          <svg
            className="h-2.5 w-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Link>
      </div>
    </aside>
  );
}