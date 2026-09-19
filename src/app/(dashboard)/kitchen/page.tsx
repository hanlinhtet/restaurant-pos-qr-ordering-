import { getActiveKitchenTickets } from "@/modules/kitchen/services/kitchenService";
import { KitchenTicketList } from "@/modules/kitchen/components/KitchenTicketList";
import { Badge } from "@/components/ui/badge";
import { protectPage } from "@/modules/auth/utils/rbac";
import { UserRole } from "@prisma/client";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function KitchenPage() {
  const session = await protectPage([UserRole.OWNER, UserRole.MANAGER, UserRole.KITCHEN]);

  // Get the user's business and branch
  const businessUser = await prisma.businessUser.findFirst({
    where: { userId: session.user.id }
  });

  if (!businessUser) return <div>No business found.</div>;

  // For now, get the first branch of the business
  const branch = await prisma.branch.findFirst({
    where: { businessId: businessUser.businessId }
  });

  if (!branch) return <div>No branch found.</div>;
  
  const tickets = await getActiveKitchenTickets(branch.id);

  const newTickets = tickets.filter(t => (t.status === "PENDING" || t.status === "CONFIRMED") && t.order.status !== 'CANCELLED');
  const preparingTickets = tickets.filter(t => t.status === "PREPARING" && t.order.status !== 'CANCELLED');
  const readyTickets = tickets.filter(t => t.status === "READY" && t.order.status !== 'CANCELLED');
  const cancelledTickets = tickets.filter(t => t.order.status === 'CANCELLED');
  const completedTickets = tickets.filter(t => t.status === "COMPLETED");

  return (
    <div className="p-6 h-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
      {/* Ticket Machine Style Header */}
      <header className="border-b border-slate-200 pb-6 mb-6 space-y-6">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-extrabold uppercase tracking-tight text-slate-900">KDS Station</h1>
                <p className="text-sm text-slate-500 font-medium uppercase mt-1 tracking-wider">{branch.name}</p>
            </div>
            {/* Today Completed Display */}
            <div className="text-right">
                <div className="text-xs text-slate-500 font-bold uppercase">Today Completed</div>
                <div className="text-2xl font-black text-slate-900">{completedTickets.length}</div>
            </div>
        </div>
        
        {/* Status Stats Row */}
        <div className="flex gap-4">
            <div className="flex-1 text-center py-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="text-[10px] text-slate-500 font-bold uppercase">New</div>
                <div className="text-xl font-black text-blue-600">{newTickets.length}</div>
            </div>
            <div className="flex-1 text-center py-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Preparing</div>
                <div className="text-xl font-black text-orange-600">{preparingTickets.length}</div>
            </div>
            <div className="flex-1 text-center py-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Ready</div>
                <div className="text-xl font-black text-green-600">{readyTickets.length}</div>
            </div>
            <div className="flex-1 text-center py-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Cancelled</div>
                <div className="text-xl font-black text-red-600">{cancelledTickets.length}</div>
            </div>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto pb-4 scrollbar-hide">
        <KitchenTicketList initialTickets={tickets} />
      </div>
    </div>
  );
}
