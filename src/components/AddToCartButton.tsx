"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/auth";

export default function AddToCartButton({ id }: { id: string }) {
  const router = useRouter();
  const auth = useAuth();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!auth?.currentUser) {
      router.push("/login");
      return;
    }

    setIsAdding(true);

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/api/items/actions/add-to-cart", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId: id }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to add item to cart");
      } else {
        toast.success("Item added to cart");
        router.push("/cart");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add item to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button className="flex-1 w-full" onClick={handleAddToCart} disabled={isAdding}>
      {isAdding ? "Adding..." : "Add to cart"}
    </Button>
  );
}
