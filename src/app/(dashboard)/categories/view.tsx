"use client";

import { useState } from "react";
import { getCategories, deleteCategory } from "@/modules/categories/actions/category";
import { CategoryForm } from "@/modules/categories/components/CategoryForm";
import { CategoryEditForm } from "@/modules/categories/components/CategoryEditForm";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";

export default function CategoriesPage({ categories, businessId }: { categories: any[], businessId: string }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground mt-2">Organize your products. Total categories: {categories.length}</p>
        </div>
      </div>

      <div className="p-6 bg-white border rounded-2xl shadow-sm">
        <CategoryForm businessId={businessId} />
      </div>

      <div className="grid gap-2">
        {categories.map((c) => (
          <div key={c.id} className="p-4 border rounded-xl flex items-center justify-between bg-white h-16">
            {editingId === c.id ? (
              <CategoryEditForm category={c} onCancel={() => setEditingId(null)} />
            ) : (
              <>
                <span className="font-medium">{c.name}</span>
                <div className="flex items-center">
                  <Button variant="ghost" size="icon" onClick={() => setEditingId(c.id)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <form action={async () => {
                    await deleteCategory(c.id);
                  }}>
                    <Button type="submit" variant="ghost" size="icon" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
