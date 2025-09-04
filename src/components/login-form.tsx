"use client"

import ContinueWithGoogleButton from "@/components/continue-with-google-button"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth"
import { passwordValidation } from "@/validation/registerUser"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

const formSchema = z.object({
    email: z.email(),
    password: passwordValidation
})

export default function loginForm({
    onSuccess
}: {
    onSuccess?: () => void;
}) {
    const auth = useAuth();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const handleSubmit = async (data: z.infer<typeof formSchema>) => {
        try{
            await auth?.loginWithEmail(data.email, data.password);
            onSuccess?.();
        }catch(e: any) {
            // Display error message to user incorrect login credentials
            toast.error("Error!", {
                description:
                e.code === "auth/invalid-credential"
                    ? "Incorrect credentials"
                    : "An error occurred"
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <fieldset disabled={form.formState.isSubmitting} className="flex flex-col gap-4">
                    <FormField 
                        control={form.control}
                        name="email"
                        render={({field}) => {
                            return (
                                <FormItem>
                                    <FormControl>
                                        <Input {...field} placeholder="Email" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )
                        }}
                    />
                    <FormField 
                        control={form.control}
                        name="password"
                        render={({field}) => {
                            return (
                                <FormItem>
                                    <FormControl>
                                        <Input {...field} placeholder="Password" type="password"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )
                        }}
                    />
                    <Button type="submit">Login</Button>
                    <div className="text-center">or</div>
                    <ContinueWithGoogleButton />
                    
                    <p className="mt-4 text-center text-gray-600">
                        Don't have an account?
                        <Link href="/register" className="pl-2 text-blue-600 hover:underline">
                            Create an account
                        </Link>
                    </p>
                    <p className="text-center text-gray-600">
                        Forgot password?
                        <Link href="/forgot-password" className="pl-2 text-blue-600 hover:underline">
                            Reset it
                        </Link>
                    </p>         
                </fieldset>
            </form>          
        </Form>
    );
}