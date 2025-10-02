// In edit-item-form.tsx
"use client";

import ItemForm from "@/components/item-form";
import { storage } from "@/firebase/client";
import { Item } from "@/types/item";
import { itemSchema } from "@/validation/itemSchema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  deleteObject,
  ref,
  uploadBytesResumable,
  UploadTask,
} from "firebase/storage";
import { z } from "zod";
import DeleteItemButton from "./delete-item-button";
import { useAuth } from "@/context/auth";

export default function EditPropertyForm({
  id,
  title,
  collectionAddress,
  description,
  price,
  status,
  condition,
  category,
  sellerId,
  images = [],
}: Item) {
  const router = useRouter();
  const auth = useAuth();

  // Optional: Validate category at runtime
  const validCategories = ["books", "electronics", "clothing", "notes", "stationery", "other"] as const;
  if (!validCategories.includes(category)) {
    toast.error("Error!", {
      description: "Invalid category value.",
    });
    return null;
  }

  const handleSubmit = async (data: z.infer<typeof itemSchema>, status: "draft" | "pending" = "draft") => {
    const token = await auth?.currentUser?.getIdToken();
    if (!token) return;

    const { images: newImages, ...rest } = data;

    // Include status in the API payload
    const response = await fetch("/api/items/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ itemId: id, ...rest, status }), // Include status
    });

    const result = await response.json();

    if (!response.ok || result?.error) {
      toast.error("Error!", {
        description: result.message || "Failed to update item.",
      });
      return;
    }

    // Handle image upload and deletion
    const storageTasks: (UploadTask | Promise<void>)[] = [];
    const imagesToDelete = images.filter(
      (image) => !newImages.find((newImage) => image === newImage.url)
    );

    imagesToDelete.forEach((image) => {
      storageTasks.push(deleteObject(ref(storage, image)));
    });

    const paths: string[] = [];
    newImages.forEach((image, index) => {
      if (image.file) {
        const path = `items/${id}/${Date.now()}-${index}-${image.file.name}`;
        paths.push(path);
        const storageRef = ref(storage, path);
        storageTasks.push(uploadBytesResumable(storageRef, image.file));
      } else {
        paths.push(image.url);
      }
    });

    await Promise.all(storageTasks);

    // API call save images
    const imageResponse = await fetch("/api/items/actions/save-images", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemId: id,
        images: paths,
      }),
    });

    const imageResult = await imageResponse.json();

    if (!imageResponse.ok || imageResult?.error) {
      toast.error("Error!", {
        description: imageResult.message || "Failed to save item images.",
      });
      return;
    }

    toast.success("Success!", {
      description: "Item updated",
    });

    router.push("/profile/user");
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="flex-1 text-2xl font-bold text-center">Edit Item</h1>
          <div className="text-3xl font-bold">
            <DeleteItemButton itemId={id} images={images || []} />
          </div>
        </div>
        <ItemForm
          handleSubmit={handleSubmit}
          submitButtonLabel={<>Save Item</>}
          defaultValues={{
            title,
            collectionAddress,
            description,
            price,
            status,
            condition,
            category,
            sellerId,
            images: images.map((image) => ({
              id: image,
              url: image,
            })),
          }}
        />
      </div>
    </div>
  );
}