"use client";

import { useState } from "react";
import { 
  Search, 
  Plus, 
  History, 
  AlertTriangle,
  Edit,
  Filter,
  Package,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { InventoryItemForm } from "./InventoryItemForm";
import { StockAdjustmentDialog } from "./StockAdjustmentDialog";
import { InventoryTransactionHistory } from "./InventoryTransactionHistory";
import { deleteInventoryItem } from "../services/inventory.service";
import { toast } from "sonner";

interface InventoryItem {
  id: string;
  name: string;
  sku: string | null;
  image: string | null;
  unit: string;
  stockAmount: number;
  minStockLevel: number | null;
  costPerUnit: number | null;
  inventoryCategoryId: string | null;
  inventoryCategory: { id: string; name: string } | null;
  conversions: {
    unit: string;
    factor: number;
  }[];
  _count: {
    recipeItems: number;
  };
}

export function InventoryList({ 
  items, 
  businessId, 
  branchId,
  onUpdate
}: { 
  items: InventoryItem[];
  businessId: string;
  branchId: string;
  onUpdate: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low-stock">("all");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);

  const categories = Array.from(new Set(items.map(i => i.inventoryCategory?.name).filter(Boolean)));

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                         (item.sku?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const isLowStock = item.minStockLevel !== null && item.stockAmount <= item.minStockLevel;
    const matchesFilter = filter === "all" || isLowStock;
    const matchesCategory = categoryFilter === "all" || item.inventoryCategory?.name === categoryFilter;
    return matchesSearch && matchesFilter && matchesCategory;
  });

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteInventoryItem(itemId);
      toast.success("Item deleted");
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete item");
    }
  };

  return (
    <div className="space-y-6">
      <InventoryTransactionHistory 
        item={historyItem} 
        isOpen={!!historyItem} 
        onClose={() => setHistoryItem(null)} 
      />

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="rounded-2xl sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit {editItem?.name}</DialogTitle>
          </DialogHeader>
          <InventoryItemForm 
            businessId={businessId} 
            branchId={branchId} 
            item={editItem}
            onSuccess={() => { setEditItem(null); onUpdate(); }} 
          />
        </DialogContent>
      </Dialog>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex flex-1 gap-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or SKU..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl h-11 w-full"
            />
          </div>
          <Select 
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger className="rounded-xl h-11 w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => setFilter(filter === "all" ? "low-stock" : "all")}
            className={cn(
              "rounded-xl gap-2 h-11",
              filter === "low-stock" && "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
            )}
          >
            <Filter className="h-4 w-4" />
            {filter === "low-stock" ? "Showing Low Stock" : "All Items"}
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2 h-11 px-6 shadow-lg shadow-primary/10">
                <Plus className="h-4 w-4" /> Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">New Inventory Item</DialogTitle>
              </DialogHeader>
              <InventoryItemForm 
                businessId={businessId} 
                branchId={branchId} 
                onSuccess={() => { setAddDialogOpen(false); onUpdate(); }} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Inventory Table-like List */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4">Min Level</th>
                <th className="px-6 py-4 text-center">In Recipes</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredItems.map((item) => {
                const isLowStock = item.minStockLevel !== null && item.stockAmount <= item.minStockLevel;
                const isOutOfStock = item.stockAmount <= 0;

                return (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 border overflow-hidden shrink-0 flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="h-5 w-5 text-slate-300" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{item.name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            {item.sku && <span className="text-[10px] text-slate-400 font-bold tracking-tight uppercase">SKU: {item.sku}</span>}
                            {item.conversions?.length > 0 && (
                               <div className="flex gap-1">
                                 {item.conversions.map((c, i) => (
                                   <Badge key={i} variant="outline" className="text-[9px] h-4 px-1 border-primary/20 text-primary font-bold bg-primary/5">
                                     1 {c.unit} = {Number(c.factor)} {item.unit}
                                   </Badge>
                                 ))}
                               </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="font-bold text-[10px] rounded-lg">
                        {item.inventoryCategory?.name || "Uncategorized"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-base font-black tabular-nums",
                          isOutOfStock ? "text-rose-600" : isLowStock ? "text-amber-600" : "text-slate-900"
                        )}>
                          {item.stockAmount}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.unit}</span>
                        {isLowStock && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] h-5 px-1.5 font-black">
                            <AlertTriangle className="h-3 w-3 mr-1" /> LOW
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-bold text-sm">
                      {item.minStockLevel !== null ? `${item.minStockLevel} ${item.unit}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-lg font-bold text-[10px] px-2 uppercase">
                        {item._count.recipeItems} Linked
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <StockAdjustmentDialog item={item} onSuccess={onUpdate}>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50" title="Adjust Stock">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </StockAdjustmentDialog>
                        <Button 
                          onClick={() => setHistoryItem(item)}
                          variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100" title="Transaction History"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => setEditItem(item)}
                          variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100" title="Edit Item"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDelete(item.id)}
                          variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="Delete Item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="bg-slate-50 p-4 rounded-full mb-4">
                        <Search className="h-8 w-8 opacity-20" />
                      </div>
                      <p className="font-bold text-slate-900">No items found</p>
                      <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
