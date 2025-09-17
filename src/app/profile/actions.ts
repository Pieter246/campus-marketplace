"use server"

import { auth, firestore } from "@/firebase/server";
import z from "zod";

export const saveItemImages = async ({itemId, images}: {
    itemId: string;
    images: string[];
}, authToken: string) => {  
    const verifiedToken = await auth.verifyIdToken(authToken);

    // Admins cannot create items only users can
    if(verifiedToken.admin){
        return {
            error: true,
            message: "Unauthorized",
        };
    }

    const schema = z.object({
        itemId: z.string(),
        images: z.array(z.string())
    })

    const validation = schema.safeParse({itemId, images});
    if(!validation.success){
        return{
            error: true,
            message: validation.error.issues[0]?.message ?? "An error occurred"
        }
    }

    console.log("Saving images for itemId:", itemId);

    await firestore.collection("items").doc(itemId).update({
        images,
    })
}