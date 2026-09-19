"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Clock, CheckCircle2, Hash, Layers } from "lucide-react";
import { format } from "date-fns";
import { completeTicketAction, startTicketAction, finalizeTicketAction } from "../actions/kitchenActions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChefReportModal } from "./ChefReportModal";

interface KitchenTicketProps {
  ticket: any;
}

export function KitchenTicket({ ticket }: KitchenTicketProps) {
  const { order, status, createdAt } = ticket;
  const isReady = status === "READY";
  const isCancelled = order.status === 'CANCELLED';
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const totalItems = order.items.reduce((acc: number, item: any) => acc + item.quantity, 0);

  // Fix: Correctly access the table number from the nested relation
  const tableNumber = order.tableSession?.table?.number || "TAKE AWAY";

  const handleRingBell = async () => {
    try {
      await completeTicketAction(ticket.id);
      toast.success(`Order ${order.orderNumber} is ready!`);
      const audio = new Audio("/bell-sound.mp3");
      audio.play().catch(() => {}); 
    } catch (error) {
      toast.error("Failed to update ticket");
    }
  };

  const handleComplete = async () => {
    try {
      await finalizeTicketAction(ticket.id);
      toast.success(`Order ${order.orderNumber} completed`);
    } catch (error) {
      toast.error("Failed to complete ticket");
    }
  };

  const handleStartPrep = async () => {
    try {
      await startTicketAction(ticket.id);
      toast.info(`Preparing Order ${order.orderNumber}`);
    } catch (error) {
      toast.error("Failed to start preparation");
    }
  };

  const handleReportOutage = () => {
    setIsReportModalOpen(true);
  };

  const isPreparing = status === "PREPARING";
  // The ticket is initial if it is CONFIRMED (newly taken) or not yet PREPARING and not READY
  const isInitial = (status === "CONFIRMED" || status === "PENDING") && !isPreparing && !isReady;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0, height: 0 }}
      animate={{ y: 0, opacity: 1, height: "auto" }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        type: "spring", 
        stiffness: 100, 
        damping: 15,
        duration: 0.8 
      }}
      className="relative"
    >
      {/* Printer Rail Visual */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-64 h-2 bg-slate-800 rounded-t-full z-0 opacity-20" />

      <Card className={cn(
        "relative w-72 bg-[#fdfdfd] shadow-2xl flex flex-col text-slate-900 border-none transition-all duration-300 rounded-b-none",
        (isReady || isCancelled) ? "opacity-60 scale-95 brightness-95" : "hover:shadow-3xl ring-1 ring-black/5",
        isCancelled && "grayscale"
      )}>
        
        {/* Glow Effect for New Tickets */}
        {!isReady && !isCancelled && (
          <motion.div 
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 2, times: [0, 0.5, 1] }}
            className="absolute inset-0 bg-blue-400/10 rounded-lg pointer-events-none"
          />
        )}

        <div className="p-6 pb-2">
          {/* Header Section */}
          <div className="text-center space-y-1 mb-4 border-b-2 border-dashed border-slate-200 pb-4">
            <div className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
              TABLE {tableNumber}
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase text-slate-500">
              <Hash className="w-3 h-3" /> {order.orderNumber}
            </div>
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
              <Clock className="w-3 h-3" /> {format(new Date(createdAt), "hh:mm a")}
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4 my-6">
            {order.items.map((item: any) => (
              <div key={item.id} className="space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-black text-lg shrink-0">{item.quantity}×</span>
                  <span className="flex-1 font-bold text-base uppercase leading-tight">
                    {item.product.name}
                  </span>
                </div>
                
                {(item.variant || item.attribute || item.notes) && (
                  <div className="ml-6 space-y-1 border-l-2 border-slate-100 pl-3 py-1">
                    {item.variant && (
                      <p className="text-xs uppercase font-bold text-slate-500">
                        {item.variant.name}
                      </p>
                    )}
                    {item.attribute && (
                      <p className="text-xs uppercase font-bold text-slate-500">
                        {item.attribute.name}
                      </p>
                    )}
                    {item.notes && (
                      <div className="mt-1 text-red-600 font-black text-[10px] uppercase leading-tight">
                        NOTE: {item.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Section */}
          <div className="border-t-2 border-dashed border-slate-200 pt-4 flex justify-between items-center mb-4">
             <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                <Layers className="w-3 h-3" /> {totalItems} ITEMS
             </div>
             <Badge variant={isReady ? "default" : "outline"} className={cn(
               "text-[10px] font-black uppercase tracking-widest",
               isReady ? "bg-green-600" : isCancelled ? "bg-red-600 text-white border-red-600" : "text-orange-600 border-orange-600"
             )}>
               {isCancelled ? "CANCELLED" : status === "PREPARING" ? "URGENT" : status}
             </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-3 pb-6 mt-auto space-y-2">
          {/* Explicit Status Check */}
          {!isCancelled && (
              <>
                {(status === "CONFIRMED" || status === "PENDING") && (
                    <Button 
                    onClick={handleStartPrep}
                    className="w-full h-12 font-black uppercase tracking-wider text-sm bg-orange-500 hover:bg-orange-600 shadow-lg text-white"
                    >
                    Start Prep
                    </Button>
                )}

                {status === "PREPARING" && (
                    <Button 
                    onClick={handleRingBell} 
                    className="w-full gap-2 h-12 font-black uppercase tracking-wider text-sm bg-slate-900 hover:bg-slate-800 shadow-lg"
                    >
                    <Bell className="w-5 h-5" /> Ring Bell
                    </Button>
                )}

                {status === "READY" && (
                    <Button 
                      disabled
                      className="w-full h-12 font-black uppercase tracking-wider text-sm bg-green-600/50 cursor-not-allowed text-white rounded-md shadow-none"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" /> Ready
                    </Button>
                )}
              </>
          )}

          {!isReady && !isCancelled && (
            <Button 
              variant="ghost"
              onClick={handleReportOutage}
              className="w-full text-[10px] font-bold uppercase text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              Report Issue / Cancel
            </Button>
          )}
          
          {isCancelled && (
              <div className="w-full h-12 flex items-center justify-center font-black uppercase tracking-wider text-sm bg-red-100 text-red-700 shadow-lg rounded-md">
                  Cancelled
              </div>
          )}
        </div>

        {/* Premium Torn Line Effect (Perforation) */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-200/50 flex justify-between px-1 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="w-0.5 h-0.5 bg-slate-300 rounded-full -translate-y-1/2" />
            ))}
        </div>

        {/* Serrated Cut Edge Bottom - Sharp triangles with slight rounding */}
        <div 
          className="h-4 w-full bg-[#fdfdfd] absolute -bottom-3 left-0" 
          style={{
            maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'10\' viewBox=\'0 0 20 10\'%3E%3Cpath d=\'M0 0 L8 8 Q10 10 12 8 L20 0 Z\' fill=\'black\'/%3E%3C/svg%3E")',
            WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'10\' viewBox=\'0 0 20 10\'%3E%3Cpath d=\'M0 0 L8 8 Q10 10 12 8 L20 0 Z\' fill=\'black\'/%3E%3C/svg%3E")',
            maskRepeat: 'repeat-x',
            WebkitMaskRepeat: 'repeat-x',
          }}
        />
      </Card>

      <ChefReportModal 
        ticket={ticket} 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
    </motion.div>
  );
}
