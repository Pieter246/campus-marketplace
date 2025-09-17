"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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

export default function AdminItemsTable() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);

  const auth = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      const user = auth?.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      // Cal get items API
      const response = await fetch("/api/items/list", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page,
          pageSize: 10,
          status: ["for-sale", "pending"],
        }),
      });

      const result: GetItemsResponse = await response.json();

      if (!response.ok || !result.success || !Array.isArray(result.items)) {
        console.error("Failed to fetch items:", result.message || result.error);
        return;
      }

      setItems(result.items);
      setTotalPages(result.totalPages);
      setLoading(false);
    };

    fetchItems();
  }, [auth, page]);

  if (loading) {
    return (
      <h1 className="text-center text-zinc-400 py-20 font-bold text-2xl">
        Loading items...
      </h1>
    );
  }

  if (!items.length) {
    return (
      <h1 className="text-center text-zinc-400 py-20 font-bold text-3xl">
        There are no items to approve
      </h1>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-primary">Manage Items</h1>
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
          {items.map((item) => {
            const detail = [item.title].filter(Boolean).join(", ");

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
            <TableCell colSpan={4} className="text-center">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  disabled={page === i + 1}
                  key={i}
                  asChild={page !== i + 1}
                  variant="outline"
                  className="mx-1"
                >
                  <Link href={`/profile/admin/items?page=${i + 1}`}>
                    {i + 1}
                  </Link>
                </Button>
              ))}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
