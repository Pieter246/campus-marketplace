"use client";

import { approveItem } from "@/app/profile/edit/[itemId]/actions";
import Button from "@/components/ui/Button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import BackButton from "./back-button";

const formSchema = z.object({
  realCondition: z.string(),
});

type ApproveFormProps = {
  id: string;
  condition: string;
};

export default function ApproveForm({ id, condition }: ApproveFormProps) {
  const router = useRouter();
  const auth = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      realCondition: condition,
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const tokenResult = await auth?.currentUser?.getIdTokenResult();

    if (!tokenResult) {
      router.push("/login");
      return;
    }

    const response = await approveItem(id, data.realCondition, tokenResult.token);

    if (!!response?.error) {
      toast.error("Error!", {
        description: response.message,
      });
      return;
    }

    toast.success("Success!", {
      description: `Item was approved`,
    });

    // Redirect user to dashboard to show item bought (Will not show query not implemented)
    router.push("/profile/admin/items");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <fieldset disabled={form.formState.isSubmitting} className="grid grid-cols-3 gap-3 pt-2">
          {/* Condition Select */}
          <div className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="realCondition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-full">
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
                </FormItem>
              )}
            />
          </div>

          {/* Approve Button */}
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              className="mt-auto w-full"
              disabled={form.formState.isSubmitting}
            >
              Approve item
            </Button>
          </div>

          {/* Cancel Button */}
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              className="mt-auto w-full"
              disabled={form.formState.isSubmitting}
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </fieldset>
      </form>
    </Form>
  );
}