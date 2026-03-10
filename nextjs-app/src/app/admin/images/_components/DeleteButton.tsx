"use client";

import { deleteImage } from "../actions";

export function DeleteButton({ id }: { id: string }) {
  return (
    <form action={deleteImage} className="w-full flex justify-center">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        onClick={(e) => {
          if (!window.confirm("Delete this image? This cannot be undone.")) {
            e.preventDefault();
          }
        }}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-xl hover:bg-red-600 transition-colors group/del"
      >
        <svg 
          className="h-3.5 w-3.5 transition-transform group-hover/del:scale-110" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h14" />
        </svg>
        Delete
      </button>
    </form>
  );
}
