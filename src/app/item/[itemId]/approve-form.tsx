"use client";

import Button from "@/components/ui/Button";
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
import { useAuth } from "@/context/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import WithdrawButton from "./withdraw-button";

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

    //Redirect if token is invalid
    if (!tokenResult) {
      router.push("/login");
      return;
    }

    // API call approve item
    const response = await fetch("/api/items/actions/approve", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenResult.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemId: id,
        condition: data.realCondition,
      }),
    });

    const result = await response.json();

    if (!response.ok || result?.error) {
      toast.error("Error!", {
        description: result.message || "Failed to approve item.",
      });
      return;
    }

    toast.success("Success!", {
      description: "Item was approved",
    });

    router.push("/profile/admin/items");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <p className="text-center font-bold">- Admin buttons -</p>
        <fieldset
          disabled={form.formState.isSubmitting}
          className="grid grid-cols-3 gap-3 pt-2"
        >
          {/* Condition Select */}
          <div className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="realCondition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Set condition</FormLabel>
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
          <div className="mt-auto flex flex-col gap-2">
            <WithdrawButton id={id} />
          </div>
        </fieldset>
      </form>
    </Form>
  );
}
