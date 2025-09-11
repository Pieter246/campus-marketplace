"use client"

import { sellItem } from "@/app/profile/edit/[itemId]/actions";
import  Button  from "@/components/ui/Button";
import { useAuth } from "@/context/auth"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function SellButton({
    id
}: {
    id: string,
}) {
    const router = useRouter();
    const auth = useAuth();
    const [isSelling, setIsSelling] = useState(false);

    const handleSellClick = async () => {

        // Get current user token to verify user is logged in
        const tokenResult = await auth?.currentUser?.getIdTokenResult();

        // If user is not logged in redirect to login
        if(!tokenResult){
            router.push("/login");
            return;
        }

        // Selling animation start
        setIsSelling(true)

        // Update item data set buyer ID and status to sold
        const response = await sellItem(id, tokenResult.token);
        // If item update is not successful show message
        if(!!response?.error){
            toast.error("Error!", {
                description: response.message,
            });
            return;
        }

        // Selling animation finish
        setIsSelling(false);

        // Display message item placed under review for sale
        toast.success("Success!", {
            description: `Your item has been placed under review for sale`
        });

        // Redirect user to dashboard to show item bought (Will not show query not implemented)
        router.push("/profile/user")
    };

    return (
        <Button 
            className="flex-1"
            onClick={handleSellClick} 
            disabled={isSelling}
        >
            {isSelling ? "Selling..." : "Sell Item"}
        </Button>             
    );
}