"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { addInventoryTransaction } from "../services/inventory.service";
import { InventoryTransactionType } from "@prisma/client";
import { toast } from "sonner";
import { PackagePlus, PackageMinus } from "lucide-react";
import { cn } from "@/lib/utils";

export function StockAdjustmentDialog({ 
  item, 
  children,
  onSuccess
}: { 
  item: { id: string, name: string, unit: string, stockAmount: number };
  children: React.ReactNode;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<InventoryTransactionType>("PURCHASE");
  const [quantity, setQuantity] = useState<string>("");
  const [reason, setReason] = useState("");

  async function handleSubmit() {
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty === 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    setLoading(true);
    try {
      // For adjustments, if it's SALE, WASTE, or ADJUSTMENT(negative), we send a negative quantity
      const signedQuantity = (type === "SALE" || type === "WASTE") ? -Math.abs(qty) : Math.abs(qty);

      await addInventoryTransaction({
        inventoryItemId: item.id,
        type,
        quantity: signedQuantity,
        reason
      });
      toast.success("Stock adjusted successfully");
      setOpen(false);
      setQuantity("");
      setReason("");
      onSuccess?.(); // Trigger success callback
    } catch (error) {
      toast.error("Failed to adjust stock");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Adjust Stock</DialogTitle>
          <DialogDescription className="font-medium">
            Update inventory for <span className="text-primary font-black">{item.name}</span>. 
            Current: <span className="text-slate-900 font-bold">{item.stockAmount} {item.unit}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setType("PURCHASE")}
              className={cn(
                "flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all",
                type === "PURCHASE" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
              )}
            >
              <PackagePlus className="h-4 w-4" /> Stock In
            </button>
            <button 
              onClick={() => setType("WASTE")}
              className={cn(
                "flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all",
                type === "WASTE" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
              )}
            >
              <PackageMinus className="h-4 w-4" /> Stock Out
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Quantity ({item.unit})</label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="rounded-xl text-lg font-bold py-6"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Type / Reason</label>
              <Select value={type} onValueChange={(v) => setType(v as InventoryTransactionType)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PURCHASE">Purchase / Restock</SelectItem>
                  <SelectItem value="SALE">Sold / Used</SelectItem>
                  <SelectItem value="WASTE">Waste / Spoiled</SelectItem>
                  <SelectItem value="ADJUSTMENT">Manual Adjustment</SelectItem>
                  <SelectItem value="RETURN">Return from Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Notes (Optional)</label>
              <Textarea 
                placeholder="e.g. Monthly restock from Supplier X"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="rounded-xl resize-none"
              />
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className={cn(
              "w-full rounded-xl py-6 font-bold text-base",
              type === "PURCHASE" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
            )}
          >
            {loading ? "Processing..." : `Confirm ${type === "PURCHASE" ? "Stock In" : "Stock Out"}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
