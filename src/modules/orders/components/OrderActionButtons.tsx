"use client";

import { Button } from "@/components/ui/button";
import { updateOrderStatusAction, completeOrderAndCloseSessionAction, markAsPaidAction } from "../actions/orderActions";
import { toast } from "sonner";
import { OrderWithDetails } from "../types";

export function OrderActionButtons({ order }: { order: OrderWithDetails }) {
    const { id: orderId, status, payments } = order;
    const isPaid = payments.some(p => p.status === 'PAID');

    const handleUpdate = async (newStatus: string) => {
        const result = await updateOrderStatusAction(orderId, newStatus);
        if (result.success) {
            toast.success(`Order status updated to ${newStatus}`);
        }
    };

    const handleMarkAsPaid = async () => {
        const result = await markAsPaidAction(orderId);
        if (result.success) {
            toast.success("Order marked as paid!");
        }
    };

    const handleComplete = async () => {
        const result = await completeOrderAndCloseSessionAction(orderId);
        if (result.success) {
            toast.success("Order completed and table cleared!");
        } else {
            toast.error("Failed to complete order");
        }
    };

    if (status === 'COMPLETED' || status === 'CANCELLED') return null;

    return (
        <div className="flex gap-2 items-center">
            {status === 'PENDING' && (
                <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleUpdate('CONFIRMED')}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-none"
                >
                    Take Order
                </Button>
            )}

            {isPaid ? (
                <div className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide">
                    Paid
                </div>
            ) : (
                <Button size="sm" onClick={handleMarkAsPaid} className="bg-emerald-600 hover:bg-emerald-700 text-white border-none">
                    Mark as Paid
                </Button>
            )}

            {status === 'READY' && (
                <Button size="sm" variant="outline" onClick={() => handleUpdate('SERVED')} className="bg-orange-500 hover:bg-orange-600 text-white border-none">
                    Served
                </Button>
            )}
            
            {status === 'SERVED' && isPaid && (
                <Button size="sm" onClick={handleComplete} className="bg-slate-900 hover:bg-slate-800 text-white border-none">
                    Finish & Clean
                </Button>
            )}
        </div>
    );
}
