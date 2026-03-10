"use client";

import { SearchInput } from "./SearchInput";

export function UsersPageHeader({ defaultValue }: { defaultValue: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-end gap-4">
      <SearchInput defaultValue={defaultValue} />
    </div>
  );
}
