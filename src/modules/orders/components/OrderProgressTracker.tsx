"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChefHat, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/modules/menu/store/cartStore";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { updateOrderStatusAction } from "@/modules/orders/actions/orderActions";

interface OrderProgressTrackerProps {
  order: any;
  hasActiveCart?: boolean;
}

export function OrderProgressTracker({ order: initialOrder, hasActiveCart = false }: OrderProgressTrackerProps) {
  const [order, setOrder] = useState(initialOrder);
  const [status, setStatus] = useState(order?.status || "PENDING");
  const [progress, setProgress] = useState(0);
  const { addToCart, clearCart } = useCartStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  useEffect(() => {
    // Map PAID to READY for customer view to simplify status
    const effectiveStatus = order?.status === 'PAID' ? 'READY' : (order?.status || 'PENDING');
    setStatus(effectiveStatus);
    
    // Calculate progress based on simplified effective status
    switch (effectiveStatus) {
      case "PENDING":
        setProgress(10);
        break;
      case "CONFIRMED":
        setProgress(30);
        break;
      case "PREPARING":
        setProgress(60);
        break;
      case "READY":
      case "SERVED":
        setProgress(100);
        break;
      case "CANCELLED":
        setProgress(0);
        break;
      default:
        setProgress(0);
    }
  }, [order?.status]);

  // DO NOT show tracker if completed or cancelled
  // Note: PAID orders are now treated as READY, so they won't be filtered out here.
  if (!order || status === "COMPLETED" || status === "CANCELLED") return null;

  const isCancelled = status === "CANCELLED";
  const isReady = status === "READY" || status === "SERVED";
  // The report box only shows when the admin has sent a response and the order is NOT cancelled
  const hasReport = !!order.report && !!order.report.adminNotes && status !== 'CANCELLED';
  const isSelfService = order?.branch?.serviceType === "SELF_SERVICE";

  const handleOrderAgain = async () => {
    if (!order) return;
    
    // Clear UI immediately
    setOrder(null);
    
    // 1. Cancel the current order on the server
    await updateOrderStatusAction(order.id, 'CANCELLED');
    
    // 2. Clear current cart
    clearCart();
    
    // 3. Redirect back to menu
    const tableId = order.tableSession?.tableId || searchParams.get("tableId");
    if (tableId) {
        router.push(`/menu/view?tableId=${tableId}`);
    } else {
        console.error("Missing tableId, cannot redirect to menu.");
        toast.error("Could not restart order. Please scan the QR code again.");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        layout
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1, bottom: hasActiveCart ? 96 : 16 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ 
          duration: 0.3, 
          ease: "easeInOut" 
        }}
        className="fixed left-4 right-4 z-50 md:left-auto md:right-8 md:w-96"
      >
        <Card className={cn(
          "overflow-hidden border-none shadow-2xl bg-white/95 backdrop-blur-md",
          (isCancelled || hasReport) ? "ring-2 ring-red-500" : (isReady ? "ring-2 ring-green-500" : "ring-1 ring-slate-200")
        )}>
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-2 rounded-full",
                  (isCancelled || hasReport) ? "bg-red-100 text-red-600" : (isReady ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600")
                )}>
                  {(isCancelled || hasReport) ? <AlertCircle className="w-4 h-4" /> : (isReady ? <CheckCircle2 className="w-4 h-4" /> : <ChefHat className="w-4 h-4" />)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className={cn(
                    "font-bold text-sm uppercase tracking-tight truncate",
                    (isCancelled || hasReport) ? "text-red-600" : "text-slate-900"
                  )}>
                    {hasReport ? "Order Issues Detected" : isCancelled ? "Order Cancelled" : isReady ? "Food is Ready!" : "Preparing your food"}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                    Order #{order.orderNumber}
                  </p>
                </div>
              </div>
              <Badge variant={(isCancelled || hasReport) ? "destructive" : "secondary"} className="text-[10px] font-black">
                {status}
              </Badge>
            </div>

            {/* If there is a chef report, show the details box instead of the progress bar */}
            {hasReport ? (
                <div className="space-y-2 mt-2 bg-red-50/50 p-3 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2 text-red-700 font-bold text-[10px] uppercase">
                        Chef Report: {order.report.type.replace('_', ' ')}
                    </div>
                    <p className="text-xs text-red-600 font-medium italic">
                        "{order.report.description}"
                    </p>
                    {order.report.adminNotes && (
                        <div className="mt-2 pt-2 border-t border-red-100">
                            <span className="text-[8px] font-black uppercase text-slate-400 block mb-1">Admin Response</span>
                            <p className="text-xs text-slate-700 font-bold">
                                {order.report.adminNotes}
                            </p>
                        </div>
                    )}
                    <Button 
                        onClick={handleOrderAgain}
                        className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl h-9"
                    >
                        Start New Order
                    </Button>
                </div>
            ) : isCancelled ? (
                <div className="space-y-3 mt-2">
                    <p className="text-xs text-slate-600 font-medium italic">
                        Your order has been cancelled by the restaurant.
                    </p>
                    <Button 
                        onClick={handleOrderAgain}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl h-9"
                    >
                        Start New Order
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    <motion.div
                        animate={status === "PREPARING" ? { opacity: [0.5, 1, 0.5] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Progress value={progress} className={cn(
                        "h-2",
                        isReady ? "bg-green-100 [&>div]:bg-green-500" : "bg-slate-100 [&>div]:bg-blue-500"
                        )} />
                    </motion.div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>Ordered</span>
                        <span>Kitchen</span>
                        <span>Ready</span>
                    </div>
                </div>
            )}
          </div>
          
          {isReady && !isCancelled && !hasReport && (
            <motion.div 
              animate={{ backgroundColor: ["#22c55e", "#16a34a", "#22c55e"] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="py-2 px-4 text-center text-white text-xs font-black uppercase tracking-widest"
            >
              {isSelfService ? "Please pick up your order!" : "Your food will be brought to you soon"}
            </motion.div>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
