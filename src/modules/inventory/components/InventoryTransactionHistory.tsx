"use client";

import { useState, useEffect } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { getInventoryTransactions } from "../services/inventory.service";
import { format } from "date-fns";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Package, 
  Trash2, 
  ShoppingCart,
  RefreshCcw,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";

export function InventoryTransactionHistory({ 
  item, 
  isOpen, 
  onClose 
}: { 
  item: any; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && item?.id) {
      loadTransactions();
    }
  }, [isOpen, item?.id]);

  async function loadTransactions() {
    setLoading(true);
    try {
      const data = await getInventoryTransactions(item.id);
      setTransactions(data);
    } catch (error) {
      console.error("Failed to load transactions", error);
    } finally {
      setLoading(false);
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PURCHASE": return <ArrowUpRight className="h-4 w-4 text-emerald-500" />;
      case "SALE": return <ShoppingCart className="h-4 w-4 text-amber-500" />;
      case "WASTE": return <Trash2 className="h-4 w-4 text-rose-500" />;
      case "RETURN": return <RefreshCcw className="h-4 w-4 text-blue-500" />;
      default: return <Package className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="border-b pb-6">
          <SheetTitle className="text-xl font-bold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" /> Stock History
          </SheetTitle>
          <SheetDescription className="font-bold text-slate-900">
            {item?.name}
          </SheetDescription>
        </SheetHeader>

        <div className="py-8 space-y-6">
          {loading ? (
            <div className="text-center py-12 text-slate-400 animate-pulse font-bold">
              Loading history...
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 italic">
              No transactions logged for this item yet.
            </div>
          ) : (
            transactions.map((t) => (
              <div key={t.id} className="flex gap-4 relative group">
                {/* Timeline Line */}
                <div className="absolute left-5 top-10 bottom-[-24px] w-[2px] bg-slate-100 group-last:hidden" />
                
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10",
                  t.quantity > 0 ? "bg-emerald-50" : "bg-slate-50"
                )}>
                  {getTypeIcon(t.type)}
                </div>

                <div className="flex-1 pb-6">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 text-sm">{t.type}</span>
                    <span className={cn(
                      "font-black text-sm",
                      t.quantity > 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {t.quantity > 0 ? "+" : ""}{Number(t.quantity)} {item?.unit || ""}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    {format(new Date(t.createdAt), "MMM d, yyyy • h:mm a")}
                  </p>
                  {t.reason && (
                    <div className="bg-slate-50/50 p-3 rounded-lg mt-2 border border-slate-100/50">
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        "{t.reason}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
