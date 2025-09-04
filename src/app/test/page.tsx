"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Logo from "@/components/ui/Logo";

export default function Test() {
    const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
    function showAlert(message: string, type: "success" | "error") {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
    }
    return (
        <div>
            <p>Test</p>
            <Button 
            className="w-full"
            variant="primary"
            onClick={() => showAlert("Button pressed", "success")}
            >
            Click the button
            </Button>
            <Input
                name="username"
                type="text"
                label="Username"
                id="username"
                value=""
                onChange={() => {}}
            />
            <Logo className="h-42 w-auto mb-10 mt-20 " />
        </div>
    );
} 