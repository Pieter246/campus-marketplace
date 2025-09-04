"use server"

import { auth } from "@/firebase/server";
import { registerUserSchema } from "@/validation/registerUser";

export const registerUser = async (data: {
    email: string;
    password: string;
    passwordConfirm: string;
    name: string;
}) => {
    const validation = registerUserSchema.safeParse(data);

    if(!validation.success){
        return {
            error: true,
            message: validation.error.issues[0]?.message ?? "An error occurred"
        }
    }
    try {
        await auth.createUser({
            displayName: data.name,
            email: data.email,
            password: data.password
        });
    }catch(e: any){
        // Display error message to user (most likely email already in use)
        return {
            error: true,
            message: e.message ?? "Could not register user"
        }
    }
}