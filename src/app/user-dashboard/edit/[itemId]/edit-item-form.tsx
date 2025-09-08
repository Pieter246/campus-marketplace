"use client"

import ItemForm from "@/components/item-form";
import { auth, storage } from "@/firebase/client";
import { Item } from "@/types/item";
import { itemSchema } from "@/validation/itemSchema";
import { updateItem } from "./actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteObject, ref, uploadBytesResumable, UploadTask } from "firebase/storage";
import { saveItemImages } from "../../actions";
import { SaveIcon } from "lucide-react";
import z from "zod";

type Props = Item;

export default function EditPropertyForm({
    id,
    title,
    collectionAddress,
    description,
    price,
    status,
    condition,
    images= []
}: Props) {
    const router = useRouter();

    const handleSubmit = async (data: z.infer<typeof itemSchema>) => {

        // Get current user token to verify user is logged in
        const token = await auth?.currentUser?.getIdToken();
        if(!token){
            return;
        }

        // Destructure images and rest of data from data
        const {images: newImages, ...rest} = data;

        // Update item data this does not update images
        const response = await updateItem({...rest, id}, token);

        // If item update is not successful show message
        if(!!response?.error){
            toast.error("Error!", {
                description: response.message,
            });
            return;
        }

        // Handle image upload and deletion of existing images
        const storageTasks: (UploadTask | Promise<void>)[] = [];
        const imagesToDelete = images.filter(
            (image) => !newImages.find((newImage) => image === newImage.url)
        );

        imagesToDelete.forEach(image => {
            storageTasks.push(deleteObject(ref(storage, image)));
        });

        const paths: string[] = []
        newImages.forEach((image, index) => {
            if(image.file){
                const path = `items/${id}/${Date.now()}-${index}-${image.file.name}`;
                paths.push(path);
                const storageRef = ref(storage, path);
                storageTasks.push(uploadBytesResumable(storageRef, image.file));
            }else {
                paths.push(image.url)
            }
        })

        // Upload images to firebase
        await Promise.all(storageTasks);
        await saveItemImages({itemId: id, images: paths}, token)

        // Display success message and redirect to admin dashboard
        toast.success("Success!", {
            description: "Item updated",
        });

        // Redirect user to dashboard
        router.push("/user-dashboard");
    };
    return (
        <div>
            <ItemForm
                handleSubmit={handleSubmit}
                submitButtonLabel={
                    <>
                        <SaveIcon /> Save Item
                    </>
                }
                defaultValues={{
                    title,
                    collectionAddress,
                    description,
                    price,
                    status,
                    condition,
                    images: images.map(image => ({
                        id: image,
                        url: image
                    }))
                }}
            />
        </div>
    );
}