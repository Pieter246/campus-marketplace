// In @/components/item-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { itemSchema } from "@/validation/itemSchema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/textarea";
import Button from "./ui/Button";
import MultiImageUploader, { ImageUpload } from "./multi-image-uploader";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import imageUrlFormatter from "@/lib/imageUrlFormatter";
import { type Resolver } from "react-hook-form";

type Props = {
  handleSubmit: (data: z.infer<typeof itemSchema>, status?: "draft" | "pending") => void;
  submitButtonLabel?: React.ReactNode; // Add this to support JSX.Element or string
  defaultValues?: z.infer<typeof itemSchema>;
};

export default function ItemForm({ handleSubmit, submitButtonLabel = "Save Draft", defaultValues }: Props) {
  const router = useRouter();

  const combinedDefaultValues: z.infer<typeof itemSchema> = {
    ...{
      title: "",
      collectionAddress: "",
      description: "",
      price: 0,
      status: "draft",
      condition: "used",
      category: "books",
      sellerId: "",
      images: [],
    },
    ...defaultValues,
  };

  useEffect(() => {
    if (combinedDefaultValues.status === "sold") {
      router.push("/profile/user");
    }
  }, [combinedDefaultValues.status, router]);

  const form = useForm<z.output<typeof itemSchema>>({
    resolver: zodResolver(itemSchema) as Resolver<z.output<typeof itemSchema>>,
    defaultValues: combinedDefaultValues,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => handleSubmit(data, "draft"))}
        className="space-y-6"
      >
        <fieldset className="flex flex-col gap-6" disabled={form.formState.isSubmitting}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} label="Title" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={5}
                    className="resize-none min-h-[200px]"
                    placeholder={
                      "## Title\n\n[Item description]\n\n## Key Features\n\n- ** Key feature 1 **\n- ** Key feature 2 **\n- ** Key feature 3 **"
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value === 0 ? "" : field.value}
                    onChange={(e) => {
                      const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                      field.onChange(val);
                    }}
                    label="Price (ZAR)"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="collectionAddress"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} label="Collection Address" />
                </FormControl>
              </FormItem>
            )}
          />
        </fieldset>
        <div className="grid grid-cols-2 gap-4">
          <fieldset className="flex flex-col gap-2" disabled={form.formState.isSubmitting}>
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="used">Used</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </fieldset>
          <fieldset className="flex flex-col gap-2" disabled={form.formState.isSubmitting}>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="books">Books</SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="notes">Notes</SelectItem>
                        <SelectItem value="stationery">Stationery</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </fieldset>
        </div>
        <fieldset className="flex flex-col gap-6" disabled={form.formState.isSubmitting}>
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <MultiImageUploader
                    onImagesChange={(images: ImageUpload[]) => {
                      form.setValue("images", images);
                    }}
                    images={field.value}
                    urlFormatter={(image) => {
                      if (!image.file) {
                        return imageUrlFormatter(image.url);
                      }
                      return image.url;
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>
        <div className="flex gap-3 pt-2">
          {/* Submit as Pending */}
          <Button
            type="button"
            className="flex-1"
            disabled={form.formState.isSubmitting}
            onClick={form.handleSubmit((data) => handleSubmit(data, "pending"))}
          >
            Sell Item
          </Button>

          {/* Save as Draft */}
          <Button
            type="submit"
            variant="secondary"
            className="flex-1"
            disabled={form.formState.isSubmitting}
          >
            {submitButtonLabel} {/* Use the prop here */}
          </Button>

          {/* Cancel */}
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={form.formState.isSubmitting}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}