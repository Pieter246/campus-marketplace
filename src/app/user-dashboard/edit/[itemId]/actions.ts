"use server"

import { auth, firestore } from "@/firebase/server";
import { Item } from "@/types/item"
import { itemDataSchema } from "@/validation/itemSchema";
import { revalidatePath } from "next/cache";

// Delete an item parameter itemId must be the same as route /dashboard/edit/[itemId]
export const deleteItem = async (itemId: string, authToken: string) => {

    // Get token and verify that user is admin
    // const verifiedToken = await auth.verifyIdToken(authToken);
    // if(!verifiedToken.admin){
    //     return {
    //         error: true,
    //         message: "Unauthorized",
    //     };
    // }

    // Delete item from Firestore
    await firestore.collection("items").doc(itemId).delete();
}

// Update an item parameter itemId must be the same as route /dashboard/edit/[itemId]
export const updateItem = async (data: Item, authToken: string) => {
    const { id, ...itemData} = data;

    // Get token and verify that user is admin
    // const verifiedToken = await auth.verifyIdToken(authToken);
    // if(!verifiedToken.admin){
    //     return {
    //         error: true,
    //         message: "Unauthorized",
    //     };
    // }

    // Check that item data is valid according to schema
    const validation = itemDataSchema.safeParse(itemData);
    if(!validation.success){
        return {
            error: true,
            message: validation.error.issues[0]?.message ?? "An error occurred",
        };
    }

    // Update item in Firestore (This does not handle image upload updates)
    await firestore
        .collection("items")
        .doc(id)
        .update({
            ...itemData,
            updated: new Date(),
        });

    revalidatePath(`/item/${id}`) //caching for Vercel
}