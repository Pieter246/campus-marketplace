"use client"

import { approveItem } from "@/app/profile/edit/[itemId]/actions";
import  Button  from "@/components/ui/Button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/auth"
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
    realCondition: z.string(),
})

export default function ApproveForm({
    id,
    condition
}: {
    id: string,
    condition: string
}) {
    const router = useRouter();
    const auth = useAuth();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            realCondition: condition
        }
    });

    const handleSubmit = async (data: z.infer<typeof formSchema>) => {
        // Get current user token to verify user is logged in
        const tokenResult = await auth?.currentUser?.getIdTokenResult();

        // If user is not logged in redirect to login
        if(!tokenResult){
            router.push("/login");
            return;
        }

        // Update item data set seller ID and status to "for sale"
        const response = await approveItem(id, data.realCondition, tokenResult.token);
        // If item update is not successful show message
        if(!!response?.error){
            toast.error("Error!", {
                description: response.message,
            });
            return;
        }

        // Display message item approved
        toast.success("Success!", {
            description: `Item was approved`
        });

        // Redirect user to dashboard to show item is no longer pending
        router.push("/profile/admin")
    };

    return <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-4 gap-2">
            <fieldset className="flex flex-col gap-2" disabled={form.formState.isSubmitting}>            
                <FormField 
                    control={form.control}
                    name="realCondition"
                    render={({field}) => (
                    <FormItem>
                        <FormLabel>Condition</FormLabel>
                        <FormControl>
                            <Select 
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="used">Used</SelectItem>
                                    <SelectItem value="fair">Fair</SelectItem>
                                    <SelectItem value="poor">Poor</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormControl>
                    </FormItem>
                )}/>
                <Button type="submit" className="mt-auto">
                    Approve item
                </Button>
            </fieldset>
        </form>
    </Form>
}