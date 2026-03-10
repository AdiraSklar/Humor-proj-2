"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/users", label: "Users" },
  { href: "/admin/images", label: "Images" },
  { href: "/admin/captions", label: "Captions" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-3" aria-label="Admin sections">
      {links.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={
              active
                ? "px-8 py-3 rounded-2xl bg-violet-500/10 text-violet-400 text-sm font-black uppercase tracking-[0.3em] border border-violet-500/20 shadow-[0_0_25px_rgba(139,92,246,0.15)] scale-105 transition-all"
                : "px-8 py-3 rounded-2xl text-zinc-500 text-sm font-bold uppercase tracking-[0.3em] transition-all hover:text-zinc-200 hover:bg-white/[0.03] hover:scale-105"
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
