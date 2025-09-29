"use client";

import { useState, useEffect } from "react";
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
import { z } from "zod";
import type { ItemStatus, ItemCondition } from "@/types/item";

const formSchema = z.object({
  realCondition: z.enum(["new", "excellent", "used", "fair", "poor"]),
});

const STATUS_OPTIONS = ["pending", "for-sale", "draft", "sold", "withdrawn", "collected"] as const;

type ApproveFormProps = {
  id: string;
  condition: ItemCondition;
  status: ItemStatus;
};

const StatusDropdown: React.FC<{
  itemId: string;
  currentStatus: ItemStatus;
}> = ({ itemId, currentStatus }) => {
  const auth = useAuth();
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<ItemStatus>(currentStatus);

  // Sync selectedStatus with currentStatus prop
  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  const handleStatusChange = async (newStatus: ItemStatus) => {
    try {
      const user = auth?.currentUser;
      if (!user) throw new Error("Not logged in");

      const token = await user.getIdToken();

      // Optimistic update
      setSelectedStatus(newStatus);

      const response = await fetch("/api/items/update-status", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId, status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Revert on error
        setSelectedStatus(currentStatus);
        toast.error("Failed to update item status", {
          description: result.message || result.error || "Unknown error",
        });
        return;
      }

      toast.success("Item status updated successfully");
      window.dispatchEvent(new Event("itemStatusUpdated"));
    } catch (err: any) {
      setSelectedStatus(currentStatus);
      console.error("Update item status error:", err);
      toast.error("Failed to update item status", {
        description: err.message || "Unknown error",
      });
    }
  };

  return (
    <FormItem>
      <FormLabel>Set status</FormLabel>
      <Select
        onValueChange={handleStatusChange}
        value={selectedStatus}
      >
        <SelectTrigger className="w-full">
          <SelectValue>
            {selectedStatus
              ? selectedStatus
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")
              : "Select status"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((status) => (
            <SelectItem key={status} value={status} className="capitalize">
              {status.replace("-", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormItem>
  );
};

export default function ApproveForm({ id, condition, status }: ApproveFormProps) {
  const router = useRouter();
  const auth = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      realCondition: condition,
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!auth?.currentUser) {
      router.push("/login");
      toast.error("Error!", {
        description: "You must be logged in to perform this action.",
      });
      return;
    }

    setIsSubmitting(true);

    const newStatus = status === "for-sale" ? "pending" : "for-sale";

    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch("/api/items/actions/approve", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: id,
          condition: data.realCondition,
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok || result?.error || !result.success) {
        throw new Error(result.message || `Failed to ${newStatus === "for-sale" ? "approve" : "unapprove"} item.`);
      }

      toast.success("Success!", {
        description: `Item ${newStatus === "for-sale" ? "approved" : "unapproved"} successfully.`,
      });

      window.dispatchEvent(new Event("itemStatusUpdated"));
    } catch (err: any) {
      console.error("Approve item error:", err);
      toast.error("Error!", {
        description: err.message || `Failed to ${newStatus === "for-sale" ? "approve" : "unapprove"} item.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <p className="text-center font-bold">- Admin buttons -</p>
        <fieldset
          disabled={isSubmitting}
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
                        <SelectItem value="excellent">Excellent</SelectItem>
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

          {/* Approve/Unapprove Button */}
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              className="mt-auto w-full"
              disabled={isSubmitting}
            >
              {status === "for-sale" ? "Unapprove" : "Approve"}
            </Button>
          </div>

          {/* Status Dropdown */}
          <div className="flex flex-col gap-2">
            <StatusDropdown itemId={id} currentStatus={status} />
          </div>
        </fieldset>
      </form>
    </Form>
  );
}