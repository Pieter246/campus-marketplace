"use client";

import Button from "@/components/ui/Button";
import { auth } from "@/firebase/client"; // your Firebase client
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface BuyButtonProps {
  itemId: string;   // Pass the item's unique ID here
  quantity?: number; // Optional, defaults to 1
}

export default function BuyButton({ itemId, quantity = 1 }: BuyButtonProps) {
  const router = useRouter();
  const [isBuying, setIsBuying] = useState(false);

  const handleBuyClick = async () => {
    if (!auth.currentUser) {
      router.push("/login");
      return;
    }

    setIsBuying(true);

    try {
      // Get fresh ID token from the current user
      const token = await auth.currentUser.getIdToken(true);

      // Call your cart API to add the item
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId, quantity }),
      });

      const result = await response.json();

      if (!response.ok || result?.error) {
        toast.error("Error!", {
          description: result.message || "Failed to add item to cart.",
        });
        return;
      }

      // Show success message
      toast.success("Success!", {
        description: "Item added to cart!",
      });

      // Redirect to the cart page
      router.push("/cart");
    } catch (err: any) {
      console.error("BuyButton error:", err);
      toast.error("Error!", { description: "Something went wrong." });
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <Button
      className="flex-1 w-full"
      onClick={handleBuyClick}
      disabled={isBuying}
    >
      {isBuying ? "Adding to cart..." : "Add to cart"}
    </Button>
  );
}
