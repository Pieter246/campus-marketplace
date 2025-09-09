"use client"

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth";
import { useState } from "react";
import { TrashIcon } from "lucide-react";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "@/firebase/client";
import { deleteItem } from "./actions";
import { useRouter } from "next/navigation";

export default function DeleteItemButton({
    itemId,
    images
}: {
    itemId: string;
    images: string[];
}) {
    const router = useRouter();
    const auth = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = async () => {

        // Get current user token to verify user is logged in
        const token = await auth?.currentUser?.getIdToken();
        if(!token){
            return;
        }

        // Deleting animation start
        setIsDeleting(true)

        // Delete all images associated with the item
        const storageTasks: Promise<void>[] = [];
        images.forEach(image => {
            storageTasks.push(deleteObject(ref(storage, image)));
        });
        await Promise.all(storageTasks);

        // Delete the item
        await deleteItem(itemId, token);

        // Deleting animation finish
        setIsDeleting(false);

        // Redirect user to dashboard
        router.push("/dashboard/user")
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
                            This action cannot be undone. This will permanently delete this item.
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button onClick={handleDeleteClick} disabled={isDeleting}>
                        {isDeleting ? "Deleting..." : "Delete Item"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}