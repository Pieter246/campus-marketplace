"use client";

import { Button } from "@/components/ui/Button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/auth";
import { passwordValidation } from "@/validation/registerUser";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
    currentPassword: passwordValidation,
    newPassword: passwordValidation,
    newPasswordConfirm: z.string()
})
.superRefine((data, ctx) => {
    if(data.newPassword !== data.newPasswordConfirm){
        ctx.addIssue({
            message: "Passwords do not match",
            path: ["newPasswordConfirm"],
            code: "custom"
        })
    }
});

export default function UpdatePasswordForm(){
    const router = useRouter();
    const auth = useAuth();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            newPasswordConfirm: ""
        }
    });

    const handleSubmit = async (data: z.infer<typeof formSchema>) => {
        const user = auth?.currentUser;
        if(!user?.email){
            return;
        }

        try{
            await reauthenticateWithCredential(user,
                EmailAuthProvider.credential(user.email, data.currentPassword)
            );
            await updatePassword(user, data.newPassword);
            toast.success("Success!", {
                description: "Password updated successfully"
            });
            form.reset();
        } catch(e: any){
            console.log({ e });     
            toast.error("Error!", {
                description:
                e.code === "auth/invalid-credential"
                    ? "Your current password is incorrect"
                    : "An error occurred"
            });
        }
    };

    return (
        <>
            <h2 className="text-2xl font-bold mb-5 text-center">Update Password</h2>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <fieldset 
                        className="flex flex-col gap-4" 
                        disabled={form.formState.isSubmitting}
                    >          
                        <FormField
                            control={form.control} 
                            name="currentPassword" 
                            render={({field}) => (
                                <FormItem>
                                    <FormControl>
                                        <Input {...field} type="password" label="Current password"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField 
                            control={form.control} 
                            name="newPassword" 
                            render={({field}) => (
                                <FormItem>
                                    <FormControl>
                                        <Input {...field} type="password" label="New Password"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField 
                            control={form.control} 
                            name="newPasswordConfirm" 
                            render={({field}) => (
                                <FormItem>
                                    <FormControl>
                                        <Input {...field} type="password" label="Confirm password"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <Button 
                            type="submit"
                            disabled={form.formState.isSubmitting}
                        >
                            Update Password
                        </Button>
                    </fieldset>
                </form>
            </Form>
        </>        
    )
}