// These actions can only run on the server they wont be exposed to the client side in the browser
"use server"

import { auth } from "../firebase/server"; //Needed to change
import { cookies } from "next/headers";

export const removeToken = async () => {
    // Remove token and refresh token from cookies
    const cookieStore = await cookies();
    cookieStore.delete("firebaseAuthToken");
    cookieStore.delete("firebaseAuthRefreshToken");
};

export const setToken = async ({
    token,
    refreshToken
}: {
    token: string;
    refreshToken: string;
}) => {
    try{
        // verifiedToken is a decoded JWT (Json Web Token) token
        const verifiedToken = await auth.verifyIdToken(token); 

        if(!verifiedToken) {
            return;
        }

        //Check if user is admin and if so set custom claim admin to true
        const userRecord = await auth.getUser(verifiedToken.uid);
        if(
            process.env.ADMIN_EMAIL === userRecord.email && //ADMIN_EMAIL is set in .env.local file
            !userRecord.customClaims?.admin
        ) {
            auth.setCustomUserClaims(userRecord.uid, { //Check if THIS WORKS!!!!!!!!!
                admin: true
            });
        }

        // Store token and refresh token in cookies
        const cookieStore = await cookies();
        cookieStore.set("firebaseAuthToken", token, {
            httpOnly: true, // This is just a server side cookie we will not expose this to the client browser
            secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS in production environment
        });
        cookieStore.set("firebaseAuthRefreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });
    } catch (e) {
        console.log(e);
    }
}