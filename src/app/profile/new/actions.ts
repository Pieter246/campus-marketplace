"use server"

import { auth, firestore } from "@/firebase/server";
import { itemDataSchema } from "@/validation/itemSchema";

export const createItem = async (data: {
    title: string;
    collectionAddress: string;
    description: string;
    price: number;
    status: "draft" | "pending" | "for-sale" | "sold" | "withdrawn";
    condition: "new" | "used" | "fair" | "poor";
    category: "books" | "electronics" | "clothing";
}, authToken: string) => {
    const verifiedToken = await auth.verifyIdToken(authToken);

    // Admins cannot create items only users can
    if(verifiedToken.admin){
        return {
            error: true,
            message: "Unauthorized",
        };     
    }

    const validation = itemDataSchema.safeParse(data);
    if(!validation.success){
        console.log("There is an error")
        return {
            error: true,
            message: validation.error.issues[0]?.message ?? "An error occurred",
        };
    }

    const item = await firestore.collection("items").add({
        ...data,
        sellerId: verifiedToken.uid, // Add users token ID to item
        created: new Date(),
        updated: new Date()
    })

    console.log(`Item created: ${item.id}`);

    return {
        itemId: item.id,
    }
}