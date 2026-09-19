"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getOrderByIdAction, deleteOrderAction } from "@/modules/orders/actions/orderActions";
import { initializeTableSessionAction } from "@/modules/tables/actions/sessionActions";
import { useCartStore } from "@/modules/menu/store/cartStore";
import Image from "next/image";
import { CustomerCancelModal } from "@/modules/orders/components/CustomerCancelModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function OrderStatusPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams.get("tableId");
  const [order, setOrder] = useState<any>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const { addToCart, clearCart } = useCartStore();

  const handleModifyOrder = async () => {
    if (!order) return;
    
    // 1. Clear current cart
    clearCart();
    
    // 2. Add all items from the order back to the cart
    order.items.forEach((item: any) => {
      addToCart({
        id: item.productId,
        name: item.product.name,
        image: item.product.image,
        price: Number(item.unitPrice),
        quantity: item.quantity,
        variant: item.variant,
        attribute: item.attribute,
        notes: item.notes || ""
      } as any);
    });
    
    // 3. Delete the pending order
    await deleteOrderAction(order.id);
    
    // 4. Redirect back to menu
    router.push(`/menu?tableId=${tableId}`);
    toast.success("Order items loaded. You can now modify your order.");
  };

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      if (tableId) {
        const session = await initializeTableSessionAction(tableId);
        if (!session) {
            router.push(`/menu/expired?tableId=${tableId}`);
            return;
        }
      }
      const data = await getOrderByIdAction(id as string);
      setOrder(data);
    }
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [id, tableId, router]);

  if (!order) return <div className="flex items-center justify-center min-h-screen">Loading order details...</div>;

  const status = order.status;
  const isServed = status === 'SERVED' || status === 'PAID' || status === 'COMPLETED';
  const canChange = status === 'PENDING';

  const getStatusConfig = (s: string) => {
    switch (s) {
        case 'PENDING': return { title: "Order Received", desc: "Waiting for confirmation", icon: "🕒", color: "blue" };
        case 'CONFIRMED': return { title: "Order Confirmed", desc: "Chef is getting ready", icon: "👨‍🍳", color: "emerald" };
        case 'PREPARING': return { title: "Preparing", desc: "Chef is cooking your meal", icon: "🔥", color: "orange" };
        case 'READY': return { title: "Ready!", desc: "Your food is ready to be served", icon: "🔔", color: "green" };
        case 'SERVED': return { title: "Enjoy!", desc: "Your meal has been served", icon: "😋", color: "amber" };
        case 'PAID': return { title: "Paid", desc: "Thank you for your payment", icon: "💰", color: "emerald" };
        case 'COMPLETED': return { title: "Finished", desc: "Hope to see you again!", icon: "✨", color: "slate" };
        case 'CANCELLED': return { title: "Cancelled", desc: "Your order has been cancelled", icon: "❌", color: "red" };
        default: return { title: "Order Status", desc: "Processing...", icon: "📝", color: "slate" };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20 p-4">
      <button onClick={() => router.push(`/menu?tableId=${tableId}`)} className="text-sm text-slate-500 mb-4">← Back to Menu</button>
      
      {/* Dynamic Status Header */}
      <div className={cn(
        "rounded-3xl p-6 mb-8 flex flex-col items-center text-center gap-4 shadow-sm border",
        statusConfig.color === 'emerald' && "bg-emerald-50 border-emerald-100",
        statusConfig.color === 'blue' && "bg-blue-50 border-blue-100",
        statusConfig.color === 'orange' && "bg-orange-50 border-orange-100",
        statusConfig.color === 'green' && "bg-green-50 border-green-100",
        statusConfig.color === 'amber' && "bg-amber-50 border-amber-100",
        statusConfig.color === 'slate' && "bg-slate-50 border-slate-100",
        statusConfig.color === 'red' && "bg-red-50 border-red-100",
      )}>
        <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center shadow-lg text-3xl",
            statusConfig.color === 'emerald' && "bg-emerald-500 shadow-emerald-200",
            statusConfig.color === 'blue' && "bg-blue-500 shadow-blue-200",
            statusConfig.color === 'orange' && "bg-orange-500 shadow-orange-200",
            statusConfig.color === 'green' && "bg-green-500 shadow-green-200",
            statusConfig.color === 'amber' && "bg-amber-500 shadow-amber-200",
            statusConfig.color === 'slate' && "bg-slate-500 shadow-slate-200",
            statusConfig.color === 'red' && "bg-red-500 shadow-red-200",
        )}>
            {statusConfig.icon}
        </div>
        <div>
            <h1 className={cn("text-xl font-bold", 
                statusConfig.color === 'emerald' && "text-emerald-900",
                statusConfig.color === 'blue' && "text-blue-900",
                statusConfig.color === 'orange' && "text-orange-900",
                statusConfig.color === 'green' && "text-green-900",
                statusConfig.color === 'amber' && "text-amber-900",
                statusConfig.color === 'slate' && "text-slate-900",
                statusConfig.color === 'red' && "text-red-900",
            )}>
                {statusConfig.title}
            </h1>
            <p className={cn("text-sm mt-1 font-medium", 
                statusConfig.color === 'emerald' && "text-emerald-700",
                statusConfig.color === 'blue' && "text-blue-700",
                statusConfig.color === 'orange' && "text-orange-700",
                statusConfig.color === 'green' && "text-green-700",
                statusConfig.color === 'amber' && "text-amber-700",
                statusConfig.color === 'slate' && "text-slate-700",
                statusConfig.color === 'red' && "text-red-700",
            )}>
                {statusConfig.desc}
            </p>
        </div>
        <div className="text-xs font-mono text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-100 uppercase tracking-widest">
            {order.orderNumber}
        </div>
      </div>

      <h2 className="text-lg font-bold mb-4">Order Items</h2>
      <div className="space-y-4">
        {order.items.map((item: any) => (
          <div key={item.id} className="flex gap-4 items-center border-b pb-4 last:border-0">
            {item.product.image && <Image src={item.product.image} alt={item.product.name} width={56} height={56} className="rounded-lg object-cover w-14 h-14" />}
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{item.product.name}</h3>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs font-bold text-slate-700">x{item.quantity}</span>
                <span className="text-sm font-bold text-primary">{Number(item.subtotal).toLocaleString()} MMK</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t space-y-3">
        <div className="flex justify-between text-lg font-bold">
            <span>Order Total</span>
            <span className="text-primary">{Number(order.totalAmount).toLocaleString()} MMK</span>
        </div>
      </div>

      <div className="fixed bottom-0 w-full max-w-md p-4 bg-white border-t flex gap-3">
        {canChange ? (
            <button 
                onClick={handleModifyOrder}
                className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm"
            >
                Modify Order
            </button>
        ) : (
            <button 
                onClick={() => router.push(`/menu?tableId=${tableId}`)}
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold text-sm"
            >
                Order More
            </button>
        )}
        {isServed ? (
            <Button className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm">Review Meal</Button>
        ) : (
            status !== 'CANCELLED' && status !== 'COMPLETED' && status !== 'READY' && status !== 'SERVED' && (
                <button 
                    onClick={() => setIsCancelModalOpen(true)}
                    className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold text-sm border border-red-100"
                >
                    Cancel Order
                </button>
            )
        )}
      </div>

      <CustomerCancelModal 
        order={order} 
        isOpen={isCancelModalOpen} 
        onClose={() => setIsCancelModalOpen(false)} 
        tableId={tableId as string}
      />
    </div>
  );
}
