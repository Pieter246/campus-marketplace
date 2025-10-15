"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ItemStatusBadge from "@/components/item-status-badge";
import Button from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EyeIcon } from "lucide-react";
import Link from "next/link";
import numeral from "numeral";
import { useAuth } from "@/context/auth";
import { GetItemsResponse } from "@/types/GetItemsResponse";
import { Item, ItemStatus } from "@/types/item";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

const STATUSES: (ItemStatus | "all")[] = ["all", "pending", "for-sale", "draft", "sold", "withdrawn", "collected"];

// Form schema
const formSchema = z.object({
  status: z.enum(["all", "pending", "for-sale", "draft", "sold", "withdrawn", "collected"]),
});

type SortColumn = "title" | "price" | "status";
type SortDirection = "asc" | "desc";

export default function AdminItemsPage() {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Type-safe status validation
  const isValidStatus = (status: string | null): status is ItemStatus | "all" =>
    status !== null && STATUSES.includes(status as ItemStatus | "all");

  const urlStatus = searchParams.get("status") || "all";
  const validatedStatus: ItemStatus | "all" = isValidStatus(urlStatus) ? urlStatus : "all";

  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortColumn>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const itemsPerPage = 20;

  // Initialize form for status dropdown
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: validatedStatus,
    },
  });

  // Handle form submission for status
  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("status", data.status);
    router.push(`/admin/items?${newSearchParams.toString()}`);
  };

  // Fetch items
  const fetchItems = useCallback(async (pageNum: number, reset: boolean = false) => {
    if (isFetching) return;
    setIsFetching(true);
    try {
      const user = auth?.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      setIsLoadingMore(pageNum > 1);

      const response = await fetch("/api/items/list", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: validatedStatus === "all" ? undefined : [validatedStatus],
          page: pageNum,
          pageSize: itemsPerPage + 1, // Fetch one extra to check for more items
        }),
      });

      const result: GetItemsResponse = await response.json();

      if (!response.ok || !result.success || !Array.isArray(result.items)) {
        toast.error("Failed to fetch items", {
          description: result.message || result.error || "Failed to fetch items.",
        });
        return;
      }

      // Deduplicate items by id
      const newItems = result.items.slice(0, itemsPerPage).filter(
        (newItem) => !items.some((existingItem) => existingItem.id === newItem.id)
      );
      setHasMore(result.items.length > itemsPerPage);
      setItems((prevItems) => (reset ? newItems : [...prevItems, ...newItems]));
    } catch (error) {
      toast.error("Failed to fetch items", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoadingMore(false);
      setIsFetching(false);
      if (pageNum === 1) setLoading(false);
    }
  }, [auth, isFetching, items, itemsPerPage, validatedStatus]);

  // Fetch items on mount or when status changes
  useEffect(() => {
    setItems([]); // Reset items
    setHasMore(true); // Reset hasMore
    setPage(1); // Reset page
    setLoading(true);
    fetchItems(1, true);
  }, [auth, validatedStatus, fetchItems]);

  // Sync form status with URL
  useEffect(() => {
    form.setValue("status", validatedStatus);
  }, [form, validatedStatus]);

  // Filter and sort items locally
  useEffect(() => {
    const filtered = items
      .filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const multiplier = sortDirection === "asc" ? 1 : -1;
        switch (sortColumn) {
          case "title":
            return multiplier * a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
          case "price":
            return multiplier * (a.price - b.price);
          case "status":
            return multiplier * a.status.localeCompare(b.status, undefined, { sensitivity: "base" });
          default:
            return 0;
        }
      });
    setFilteredItems(filtered);
  }, [items, searchTerm, sortColumn, sortDirection]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore && !isFetching) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchItems(nextPage);
    }
  };

  if (loading && !items.length) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6 text-primary">Approve Items</h1>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading items...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-primary">Approve Items</h1>

      {/* Search and Status Filter */}
      <div className="flex gap-4 mb-4 items-center">
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-1">Search</p>
          <input
            id="search-items"
            type="text"
            placeholder="Search items by title..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full max-w-sm px-4 py-2 border rounded-lg shadow-sm text-base"
          />
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col h-17"
          >
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Status</FormLabel>
                  <FormControl>
                    <Select
                      defaultValue={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.handleSubmit(handleSubmit)();
                      }}
                    >
                      <SelectTrigger className="w-32 px-4 py-5 rounded-lg text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((status) => (
                          <SelectItem key={status} value={status} className="text-base">
                            {status === "all"
                              ? "All"
                              : status
                                  .replace("-", " ")
                                  .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>

      {!filteredItems.length && (
        <h1 className="text-center text-zinc-400 py-20 font-bold text-3xl">
          No items found
        </h1>
      )}

      {!!filteredItems.length && (
        <>
          <Table className="mt-5">
            <TableHeader>
              <TableRow className="border-b text-gray-600">
                <TableHead className="cursor-pointer" onClick={() => handleSort("title")}>
                  Title {sortColumn === "title" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("price")}>
                  Listing price {sortColumn === "price" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                  Status {sortColumn === "status" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>R{numeral(item.price).format("0,0")}</TableCell>
                  <TableCell>
                    <ItemStatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="flex justify-end gap-1">
                    <Button
                      asChild
                      className="inline-flex items-center justify-center rounded-lg font-medium transition-colors border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background focus:ring-2 focus:ring-offset-2 focus:ring-foreground px-3 py-1.5 text-sm h-auto min-h-0"
                    >
                      <Link href={`/item/${item.id}`}>
                        <EyeIcon />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {hasMore && (
            <div className="mt-4 flex justify-center">
              <Button
                onClick={handleLoadMore}
                disabled={isLoadingMore || isFetching}
                className="px-4 py-2"
              >
                {isLoadingMore ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Loading...
                  </span>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}