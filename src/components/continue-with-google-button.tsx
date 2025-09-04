"use client";

import { useAuth } from "@/context/auth";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function ContinueWithGoogleButton() {
   const auth = useAuth();
   const router = useRouter();

    return (
        <Button 
        variant="secondary"
        onClick={async () => {    
            try {
                await auth?.loginWithGoogle();      
                router.refresh(); 
            } catch (e) {}; // Catch clears runtime error when user closes popup
        }}
        className="w-full"
        >         
            Continue with Google
        </Button>
    );
}