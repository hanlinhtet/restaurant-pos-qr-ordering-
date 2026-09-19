"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cancelOrderAction } from "../actions/orderCancelAction";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CustomerCancelModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  tableId: string | null;
}

export function CustomerCancelModal({ order, isOpen, onClose, tableId }: CustomerCancelModalProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    setLoading(true);
    try {
      await cancelOrderAction(order.id);
      toast.success("Order cancelled");
      onClose();
      router.push(`/menu?tableId=${tableId}`);
    } catch (error) {
      toast.error("Failed to cancel order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancel Order</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this order? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Close</Button>
          <Button variant="destructive" onClick={handleCancel} disabled={loading}>
            {loading ? "Cancelling..." : "Yes, Cancel Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
