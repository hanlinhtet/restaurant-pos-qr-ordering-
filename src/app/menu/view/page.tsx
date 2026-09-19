"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getMenuDataAction } from "@/modules/menu/actions/menuActions";
import { getBusinessInfoAction } from "@/modules/businesses/actions/businessActions";
import { initializeTableSessionAction, updateSessionActivityAction } from "@/modules/tables/actions/sessionActions";
import { getActiveOrderByTableAction } from "@/modules/orders/actions/orderActions";
import { useCartStore } from "@/modules/menu/store/cartStore";
import Image from "next/image";
import { OrderProgressTracker } from "@/modules/orders/components/OrderProgressTracker";
import { cn } from "@/lib/utils";

export default function MenuViewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
  const [activeOrder, setActiveOrder] = useState<any>(null);

  const cart = useCartStore((state) => state.cart);
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const getCartTotal = useCartStore((state) => state.getCartTotal);
  const getProductQuantity = useCartStore((state) => state.getProductQuantity);
  const setTableId = useCartStore((state) => state.setTableId);
  const searchParams = useSearchParams();
  const router = useRouter();
  const tableId = searchParams.get("tableId");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let heartbeat: any;
    let orderPoller: any;
    async function init() {
        if (!tableId) return;
        
        const session = await initializeTableSessionAction(tableId);
        
        if (!session) {
            // No active session found - access denied or session closed
            router.push(`/menu/expired?tableId=${tableId}`);
            return;
        }

        setTableId(tableId);

        // Fetch active order
        const currentOrder = await getActiveOrderByTableAction(tableId);
        setActiveOrder(currentOrder);

        // Poll for order status updates
        orderPoller = setInterval(async () => {
          const freshOrder = await getActiveOrderByTableAction(tableId);
          setActiveOrder(freshOrder);
        }, 10000); // Poll every 10s

        // Start heartbeat to track activity
        heartbeat = setInterval(() => {
            updateSessionActivityAction(tableId);
        }, 30000); // every 30s

        const bizPromise = getBusinessInfoAction(tableId);
        const menuPromise = getMenuDataAction(tableId);

        const [biz, menuData] = await Promise.all([bizPromise, menuPromise]);
        
        setData(menuData);
        setActiveCategoryId(menuData?.categories?.[0]?.id || "");
        setLoading(false);
    }
    init();
    return () => {
        if (heartbeat) clearInterval(heartbeat);
        if (orderPoller) clearInterval(orderPoller);
    };
  }, [tableId, router]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 180; 
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveCategoryId(id);
    }
  };

  const getMinPrice = (product: any) => {
    if (product.variants && product.variants.length > 0) {
        const prices = product.variants
            .map((v: any) => Number(v.price))
            .filter((p: number) => !isNaN(p) && p > 0);
        
        if (prices.length > 0) {
            return Math.min(...prices);
        }
    }
    return Number(product.price) || 0;
  };

  const getCartUid = (productId: string) => {
    return cart.find(item => item.id === productId)?.uid;
  };

  const isProductAvailable = (product: any) => {
    console.log(`Checking availability for ${product.name}:`, product.isAvailable, product.variants);

    if (product.variants && product.variants.length > 0) {
      // Check if any variant is available
      return product.variants.some((v: any) => v.isAvailable);
    }
    return product.isAvailable;
  };

  const handleProductClick = (product: any) => {
    router.push(`/menu/product/${product.id}?tableId=${tableId}`);
  };

  const handleQuickAdd = (product: any) => {
    const hasMultipleOptions = (product.variants?.length > 1) || (product.attributes?.length > 1);
    if (hasMultipleOptions) {
      handleProductClick(product);
    } else {
      addToCart({ 
        id: product.id, 
        name: product.name, 
        image: product.image, 
        price: getMinPrice(product), 
        quantity: 1,
        variant: product.variants?.[0] || null,
        attribute: product.attributes?.[0] || null,
        notes: ""
      } as any);
    }
  };

  if (loading || !data) {
    return <div>Loading...</div>; // Should be handled by /menu/loading
  }

  const validCategories = data.categories.filter((cat: any) => 
    cat.products.some((p: any) => (p.price != null && p.price > 0) || (p.variants && p.variants.length > 0))
  );

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      <div className="sticky top-0 bg-white z-50 border-b">
        <header className="p-4 space-y-4">
          <div className="flex items-center gap-3">
              {data.business.logo ? (
              <Image src={data.business.logo} alt="Logo" width={48} height={48} className="rounded-full" />
              ) : (
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400">LOGO</div>
              )}
              <div>
              <h1 className="text-lg font-bold">{data.business.name}</h1>
              <p className="text-xs text-slate-500">Table {data.table.number}</p>
              </div>
          </div>
          <input type="text" placeholder="Search..." className="w-full bg-slate-100 p-2 rounded-lg text-sm focus:outline-none" />
        </header>

        <nav className="flex gap-2 p-2 overflow-x-auto">
          {validCategories.map((category: any) => (
            <button
              key={category.id}
              onClick={() => scrollToSection(category.id)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition",
                activeCategoryId === category.id ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
              )}
            >
              {category.name}
            </button>
          ))}
        </nav>
      </div>

      {activeOrder && activeOrder.status !== 'COMPLETED' && activeOrder.status !== 'CANCELLED' && (
          <div className="mx-4 mt-4 p-4 bg-primary text-white rounded-2xl flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                  </div>
                  <div>
                      <p className="text-[10px] font-bold uppercase opacity-80">Order #{activeOrder.orderNumber}</p>
                      <p className="text-sm font-bold">{activeOrder.status}</p>
                  </div>
              </div>
              <button 
                  onClick={() => router.push(`/menu/orders/${activeOrder.id}?tableId=${tableId}`)}
                  className="bg-white text-primary px-4 py-2 rounded-lg text-xs font-bold"
              >
                  View Order
              </button>
          </div>
      )}

      {activeOrder && activeOrder.status === 'CANCELLED' && (
          <div className="mx-4 mt-4 p-4 bg-red-50 text-red-800 rounded-2xl border border-red-100 shadow-sm">
              <p className="font-bold text-sm">Order #{activeOrder.orderNumber} Cancelled</p>
              <p className="text-xs mt-1">Please start a new order.</p>
          </div>
      )}

      <main ref={scrollContainerRef} className="p-4 space-y-8">
        {validCategories.map((category: any) => (
          <section key={category.id}>
            <h2 id={category.id} className="text-md font-bold mb-4 scroll-mt-32">{category.name}</h2>
            <div className="grid gap-4">
              {category.products
                .filter((p: any) => (p.price != null && p.price > 0) || (p.variants && p.variants.length > 0))
                .map((product: any) => {
                  const available = isProductAvailable(product);
                  return (
                    <div key={product.id} onClick={() => available && handleProductClick(product)} className={cn("flex gap-4 border rounded-2xl p-4 hover:shadow-md transition bg-white items-center relative", available ? "cursor-pointer" : "opacity-60 pointer-events-none")}>
                      {product.image && <Image src={product.image} alt={product.name} width={120} height={120} className="rounded-xl object-cover w-24 h-24" />}
                      {!available && <div className="absolute inset-0 bg-white/50 rounded-2xl flex items-center justify-center font-bold text-slate-500">Sold Out</div>}
                      <div className="flex-1 space-y-1">
                        <h3 className="font-bold text-base">{product.name}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between mt-3" onClick={(e) => e.stopPropagation()}>
                          <p className="font-bold text-primary text-base">{getMinPrice(product)} MMK</p>
                          {available && getProductQuantity(product.id) > 0 ? (
                            <div className="flex items-center gap-2 border rounded-full px-2 py-1">
                               <button onClick={() => removeFromCart(getCartUid(product.id) || "")} className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm">-</button>
                               <span className="font-bold text-sm w-4 text-center">{getProductQuantity(product.id)}</span>
                               <button onClick={(e) => { e.stopPropagation(); handleQuickAdd(product); }} className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">+</button>
                            </div>
                          ) : available ? (
                            <button onClick={(e) => { e.stopPropagation(); handleQuickAdd(product); }} className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">+</button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
              })}
            </div>
          </section>
        ))}
      </main>

      <div className={`fixed bottom-0 w-full max-w-md bg-white border-t p-4 z-50 transition-transform duration-300 ${cart.length > 0 ? "translate-y-0" : "translate-y-full"}`}>
        <button onClick={() => router.push(`/menu/checkout?tableId=${tableId}`)} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold flex justify-between px-4">
          <span>View Order ({cart.length})</span>
          <span>{getCartTotal().toLocaleString()} MMK</span>
        </button>
      </div>

      <OrderProgressTracker order={activeOrder} hasActiveCart={cart.length > 0} />
    </div>
  );
}
