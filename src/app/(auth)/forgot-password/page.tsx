import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ForgotPasswordForm from "./forgot-password-form";

export default function ForgotPassword(){
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold mb-2 text-center">
                    Reset Password
                </CardTitle>
                <CardDescription className="text-1xl text-gray-600 mb-6 text-center">
                    Enter your email address and we will send you instructions to reset your password.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ForgotPasswordForm />
            </CardContent>
        </Card>
    )
}