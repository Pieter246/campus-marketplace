"use client";

import { useState } from "react"
import Link from "next/link"
import Button from "@/components/ui/Button"
import { useRouter } from "next/navigation";

export default function CheckoutSuccessPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    return (
        <div className="flex flex-col justify-center items-center px-4">
            <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full text-center">
                <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
                <p className="text-gray-700 mb-6">
                Thank you for your purchase. Your payment has been successfully processed.
                </p>
                <Button
                    type="button"
                    className="w-full mt-2"
                    loading={loading}
                    onClick={() => router.push("/")}
                
                >
                    Continue Shopping
                </Button>
            </div>
        </div>
    );
}
