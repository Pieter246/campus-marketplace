"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

export default function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "newest";

  const handleSortChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams as any);
    newSearchParams.set("sort", value);
    newSearchParams.set("page", "1");
    router.push(`/?${newSearchParams.toString()}`);
  };

  return (
    <div className="flex flex-col pb-0">
      <label htmlFor="sort" className="text-xs font-medium mb-2">Sort By</label>
      <Select defaultValue={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-50 max-w-xl h-10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="oldest">Oldest</SelectItem>
          <SelectItem value="price-asc">Price: Low → High</SelectItem>
          <SelectItem value="price-desc">Price: High → Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
