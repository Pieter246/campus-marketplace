"use server"

import { auth } from "@/firebase/server";

export const registerUser = async (userEmail: string, userPassword: string) => {
    try {
        await auth.createUser({
            email: userEmail,
            password: userPassword
        });
    }catch(e: any){
        // Display error message to user (most likely email already in use)
        return {
            error: true,
            message: e.message ?? "Could not register user"
        }
    }
}