"use client"

import { buyItem } from "@/app/profile/edit/[itemId]/actions";
import  Button  from "@/components/ui/Button";
import { useAuth } from "@/context/auth"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function BuyButton({
    id
}: {
    id: string,
}) {
    const router = useRouter();
    const auth = useAuth();
    const [isBuying, setIsBuying] = useState(false);

    const handleBuyClick = async () => {

        // Get current user token to verify user is logged in
        const tokenResult = await auth?.currentUser?.getIdTokenResult();

        // If user is not logged in redirect to login
        if(!tokenResult){
            router.push("/login");
            return;
        }

        // Buying animation start
        setIsBuying(true)

        // Update item data set buyer ID and status to sold
        const response = await buyItem(id, tokenResult.token);
        // If item update is not successful show message
        if(!!response?.error){
            toast.error("Error!", {
                description: response.message,
            });
            return;
        }

        // Buying animation finish
        setIsBuying(false);

        // Display message item bought
        toast.success("Success!", {
            description: `you have bought an item!`
        });

        // Redirect user to dashboard to show item bought (Will not show query not implemented)
        router.push("/profile/user?tab=purchases")
    };

    return (
        <Button 
            className="flex-1 w-full" 
            onClick={handleBuyClick} 
            disabled={isBuying}
        >
            {isBuying ? "Buying..." : "Buy Item"}
        </Button>             
    );
}