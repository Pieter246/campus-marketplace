"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

export default function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "newest";
  const currentCategory = searchParams.get("category") || "all";

  const handleSortChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("sort", value);
    newSearchParams.set("page", "1");

    router.push(`/?${newSearchParams.toString()}`);
  };

  const handleCategoryChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      newSearchParams.delete("category");
    } else {
      newSearchParams.set("category", value);
    }
    newSearchParams.set("page", "1");

    router.push(`/?${newSearchParams.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 pb-0">
      {/* Sort Select */}
      <div className="flex flex-col">
        <label htmlFor="sort" className="text-xs font-medium mb-2">
          Sort By
        </label>
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

      {/* Category Select */}
      <div className="flex flex-col">
        <label htmlFor="category" className="text-xs font-medium mb-2">
          Category
        </label>
        <Select defaultValue={currentCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-50 max-w-xl h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="books">Books</SelectItem>
            <SelectItem value="tech">Technology</SelectItem>
            <SelectItem value="stationery">Stationery</SelectItem>
            <SelectItem value="furniture">Furniture</SelectItem>
            {/* Add more categories as needed */}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}