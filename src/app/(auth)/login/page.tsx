import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "./login-form";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function Login() {
    return <div>
        <Card>
            <div className="flex justify-center mb-4">
                <Logo className="h-42 w-auto" />
            </div>
            <CardHeader>
                <CardTitle className="text-2xl font-bold mb-2 text-center">Login to your account</CardTitle>
                <p className="text-gray-600 mb-6 text-center">Welcome back!</p>
            </CardHeader>           
            <CardContent>
                <LoginForm />
            </CardContent>
        </Card>     
    </div>
}