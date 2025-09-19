"use client"

import  Button  from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
    const router = useRouter();

    return (
        <Button 
            className="flex-1 w-full" 
            variant="secondary" 
            type="button" 
            onClick={() => router.back()}
        >
            Back
        </Button>
    );
}