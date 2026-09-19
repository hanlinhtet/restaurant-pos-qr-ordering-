"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, LayoutGrid, List, Search, Edit, CookingPot } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { deleteProduct } from "@/modules/products/actions/product";
import { cn } from "@/lib/utils";
import { UserRole } from "@prisma/client";

export function ProductListClient({ 
  products, 
  categories,
  userRole 
}: { 
  products: any[], 
  categories: any[],
  userRole?: UserRole
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const canManage = userRole === UserRole.OWNER || userRole === UserRole.MANAGER || userRole === UserRole.KITCHEN;

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || p.categoryId === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex flex-1 gap-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl w-full"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px] rounded-xl">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex gap-1 items-center bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setView("grid")} className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-black"}`}><LayoutGrid className="h-4 w-4" /></button>
            <button onClick={() => setView("list")} className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-black"}`}><List className="h-4 w-4" /></button>
          </div>
          {canManage && (
            <Button asChild className="rounded-xl">
              <Link href="/products/new"><Plus className="h-4 w-4 mr-2" /> Add Product</Link>
            </Button>
          )}
        </div>
      </div>

      <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
        {filteredProducts.map((p, index) => {
          return (
            <div key={p.id || `product-${index}`} className={`group bg-white border border-slate-200 rounded-xl transition-all duration-200 hover:shadow-md ${view === "list" ? "flex items-center p-6 gap-6 min-h-[140px]" : "flex flex-col items-start text-left h-full rounded-2xl overflow-hidden"}`}>

                {/* 1. Image Column */}
                <div className={`relative bg-slate-50 flex-shrink-0 overflow-hidden ${view === "list" ? "h-20 w-20 rounded-xl" : "aspect-square w-full"}`}>
                {view === "grid" && p.orderCount > 5 && (
                    <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-sm border border-slate-100 text-[11px] font-black text-yellow-600 px-2.5 py-1 rounded-lg shadow-sm flex items-center justify-center gap-1">
                        <span>★</span> POPULAR
                    </div>
                )}
                {p.image ? (
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-300"><LayoutGrid className="h-6 w-6 opacity-20" /></div>
                )}
                {view === "grid" && (
                    <div className="absolute top-2 right-2">
                    <span className="bg-white/90 backdrop-blur-sm border border-slate-100 text-[10px] font-bold px-2 py-0.5 rounded-lg text-slate-600 uppercase shadow-sm">{p.category?.name}</span>
                    </div>
                )}
                </div>

                {/* 2. Details Column (Name, Category, Description, Attributes) */}
                <div className={`flex flex-col ${view === "list" ? "flex-[1.5] pt-0.5" : "p-4 pb-0"}`}>
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">{p.name}</h3>
                        {view === "list" && p.orderCount > 5 && (
                            <div className="bg-white/90 backdrop-blur-sm border border-slate-100 text-[11px] font-black px-2.5 py-1 rounded-lg text-yellow-600 shadow-sm flex items-center justify-center gap-0.5">
                                <span>★</span> POPULAR
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 font-bold mt-0.5">Orders: {p.orderCount}</p>
                    {view === "list" && (
                        <span className="inline-flex w-fit bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-500 px-1.5 py-0.5 rounded-lg uppercase tracking-wider mt-1">
                            {p.category?.name}
                        </span>
                    )}
                    {p.description && <p className="text-sm text-slate-400 mt-1 line-clamp-1">{p.description}</p>}

                    {/* Unified Attributes/Flavours Section */}
                    {p.flavours && p.flavours.length > 0 && (
                    <div key={`flavours-${p.id}`} className={cn("flex flex-wrap gap-1 mt-2")}>
                        {p.flavours.map((f: any, index: number) => (
                        <span key={`${f.id}-${index}-${p.id}`} className="text-[11px] font-bold border border-primary/20 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider">
                            {f.name}
                        </span>
                        ))}
                    </div>
                    )}
                </div>

                {/* 3. Flavours/Variants Column */}
                <div className={`flex flex-col text-xs w-full ${view === "list" ? "flex-[2] pt-0.5" : "px-4 pb-4"}`}>
                {p.variants && p.variants.length > 0 && (
                    <div className="space-y-1 w-full">
                        {view === "grid" && <hr className="my-3 border-slate-100" />}
                        {view === "grid" && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Variants</p>}

                        {p.variants.map((v: any) => (
                        <div key={v.id} className="flex items-center justify-between w-full">
                            {/* Size/Name (Left Side) */}
                            <span className="flex-1 text-slate-700 font-bold truncate pr-4">
                                {v.name}
                                {p.applyPortion && v.portion ? ` . ${v.portion}pcs` : ""}
                            </span>

                            {/* Price (Right Side - Dynamic Gap) */}
                            <span className="flex-shrink-0 font-black text-slate-900 whitespace-nowrap">
                                {Number(v.price).toLocaleString()} MMk
                            </span>
                        </div>
                        ))}
                    </div>
                )}
                </div>

                {/* 4. Actions Column */}
                <hr className={`border-slate-100 ${view === "grid" ? "my-2" : "hidden"}`} />
                <div className={`flex items-center gap-1 ${view === "list" ? "ml-auto pl-8" : "p-4 mt-auto w-full"}`}>
                    {(userRole === UserRole.OWNER || userRole === UserRole.MANAGER || userRole === UserRole.KITCHEN) && (
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100" title="Manage Recipe">
                        <Link href={`/products/${p.id}/recipe`}><CookingPot className="h-4 w-4" /></Link>
                    </Button>
                    )}
                    {canManage && (
                    <>
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                        <Link href={`/products/${p.id}/edit`}><Edit className="h-4 w-4" /></Link>
                        </Button>
                        <form action={async () => { if(confirm('Delete?')) await deleteProduct(p.id); }}>
                        <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></Button>
                        </form>
                    </>
                    )}
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
