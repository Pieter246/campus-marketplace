"use client";

import Button from "@/components/ui/Button";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function WithdrawButton({ id }: { id: string }) {
  const router = useRouter();
  const auth = useAuth();
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdrawClick = async () => {
    const tokenResult = await auth?.currentUser?.getIdTokenResult();

    //Redirect if token is invalid
    if (!tokenResult) {
      router.push("/login");
      return;
    }

    setIsWithdrawing(true);

    // API call withdraw item
    const response = await fetch("/api/items/actions/withdraw", {
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
        description: result.message || "Failed to withdraw item.",
      });
      setIsWithdrawing(false);
      return;
    }

    setIsWithdrawing(false);

    toast.success("Success!", {
      description: "The item has been withdrawn and is now placed as draft",
    });

    // if (auth?.customClaims?.admin) router.push("/profile/admin/items");
    // else router.push("/profile/user");

    router.push("/profile/user");
  };

  return (
    <Button
      className="flex-1"
      onClick={handleWithdrawClick}
      disabled={isWithdrawing}
    >
      {isWithdrawing ? "Withdrawing..." : "Withdraw Item"}
    </Button>
  );
}
