"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/auth";
import { ShoppingCart } from "lucide-react"; 

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
      console.error("Add to cart error:", err);
      toast.error("Failed to add item to cart");
    } finally {
      setIsAdding(false);
    }
  };

   return (
    <Button 
      className="flex-1 w-full justify-center h-10" // Added justify-center for a better look on mobile
      onClick={handleAddToCart} 
      disabled={isAdding}
    >
      {isAdding ? (
        "Adding..."
      ) : (
        <>
          {/* MOBILE: Icon is shown by default (no size prefix). Hidden on 'sm' screens and up. */}
          <span className="sm:hidden">
            <ShoppingCart className="size-5" />
          </span>
          
          {/* DESKTOP: Text is hidden by default. Shown on 'sm' screens and up. */}
          <span className="hidden sm:inline">
            Add to cart
          </span>
        </>
      )}
    </Button>
  );
}
