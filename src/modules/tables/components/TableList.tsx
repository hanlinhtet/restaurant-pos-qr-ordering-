"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";
import { addTableAction, deleteTableAction, deleteTablesAction, getTablesAction } from "../actions/tableActions";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { QRCodeCanvas } from "qrcode.react";
import { FloorPlanEditor } from "./FloorPlanEditor";
import { QRCodeModal } from "./QRCodeModal";

export function TableList({ tables: initialTables, branchId }: any) {
  const [tables, setTables] = useState(initialTables);
  const [useAutoIncrement, setUseAutoIncrement] = useState(true);
  const [capacity, setCapacity] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeletionMode, setIsDeletionMode] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "floorplan">("grid");

  // Polling for real-time updates
  useEffect(() => {
    const interval = setInterval(async () => {
        const updatedTables = await getTablesAction(branchId);
        setTables(updatedTables);
    }, 5000);
    return () => clearInterval(interval);
  }, [branchId]);

  const nextTableNumber = useMemo(() => {
    const numbers = tables
      .map((t: any) => {
        // Strip ALL 'T's to get the raw number
        const cleanNumber = t.number.replace(/^T+/i, '');
        return parseInt(cleanNumber);
      })
      .filter((n: number) => !isNaN(n))
      .sort((a: number, b: number) => a - b);

    let next = 1;
    for (const num of numbers) {
      if (num === next) {
        next++;
      } else if (num > next) {
        break;
      }
    }
    return "T" + String(next).padStart(2, "0");
  }, [tables]);

  const [number, setNumber] = useState(nextTableNumber);

  const handleAddTable = async () => {
    const qty = parseInt(quantity) || 1;
    const baseNumber = parseInt(nextTableNumber.replace(/^T+/i, ''));

    for (let i = 0; i < qty; i++) {
        const currentNum = baseNumber + i;
        const finalTableNum = 'T' + String(currentNum).padStart(2, "0");

        const result = await addTableAction(branchId, { 
            number: finalTableNum, 
            capacity: capacity ? parseInt(capacity) : 0 
        }, 1);

        if (result.error) {
            toast.error(`Error adding ${finalTableNum}: ${result.error}`);
        }
    }

    toast.success("Tables added successfully");
    setCapacity("");
    setQuantity("1");
    setNumber(nextTableNumber);
    const updatedTables = await getTablesAction(branchId);
    setTables(updatedTables);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === tables.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(tables.map((t: any) => t.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteSelected = async () => {
    const result = await deleteTablesAction(selectedIds);
    toast.success(result.success);
    setSelectedIds([]);
    setIsDeletionMode(false);
    const updatedTables = await getTablesAction(branchId);
    setTables(updatedTables);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 p-4 bg-white border rounded-2xl items-end">
        <div className="space-y-2 flex-1">
            <label className="text-sm font-semibold flex items-center gap-2">
                Table Number
                <div className="flex items-center gap-1.5 font-normal">
                    <Checkbox 
                        checked={useAutoIncrement} 
                        onCheckedChange={(checked) => {
                            setUseAutoIncrement(!!checked);
                            if (checked) setNumber(nextTableNumber);
                        }}
                    />
                    Auto-increment
                </div>
            </label>
            <Input 
                value={useAutoIncrement ? nextTableNumber : number} 
                onChange={(e) => setNumber(e.target.value)} 
                disabled={useAutoIncrement}
                placeholder="T01" 
                className="h-11 rounded-xl" 
            />
        </div>
        <div className="space-y-2 w-32">
            <label className="text-sm font-semibold">Quantity</label>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="1" className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2 flex-1">
            <label className="text-sm font-semibold">Capacity (Optional)</label>
            <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="4" className="h-11 rounded-xl" />
        </div>
        <Button onClick={handleAddTable} className="h-11 px-6 rounded-xl font-bold">
            <Plus className="mr-2 h-4 w-4" /> Add Table
        </Button>
      </div>

      <div className="flex items-center justify-between">
        {isDeletionMode ? (
          <div className="flex items-center gap-2">
            <Checkbox checked={selectedIds.length > 0 && selectedIds.length === tables.length} onCheckedChange={toggleSelectAll} />
            <span className="text-sm font-medium">Select All</span>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
                <LayoutGrid className="w-4 h-4 mr-2" /> Grid
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
                <List className="w-4 h-4 mr-2" /> List
            </Button>
            <Button variant={viewMode === 'floorplan' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('floorplan')}>
                <LayoutGrid className="w-4 h-4 mr-2" /> Floor Plan
            </Button>
          </div>
        )}
        
        {isDeletionMode ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setIsDeletionMode(false); setSelectedIds([]); }}>
                Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteSelected} disabled={selectedIds.length === 0}>
                Delete {selectedIds.length} Selected
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setIsDeletionMode(true)} className="text-red-500 hover:text-red-600 hover:bg-red-50 font-semibold">
              Select for removal
          </Button>
        )}
      </div>

      {viewMode === 'floorplan' ? (
        <FloorPlanEditor tables={tables} />
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6" : "space-y-4"}>
            {tables.map((table: any) => {
                const isSelected = selectedIds.includes(table.id);
                const qrUrl = `${window.location.origin}/menu?tableId=${table.id}`;

                return (
                    <div key={table.id} className={`p-6 bg-white border rounded-2xl shadow-sm flex ${viewMode === 'list' ? 'flex-row items-center gap-6' : 'flex-col items-center justify-between gap-4'} transition-colors relative ${isDeletionMode && isSelected ? 'border-red-500 bg-red-50' : 'border-slate-100'}`}>
                        {isDeletionMode && (
                          <div className="absolute top-2 left-2">
                            <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(table.id)} />
                          </div>
                        )}
                        
                        {viewMode === 'list' && (
                            <div className="flex items-center gap-4">
                                <QRCodeCanvas value={qrUrl} size={64} />
                                <QRCodeModal table={table} />
                            </div>
                        )}

                        <div className="text-3xl font-bold text-slate-700">{table.number}</div>
                        <div className="text-sm text-muted-foreground">
                            {table.capacity > 0 ? `${table.capacity} people` : "No capacity set"}
                        </div>
                    </div>
                )
            })}
        </div>
      )}
    </div>
  );
}
