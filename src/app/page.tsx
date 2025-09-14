import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FiltersForm from "./item-search/filters-form";
import { Suspense } from "react";
import { getItems } from "@/data/items";
import Image from "next/image";
import imageUrlFormatter from "@/lib/imageUrlFormatter";
import { BookMarked } from "lucide-react";
import numeral from "numeral";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { cookies } from "next/headers";
import { verifyTokenSafe } from "@/firebase/server";
import ItemConditionBadge from "@/components/item-condition-badge";
import SortDropdown from "@/components/ui/SortDropdown";
import Logo from "@/components/ui/Logo";


export default async function Home({ searchParams }: { searchParams: Promise<any> }) {
  const searchParamsValues = await searchParams;

  const parsedPage = parseInt(searchParamsValues?.page);
  const parsedMinPrice = parseInt(searchParamsValues?.minPrice);
  const parsedMaxPrice = parseInt(searchParamsValues?.maxPrice);

  const page = isNaN(parsedPage) ? 1 : parsedPage;
  const minPrice = isNaN(parsedMinPrice) ? null : parsedMinPrice;
  const maxPrice = isNaN(parsedMaxPrice) ? null : parsedMaxPrice;

  const condition: string | null = searchParamsValues.condition ?? null;
  const searchTerm: string | null = searchParamsValues.search ?? null;

  // Get user token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("firebaseAuthToken")?.value;
  const verifiedToken = await verifyTokenSafe(token); // safe verification

  // Fetch items with filters + search
  const { data, totalPages } = await getItems({
    pagination: { page, pageSize: 10 },
    filters: { minPrice, maxPrice, condition, status: ["for-sale"], searchTerm },
  });

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
        {/* Sort card */}
        <div className="flex-1 w-full md:w-auto">
          <SortDropdown />
        </div>
        {/* Filters card */}
        <div className="flex-shrink-0 w-full md:w-auto">
          <FiltersForm />
        </div>
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-5 gap-5">
        {data.map((item) => {
          const addressLines = [item.collectionAddress].filter(Boolean).join(", ");
          return (
            <Card key={item.id} className="overflow-hidden pt-0 pb-0">
              <CardContent className="px-0 flex flex-col h-full">
                {/* Image */}
                <div className="h-40 relative bg-sky-50 text-zinc-400 flex flex-col justify-center items-center">
                  {!!item.images?.[0] && (
                    <Image
                      fill
                      className="object-cover"
                      src={imageUrlFormatter(item.images[0])}
                      alt=""
                    />
                  )}
                  {!item.images?.[0] && (
                    <>
                      <BookMarked />
                      <small>No Image</small>
                    </>
                  )}
                </div>

                {/* Top content: title, condition, address */}
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

                {/* Bottom content: price + button */}
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


      {/* Pagination */}
      <div className="flex gap-2 items-center justify-center py-10">
        {Array.from({ length: totalPages }).map((_, i) => {
          const newSearchParams = new URLSearchParams();

          if (searchParamsValues?.minPrice) newSearchParams.set("minPrice", searchParamsValues.minPrice);
          if (searchParamsValues?.maxPrice) newSearchParams.set("maxPrice", searchParamsValues.maxPrice);
          if (searchParamsValues?.condition) newSearchParams.set("condition", searchParamsValues.condition);
          if (searchTerm) newSearchParams.set("search", searchTerm);

          newSearchParams.set("page", `${i + 1}`);

          return (
            <Button asChild={page !== i + 1} disabled={page === i + 1} variant="outline" key={i}>
              <Link href={`/?${newSearchParams.toString()}`}>{i + 1}</Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
