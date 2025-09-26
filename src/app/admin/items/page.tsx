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

  // Read and validate status from URL, default to "all"
  const urlStatus = searchParams.get("status") || "all";
  const validatedStatus: ItemStatus | "all" = STATUSES.includes(urlStatus as any)
    ? (urlStatus as ItemStatus | "all")
    : "all";

  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<SortColumn>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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
    newSearchParams.set("status", data.status); // Always set status, including "all"
    router.push(`/admin/items?${newSearchParams.toString()}`);
  };

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
          status: validatedStatus === "all" ? undefined : [validatedStatus],
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
  }, [auth, validatedStatus]);

  // Sync form status with URL
  useEffect(() => {
    form.setValue("status", validatedStatus);
  }, [form, validatedStatus]);

  // Filter and sort items
  useEffect(() => {
    const filtered = items
      .filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (validatedStatus === "all" || item.status === validatedStatus)
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
  }, [items, searchTerm, validatedStatus, sortColumn, sortDirection]);

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