"use client";

import { useEffect, useState } from "react";
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

type Props = {
  page?: number;
};

export default function UserPurchaseTable({ page = 1 }: Props) {
  const auth = useAuth();
  const [data, setItems] = useState<Item[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      const user = auth?.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      // API call get items bought by the user
      const response = await fetch("/api/items/list", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyerId: user.uid,
          page,
          pageSize: 10,
        }),
      });

      // Get items result
      const result: GetItemsResponse = await response.json();

      // Display error if result has error
      if (!response.ok || !result.success || !Array.isArray(result.items)) {
        toast.error("Failed to fetch purchases", {
          description:
            result.message || result.error || "Failed to fetch purchases",
        });
        setLoading(false);
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
        Loading your purchases...
      </h1>
    );
  }

  return (
    <>
      {!data.length && (
        <h1 className="text-center text-zinc-400 py-20 font-bold text-2xl">
          You have no purchases
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
                <TableCell colSpan={4} className="text-center">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Button
                      disabled={page === i + 1}
                      key={i}
                      asChild={page !== i + 1}
                      variant="outline"
                      className="mx-1"
                    >
                      <Link href={`/profile/user?tab=purchases&page=${i + 1}`}>
                        {i + 1}
                      </Link>
                    </Button>
                  ))}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </>
      )}
    </>
  );
}
