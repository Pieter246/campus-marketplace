"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ItemStatusBadge from "@/components/item-status-badge";
import Button from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EyeIcon } from "lucide-react";
import Link from "next/link";
import numeral from "numeral";
import { useAuth } from "@/context/auth";
import { GetItemsResponse } from "@/types/GetItemsResponse";
import { Item } from "@/types/item";
import { toast } from "sonner";

const STATUSES = ["all", "pending", "for-sale", "draft", "sold", "withdrawn"];

export default function AdminItemsPage() {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get page from URL params
  const page = parseInt(searchParams.get("page") || "1");
  
  // read status from URL, default to pending
  const urlStatus = searchParams.get("status") || "pending";
  const [statusFilter, setStatusFilter] = useState(urlStatus);

  const [data, setItems] = useState<Item[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

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
          page,
          pageSize: 10,
          status: statusFilter === "all" ? undefined : [statusFilter],
        }),
      });

      const result: GetItemsResponse = await response.json();

      if (!response.ok || !result.success || !Array.isArray(result.items)) {
        toast.error("Failed to fetch items", {
          description:
            result.message || result.error || "Failed to fetch items.",
        });
        setLoading(false);
        return;
      }

      setItems(result.items);
      setTotalPages(result.totalPages);
      setLoading(false);
    };

    setLoading(true);
    fetchItems();
  }, [auth, page, statusFilter]);

  // keep state in sync with URL param
  useEffect(() => {
    setStatusFilter(urlStatus);
  }, [urlStatus]);

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", status);
    params.set("page", "1"); // reset to first page on filter change
    router.push(`/admin/items?${params.toString()}`);
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
      
      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {STATUSES.map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "primary" : "outline"}
            onClick={() => handleStatusChange(status)}
          >
            {status === "all"
              ? "All"
              : status
                  .replace("-", " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
          </Button>
        ))}
      </div>

      {!data.length && (
        <h1 className="text-center text-zinc-400 py-20 font-bold text-3xl">
          No items found
        </h1>
      )}
      
      {!!data.length && (
        <>
          <Table className="mt-5">
            <TableHeader>
              <TableRow>
                <TableHead>Details</TableHead>
                <TableHead>Listing price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => {
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
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/item/${item.id}`}>
                          <EyeIcon />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="text-center bg-white">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("page", String(i + 1));
                    return (
                      <Button
                        disabled={page === i + 1}
                        key={i}
                        asChild={page !== i + 1}
                        variant="outline"
                        className="mx-1 mt-5"
                      >
                        <Link href={`/admin/items?${params.toString()}`}>
                          {i + 1}
                        </Link>
                      </Button>
                    );
                  })}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </>
      )}
    </div>
  );
}
