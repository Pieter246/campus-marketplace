"use client"; //(Directive)Because this is a client component bunch of validation front-end which means javaScript needs to run in browser

import ItemForm from "@/components/item-form";
import { useAuth } from "@/context/auth";
import { itemSchema } from "@/validation/itemSchema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ref, uploadBytesResumable, UploadTask } from "firebase/storage";
import { storage } from "@/firebase/client";
import z from "zod";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { CreateItemResponse } from "@/types/CreateItemResponse";

export default function NewItem() {
  const auth = useAuth();
  const router = useRouter();

  const handleSubmit = async (data: z.infer<typeof itemSchema>) => {
    const token = await auth?.currentUser?.getIdToken();

    if (!token) {
      return;
    }
    const { images, ...rest } = data;

    // API call create item
    const response = await fetch("/api/items/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rest), // no need to wrap in `{ rest }`
    });

    // Get API response
    const itemsData: CreateItemResponse = await response.json();

    // Display error if response is invalid
    if (!response.ok || !itemsData.success || !itemsData.item?.itemId) {
      toast.error("Error!", {
        description:
          itemsData.message || itemsData.error || "Failed to create item.",
      });
      return;
    }

    const uploadTasks: UploadTask[] = [];
    const paths: string[] = [];
    images.forEach((image, index) => {
      if (image.file) {
        const path = `items/${itemsData.item.itemId}/${Date.now()}-${index}-${
          image.file.name
        }`;
        paths.push(path);
        const storageRef = ref(storage, path);
        uploadTasks.push(uploadBytesResumable(storageRef, image.file));
      }
    });

    await Promise.all(uploadTasks);

    // API call save images
    const imageResponse = await fetch("/api/items/actions/save-images", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemId: itemsData.item.itemId,
        images: paths,
      }),
    });

    // Get result of image upload
    const imageResult = await imageResponse.json();

    // Display error if imageResult has error
    if (!imageResponse.ok || imageResult?.error) {
      toast.error("Error!", {
        description: imageResult.message || "Failed to save item images.",
      });
      return;
    }

    // Display item created
    toast.success("Success!", {
      description: "Item created successfully",
    });

    router.push("/profile/user");
  };
  return (
    <div className="flex flex-col justify-center items-center pb-4">
      {/* Removed breadcrumb for now to preserve visual consistency
      <Breadcrumbs
        className="text-2xl pb-2"
        items={[
          { href: "/profile/user", label: "User" },
          { label: "New item" }, // current page, no href
        ]}
      />*/}
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl">
        <h1 className="text-2xl text-center font-bold pb-4">New Item</h1>
        <ItemForm
          handleSubmit={handleSubmit}
          submitButtonLabel={<>Add Item Listing</>}
        />
      </div>
    </div>
  );
}
