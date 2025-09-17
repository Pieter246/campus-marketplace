"use client";

import Button from "@/components/ui/Button";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function SellButton({ id }: { id: string }) {
  const router = useRouter();
  const auth = useAuth();
  const [isSelling, setIsSelling] = useState(false);

  const handleSellClick = async () => {
    const tokenResult = await auth?.currentUser?.getIdTokenResult();

    //Redirect if token is invalid
    if (!tokenResult) {
      router.push("/login");
      return;
    }

    setIsSelling(true);

    // API call sell item
    const response = await fetch("/api/items/actions/sell", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenResult.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemId: id }),
    });

    const result = await response.json();

    if (!response.ok || result?.error) {
      toast.error("Error!", {
        description: result.message || "Failed to mark item as pending.",
      });
      setIsSelling(false);
      return;
    }

    setIsSelling(false);

    toast.success("Success!", {
      description: "Your item has been placed under review for sale",
    });

    router.push("/profile/user");
  };

  return (
    <Button className="flex-1" onClick={handleSellClick} disabled={isSelling}>
      {isSelling ? "Selling..." : "Sell Item"}
    </Button>
  );
}
