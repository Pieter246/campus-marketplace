"use client"

import { buyItem } from "@/app/dashboard/edit/[itemId]/actions";
import { Button } from "@/components/ui/button";
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

        // Deleting animation start
        setIsBuying(true)

        // Update item data set seller ID and status to sold
        const response = await buyItem(id, tokenResult.token);
        // If item update is not successful show message
        if(!!response?.error){
            toast.error("Error!", {
                description: response.message,
            });
            return;
        }

        // Deleting animation finish
        setIsBuying(false);

        // Display message property added or removed from favourites
        toast.success("Success!", {
            description: `you have bought an item!`
        });

        // Redirect user to dashboard to show item bought
        router.push("/dashboard/user")
    };

    return (
        <Button onClick={handleBuyClick} disabled={isBuying}>
            {isBuying ? "Buying..." : "Buy Item"}
        </Button>             
    );
}