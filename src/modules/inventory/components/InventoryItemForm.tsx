"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InventoryItemSchema, InventoryItemInput } from "../validations/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { createInventoryItem, updateInventoryItem } from "../services/inventory.service";
import { useState, useRef, useEffect } from "react";
import { UnitOfMeasure } from "@prisma/client";
import { toast } from "sonner";
import { Upload, X, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { getInventoryCategories } from "../actions/inventoryCategory";

export function InventoryItemForm({ 
  businessId, 
  branchId, 
  onSuccess,
  item
}: { 
  businessId: string;
  branchId: string; 
  onSuccess?: () => void;
  item?: any;
}) {
  const [loading, setLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState(item?.image || "");
  const [categories, setCategories] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadCategories() {
      const cats = await getInventoryCategories(businessId);
      setCategories(cats);
    }
    loadCategories();
  }, [businessId]);

  const form = useForm<InventoryItemInput>({
    resolver: zodResolver(InventoryItemSchema),
    defaultValues: {
      name: item?.name || "",
      sku: item?.sku || "",
      image: item?.image || "",
      unit: item?.unit || "GRAM",
      minStockLevel: item?.minStockLevel || 0,
      costPerUnit: item?.costPerUnit || 0,
      inventoryCategoryId: item?.inventoryCategoryId || "",
      branchId: branchId,
      conversions: item?.conversions?.map((c: any) => ({ unit: c.unit, factor: c.factor })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "conversions"
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageBase64(base64String);
        form.setValue("image", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: InventoryItemInput) {
    setLoading(true);
    try {
      if (item) {
        await updateInventoryItem(item.id, values);
        toast.success("Inventory item updated");
      } else {
        await createInventoryItem(businessId, values);
        toast.success("Inventory item created");
      }
      onSuccess?.();
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error(`Failed to ${item ? 'update' : 'create'} item`);
    } finally {
      setLoading(false);
    }
  }

  const onValidationError = (errors: any) => {
    console.log("Validation Errors:", errors);
    const firstError = Object.values(errors)[0] as any;
    if (firstError?.message) {
      toast.error(firstError.message);
    } else {
      toast.error("Please check the form for errors");
    }
  };

  const baseUnit = form.watch("unit");

  return (
    <form onSubmit={form.handleSubmit(onSubmit, onValidationError)} className="space-y-4 pt-4 max-h-[80vh] overflow-y-auto px-1">
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">Item Image</label>
        <div 
          className="relative w-full h-32 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
          {imageBase64 ? (
            <>
              <Image src={imageBase64} alt="Preview" fill className="object-cover" />
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setImageBase64(""); form.setValue("image", ""); }}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 z-10"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Upload className="h-6 w-6" />
              <span className="text-xs font-bold uppercase tracking-tight">Click to attach file</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">Item Name</label>
        <Input {...form.register("name")} placeholder="e.g. Fresh Chicken" className="rounded-xl h-11" />
        {form.formState.errors.name && <p className="text-xs text-rose-500 font-medium">{form.formState.errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">SKU (Optional)</label>
          <Input {...form.register("sku")} placeholder="e.g. CHK-001" className="rounded-xl h-11" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Category (Optional)</label>
          <Select 
            onValueChange={(v) => form.setValue("inventoryCategoryId", v)} 
            defaultValue={item?.inventoryCategoryId || ""}
          >
            <SelectTrigger className="rounded-xl h-11">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Base Unit (Supplier)</label>
          <Select 
            onValueChange={(v) => form.setValue("unit", v as UnitOfMeasure)} 
            defaultValue={form.getValues("unit")}
          >
            <SelectTrigger className="rounded-xl h-11">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(UnitOfMeasure).map((unit) => (
                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-slate-400 font-medium">The unit you use when purchasing from suppliers.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Min Stock Level</label>
          <Input 
            type="number" 
            {...form.register("minStockLevel", { valueAsNumber: true })} 
            className="rounded-xl h-11" 
          />
        </div>
      </div>

      {/* Unit Conversions Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-700">Unit Conversions (Chef)</label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => append({ unit: "PIECE", factor: 1 })}
            className="h-8 rounded-lg gap-1 font-bold text-[10px] uppercase"
          >
            <Plus className="h-3 w-3" /> Add Conversion
          </Button>
        </div>
        <p className="text-[10px] text-slate-400 font-medium leading-tight">Define how kitchen units convert to supplier units. (e.g., 1 PIECE = 50 GRAM)</p>
        
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 group">
              <div className="flex-1 space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Chef Unit</label>
                <Select 
                  onValueChange={(v) => form.setValue(`conversions.${index}.unit`, v as UnitOfMeasure)} 
                  defaultValue={field.unit}
                >
                  <SelectTrigger className="rounded-lg h-9 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(UnitOfMeasure).filter(u => u !== baseUnit).map((unit) => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1 space-y-1.5 text-center pb-2">
                <span className="text-sm font-black text-slate-300">=</span>
              </div>

              <div className="flex-1 space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Factor ({baseUnit})</label>
                <Input 
                  type="number" 
                  step="0.000001"
                  {...form.register(`conversions.${index}.factor`, { valueAsNumber: true })} 
                  className="rounded-lg h-9 bg-white font-bold"
                />
              </div>

              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => remove(index)}
                className="h-9 w-9 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {fields.length === 0 && (
            <div className="text-center py-4 bg-slate-50/50 rounded-xl border border-dashed text-[10px] font-medium text-slate-400 uppercase tracking-tight">
              No conversions defined
            </div>
          )}
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full rounded-xl py-6 font-bold text-base mt-2 shadow-lg shadow-primary/10">
        {loading ? (item ? "Updating..." : "Creating...") : (item ? "Update Inventory Item" : "Create Inventory Item")}
      </Button>
    </form>
  );
}
