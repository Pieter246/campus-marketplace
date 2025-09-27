"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import FiltersForm from "./item-search/filters-form";
import Image from "next/image";
import imageUrlFormatter from "@/lib/imageUrlFormatter";
import { BookMarked } from "lucide-react";
import numeral from "numeral";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import ItemConditionBadge from "@/components/item-condition-badge";
import SortDropdown from "@/components/ui/SortDropdown";
import { useAuth } from "@/context/auth";
import { Item } from "@/types/item";

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const auth = useAuth();

  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const minPrice = parseInt(searchParams.get("minPrice") || "") || null;
  const maxPrice = parseInt(searchParams.get("maxPrice") || "") || null;
  const condition = searchParams.get("condition") || null;
  const searchTerm = searchParams.get("search") || null;
  const sort = searchParams.get("sort") || "newest";
  const category = searchParams.get("category") || "all";

  const fetchItems = async (pageNum: number, append: boolean = false) => {
    if (auth === undefined) return; // wait until auth context has settled

    setLoading(true);

    let token: string | null = null;
    if (auth?.currentUser) {
      token = await auth.currentUser.getIdToken();
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch("/api/items/list", {
        method: "POST",
        headers,
        body: JSON.stringify({
          page: pageNum,
          pageSize: 10,
          minPrice,
          maxPrice,
          condition,
          status: ["for-sale"],
          searchTerm,
          sort,
          category,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success || !Array.isArray(result.items)) {
        console.error("Failed to fetch items:", result.message || result.error);
        setLoading(false);
        setHasMore(false);
        return;
      }

      setItems((prev) => (append ? [...prev, ...result.items] : result.items));
      setHasMore(pageNum < result.totalPages);
    } catch (err) {
      console.error("Fetch error:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth !== undefined) {
      setItems([]); // Reset items on filter change
      setPage(1);
      setHasMore(true);
      fetchItems(1);
    }
  }, [
    auth?.currentUser,
    minPrice,
    maxPrice,
    condition,
    searchTerm,
    sort,
    category,
  ]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchItems(nextPage, true);
  };

  return (
    <div className="max-w-screen-lg mx-auto px-2 pb-6">
      <div className="flex flex-col items-center text-center space-y-4 pb-6">
        <h1 className="text-2xl font-bold">
          Welcome to Campus Marketplace!
        </h1>
        <p className="">
          Buy and sell textbooks, technology, and more.
        </p>
      </div>

      {/* Search */}
      <div className="space-y-4 bg-white rounded-xl">
        <form method="get" className="flex gap-2 p-4">
          <input
            type="text"
            name="search"
            defaultValue={searchTerm ?? ""}
            placeholder="Search items..."
            className="flex-1 border border-gray-300 rounded-md p-2"
          />
          <Button type="submit">Search</Button>
        </form>
      </div>

      <div className="flex flex-col md:flex-row gap-5 mt-5 bg-white items-center rounded-xl px-6 py-4">
        <div className="flex-1 w-full md:w-auto">
          <SortDropdown />
        </div>
        <div className="flex-shrink-0 w-full md:w-auto">
          <FiltersForm />
        </div>
      </div>

      {/* Items grid */}
      {loading && items.length === 0 ? (
        <p className="text-center py-10 text-zinc-400">Loading items...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-5 gap-5">
          {items.map((item) => {
            const addressLines = [item.collectionAddress]
              .filter(Boolean)
              .join(", ");
            return (
              <Card key={item.id} className="overflow-hidden pt-0 pb-0">
                <CardContent className="px-0 flex flex-col h-full">
                  <div className="h-40 relative bg-sky-50 text-zinc-400 flex flex-col justify-center items-center">
                    {!!item.images?.[0] ? (
                      <Image
                        fill
                        className="object-cover"
                        src={imageUrlFormatter(item.images[0])}
                        alt=""
                      />
                    ) : (
                      <>
                        <BookMarked />
                        <small>No Image</small>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 p-5 flex-1">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <p className="font-semibold truncate">{item.title}</p>
                      <ItemConditionBadge
                        condition={item.condition}
                        className="capitalize text-base flex-shrink-0 text-xs"
                      />
                    </div>
                    <p className="text-sm text-zinc-500">{addressLines}</p>
                  </div>

                  <div className="flex flex-col gap-2 p-5 pt-0">
                    <p className="text-2xl font-bold">
                      R{numeral(item.price).format("0,0")}
                    </p>
                    <Button asChild>
                      <Link href={`/item/${item.id}`}>View item</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center py-10">
          <Button onClick={handleLoadMore} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}