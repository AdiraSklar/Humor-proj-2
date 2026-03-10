"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { ImageFormState } from "../actions";

interface ProfileOption {
  id: string;
  email: string;
}

interface ImageDefaults {
  id?: string;
  url?: string;
  profile_id?: string | null;
  is_public?: boolean;
  is_common_use?: boolean;
  additional_context?: string | null;
  image_description?: string | null;
}

interface Props {
  action: (prevState: ImageFormState, formData: FormData) => Promise<ImageFormState>;
  defaultValues?: ImageDefaults;
  profiles: ProfileOption[];
}

export function ImageForm({ action, defaultValues = {}, profiles }: Props) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [previewUrl, setPreviewUrl] = useState(defaultValues.url ?? "");

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      {/* Hidden id for update */}
      {defaultValues.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      {state?.error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
          {state.error}
        </p>
      )}

      {/* URL */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          URL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          name="url"
          required
          defaultValue={defaultValues.url ?? ""}
          onChange={(e) => setPreviewUrl(e.target.value)}
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          placeholder="https://example.com/image.jpg"
        />
        {previewUrl && (
          <div className="mt-2 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className="h-40 w-full object-contain bg-zinc-50 dark:bg-zinc-900"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      {/* Profile */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Profile
        </label>
        <select
          name="profile_id"
          defaultValue={defaultValues.profile_id ?? ""}
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          <option value="">— None —</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.email} ({p.id.slice(0, 8)}…)
            </option>
          ))}
        </select>
      </div>

      {/* Checkboxes */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Flags
        </legend>
        <label className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            name="is_public"
            defaultChecked={defaultValues.is_public ?? false}
            className="h-4 w-4 rounded border-zinc-300 accent-zinc-900 dark:accent-zinc-50"
          />
          Public
        </label>
        <label className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            name="is_common_use"
            defaultChecked={defaultValues.is_common_use ?? false}
            className="h-4 w-4 rounded border-zinc-300 accent-zinc-900 dark:accent-zinc-50"
          />
          Common use
        </label>
      </fieldset>

      {/* Additional context */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Additional context
        </label>
        <input
          type="text"
          name="additional_context"
          defaultValue={defaultValues.additional_context ?? ""}
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          placeholder="Optional"
        />
      </div>

      {/* Image description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Image description
        </label>
        <textarea
          name="image_description"
          rows={4}
          defaultValue={defaultValues.image_description ?? ""}
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          placeholder="Optional"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="cursor-pointer rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        <Link
          href="/admin/images"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
