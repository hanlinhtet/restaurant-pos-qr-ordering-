"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { updateAdminNotesAction } from "@/modules/kitchen/actions/kitchenActions";
import { toast } from "sonner";

interface AdminNotesInputProps {
  orderId: string;
  initialNotes: string;
  disabled?: boolean;
}

export function AdminNotesInput({ orderId, initialNotes, disabled = false }: AdminNotesInputProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateAdminNotesAction(orderId, notes);
      toast.success("Customer notified with notes");
    } catch (error) {
      toast.error("Failed to update notes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Input 
        value={notes} 
        onChange={(e) => setNotes(e.target.value)} 
        placeholder="e.g. Refunded your payment..." 
        className="h-8 text-xs"
        disabled={disabled || loading}
      />
      <Button size="sm" variant="secondary" onClick={handleUpdate} disabled={disabled || loading} className="h-8 px-2">
        <Send className="w-3 h-3" />
      </Button>
    </div>
  );
}
