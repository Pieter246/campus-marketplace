"use client";

import { Button } from "@/components/ui/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";

// Filter schema
const formSchema = z.object({
  priceRange: z.string().optional(),
  condition: z.string().optional(),
});

// Price ranges with a dummy "all" value instead of empty string
const priceOptions = [
  { value: "all", label: "All" },
  { value: "0-100", label: "0 - 100" },
  { value: "100-250", label: "100 - 250" },
  { value: "250-500", label: "250 - 500" },
  { value: "500-1000", label: "500 - 1000" },
  { value: "1000-2000", label: "1000 - 2000" },
  { value: "2000-5000", label: "2000 - 5000" },
  { value: "5000-10000", label: "5000 - 10000" },
  { value: "10000-20000", label: "10000 - 20000" },
  { value: "20000+", label: "20000+" },
];

export default function FiltersForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Convert min/max query params to priceRange string for default value
  const initialMin = searchParams.get("minPrice");
  const initialMax = searchParams.get("maxPrice");
  let initialPriceRange = "all";
  if (initialMin && initialMax) {
    initialPriceRange = `${initialMin}-${initialMax}`;
  } else if (initialMin && !initialMax) {
    initialPriceRange = `${initialMin}-`;
  } else if (!initialMin && initialMax) {
    initialPriceRange = `-${initialMax}`;
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priceRange: initialPriceRange,
      condition: searchParams.get("condition") ?? "all",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    // Reset pagination
    newSearchParams.set("page", "1");

    // Update price range
    if (data.priceRange && data.priceRange !== "all") {
      const [min, max] = data.priceRange.split("-");
      if (min) newSearchParams.set("minPrice", min);
      else newSearchParams.delete("minPrice");
      if (max) newSearchParams.set("maxPrice", max);
      else newSearchParams.delete("maxPrice");
    } else {
      newSearchParams.delete("minPrice");
      newSearchParams.delete("maxPrice");
    }

    // Update condition
    if (data.condition && data.condition !== "all") {
      newSearchParams.set("condition", data.condition);
    } else {
      newSearchParams.delete("condition");
    }

    router.push(`/?${newSearchParams.toString()}`);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col flex-row w-full gap-4 items-end"
      >
        {/* Price Range */}
        <FormField
          control={form.control}
          name="priceRange"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-xs mb-1">Price Range</FormLabel>
              <FormControl>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full sm:w-40 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priceOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Condition */}
        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-xs mb-1">Condition</FormLabel>
              <FormControl>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full w-32 h-10">
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
          )}
        />

        {/* Filter Button */}
        <Button type="submit" className="h-10">
          Filter
        </Button>
      </form>
    </Form>
  );
}
