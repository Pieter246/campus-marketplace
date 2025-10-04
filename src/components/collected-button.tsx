"use client";

import { Package } from "lucide-react";
import Button from "@/components/ui/Button";
import { getAuth } from "firebase/auth";
import { useState } from "react";

interface CollectedButtonProps {
  itemId: string;
  itemTitle: string;
  onCollected?: () => void;
}

export default function CollectedButton({ 
  itemId, 
  itemTitle, 
  onCollected 
}: CollectedButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkCollected = async () => {
    if (!window.confirm(`Mark "${itemTitle}" as collected?\n\nThis confirms you have picked up the item from the seller.`)) {
      return;
    }

    setIsLoading(true);
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      
      if (!token) {
        alert("Please log in to mark items as collected");
        return;
      }

      const response = await fetch("/api/items/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId,
          status: "collected",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to mark as collected");
      }

      alert("Item marked as collected!");
      if (onCollected) onCollected();
      
    } catch (error: unknown) {
      console.error("Error marking item as collected:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to mark item as collected";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleMarkCollected}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="flex items-center gap-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
    >
      <Package size={16} />
      {isLoading ? "Marking..." : "Collected"}
    </Button>
  );
}