"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useCartStore } from "@/modules/menu/store/cartStore";
import { createOrder } from "@/modules/orders/services/orderService";
import { toast } from "sonner";
import { Suspense } from "react";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams.get("tableId");
  const { cart, removeFromCart, addToCart, getCartTotal, setOrderPlaced } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [orderType, setOrderType] = useState<"dine-in" | "takeaway">("dine-in");
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = getCartTotal();
  const tax = subtotal * 0.05;
  const containerCharge = orderType === "takeaway" ? 2000 : 0;
  const total = subtotal + tax + containerCharge;

  const handleConfirmOrder = async () => {
    if (!tableId) return toast.error("Table ID missing, please check your QR scan URL");
    
    const result = await createOrder({
        tableId,
        orderType,
        items: cart,
        total
    });

    if (result.success) {
        setOrderPlaced(orderType);
        toast.success("Order confirmed successfully!");
        router.push("/menu?tableId=" + tableId);
    } else {
        toast.error(result.error || "Failed to confirm order");
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20 p-4">
      <button onClick={() => router.back()} className="text-sm text-slate-500 mb-4">← Back to Menu</button>
      <h1 className="text-2xl font-bold mb-6">Order Summary</h1>

      {/* Order Type Toggle */}
      <div className="flex border rounded-xl p-1 mb-6">
        <button 
            onClick={() => setOrderType("dine-in")}
            className={`flex-1 py-2 rounded-lg font-bold text-sm ${orderType === "dine-in" ? "bg-primary text-white" : "text-slate-500"}`}>
            Dine-in
        </button>
        <button 
            onClick={() => setOrderType("takeaway")}
            className={`flex-1 py-2 rounded-lg font-bold text-sm ${orderType === "takeaway" ? "bg-primary text-white" : "text-slate-500"}`}>
            Takeaway
        </button>
      </div>

      <div className="space-y-4">
        {cart.map((item) => (
          <div key={item.uid} className="flex gap-4 items-center border-b pb-4">
            {item.image && <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-lg object-cover w-16 h-16" />}
            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-xs text-slate-500">
                {item.variant?.name} {item.attribute?.content ? `- ${item.attribute.content}` : ""}
              </p>
              {item.notes && (
                <p className="text-xs text-slate-400 mt-1">
                    {expandedNotes[item.uid] ? item.notes : item.notes.slice(0, 30) + (item.notes.length > 30 ? "..." : "")}
                    {item.notes.length > 30 && (
                        <button onClick={() => setExpandedNotes({...expandedNotes, [item.uid]: !expandedNotes[item.uid]})} className="text-primary font-bold ml-1">
                            {expandedNotes[item.uid] ? "less" : "more"}
                        </button>
                    )}
                </p>
              )}
              <p className="text-primary font-bold">{item.price.toLocaleString()} MMK</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => removeFromCart(item.uid)} className="w-8 h-8 rounded-full bg-slate-100 font-bold">-</button>
              <span className="font-bold w-4 text-center">{item.quantity}</span>
              <button onClick={() => addToCart({ ...item, uid: item.uid })} className="w-8 h-8 rounded-full bg-primary text-white font-bold">+</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 space-y-2 border-t pt-4 mb-24">
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>{subtotal.toLocaleString()} MMK</span></div>
          <div className="flex justify-between text-sm"><span>Tax (5%)</span><span>{tax.toLocaleString()} MMK</span></div>
          {orderType === "takeaway" && <div className="flex justify-between text-sm"><span>Container Charge</span><span>2,000 MMK</span></div>}
          <div className="flex justify-between font-bold text-lg pt-2"><span>Total</span><span>{total.toLocaleString()} MMK</span></div>
      </div>

      <div className="fixed bottom-0 w-full max-w-md p-4 bg-white border-t">
        <button onClick={handleConfirmOrder} className="w-full bg-primary text-white py-3 rounded-xl font-bold">
            Confirm Order
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CheckoutContent />
        </Suspense>
    )
}
