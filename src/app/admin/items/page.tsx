"use client";

import { useEffect, useState } from "react";
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

const STATUSES: (ItemStatus | "all")[] = ["all", "pending", "for-sale", "draft", "sold", "withdrawn", "collected"];

type SortColumn = "title" | "price" | "status";
type SortDirection = "asc" | "desc";

export default function AdminItemsPage() {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read and validate status from URL, default to pending
  const urlStatus = searchParams.get("status") || "pending";
  const validatedStatus: ItemStatus | "all" = STATUSES.includes(urlStatus as any)
    ? (urlStatus as ItemStatus | "all")
    : "pending";

  const [statusFilter, setStatusFilter] = useState<ItemStatus | "all">(validatedStatus);
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<SortColumn>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    const fetchItems = async () => {
      const user = auth?.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      const response = await fetch("/api/items/list", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: statusFilter === "all" ? undefined : [statusFilter],
        }),
      });

      const result: GetItemsResponse = await response.json();

      if (!response.ok || !result.success || !Array.isArray(result.items)) {
        toast.error("Failed to fetch items", {
          description: result.message || result.error || "Failed to fetch items.",
        });
        setLoading(false);
        return;
      }

      setItems(result.items);
      setLoading(false);
    };

    setLoading(true);
    fetchItems();
  }, [auth, statusFilter]);

  // Keep status filter in sync with URL param
  useEffect(() => {
    const validatedStatus: ItemStatus | "all" = STATUSES.includes(urlStatus as any)
      ? (urlStatus as ItemStatus | "all")
      : "pending";
    setStatusFilter(validatedStatus);
  }, [urlStatus]);

  // Filter and sort items
  useEffect(() => {
    const filtered = items
      .filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (statusFilter === "all" || item.status === statusFilter)
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
  }, [items, searchTerm, statusFilter, sortColumn, sortDirection]);

  const handleStatusChange = (status: ItemStatus | "all") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", status);
    router.push(`/admin/items?${params.toString()}`);
  };

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

  if (loading) {
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
        <input
          id="search-items"
          type="text"
          placeholder="Search items by title..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full max-w-sm px-4 py-2 border rounded-lg shadow-sm text-base"
        />
        <div className="flex gap-2 items-center">
          {STATUSES.map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "primary" : "outline"}
              onClick={() => handleStatusChange(status)}
              className="px-4 py-2 h-auto text-base min-h-0"
            >
              {status === "all"
                ? "All"
                : status
                    .replace("-", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
            </Button>
          ))}
        </div>
      </div>

      {!filteredItems.length && (
        <h1 className="text-center text-zinc-400 py-20 font-bold text-3xl">
          No items found
        </h1>
      )}

      {!!filteredItems.length && (
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
            {filteredItems.map((item) => {
              const detail = [item.title]
                .filter((addressLine) => !!addressLine)
                .join(", ");

              return (
                <TableRow key={item.id}>
                  <TableCell>{detail}</TableCell>
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
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}