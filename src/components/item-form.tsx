"use client"

import { useForm } from "react-hook-form";
import { itemSchema } from "@/validation/itemSchema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import MultiImageUploader, { ImageUpload } from "./multi-image-uploader";

type Props = {
    submitButtonLabel: React.ReactNode;
    handleSubmit: (data: z.infer<typeof itemSchema>) => void;
    defaultValues?: z.infer<typeof itemSchema>
};

export default function ItemForm({
    handleSubmit,
    submitButtonLabel,
    defaultValues
}: Props){
    const combinedDefaultValues: z.infer<typeof itemSchema> = {
        ...{
            title: "",
            collectionAddress: "",
            description: "",
            price: 0,
            status: "for-sale",
            condition: "used",      
            images: []
        },
        ...defaultValues,
    }

    const form = useForm<z.infer<typeof itemSchema>>({
        resolver: zodResolver(itemSchema),
        defaultValues: combinedDefaultValues
    });

    return <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid grid-cols-2 gap-4">
                <fieldset className="flex flex-col gap-2" disabled={form.formState.isSubmitting}>
                    <FormField 
                        control={form.control}
                        name="condition"
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
                                        <SelectItem value="new">New</SelectItem>
                                        <SelectItem value="used">Used</SelectItem>
                                        <SelectItem value="fair">Fair</SelectItem>
                                        <SelectItem value="poor">Poor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>                    
                </fieldset>
                <fieldset className="flex flex-col gap-2" disabled={form.formState.isSubmitting}>
                    <FormField 
                        control={form.control}
                        name="price" 
                        render={({field}) => (
                        <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>                                    
                </fieldset>
            </div>
            <fieldset className="flex flex-col gap-2" disabled={form.formState.isSubmitting}>
                <FormField 
                    control={form.control}
                    name="title" 
                    render={({field}) => (
                    <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField 
                    control={form.control}
                    name="collectionAddress"
                    render={({field}) => (
                    <FormItem>
                        <FormLabel>Collection Address</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Textarea {...field} rows={5} className="resize-none"
                                placeholder={
                                    `## Title\n\n[Item description]\n\n## Key Features\n\n- ** Key feature 1 **\n- ** Key feature 2 **\n- ** Key feature 3 **`
                                } 
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField 
                    control={form.control}
                    name="images" 
                    render={({field}) => (
                    <FormItem>
                        <FormControl>
                            <MultiImageUploader
                                onImagesChange={(images: ImageUpload[]) => {
                                form.setValue("images", images);
                            }}
                                images={field.value}
                                urlFormatter={(image) => {
                                    if(!image.file){
                                        return `https://firebasestorage.googleapis.com/v0/b/fire-homes-course-32c50.firebasestorage.app/o/${encodeURIComponent(
                                            image.url
                                        )}?alt=media`;
                                    }
                                    return image.url;
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>         
                <Button 
                    type="submit"
                    className="max-w-md mx-auto mt-2 w-full flex gap-2"
                    disabled={form.formState.isSubmitting}
                >
                    {submitButtonLabel}
                </Button>
            </fieldset>          
        </form>
    </Form>
}