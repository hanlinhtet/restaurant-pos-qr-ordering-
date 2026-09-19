"use client";

import { useEffect, useState, useCallback } from "react";
import { getInventoryItems } from "@/modules/inventory/services/inventory.service";
import { InventoryList } from "@/modules/inventory/components/InventoryList";

export default function InventoryPageWrapper({ businessId, branchId }: { businessId: string, branchId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getInventoryItems(branchId);
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Inventory</h2>
        <p className="text-muted-foreground mt-2 font-medium">
          Monitor your stock levels and manage ingredient recipes. Total items: {items.length}
        </p>
      </div>
      
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading inventory...</div>
      ) : (
        <InventoryList 
          items={items} 
          businessId={businessId} 
          branchId={branchId} 
          onUpdate={loadInventory}
        />
      )}
    </div>
  );
}
