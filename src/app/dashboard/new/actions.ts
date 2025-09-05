"use server"

import { auth, firestore } from "@/firebase/server";
import { itemDataSchema } from "@/validation/itemSchema";
import z from "zod";

export const createItem = async (data: {
    title: string;
    collectionAddress: string;
    description: string;
    price: number;
    status: "for-sale" | "pending" | "withdrawn" | "sold";
    condition: "new" | "used" | "fair" | "poor";
}, authToken: string) => {
    const verifiedToken = await auth.verifyIdToken(authToken);

    if(!verifiedToken.admin){
        return {
            error: true,
            message: "Unauthorized",
        };
    }

    const validation = itemDataSchema.safeParse(data);
    if(!validation.success){
        return {
            error: true,
            message: validation.error.issues[0]?.message ?? "An error occurred",
        };
    }

    const item = await firestore.collection("items").add({
        ...data,
        created: new Date(),
        updated: new Date()
    })

    return {
        itemId: item.id,
    }
}