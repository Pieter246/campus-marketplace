"use client"

import { useRouter } from "next/navigation"
import CommonLoginForm from "@/components/login-form"

export default function loginForm() {
    const router = useRouter();

    return (
        <CommonLoginForm onSuccess={() => {
            router.refresh();
        }}/>
    );
}