"use client";

import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { cancelOrderAction } from "../actions/orderCancelAction";
import { toast } from "sonner";

export function OrderCancelButton({ orderId, status }: { orderId: string, status: string }) {
    // Hide cancel button if order is already being prepared, ready, served, completed, or cancelled
    const uncancelableStatuses = ['PREPARING', 'READY', 'SERVED', 'CANCELLED', 'COMPLETED'];
    if (uncancelableStatuses.includes(status)) return null;

    return (
        <Button size="sm" variant="destructive" onClick={async () => {
            if(confirm("Are you sure you want to cancel this order?")) {
                await cancelOrderAction(orderId);
                toast.success("Order cancelled");
            }
        }}>
            <XCircle className="w-4 h-4 mr-1" /> Cancel
        </Button>
    );
}
