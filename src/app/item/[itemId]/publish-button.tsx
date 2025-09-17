"use client";

import Button from "@/components/ui/Button";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function PublishButton({ id }: { id: string }) {
  const router = useRouter();
  const auth = useAuth();
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublishClick = async () => {
    const tokenResult = await auth?.currentUser?.getIdTokenResult();

    //Redirect if token is invalid
    if (!tokenResult) {
      router.push("/login");
      return;
    }

    setIsPublishing(true);

    // API call publish item
    const response = await fetch("/api/items/actions/publish", {
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
        description: result.message || "Failed to publish item.",
      });
      setIsPublishing(false);
      return;
    }

    setIsPublishing(false);

    toast.success("Success!", {
      description: "The item is now published and visible for sale.",
    });

    router.push("/profile/user");
  };

  return (
    <Button
      className="flex-1 w-full"
      onClick={handlePublishClick}
      disabled={isPublishing}
    >
      {isPublishing ? "Publishing..." : "Publish Item"}
    </Button>
  );
}
