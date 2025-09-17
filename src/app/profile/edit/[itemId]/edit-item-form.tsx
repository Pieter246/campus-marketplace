"use client";

import ItemForm from "@/components/item-form";
import { storage } from "@/firebase/client";
import { Item } from "@/types/item";
import { itemSchema } from "@/validation/itemSchema";
import { updateItem } from "./actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  deleteObject,
  ref,
  uploadBytesResumable,
  UploadTask,
} from "firebase/storage";
import { SaveIcon } from "lucide-react";
import z from "zod";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import DeleteItemButton from "./delete-item-button";
import { useAuth } from "@/context/auth";
import { saveItemImages } from "../../actions";

type Props = Item;

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
}: Props) {
  const router = useRouter();
  const auth = useAuth();

  const handleSubmit = async (data: z.infer<typeof itemSchema>) => {
    const token = await auth?.currentUser?.getIdToken();
    if (!token) return;

    const { images: newImages, ...rest } = data;

    // ✅ Call flat API directly
    const response = await fetch("/api/items/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ itemId: id, ...rest }),
    });

    // Get result of update
    const result = await response.json();

    if (!response.ok || result?.error) {
      toast.error("Error!", {
        description: result.message || "Failed to update item.",
      });
      return;
    }

    // Update item data this does not update images
    // const response = await updateItem({...rest, id}, token);

    // Handle image upload and deletion of existing images
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

    // Upload images to firebase
    await Promise.all(storageTasks);
    await saveItemImages({ itemId: id, images: paths }, token);

    // Display success message and redirect to admin dashboard
    toast.success("Success!", {
      description: "Item updated",
    });

    // Redirect user to dashboard
    router.push("/profile/user");
  };
  return (
    <div className="flex flex-col justify-center items-center p-4">
      <Breadcrumbs
        className="text-2xl pb-2"
        items={[
          {
            href: "/profile/user",
            label: "Profile",
          },
          {
            label: "Edit item",
          },
        ]}
      />
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl">
        {!auth?.customClaims?.admin && ( //Admins cannot delete the item
          <div className="text-3xl font-bold flex justify-end mb-6">
            {/* <h1 className="text-2xl font-bold">Sell Your Item</h1> */}
            <DeleteItemButton itemId={id} images={images || []} />
          </div>
        )}
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
