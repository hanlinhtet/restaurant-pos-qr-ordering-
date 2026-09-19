"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductSchema, ProductInput } from "../validations/product";
import { createProduct, updateProduct } from "../actions/product";
import { getSauces } from "../actions/sauce";
import { getInventoryItems } from "@/modules/inventory/services/inventory.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProductForm({ businessId, branchId, categories, product }: any) {
  const [isPending, startTransition] = useTransition();
  const [imageBase64, setImageBase64] = useState(product?.image || "");
  const [showPortion, setShowPortion] = useState(product?.applyPortion || false);
  const [showAttribute, setShowAttribute] = useState(product?.applyAttribute || false);
  
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [selectedFlavourIds, setSelectedFlavourIds] = useState<string[]>([]);

  const [newAttribute, setNewAttribute] = useState("");
  const [newAttributePrice, setNewAttributePrice] = useState(0);
  const [newAttributeItem, setNewAttributeItem] = useState("none");
  const [attributes, setAttributes] = useState<{name: string, price: number, flavourItemId?: string}[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const form = useForm<ProductInput>({
    resolver: zodResolver(ProductSchema),
    defaultValues: { name: "", description: "", categoryId: "", variants: [], image: "", attributes: [], flavourIds: [], applyAttribute: false, applyPortion: false },
  });

  useEffect(() => {
    async function loadData() {
      const items = await getInventoryItems(branchId);
      setAvailableItems(items);
    }
    loadData();
  }, [branchId]);

  useEffect(() => {
    if (product) {
        setShowAttribute(product.applyAttribute || false);
        const productAttributes = product.attributes?.map((a: any) => ({ 
            name: a.content || a.name, 
            price: Number(a.price), 
            flavourItemId: a.flavourItemId 
        })) || [];
        setAttributes(productAttributes);
        setShowPortion(product.applyPortion || false);
        
        const flavourIds = product.flavours?.map((f: any) => f.id) || [];
        setSelectedFlavourIds(flavourIds);
        
        form.reset({
            name: product.name,
            description: product.description || "",
            categoryId: product.categoryId,
            variants: product.variants || [],
            image: product.image || "",
            attributes: productAttributes,
            flavourIds: flavourIds,
            applyAttribute: product.applyAttribute || false,
            applyPortion: product.applyPortion || false,
        });
    }
  }, [product, form]);

  const addAttribute = () => {
    if (newAttribute) {
        const flavourItemId = (newAttributeItem === "none" || !newAttributeItem) ? undefined : newAttributeItem;
        const updatedAttributes = [...attributes, { name: newAttribute, price: newAttributePrice, flavourItemId }];
        setAttributes(updatedAttributes);
        form.setValue("attributes", updatedAttributes);
        setNewAttribute("");
        setNewAttributePrice(0);
        setNewAttributeItem("none");
    }
  };

  const removeAttribute = (attrNameToRemove: string) => {
    const updatedAttributes = attributes.filter(a => a.name !== attrNameToRemove);
    setAttributes(updatedAttributes);
    form.setValue("attributes", updatedAttributes);
  };

  const toggleSauce = (itemId: string) => {
    const updated = selectedFlavourIds.includes(itemId) 
        ? selectedFlavourIds.filter(id => id !== itemId) 
        : [...selectedFlavourIds, itemId];
    
    setSelectedFlavourIds(updated);
    form.setValue("flavourIds", updated);
  };

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants" as any,
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

  const onSubmit = (values: ProductInput) => {
    const processedValues = {
        ...values,
        applyAttribute: showAttribute,
        applyPortion: showPortion,
        attributes: attributes, 
        flavourIds: selectedFlavourIds,
        variants: (values.variants || []).map(v => ({
            ...v,
            portion: v.portion || null
        }))
    };
    
    console.log("Submitting processedValues:", processedValues);
    
    startTransition(async () => {
      const res = product 
        ? await updateProduct(product.id, processedValues)
        : await createProduct(businessId, processedValues);
        
      if (res.error) toast.error(res.error);
      else {
        toast.success(product ? "Product updated successfully!" : "Product created successfully!");
        form.reset();
        router.push("/products");
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <label className="text-sm font-semibold block">Product Image</label>
          <div 
            className="relative w-full aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            {imageBase64 ? (
              <>
                <Image src={imageBase64} alt="Product" fill className="object-cover rounded-2xl" />
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setImageBase64(""); form.setValue("image", ""); }}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="h-8 w-8" />
                <span className="text-xs font-medium">Click to upload</span>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Product Name</label>
            <Input {...form.register("name")} placeholder="e.g. Chicken Fried Rice" className="rounded-xl" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-semibold">Category</label>
                <Select defaultValue={product?.categoryId} onValueChange={(v) => form.setValue("categoryId", v)}>
                    <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold">Description (optional)</label>
            <Textarea {...form.register("description")} placeholder="Add product details..." className="rounded-xl min-h-[100px]" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold">Variants (Size/Portion)</label>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <input 
                    type="checkbox" 
                    checked={showPortion} 
                    onChange={(e) => {
                        const checked = e.target.checked;
                        setShowPortion(checked);
                        form.setValue("applyPortion", checked);
                    }} 
                    className="h-4 w-4" 
                />
                <span className="text-sm font-medium">Apply Portion</span>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", price: 0 })}>
                <Plus className="h-4 w-4 mr-2" /> Add Variant
            </Button>
          </div>
        </div>
        {fields.length > 0 && (
          <>
            <div className={`grid ${showPortion ? "grid-cols-[1fr,1fr,1fr,auto]" : "grid-cols-[1fr,1fr,auto]"} gap-2 text-xs font-bold text-slate-500 uppercase px-2`}>
              <span>Size</span>
              {showPortion && <span>Portion</span>}
              <span>Price (MMk)</span>
              <span />
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className={`grid ${showPortion ? "grid-cols-[1fr,1fr,1fr,auto]" : "grid-cols-[1fr,1fr,auto]"} gap-2 items-center`}>
                <Input {...form.register(`variants.${index}.name` as any)} placeholder="Size" className="rounded-xl w-full" />
                {showPortion && <Input {...form.register(`variants.${index}.portion` as any, { valueAsNumber: true })} type="number" placeholder="Portion" className="rounded-xl w-full" />}
                <Input {...form.register(`variants.${index}.price` as any, { valueAsNumber: true })} type="number" placeholder="Price" className="rounded-xl w-full" />
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-rose-500" /></Button>
              </div>
            ))}
          </>
        )}
      </div>

      <hr />

      {/* Priced Add-ons Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Priced Add-ons</h3>
            <div className="flex items-center gap-2">
                <input type="checkbox" id="applyAttribute" checked={showAttribute} onChange={(e) => { setShowAttribute(e.target.checked); form.setValue("applyAttribute", e.target.checked); }} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                <label htmlFor="applyAttribute" className="text-sm font-medium cursor-pointer">Enable Add-ons</label>
            </div>
        </div>
        
        {showAttribute && (
            <div className="space-y-4">
                <div className="flex flex-col gap-3">
                    <Input value={newAttribute} onChange={(e) => setNewAttribute(e.target.value)} placeholder="e.g. Fried Egg" className="rounded-xl" />
                    <div className="flex gap-2">
                        <Input type="number" value={newAttributePrice} onChange={(e) => setNewAttributePrice(Number(e.target.value))} placeholder="Price" className="rounded-xl" />
                        <Select value={newAttributeItem} onValueChange={setNewAttributeItem}>
                            <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Select Ingredient" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No Ingredient</SelectItem>
                                {availableItems.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Button type="button" onClick={addAttribute} className="rounded-xl"><Plus className="h-4 w-4" /></Button>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {attributes.filter(a => !a.flavourItemId).map((a) => (
                        <Badge key={a.name} variant="secondary" className="px-3 py-1 text-sm rounded-full flex items-center gap-2 border-2 border-slate-100">
                            {a.name} ({a.price} MMK) {a.flavourItemId && "🔗"}
                            <X className="h-3 w-3 cursor-pointer text-slate-400 hover:text-rose-500" onClick={() => removeAttribute(a.name)} />
                        </Badge>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* Flavours Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold">Product Flavours</h3>
        <p className="text-xs text-slate-500">Select flavours from inventory items.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableItems
                .filter(item => item.inventoryCategory?.name === "Flavour")
                .map(item => {
                    const isSelected = selectedFlavourIds.includes(item.id);
                    return (
                        <button 
                            type="button"
                            key={item.id} 
                            onClick={() => toggleSauce(item.id)}
                                className={cn(
                                    "p-3 rounded-xl border-2 text-left transition-all",
                                    isSelected ? "border-primary bg-primary/5 text-primary" : "border-slate-100 hover:border-slate-200"
                                )}
                        >
                            <div className="flex items-center justify-between">
                                <p className="font-bold text-sm">{item.name}</p>
                                {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                            <p className="text-[10px] opacity-70">Stock: {item.stockAmount} {item.unit}</p>
                        </button>
                    );
                })}
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full h-12 rounded-xl font-bold">
        {isPending ? <Loader2 className="animate-spin" /> : product ? "Update Product" : "Save Product"}
      </Button>
    </form>
  );
}
