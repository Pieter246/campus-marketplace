"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/auth";
import { useState } from "react";
import { TrashIcon } from "lucide-react";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "@/firebase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DeleteItemButton({
  itemId,
  images,
}: {
  itemId: string;
  images: string[];
}) {
  const router = useRouter();
  const auth = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = async () => {
    const token = await auth?.currentUser?.getIdToken();
    if (!token) return;

    setIsDeleting(true);

    // Delete all images
    const storageTasks: Promise<void>[] = [];
    images.forEach((image) => {
      storageTasks.push(deleteObject(ref(storage, image)));
    });
    await Promise.all(storageTasks);

    // API call delete item
    const response = await fetch("/api/items/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ itemId }),
    });

    // Get delete item result
    const result = await response.json();

    // Display error if result has error
      if (!response.ok || result?.error) {
        toast.error("Delete item error", {
          description:
            result.message || result.error || "Unknown error.",
        });
        setIsDeleting(false);
        return;
      }

    setIsDeleting(false);
    // Direct user to profile page
    router.push("/profile/user");
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <TrashIcon />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this item?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              This action cannot be undone. This will permanently delete this
              item.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className="hover:bg-secondary hover:text-white px-4 py-5 text-base cursor-pointer">Cancel</AlertDialogCancel>
          <Button onClick={handleDeleteClick} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Item"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
