"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Tags } from "lucide-react";
import { createInventoryCategory, deleteInventoryCategory } from "../actions/inventoryCategory";
import { toast } from "sonner";

export function InventoryCategoryManager({ categories, businessId }: { categories: any[], businessId: string }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!name) return;
    setLoading(true);
    try {
      await createInventoryCategory(businessId, name);
      toast.success("Category created");
      setName("");
    } catch {
      toast.error("Failed to create category");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteInventoryCategory(id);
      toast.success("Category deleted");
    } catch {
      toast.error("Failed to delete category");
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
        <h3 className="font-bold text-lg">Add New Category</h3>
        <div className="flex gap-2">
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. Vegetables" 
            className="rounded-xl h-11"
          />
          <Button onClick={handleAdd} disabled={loading} className="rounded-xl px-6">
            <Plus className="h-4 w-4 mr-2" /> Add
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="divide-y">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Tags className="h-4 w-4 text-primary" />
                <span className="font-bold text-slate-900">{c.name}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                onClick={() => handleDelete(c.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="p-8 text-center text-slate-400 italic">No categories created yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
