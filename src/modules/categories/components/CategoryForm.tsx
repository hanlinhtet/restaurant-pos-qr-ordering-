"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategorySchema, CategoryInput } from "../validations/category";
import { createCategory } from "../actions/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

export function CategoryForm({ businessId, onSuccess }: { businessId: string; onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CategoryInput>({
    resolver: zodResolver(CategorySchema),
    defaultValues: { name: "" },
  });

  const onSubmit = (values: CategoryInput) => {
    startTransition(async () => {
      const res = await createCategory(businessId, values);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.success);
        form.reset();
        onSuccess?.();
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
      <Input 
        {...form.register("name")} 
        placeholder="Category name" 
        className="h-10 rounded-xl"
        disabled={isPending}
      />
      <Button type="submit" disabled={isPending} className="rounded-xl">
        {isPending ? <Loader2 className="animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
        Add
      </Button>
    </form>
  );
}
