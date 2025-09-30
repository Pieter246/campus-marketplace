"use client";

import { use } from "react";
import EditItemForm from "./edit-item-form";
import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, User } from "@firebase/auth";
import { auth } from "@/firebase/client";
import { Item } from "@/types/item";
import { GetItemResponse } from "@/types/GetItemResponse";

export default function EditProperty({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = use(params); // ✅ unwrap the promise
  const [item, setItem] = useState<Item | null>(null);
  const [user, setUser] = useState<User | null>(null); // Fixed: Use User | null

  // ✅ Check auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        toast.error("Error!", {
          description: "You must log in to see items.",
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ Refactored fetch function
  const fetchItem = useCallback(async () => {
    if (!user || !itemId) return;

    try {
      const token = await user.getIdToken();

      // API call get item
      const response = await fetch(`/api/items/read?itemId=${itemId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Get item in result
      const result: GetItemResponse = await response.json();

      // Throw error if result has error
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch item");
      }

      // Set item to be used by form
      console.log("Fetched item:", result.item);
      setItem(result.item);
    } catch (err: unknown) { // Fixed: Use unknown with type check
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch item.";
      console.error("Fetch item error:", err);
      toast.error("Error!", {
        description: errorMessage,
      });
    }
  }, [user, itemId]);

  // ✅ Trigger fetch on user change
  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-10">
      {item && (
        <EditItemForm
          id={item.id}
          title={item.title}
          collectionAddress={item.collectionAddress}
          description={item.description}
          price={item.price}
          status={item.status}
          condition={item.condition}
          category={item.category}
          sellerId={item.sellerId}
          images={item.images || []}
        />
      )}
    </div>
  );
}