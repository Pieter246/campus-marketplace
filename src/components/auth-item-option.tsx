"use client"

import { useAuth } from "@/context/auth";
import { Button } from "./ui/button";
import Link from "next/link";
import { PlusCircleIcon } from "lucide-react";

export default function AuthItemOption() {
    const auth = useAuth();

    return (
        <div>
            {!!auth?.customClaims?.admin && ( // Admin heading
                <h1 className="text-4xl font-bold mt-6">Approve Items</h1>
            )}
            {!auth?.customClaims?.admin && ( // User heading
                <h1 className="text-4xl font-bold mt-6">My Items</h1>
            )}   
            {!auth?.customClaims?.admin && ( // Only users can create items
                <Button asChild className="inline-flex pl-2 gap-2 mt-4">
                    <Link href="/user-dashboard/new">
                        <PlusCircleIcon/> New Item
                    </Link>
                </Button>
            )}
        </div>
    )
}