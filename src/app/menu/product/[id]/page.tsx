"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { getProductDetailAction } from "@/modules/menu/actions/productActions";
import { useCartStore } from "@/modules/menu/store/cartStore";
import { ChevronLeft } from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCartStore();
  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedAttribute, setSelectedAttribute] = useState<any>(null);
  const [selectedSauces, setSelectedSauces] = useState<any[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function fetchData() {
        if (!id) return;
        const detail = await getProductDetailAction(id as string);
        console.log("DEBUG: Product Detail:", detail);
        setProduct(detail);
        if (detail?.variants && detail.variants.length > 0) setSelectedVariant(detail.variants[0]);
    }
    fetchData();
  }, [id]);

  const toggleSauce = (sauce: any) => {
    setSelectedSauces(prev => prev.some(s => s.id === sauce.id) ? prev.filter(s => s.id !== sauce.id) : [...prev, sauce]);
  };

  const handleAddToCart = () => {
    if (!product || (selectedVariant && !selectedVariant.isAvailable)) return;
    
    const variantPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.price);
    const attributePrice = selectedAttribute ? Number(selectedAttribute.price) : 0;
    const saucePrice = selectedSauces.reduce((sum, s) => sum + Number(s.price), 0);
    
    addToCart({
        id: product.id,
        name: product.name,
        image: product.image,
        price: variantPrice + attributePrice + saucePrice,
        quantity: 1,
        variant: selectedVariant,
        attribute: selectedAttribute,
        sauces: selectedSauces,
        notes: notes
    } as any);
    router.back();
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-32">
      <div className="relative h-72 w-full">
        <button onClick={() => router.back()} className="absolute top-4 left-4 z-10 p-2 bg-white/80 backdrop-blur rounded-full shadow-lg">
          <ChevronLeft className="w-6 h-6" />
        </button>
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">NO IMAGE</div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-slate-500 text-sm leading-relaxed">{product.description}</p>
        
        {product.variants?.length > 0 && (
            <>
                <h2 className="font-bold mt-6">Size</h2>
                <div className="grid gap-2 mt-2">
                    {product.variants.map((v: any) => (
                        <button 
                            key={v.id} 
                            disabled={!v.isAvailable}
                            onClick={() => v.isAvailable && setSelectedVariant(v)} 
                            className={`flex items-center justify-between w-full p-4 border-2 rounded-xl transition-all ${selectedVariant?.id === v.id ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'} ${!v.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className="flex-1 text-left font-bold text-slate-800 text-sm truncate pr-4">{v.name}</span>
                            <span className="flex-shrink-0 font-semibold text-slate-900">{Number(v.price).toLocaleString()} MMK</span>
                        </button>
                    ))}
                </div>
            </>
        )}

        {product.flavours?.length > 0 && (
            <>
                <h2 className="font-bold mt-6">Flavours</h2>
                <div className="grid gap-2 mt-2">
                    {product.flavours.map((f: any) => (
                        <button key={f.id} onClick={() => toggleSauce(f)} className={`w-full p-3 border rounded-lg text-left flex justify-between ${selectedSauces.some(s => s.id === f.id) ? 'border-primary bg-primary/5' : 'border-slate-200'}`}>
                            <span>{f.name}</span>
                        </button>
                    ))}
                </div>
            </>
        )}

        {product.attributes?.filter((a: any) => !a.disable && Number(a.price) > 0).length > 0 && (
            <>
                <h2 className="font-bold mt-6">Add-ons</h2>
                <div className="grid gap-2 mt-2">
                    {product.attributes.filter((a: any) => !a.disable && Number(a.price) > 0).map((attr: any) => (
                        <button key={attr.id} onClick={() => setSelectedAttribute(attr)} className={`w-full p-3 border rounded-lg text-left flex justify-between ${selectedAttribute?.id === attr.id ? 'border-primary bg-primary/5' : 'border-slate-200'}`}>
                            <span>{attr.content}</span>
                            <span className="font-semibold text-slate-900">+ {Number(attr.price).toLocaleString()} MMK</span>
                        </button>
                    ))}
                </div>
            </>
        )}

        <h2 className="font-bold mt-6">Special Instructions</h2>
        <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. No onions, extra spicy..." 
            className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-primary h-32 resize-none mt-2"
        />
      </div>

      <div className="fixed bottom-0 w-full max-w-md p-4 bg-white border-t">
        <button onClick={handleAddToCart} className="w-full bg-primary text-white py-3 rounded-xl font-bold">
            Add to Order
        </button>
      </div>
    </div>
  );
}
