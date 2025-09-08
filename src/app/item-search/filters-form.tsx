"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";

// Filter schema
const formSchema = z.object({
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    condition: z.string().optional(),
})

export default function FiltersForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            minPrice: searchParams.get("minPrice") ?? "",
            maxPrice: searchParams.get("maxPrice") ?? "",
            condition: searchParams.get("condition") ?? "all"
        }
    });

    const handleSubmit = async (data: z.infer<typeof formSchema>) => {
        console.log({ data });
        const newSearchParams = new URLSearchParams();

        // Apply filters
        if(data.minPrice){
            newSearchParams.set("minPrice", data.minPrice);
        }
        if(data.maxPrice){
            newSearchParams.set("maxPrice", data.maxPrice);
        }
        if (data.condition) {
            newSearchParams.set("condition", data.condition); // Condition test
        }

        newSearchParams.set("page", "1");
        router.push(`/item-search?${newSearchParams.toString()}`)
    };

    return <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-4 gap-2">
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
            <FormField 
                control={form.control} 
                name="minPrice" 
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Min price
                        </FormLabel>
                        <FormControl>
                            <Input 
                                {...field}
                                placeholder="Min price"
                                type="number"
                                min={0}
                            />
                        </FormControl>
                    </FormItem>
                )} 
            />
            <FormField 
                control={form.control} 
                name="maxPrice" 
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Max price
                        </FormLabel>
                        <FormControl>
                            <Input 
                                {...field}
                                placeholder="Max price"
                                type="number"
                                min={0}
                            />
                        </FormControl>
                    </FormItem>
                )} 
            />
            <Button type="submit" className="mt-auto">
                Search
            </Button>
        </form>
    </Form>
}