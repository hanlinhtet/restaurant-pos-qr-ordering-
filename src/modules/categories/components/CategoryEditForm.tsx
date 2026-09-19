"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategorySchema, CategoryInput } from "../validations/category";
import { updateCategory } from "../actions/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";

export function CategoryEditForm({ category, onCancel }: { category: { id: string; name: string }; onCancel: () => void }) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CategoryInput>({
    resolver: zodResolver(CategorySchema),
    defaultValues: { name: category.name },
  });

  const onSubmit = (values: CategoryInput) => {
    startTransition(async () => {
      const res = await updateCategory(category.id, values);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.success);
        onCancel();
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2 w-full">
      <Input 
        {...form.register("name")} 
        className="h-9 flex-1 rounded-xl"
        disabled={isPending}
        autoFocus
      />
      <Button type="submit" size="icon" variant="ghost" className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50">
        {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Check className="h-4 w-4" />}
      </Button>
      <Button type="button" size="icon" variant="ghost" onClick={onCancel} className="text-slate-500">
        <X className="h-4 w-4" />
      </Button>
    </form>
  );
}
