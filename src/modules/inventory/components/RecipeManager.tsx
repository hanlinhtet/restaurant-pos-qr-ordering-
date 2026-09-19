"use client";

import { useState } from "react";
import { 
  Plus, 
  Trash2, 
  ChevronLeft,
  Scale,
  BookOpen,
  ChefHat,
  Utensils,
  AlertTriangle
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
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { linkRecipeToProduct, removeRecipeFromProduct, createUnitConversion } from "../../inventory/services/inventory.service";
import { updateProductRecipeInstructions } from "../../products/actions/product";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { UnitOfMeasure } from "@prisma/client";
import Image from "next/image";

interface RecipeManagerProps {
  product: any;
  inventoryItems: any[];
  existingRecipes: any[];
}

export function RecipeManager({ product, inventoryItems, existingRecipes }: RecipeManagerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [savingInstructions, setSavingInstructions] = useState(false);
  const [instructions, setInstructions] = useState(product.recipeInstructions || "");
  const [newItem, setNewItem] = useState({
    inventoryItemId: "",
    quantity: "",
    unit: UnitOfMeasure.GRAM,
    variantId: "general",
    conversionFactor: "" // New field for quick conversion
  });

  const selectedInventoryItem = inventoryItems.find(i => i.id === newItem.inventoryItemId);
  const needsConversion = selectedInventoryItem && selectedInventoryItem.unit !== newItem.unit;
  const existingConversion = selectedInventoryItem?.conversions?.find((c: any) => c.unit === newItem.unit);
  const conversionMissing = needsConversion && !existingConversion;

  async function handleAddIngredient() {
    if (!newItem.inventoryItemId || !newItem.quantity || !newItem.unit) {
      toast.error("Please select an item, enter quantity and unit");
      return;
    }

    if (conversionMissing && !newItem.conversionFactor) {
      toast.error(`Please define how 1 ${newItem.unit} converts to ${selectedInventoryItem.unit}`);
      return;
    }

    setLoading(true);
    try {
      // Create conversion if missing
      if (conversionMissing && newItem.conversionFactor) {
        await createUnitConversion({
          inventoryItemId: newItem.inventoryItemId,
          unit: newItem.unit as UnitOfMeasure,
          factor: parseFloat(newItem.conversionFactor)
        });
      }

      await linkRecipeToProduct({
        productId: product.id,
        inventoryItemId: newItem.inventoryItemId,
        quantity: parseFloat(newItem.quantity),
        unit: newItem.unit as UnitOfMeasure,
        variantId: newItem.variantId === "general" ? undefined : newItem.variantId
      });

      toast.success("Ingredient added to recipe");
      setNewItem({
        inventoryItemId: "",
        quantity: "",
        unit: UnitOfMeasure.GRAM,
        variantId: "general",
        conversionFactor: ""
      });
      router.refresh();
    } catch (error) {
      toast.error("Failed to add ingredient");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteIngredient(id: string) {
    if (!confirm("Are you sure you want to remove this ingredient?")) return;

    try {
      await removeRecipeFromProduct(id);
      toast.success("Ingredient removed");
      router.refresh();
    } catch (error) {
      toast.error("Failed to remove ingredient");
    }
  }

  async function handleSaveInstructions() {
    setSavingInstructions(true);
    try {
      const result = await updateProductRecipeInstructions(product.id, instructions);
      if (result.success) {
        toast.success("Instructions saved");
        router.refresh();
      } else {
        toast.error("Failed to save instructions");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSavingInstructions(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-5 rounded-2xl border shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-xl h-10 w-10 bg-slate-50 border shrink-0">
            <Link href="/products"><ChevronLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border shrink-0">
              {product.image ? (
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <Utensils className="h-8 w-8" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{product.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-bold h-5 px-2">
                  {product.category?.name || "Uncategorized"}
                </Badge>
                <p className="text-slate-400 text-xs font-medium">Recipe & Preparation</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1 rounded-lg border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[9px] bg-slate-50/50">
            Internal Recipe Card
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ingredients & Instructions */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Instructions Section */}
          <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-slate-50/50 border-b px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-primary" /> How to Cook
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-lg font-bold border-primary/20 text-primary h-8 px-3 text-xs"
                onClick={handleSaveInstructions}
                disabled={savingInstructions}
              >
                {savingInstructions ? "Saving..." : "Save Instructions"}
              </Button>
            </div>
            <div className="p-6">
              <Textarea 
                placeholder="Describe the preparation process step by step..."
                className="min-h-[200px] rounded-xl border-slate-200 focus:ring-primary/20 p-4 text-sm leading-relaxed font-medium resize-none bg-slate-50/30"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>
          </div>

          {/* Current Ingredients List */}
          <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-slate-50/50 border-b px-6 py-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" /> Bill of Materials
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {existingRecipes.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-medium italic text-sm">
                  No ingredients defined for this recipe yet.
                </div>
              ) : (
                <>
                  {/* Base Recipe Section */}
                  {existingRecipes.filter(r => !r.variantId).length > 0 && (
                    <div className="bg-slate-50/30 px-6 py-2 border-y first:border-t-0">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Recipe (Common to all)</span>
                    </div>
                  )}
                  {existingRecipes.filter(r => !r.variantId).map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border shadow-sm">
                          {r.inventoryItem.image ? (
                            <Image 
                              src={r.inventoryItem.image} 
                              alt={r.inventoryItem.name} 
                              fill 
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Plus className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-base leading-tight">{r.inventoryItem.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                              Standard Portion
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-xl font-bold text-slate-900">{Number(r.quantity)}</span>
                          <span className="ml-1 text-[10px] font-bold text-slate-400 uppercase">{r.unit}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteIngredient(r.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Variant Specific Sections */}
                  {product.variants?.map((v: any) => {
                    const variantRecipes = existingRecipes.filter(r => r.variantId === v.id);
                    if (variantRecipes.length === 0) return null;

                    return (
                      <div key={v.id} className="contents">
                        <div className="bg-primary/5 px-6 py-2 border-y">
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Specific for: {v.name}</span>
                        </div>
                        {variantRecipes.map((r: any) => (
                          <div key={r.id} className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-all group">
                            <div className="flex items-center gap-4">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border shadow-sm">
                                {r.inventoryItem.image ? (
                                  <Image 
                                    src={r.inventoryItem.image} 
                                    alt={r.inventoryItem.name} 
                                    fill 
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <Plus className="h-5 w-5" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-base leading-tight">{r.inventoryItem.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className="text-[8px] h-3.5 px-1 font-black bg-primary text-white border-none uppercase">
                                    {v.name} Only
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className="text-xl font-bold text-slate-900">{Number(r.quantity)}</span>
                                <span className="ml-1 text-[10px] font-bold text-slate-400 uppercase">{r.unit}</span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDeleteIngredient(r.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Add Ingredient Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6 sticky top-6">
            <div>
              <h3 className="font-bold text-slate-900">Add Ingredient</h3>
              <p className="text-xs text-slate-400 font-medium">Link raw items to this product.</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">Select Ingredient</label>
                <Select value={newItem.inventoryItemId} onValueChange={(v) => setNewItem({...newItem, inventoryItemId: v})}>
                  <SelectTrigger className="rounded-xl h-10 bg-slate-50/50 border-slate-200">
                    <SelectValue placeholder="Choose ingredient..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {inventoryItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        <div className="flex items-center justify-between w-full gap-4">
                          <span>{item.name}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">({item.stockAmount} {item.unit})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {product.variants?.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">Applies To</label>
                  <Select value={newItem.variantId} onValueChange={(v) => setNewItem({...newItem, variantId: v})}>
                    <SelectTrigger className="rounded-xl h-10 bg-slate-50/50 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="general">All Variants (Base)</SelectItem>
                      {product.variants.map((v: any) => (
                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">Qty</label>
                  <Input 
                    type="number"
                    step="0.01"
                    placeholder="0.00" 
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                    className="rounded-xl h-10 font-bold bg-slate-50/50 border-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">Unit</label>
                  <Select value={newItem.unit} onValueChange={(v) => setNewItem({...newItem, unit: v as UnitOfMeasure})}>
                    <SelectTrigger className="rounded-xl h-10 bg-slate-50/50 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {Object.values(UnitOfMeasure).map(unit => (
                        <SelectItem key={unit} value={unit} className="text-sm">{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {conversionMissing && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <p className="text-[10px] font-bold text-amber-700 uppercase">Conversion Required</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      How many <span className="text-primary">{selectedInventoryItem?.unit}</span> in 1 <span className="text-primary">{newItem.unit}</span>?
                    </label>
                    <Input 
                      type="number" 
                      step="0.0001"
                      placeholder="e.g. 50"
                      value={newItem.conversionFactor}
                      onChange={(e) => setNewItem({...newItem, conversionFactor: e.target.value})}
                      className="rounded-lg h-9 bg-white border-amber-200 font-bold text-sm"
                    />
                    <p className="text-[9px] text-amber-600 font-medium italic">
                      1 {newItem.unit} = {newItem.conversionFactor || "..."} {selectedInventoryItem?.unit}
                    </p>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleAddIngredient} 
                disabled={loading}
                className="w-full rounded-xl h-11 font-bold text-sm mt-2 transition-all"
              >
                {loading ? "Adding..." : "Add to Recipe"}
              </Button>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-2 mb-1">
                💡 Chef's Tip
              </h4>
              <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                Define the raw weight or quantity of ingredients in any unit. Make sure to define conversion factors in the inventory settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
