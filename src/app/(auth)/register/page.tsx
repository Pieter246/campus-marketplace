import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import RegisterForm from "./register-form";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function Register() {
    return <Card>
        <CardHeader>
            <div className="flex justify-center mb-4">
                <Logo className="h-42 w-auto" />
            </div>
            <CardTitle className="mb-6 text-center text-2xl font-semibold">
                Create an account
            </CardTitle>         
        </CardHeader>
        <CardContent>
            <RegisterForm />
        </CardContent>
        <CardFooter>
            Already have an account?
            <Link href="/login" className="pl-2 underline">
                Log in here
            </Link>
        </CardFooter>
    </Card>
}