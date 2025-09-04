"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/firebase/client";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";

export default function ForgotPasswordForm(){
    const [email, setEmail] = useState("");

    return (
        <form 
            onSubmit={async (e) => {
                e.preventDefault();
                await sendPasswordResetEmail(auth, email);
            }}
            className="flex flex-col gap-4"
        >
            <Input 
                placeholder="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <Button className="w-full" type="submit">
                Send Reset Link
            </Button>
        </form>
    )
}