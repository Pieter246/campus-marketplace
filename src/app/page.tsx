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
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const minPrice = parseInt(searchParams.get("minPrice") || "") || null;
  const maxPrice = parseInt(searchParams.get("maxPrice") || "") || null;
  const condition = searchParams.get("condition") || null;
  const searchTerm = searchParams.get("search") || null;

  useEffect(() => {
    const fetchItems = async () => {
      const user = auth?.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      // Call API
      const response = await fetch("/api/items/list", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page,
          pageSize: 10,
          minPrice,
          maxPrice,
          condition,
          status: ["for-sale"],
          searchTerm,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success || !Array.isArray(result.items)) {
        console.error("Failed to fetch items:", result.message || result.error);
        return;
      }

      setItems(result.items);
      setTotalPages(result.totalPages);
      setLoading(false);
    };

    fetchItems();
  }, [auth, page, minPrice, maxPrice, condition, searchTerm]);

  return (
    <div className="max-w-screen-lg mx-auto px-2">
      <h1 className="text-2xl font-bold pb-2 text-center">Welcome to Campus Marketplace!</h1>
      <p className="text-center pb-10">Buy and sell textbooks, technology, and more.</p>

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
      {loading ? (
        <p className="text-center py-10 text-zinc-400">Loading items...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-5 gap-5">
          {items.map((item) => {
            const addressLines = [item.collectionAddress].filter(Boolean).join(", ");
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
                    <p className="text-2xl font-bold">R{numeral(item.price).format("0,0")}</p>
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

      {/* Pagination */}
      <div className="flex gap-2 items-center justify-center py-10">
        {Array.from({ length: totalPages }).map((_, i) => {
          const newSearchParams = new URLSearchParams(searchParams.toString());
          newSearchParams.set("page", `${i + 1}`);

          return (
            <Button
              asChild={page !== i + 1}
              disabled={page === i + 1}
              variant="outline"
              key={i}
            >
              <Link href={`/?${newSearchParams.toString()}`}>{i + 1}</Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}