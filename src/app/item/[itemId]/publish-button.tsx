"use client"

import { publishItem } from "@/app/profile/edit/[itemId]/actions";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function PublishButton({
    id
}: {
    id: string,
}) {
    const router = useRouter();
    const auth = useAuth();
    const [isPublishing, setIsPublishing] = useState(false);

    const handlePublishClick = async () => {

        // Get current user token to verify user is logged in
        const tokenResult = await auth?.currentUser?.getIdTokenResult();

        // If user is not logged in redirect to login
        if(!tokenResult){
            router.push("/login");
            return;
        }

        // Publishing animation start
        setIsPublishing(true);

        // Update item data: set status to published/active
        const response = await publishItem(id, tokenResult.token);
        if(!!response?.error){
            toast.error("Error!", {
                description: response.message,
            });
            setIsPublishing(false);
            return;
        }

        // Publishing animation finish
        setIsPublishing(false);

        // Show success message
        toast.success("Success!", {
            description: `The item is now published and visible for sale.`
        });

        // Redirect user to their dashboard
        router.push("/profile/user");
    };

    return (
        <Button 
            className="flex-1 w-full"
            onClick={handlePublishClick} 
            disabled={isPublishing}
        >
            {isPublishing ? "Publishing..." : "Publish Item"}
        </Button>
    );
}
