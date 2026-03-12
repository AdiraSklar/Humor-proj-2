"use client";

import { useState } from "react";

interface Props {
  text: string;
  max?: number;
  className?: string;
}

export default function ExpandableText({ text, max = 100, className = "" }: Props) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = text.length > max;

  if (!needsTruncation) {
    return <span className={className}>{text}</span>;
  }

  return (
    <button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      className={`text-left cursor-pointer transition-colors hover:text-violet-300 ${className}`}
      title={expanded ? "Click to collapse" : "Click to expand"}
    >
      {expanded ? (
        <>
          {text}
          <span className="ml-1.5 text-[9px] font-bold uppercase tracking-widest text-zinc-600 hover:text-violet-400">
            ↑ less
          </span>
        </>
      ) : (
        <>
          {text.slice(0, max)}
          <span className="text-zinc-600">…</span>
          <span className="ml-1.5 text-[9px] font-bold uppercase tracking-widest text-zinc-600 hover:text-violet-400">
            more
          </span>
        </>
      )}
    </button>
  );
}
