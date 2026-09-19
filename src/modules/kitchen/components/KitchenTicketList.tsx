"use client";

import { Reorder, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { KitchenTicket } from "./KitchenTicket";
import { useRouter } from "next/navigation";

interface KitchenTicketListProps {
  initialTickets: any[];
}

export function KitchenTicketList({ initialTickets }: KitchenTicketListProps) {
  const [tickets, setTickets] = useState(initialTickets);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 2000);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    // Simply sort the incoming data. This removes the complex (and buggy)
    // state-merging logic, ensuring the UI always reflects the server data.
    const statusOrder: Record<string, number> = {
      'PENDING': 0,
      'CONFIRMED': 0,
      'PREPARING': 0,
      'READY': 1,
      'CANCELLED': 2,
      'COMPLETED': 3
    };

    const sortedTickets = [...initialTickets]
      .filter(t => t.status !== 'COMPLETED') // Do not display completed tickets
      .sort((a: any, b: any) => {
        // 1. Calculate effective status
        const getEffectiveStatus = (t: any) => t.order.status === 'CANCELLED' ? 'CANCELLED' : t.status;
        
        const statusA = getEffectiveStatus(a);
        const statusB = getEffectiveStatus(b);

        // 2. Sort by status priority
        const statusDiff = statusOrder[statusA] - statusOrder[statusB];
        if (statusDiff !== 0) return statusDiff;

        // 3. Then by creation time (ascending)
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    
    setTickets(sortedTickets);
  }, [initialTickets]);

  return (
    <div className="relative pt-4">
      {/* Background Printer Rail Visual - Refined to match project UI */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-slate-900 rounded-full z-20 shadow-sm border-b border-slate-700 mx-4 opacity-10">
      </div>

      <Reorder.Group 
        axis="x" 
        values={tickets} 
        onReorder={setTickets}
        className="flex gap-8 min-w-max p-4 pt-6"
      >
        <AnimatePresence initial={false}>
          {tickets.map((ticket) => (
            <Reorder.Item 
              key={ticket.id} 
              value={ticket}
              dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
              className="z-10"
            >
              <KitchenTicket ticket={ticket} />
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  );
}
