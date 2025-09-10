"use server"

import { auth, firestore } from "@/firebase/server";
import { Item } from "@/types/item"
import { itemDataSchema } from "@/validation/itemSchema";
import { revalidatePath } from "next/cache";

// Delete an item parameter itemId must be the same as route /dashboard/edit/[itemId]
export const deleteItem = async (itemId: string, authToken: string) => {
    const verifiedToken = await auth.verifyIdToken(authToken);

    // if no token, return error
    if(!verifiedToken){
        return {
            error: true,
            message: "Unauthorized"
        }
    }

    // Delete item from Firestore
    await firestore.collection("items").doc(itemId).delete();
}

// Update an item parameter itemId must be the same as route /dashboard/edit/[itemId]
export const updateItem = async (data: Item, authToken: string) => {
    const verifiedToken = await auth.verifyIdToken(authToken);

    // if no token, return error
    if(!verifiedToken){
        return {
            error: true,
            message: "Unauthorized"
        }
    }

    const { id, ...itemData} = data;

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

// User sells an item
export const withdrawItem = async (id: string, authToken: string) =>{
    const verifiedToken = await auth.verifyIdToken(authToken);

    // if no token, return error
    if(!verifiedToken){
        return {
            error: true,
            message: "Unauthorized"
        }
    }

    // Set item status to pending
    await firestore
        .collection("items")
        .doc(id)
        .update({
            status: "draft",
            buyerId: verifiedToken.uid,
            updated: new Date()
        });
}

// User sells an item
export const sellItem = async (id: string, authToken: string) =>{
    const verifiedToken = await auth.verifyIdToken(authToken);

    // if no token, return error
    if(!verifiedToken){
        return {
            error: true,
            message: "Unauthorized"
        }
    }

    // Set item status to pending
    await firestore
        .collection("items")
        .doc(id)
        .update({
            status: "pending",
            buyerId: verifiedToken.uid,
            updated: new Date()
        });
}

// User buys an item
export const buyItem = async (id: string, authToken: string) =>{
    const verifiedToken = await auth.verifyIdToken(authToken);

    // if no token, return error
    if(!verifiedToken){
        return {
            error: true,
            message: "Unauthorized"
        }
    }

    // Set item status to sold
    await firestore
        .collection("items")
        .doc(id)
        .update({
            status: "sold",
            buyerId: verifiedToken.uid,
            updated: new Date()
        });
}

// Admin approves an item for sale and updates condition
export const approveItem = async (id: string, realCondition: string, authToken: string) =>{
    const verifiedToken = await auth.verifyIdToken(authToken);

    // if no token, return error
    if(!verifiedToken){
        return {
            error: true,
            message: "Unauthorized"
        }
    }

    // remove the favourite
    await firestore
        .collection("items")
        .doc(id)
        .update({
            status: "for-sale",
            condition: realCondition,
            updated: new Date()
        });
}