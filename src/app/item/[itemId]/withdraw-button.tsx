"use client"

import { withdrawItem } from "@/app/profile/edit/[itemId]/actions";
import  Button  from "@/components/ui/Button";
import { useAuth } from "@/context/auth"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function WithdrawButton({
    id
}: {
    id: string,
}) {
    const router = useRouter();
    const auth = useAuth();
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    const handleWithdrawClick = async () => {

        // Get current user token to verify user is logged in
        const tokenResult = await auth?.currentUser?.getIdTokenResult();

        // If user is not logged in redirect to login
        if(!tokenResult){
            router.push("/login");
            return;
        }

        // Withdrawing animation start
        setIsWithdrawing(true)

        // Update item data set buyer ID and status to sold
        const response = await withdrawItem(id, tokenResult.token);
        // If item update is not successful show message
        if(!!response?.error){
            toast.error("Error!", {
                description: response.message,
            });
            return;
        }

        // Withdrawing animation finish
        setIsWithdrawing(false);

        // Display message item placed under review for sale
        toast.success("Success!", {
            description: `Your item has been withdraw and is now placed as draft`
        });

        // Redirect user to dashboard to show item bought (Will not show query not implemented)
        router.push("/profile/user")
    };

    return (
        <Button 
            className="flex-1"
            onClick={handleWithdrawClick} 
            disabled={isWithdrawing}>
            {isWithdrawing ? "Withdrawing..." : "Withdraw Item"}
        </Button>             
    );
}