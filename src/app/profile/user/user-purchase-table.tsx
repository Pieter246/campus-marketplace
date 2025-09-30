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
import EmailSellerButtonProfile from "@/components/email-seller-button-profile";

type Props = {
  page?: number;
};

export default function UserPurchaseTable({ page = 1 }: Props) {
  const auth = useAuth();
  const [data, setItems] = useState<Item[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      const user = auth?.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      // API call get purchases by the user
      const response = await fetch("/api/purchases", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Get purchases result
      const result = await response.json();

      // Display error if result has error
      if (!response.ok || !result.success || !Array.isArray(result.purchases)) {
        toast.error("Failed to fetch purchases", {
          description:
            result.message || result.error || "Failed to fetch purchases",
        });
        setLoading(false);
        return;
      }

      // Convert purchases to item-like format for the table
      const purchaseItems = result.purchases.map((purchase: any) => ({
        id: purchase.itemId,
        title: purchase.itemTitle,
        price: purchase.itemPrice,
        status: 'sold',
        buyerId: purchase.buyerId,
        sellerId: purchase.sellerId,
        sellerEmail: purchase.sellerEmail,
        updatedAt: purchase.createdAt,
        collectionStatus: purchase.collectionStatus || 'pending',
        purchaseId: purchase.id,
      }));

      setItems(purchaseItems);
      setTotalPages(1); // Simple pagination for now
      setLoading(false);
    };

    fetchPurchases();
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
                      {item.status === "sold" && (
                        <EmailSellerButtonProfile
                          sellerEmail={item.sellerEmail}
                          itemTitle={item.title}
                          itemId={item.id}
                          price={item.price}
                        />
                      )}
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
