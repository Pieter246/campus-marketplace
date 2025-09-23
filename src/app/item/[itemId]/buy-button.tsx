"use client";

import Button from "@/components/ui/Button";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function AddToCartButton({ id }: { id: string }) {
  const router = useRouter();
  const auth = useAuth();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    // Early return if not logged in
    if (!auth?.currentUser) {
      router.push("/login");
      return;
    }

    setIsAdding(true);

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/api/items/actions/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId: id }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error("Error!", { description: data.message || "Failed to add item to cart." });
        setIsAdding(false);
        return;
      }

      if (!data.success) {
        toast.error("Already in Cart", { description: data.message });
        setIsAdding(false);
        return;
      }

      toast.success("Added to Cart", { description: "Item has been added to your cart." });
      setIsAdding(false);

      // Redirect to cart
      router.push("/cart");
    } catch (err) {
      console.error(err);
      toast.error("Error!", { description: "Failed to add item to cart." });
      setIsAdding(false);
    }
  };

  return (
    <Button className="flex-1 w-full" onClick={handleAddToCart} disabled={isAdding}>
      {isAdding ? "Adding..." : "Add to Cart"}
    </Button>
  );
}
