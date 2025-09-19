"use server"

import { auth, firestore } from "@/firebase/server";
import { cookies } from "next/headers";

export const removeToken = async () => {
    const cookieStore = await cookies();
    cookieStore.delete("firebaseAuthToken");
    cookieStore.delete("firebaseAuthRefreshToken");
    cookieStore.delete("lastActivity");
};

export const setToken = async ({
    token,
    refreshToken
}: {
    token: string;
    refreshToken: string;
}) => {
    try{
        const verifiedToken = await auth.verifyIdToken(token);
        if(!verifiedToken) {
            return;
        }      

        /* Old admin emails method
        const adminEmails = process.env.ADMIN_EMAILS?.split(",") ?? []; //Get all admins was (process.env.ADMIN_EMAIL === userRecord.email &&)
        const userRecord = await auth.getUser(verifiedToken.uid);



        if( // If user is admin assign admin user claim
            userRecord.email &&
            adminEmails.includes(userRecord.email) &&
            !userRecord.customClaims?.admin
        ) {
            auth.setCustomUserClaims(verifiedToken.uid, {
                admin: true
            });
        }
        */

        const userDoc = await firestore.collection("users").doc(verifiedToken.uid).get();
        const userData = userDoc.data();

        if(userData?.isAdmin && !verifiedToken.admin) {
            await auth.setCustomUserClaims(verifiedToken.uid, {
                admin: true
            });
        }

        const cookieStore = await cookies();
        cookieStore.set("firebaseAuthToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });
        cookieStore.set("firebaseAuthRefreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });
        
        // Set last activity time when setting tokens (user is actively logging in)
        cookieStore.set("lastActivity", Date.now().toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });
    } catch (e) {
        console.log(e);
    }
}