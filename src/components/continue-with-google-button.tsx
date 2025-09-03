"use client";

import { useAuth } from "../../context/auth"; //Needed to change
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function ContinueWithGoogleButton() {
   const auth = useAuth();
   const router = useRouter();

    return (
        <Button 
            variant="outline"
            onClick={async () => {    
                try {
                    await auth?.loginWithGoogle();      
                    router.refresh(); 
                } catch (e) {}; //Catch removes popup closed by user error
            }}
        className="w-full"
        >         
            Continue with Google
        </Button>
    );
}