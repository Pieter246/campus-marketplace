"use client";

import Button from "@/components/ui/Button";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function BuyButton({ id }: { id: string }) {
  const router = useRouter();
  const auth = useAuth();
  const [isBuying, setIsBuying] = useState(false);

  const handleBuyClick = async () => {
    const tokenResult = await auth?.currentUser?.getIdTokenResult();

    //Redirect if token is invalid
    if (!tokenResult) {
      router.push("/login");
      return;
    }

    setIsBuying(true);

    // API call buy item
    const response = await fetch("/api/items/actions/buy", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenResult.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemId: id }),
    });

    // Get buy item result
    const result = await response.json();

    // Display error if result has error
    if (!response.ok || result?.error) {
      toast.error("Error!", {
        description: result.message || "Failed to purchase item.",
      });
      setIsBuying(false);
      return;
    }

    setIsBuying(false);

    // Display success message
    toast.success("Success!", {
      description: "You have bought an item!",
    });

    router.push("/profile/user?tab=purchases");
  };

  return (
    <Button className="flex-1" onClick={handleBuyClick} disabled={isBuying}>
      {isBuying ? "Buying..." : "Buy Item"}
    </Button>
  );
}
