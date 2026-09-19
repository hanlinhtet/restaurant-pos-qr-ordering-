"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { reportProblemAction } from "../actions/kitchenActions";
import { toast } from "sonner";

interface ChefReportModalProps {
  ticket: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ChefReportModal({ ticket, isOpen, onClose }: ChefReportModalProps) {
  const [type, setType] = useState("SUPPLIES_OUTAGE");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await reportProblemAction(ticket.id, type, description);
      if (result.success) {
        toast.success("Problem reported to admin");
        onClose();
      } else {
        toast.error(result.error || "Failed to report problem");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Report Issue - Order {ticket.order.orderNumber}
          </DialogTitle>
          <DialogDescription>
            This will add a report note to the order for Admin review.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase text-slate-500">Reason Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUPPLIES_OUTAGE">Supplies Outage</SelectItem>
                <SelectItem value="EQUIPMENT_ISSUE">Equipment Issue</SelectItem>
                <SelectItem value="STAFF_SHORTAGE">Staff Shortage</SelectItem>
                <SelectItem value="OTHER">Other Issue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase text-slate-500">Description</label>
            <Textarea 
              placeholder="Provide more details for the admin..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Reporting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
